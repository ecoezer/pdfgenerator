import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import SectionEditor from './SectionEditor';
import { generatePrintReadyPDF, downloadPDF } from '../utils/pdfGenerator';
import { getCmykForPrint } from '../utils/colorConversion';

export default function MenuEditor({ menu, templates, onMenuUpdated }) {
  const [menuData, setMenuData] = useState(menu);
  const [sections, setSections] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setMenuData(menu);
    loadSections();
  }, [menu.id]);

  async function loadSections() {
    const { data, error } = await supabase
      .from('menu_sections')
      .select(`
        *,
        menu_items(*)
      `)
      .eq('menu_id', menu.id)
      .order('order_index');

    if (!error && data) {
      const sectionsWithSortedItems = data.map(section => ({
        ...section,
        items: section.menu_items?.sort((a, b) => a.order_index - b.order_index) || []
      }));
      setSections(sectionsWithSortedItems);
    }
  }

  async function handleUpdateMenu(updates) {
    const { data, error } = await supabase
      .from('menus')
      .update(updates)
      .eq('id', menu.id)
      .select()
      .single();

    if (!error && data) {
      setMenuData(data);
      onMenuUpdated(data);
    }
  }

  async function handleAddSection() {
    const maxOrder = sections.length > 0
      ? Math.max(...sections.map(s => s.order_index))
      : -1;

    const { data, error } = await supabase
      .from('menu_sections')
      .insert([{
        menu_id: menu.id,
        title: 'New Section',
        description: '',
        order_index: maxOrder + 1
      }])
      .select()
      .single();

    if (!error && data) {
      setSections([...sections, { ...data, items: [] }]);
    }
  }

  async function handleGeneratePDF() {
    setGenerating(true);
    try {
      const { data: template } = await supabase
        .from('templates')
        .select('*')
        .eq('id', menuData.template_id)
        .single();

      if (template) {
        const pdf = await generatePrintReadyPDF(menuData, template, sections);

        const filename = `${menuData.name.replace(/[^a-z0-9]/gi, '_')}_CMYK_Print.pdf`;
        downloadPDF(pdf, filename);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please check console for details.');
    } finally {
      setGenerating(false);
    }
  }

  const textCmyk = getCmykForPrint(menuData.text_color);
  const accentCmyk = getCmykForPrint(menuData.accent_color);

  return (
    <div className="menu-editor">
      <div className="editor-header">
        <input
          type="text"
          value={menuData.name}
          onChange={(e) => handleUpdateMenu({ name: e.target.value })}
          className="menu-title-input"
          placeholder="Menu Name"
        />
        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          className="btn-generate"
        >
          {generating ? 'Generating...' : 'Generate Print PDF'}
        </button>
      </div>

      <div className="editor-section">
        <h3>Menu Settings</h3>

        <div className="form-group">
          <label>Template Size</label>
          <select
            value={menuData.template_id || ''}
            onChange={(e) => handleUpdateMenu({ template_id: e.target.value })}
            className="form-control"
          >
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.width_mm}×{template.height_mm}mm)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={menuData.description}
            onChange={(e) => handleUpdateMenu({ description: e.target.value })}
            className="form-control"
            rows="2"
            placeholder="Menu description or tagline"
          />
        </div>

        <div className="color-group">
          <div className="form-group">
            <label>Background Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={menuData.background_color}
                onChange={(e) => handleUpdateMenu({ background_color: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                value={menuData.background_color}
                onChange={(e) => handleUpdateMenu({ background_color: e.target.value })}
                className="color-text"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Text Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={menuData.text_color}
                onChange={(e) => handleUpdateMenu({ text_color: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                value={menuData.text_color}
                onChange={(e) => handleUpdateMenu({ text_color: e.target.value })}
                className="color-text"
              />
              <span className="cmyk-label">
                CMYK: {textCmyk.c}/{textCmyk.m}/{textCmyk.y}/{textCmyk.k}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Accent Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={menuData.accent_color}
                onChange={(e) => handleUpdateMenu({ accent_color: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                value={menuData.accent_color}
                onChange={(e) => handleUpdateMenu({ accent_color: e.target.value })}
                className="color-text"
              />
              <span className="cmyk-label">
                CMYK: {accentCmyk.c}/{accentCmyk.m}/{accentCmyk.y}/{accentCmyk.k}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="editor-section">
        <div className="section-header">
          <h3>Menu Sections</h3>
          <button onClick={handleAddSection} className="btn-secondary">
            + Add Section
          </button>
        </div>

        {sections.map((section, index) => (
          <SectionEditor
            key={section.id}
            section={section}
            onUpdate={loadSections}
          />
        ))}

        {sections.length === 0 && (
          <p className="empty-message">Add sections to organize your menu items</p>
        )}
      </div>
    </div>
  );
}
