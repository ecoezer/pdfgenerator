import jsPDF from 'jspdf';
import { getCmykForPrint, hexToRgb, rgbToCmyk } from './colorConversion';

export async function generatePrintReadyPDF(menu, template, sections) {
  const mmToPt = 2.83465;
  const widthPt = template.width_mm * mmToPt;
  const heightPt = template.height_mm * mmToPt;
  const panels = template.panels || 2;
  const foldType = template.fold_type || 'einbruchfalz';

  const totalWidth = widthPt * panels;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [heightPt, totalWidth],
    compress: true
  });

  pdf.setProperties({
    title: menu.name,
    subject: `Print-Ready Menu - ${foldType} (${panels} panels)`,
    creator: 'Menu PDF Generator',
    keywords: 'menu, print, CMYK, ' + foldType
  });

  const bleedPt = template.bleed_mm * mmToPt;
  const marginPt = template.safe_margin_mm * mmToPt;
  const panelWidth = widthPt;
  const contentWidth = panelWidth - (marginPt * 2);

  const bgCmyk = getCmykForPrint(menu.background_color);
  const textCmyk = getCmykForPrint(menu.text_color);
  const accentCmyk = getCmykForPrint(menu.accent_color);
  const pureCmykBlack = { c: 0, m: 0, y: 0, k: 100 };

  pdf.setFillColor(bgCmyk.c, bgCmyk.m, bgCmyk.y, bgCmyk.k);
  pdf.rect(0, 0, totalWidth, heightPt, 'F');

  const sectionsPerPanel = Math.ceil(sections.length / panels);

  for (let panelIndex = 0; panelIndex < panels; panelIndex++) {
    const panelX = panelIndex * panelWidth;
    const contentX = panelX + marginPt;
    let currentY = marginPt;

    if (panelIndex === 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.setTextColor(textCmyk.c, textCmyk.m, textCmyk.y, textCmyk.k);

      const titleWidth = pdf.getTextWidth(menu.name);
      const titleX = panelX + (panelWidth - titleWidth) / 2;
      currentY += 40;
      pdf.text(menu.name, titleX, currentY);

      if (menu.description) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        currentY += 25;
        const descLines = pdf.splitTextToSize(menu.description, contentWidth);
        const descX = panelX + (panelWidth - pdf.getTextWidth(menu.description)) / 2;
        pdf.text(descLines, contentX, currentY);
        currentY += (descLines.length * 14);
      }

      currentY += 25;
    } else {
      currentY += 30;
    }

    const startSection = panelIndex * sectionsPerPanel;
    const endSection = Math.min(startSection + sectionsPerPanel, sections.length);
    const panelSections = sections.slice(startSection, endSection);

    panelSections.forEach((section) => {
      if (currentY > heightPt - marginPt - 80) {
        return;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(accentCmyk.c, accentCmyk.m, accentCmyk.y, accentCmyk.k);
      pdf.text(section.title, contentX, currentY);
      currentY += 8;

      pdf.setDrawColor(pureCmykBlack.c, pureCmykBlack.m, pureCmykBlack.y, pureCmykBlack.k);
      pdf.setLineWidth(1);
      pdf.line(contentX, currentY, contentX + contentWidth, currentY);
      currentY += 18;

      if (section.description) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(textCmyk.c, textCmyk.m, textCmyk.y, textCmyk.k);
        const sectionDescLines = pdf.splitTextToSize(section.description, contentWidth);
        pdf.text(sectionDescLines, contentX, currentY);
        currentY += (sectionDescLines.length * 12) + 8;
      }

      section.items?.forEach((item) => {
        if (currentY > heightPt - marginPt - 40) {
          return;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(pureCmykBlack.c, pureCmykBlack.m, pureCmykBlack.y, pureCmykBlack.k);

        const priceText = `$${parseFloat(item.price).toFixed(2)}`;
        const priceWidth = pdf.getTextWidth(priceText);

        pdf.text(item.name, contentX, currentY);
        pdf.text(priceText, contentX + contentWidth - priceWidth, currentY);
        currentY += 14;

        if (item.description) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(textCmyk.c, textCmyk.m, textCmyk.y, textCmyk.k);
          const itemDescLines = pdf.splitTextToSize(item.description, contentWidth - 10);
          pdf.text(itemDescLines, contentX + 5, currentY);
          currentY += (itemDescLines.length * 11) + 8;
        } else {
          currentY += 8;
        }
      });

      currentY += 15;
    });

    pdf.setDrawColor(pureCmykBlack.c, pureCmykBlack.m, pureCmykBlack.y, pureCmykBlack.k);
    pdf.setLineWidth(0.5);
    pdf.rect(panelX + marginPt, marginPt, contentWidth, heightPt - (marginPt * 2), 'S');

    if (panelIndex < panels - 1) {
      pdf.setLineWidth(1);
      pdf.setLineDash([5, 5], 0);
      pdf.line(panelX + panelWidth, marginPt, panelX + panelWidth, heightPt - marginPt);
      pdf.setLineDash([], 0);
    }
  }

  return pdf;
}

export function downloadPDF(pdf, filename) {
  pdf.save(filename);
}

export function getPDFBlob(pdf) {
  return pdf.output('blob');
}
