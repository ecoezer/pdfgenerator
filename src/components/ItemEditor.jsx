import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ItemEditor({ item, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    price: item.price
  });

  async function handleUpdate() {
    const { error } = await supabase
      .from('menu_items')
      .update(formData)
      .eq('id', item.id);

    if (!error) {
      setIsEditing(false);
      onUpdate();
    }
  }

  async function handleDelete() {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', item.id);

    if (!error) {
      onUpdate();
    }
  }

  if (isEditing) {
    return (
      <div className="item-editor editing">
        <div className="form-group">
          <label>Item Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-control"
            rows="2"
            placeholder="Optional description"
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="form-control"
          />
        </div>

        <div className="item-actions">
          <button onClick={handleUpdate} className="btn-primary btn-small">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="btn-secondary btn-small">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="item-editor">
      <div className="item-display">
        <div className="item-info">
          <h5>{item.name}</h5>
          {item.description && <p className="item-description">{item.description}</p>}
        </div>
        <div className="item-price">${parseFloat(item.price).toFixed(2)}</div>
      </div>
      <div className="item-actions">
        <button onClick={() => setIsEditing(true)} className="btn-secondary btn-small">
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm('Delete this item?')) {
              handleDelete();
            }
          }}
          className="btn-delete-small"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
