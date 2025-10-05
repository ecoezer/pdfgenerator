import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function MenuPreview({ menu }) {
  const [sections, setSections] = useState([]);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    loadData();
  }, [menu.id]);

  async function loadData() {
    const [sectionsResult, templateResult] = await Promise.all([
      supabase
        .from('menu_sections')
        .select('*, menu_items(*)')
        .eq('menu_id', menu.id)
        .order('order_index'),
      supabase
        .from('templates')
        .select('*')
        .eq('id', menu.template_id)
        .single()
    ]);

    if (sectionsResult.data) {
      const sectionsWithSortedItems = sectionsResult.data.map(section => ({
        ...section,
        items: section.menu_items?.sort((a, b) => a.order_index - b.order_index) || []
      }));
      setSections(sectionsWithSortedItems);
    }

    if (templateResult.data) {
      setTemplate(templateResult.data);
    }
  }

  const aspectRatio = template
    ? (template.height_mm / template.width_mm) * 100
    : 141.4;

  return (
    <div className="menu-preview-container">
      <div className="preview-header">
        <h3>Preview</h3>
        {template && (
          <span className="preview-info">
            {template.name} - {template.width_mm}×{template.height_mm}mm
          </span>
        )}
      </div>

      <div className="preview-wrapper">
        <div
          className="preview-page"
          style={{
            backgroundColor: menu.background_color,
            color: menu.text_color,
            paddingTop: `${aspectRatio}%`
          }}
        >
          <div className="preview-content">
            <div className="preview-menu">
              <h1 className="preview-title">{menu.name}</h1>
              {menu.description && (
                <p className="preview-description">{menu.description}</p>
              )}

              {sections.map(section => (
                <div key={section.id} className="preview-section">
                  <h2
                    className="preview-section-title"
                    style={{ color: menu.accent_color }}
                  >
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="preview-section-desc">{section.description}</p>
                  )}

                  <div className="preview-items">
                    {section.items?.map(item => (
                      <div key={item.id} className="preview-item">
                        <div className="preview-item-info">
                          <h4 className="preview-item-name">{item.name}</h4>
                          {item.description && (
                            <p className="preview-item-desc">{item.description}</p>
                          )}
                        </div>
                        <div className="preview-item-price">
                          ${parseFloat(item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {sections.length === 0 && (
                <p className="preview-empty">Add sections and items to see them here</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="preview-note">
        Note: This is a screen preview. Generated PDF will use CMYK colors optimized for print.
      </div>
    </div>
  );
}
