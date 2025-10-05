import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import MenuEditor from './MenuEditor';
import MenuPreview from './MenuPreview';
import MenuTypeModal from './MenuTypeModal';

export default function MenuBuilder() {
  const [templates, setTemplates] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadMenus();
  }, []);

  async function loadTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('name');

    if (!error && data) {
      setTemplates(data);
    }
    setLoading(false);
  }

  async function loadMenus() {
    const { data, error } = await supabase
      .from('menus')
      .select('*, templates(name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMenus(data);
    }
  }

  async function handleCreateMenu(template) {
    const { data, error } = await supabase
      .from('menus')
      .insert([{
        name: 'New Menu',
        template_id: template.id,
        description: '',
        background_color: '#FFFFFF',
        text_color: '#000000',
        accent_color: '#FF6B35'
      }])
      .select()
      .single();

    if (!error && data) {
      setMenus([data, ...menus]);
      setSelectedMenu(data);
      setShowTypeModal(false);
    }
  }

  async function handleDeleteMenu(menuId) {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId);

    if (!error) {
      setMenus(menus.filter(m => m.id !== menuId));
      if (selectedMenu?.id === menuId) {
        setSelectedMenu(null);
      }
    }
  }

  function handleMenuUpdated(updatedMenu) {
    setMenus(menus.map(m => m.id === updatedMenu.id ? updatedMenu : m));
    setSelectedMenu(updatedMenu);
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="menu-builder">
      {showTypeModal && (
        <MenuTypeModal
          templates={templates}
          onSelect={handleCreateMenu}
          onClose={() => setShowTypeModal(false)}
        />
      )}

      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Your Menus</h2>
          <button onClick={() => setShowTypeModal(true)} className="btn-primary">
            + New Menu
          </button>
        </div>
        <div className="menu-list">
          {menus.map(menu => (
            <div
              key={menu.id}
              className={`menu-card ${selectedMenu?.id === menu.id ? 'active' : ''}`}
              onClick={() => setSelectedMenu(menu)}
            >
              <div className="menu-card-content">
                <h3>{menu.name}</h3>
                <p className="template-name">{menu.templates?.name}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this menu?')) {
                    handleDeleteMenu(menu.id);
                  }
                }}
                className="btn-delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        {selectedMenu ? (
          <div className="editor-layout">
            <MenuEditor
              menu={selectedMenu}
              templates={templates}
              onMenuUpdated={handleMenuUpdated}
            />
            <MenuPreview menu={selectedMenu} />
          </div>
        ) : (
          <div className="empty-state">
            <h2>Create your first menu</h2>
            <p>Click "New Menu" to get started with your print-ready PDF menu</p>
          </div>
        )}
      </div>
    </div>
  );
}
