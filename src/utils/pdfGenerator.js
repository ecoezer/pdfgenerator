import jsPDF from 'jspdf';
import { getCmykForPrint, hexToRgb, rgbToCmyk } from './colorConversion';

export async function generatePrintReadyPDF(menu, template, sections) {
  const mmToPt = 2.83465;
  const widthPt = template.width_mm * mmToPt;
  const heightPt = template.height_mm * mmToPt;

  const pdf = new jsPDF({
    orientation: template.width_mm > template.height_mm ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [widthPt, heightPt],
    compress: true
  });

  pdf.setProperties({
    title: menu.name,
    subject: 'Print-Ready Menu',
    creator: 'Menu PDF Generator',
    keywords: 'menu, print, CMYK'
  });

  const bleedPt = template.bleed_mm * mmToPt;
  const marginPt = template.safe_margin_mm * mmToPt;
  const contentWidth = widthPt - (marginPt * 2);
  const contentX = marginPt;
  let currentY = marginPt;

  const bgCmyk = getCmykForPrint(menu.background_color);
  pdf.setFillColor(bgCmyk.c, bgCmyk.m, bgCmyk.y, bgCmyk.k);
  pdf.rect(-bleedPt, -bleedPt, widthPt + (bleedPt * 2), heightPt + (bleedPt * 2), 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  const textCmyk = getCmykForPrint(menu.text_color);
  pdf.setTextColor(textCmyk.c, textCmyk.m, textCmyk.y, textCmyk.k);

  const titleWidth = pdf.getTextWidth(menu.name);
  const titleX = (widthPt - titleWidth) / 2;
  currentY += 40;
  pdf.text(menu.name, titleX, currentY);

  if (menu.description) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    currentY += 25;
    const descLines = pdf.splitTextToSize(menu.description, contentWidth);
    pdf.text(descLines, contentX, currentY);
    currentY += (descLines.length * 15);
  }

  currentY += 30;

  const accentCmyk = getCmykForPrint(menu.accent_color);

  sections.forEach((section, sectionIndex) => {
    if (currentY > heightPt - marginPt - 100) {
      pdf.addPage();
      currentY = marginPt + 40;

      pdf.setFillColor(bgCmyk.c, bgCmyk.m, bgCmyk.y, bgCmyk.k);
      pdf.rect(-bleedPt, -bleedPt, widthPt + (bleedPt * 2), heightPt + (bleedPt * 2), 'F');
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(accentCmyk.c, accentCmyk.m, accentCmyk.y, accentCmyk.k);
    pdf.text(section.title, contentX, currentY);
    currentY += 8;

    const pureCmykBlack = { c: 0, m: 0, y: 0, k: 100 };
    pdf.setDrawColor(pureCmykBlack.c, pureCmykBlack.m, pureCmykBlack.y, pureCmykBlack.k);
    pdf.setLineWidth(1);
    pdf.line(contentX, currentY, contentX + contentWidth, currentY);
    currentY += 20;

    if (section.description) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(11);
      pdf.setTextColor(textCmyk.c, textCmyk.m, textCmyk.y, textCmyk.k);
      const sectionDescLines = pdf.splitTextToSize(section.description, contentWidth);
      pdf.text(sectionDescLines, contentX, currentY);
      currentY += (sectionDescLines.length * 14) + 10;
    }

    section.items?.forEach((item, itemIndex) => {
      if (currentY > heightPt - marginPt - 60) {
        pdf.addPage();
        currentY = marginPt + 40;

        pdf.setFillColor(bgCmyk.c, bgCmyk.m, bgCmyk.y, bgCmyk.k);
        pdf.rect(-bleedPt, -bleedPt, widthPt + (bleedPt * 2), heightPt + (bleedPt * 2), 'F');
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(pureCmykBlack.c, pureCmykBlack.m, pureCmykBlack.y, pureCmykBlack.k);

      const priceText = `$${parseFloat(item.price).toFixed(2)}`;
      const priceWidth = pdf.getTextWidth(priceText);
      const nameMaxWidth = contentWidth - priceWidth - 20;

      pdf.text(item.name, contentX, currentY);
      pdf.text(priceText, contentX + contentWidth - priceWidth, currentY);
      currentY += 15;

      if (item.description) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(textCmyk.c, textCmyk.m, textCmyk.y, textCmyk.k);
        const itemDescLines = pdf.splitTextToSize(item.description, contentWidth - 20);
        pdf.text(itemDescLines, contentX + 10, currentY);
        currentY += (itemDescLines.length * 12) + 10;
      } else {
        currentY += 10;
      }
    });

    currentY += 20;
  });

  pdf.setDrawColor(pureCmykBlack.c, pureCmykBlack.m, pureCmykBlack.y, pureCmykBlack.k);
  pdf.setLineWidth(0.5);

  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.rect(marginPt, marginPt, contentWidth, heightPt - (marginPt * 2), 'S');
  }

  return pdf;
}

export function downloadPDF(pdf, filename) {
  pdf.save(filename);
}

export function getPDFBlob(pdf) {
  return pdf.output('blob');
}
