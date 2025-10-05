import { useState } from 'react';
import { supabase } from '../lib/supabase';
import ItemEditor from './ItemEditor';

export default function SectionEditor({ section, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);

  async function handleUpdateSection(updates) {
    const { error } = await supabase
      .from('menu_sections')
      .update(updates)
      .eq('id', section.id);

    if (!error) {
      onUpdate();
    }
  }

  async function handleDeleteSection() {
    const { error } = await supabase
      .from('menu_sections')
      .delete()
      .eq('id', section.id);

    if (!error) {
      onUpdate();
    }
  }

  async function handleAddItem() {
    const maxOrder = section.items?.length > 0
      ? Math.max(...section.items.map(i => i.order_index))
      : -1;

    const { error } = await supabase
      .from('menu_items')
      .insert([{
        section_id: section.id,
        name: 'New Item',
        description: '',
        price: 0,
        order_index: maxOrder + 1
      }]);

    if (!error) {
      onUpdate();
    }
  }

  return (
    <div className="section-editor">
      <div className="section-header-row">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-button"
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        {editingTitle ? (
          <input
            type="text"
            value={section.title}
            onChange={(e) => handleUpdateSection({ title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
            className="section-title-input"
            autoFocus
          />
        ) : (
          <h4 onClick={() => setEditingTitle(true)} className="section-title">
            {section.title}
          </h4>
        )}

        <div className="section-actions">
          <button onClick={handleAddItem} className="btn-small">
            + Add Item
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this section and all its items?')) {
                handleDeleteSection();
              }
            }}
            className="btn-delete-small"
          >
            Delete
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="section-content">
          <div className="form-group">
            <label>Section Description</label>
            <input
              type="text"
              value={section.description}
              onChange={(e) => handleUpdateSection({ description: e.target.value })}
              className="form-control"
              placeholder="Optional section description"
            />
          </div>

          <div className="items-list">
            {section.items?.map((item, index) => (
              <ItemEditor
                key={item.id}
                item={item}
                onUpdate={onUpdate}
              />
            ))}

            {(!section.items || section.items.length === 0) && (
              <p className="empty-message">No items yet. Add your first item!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
