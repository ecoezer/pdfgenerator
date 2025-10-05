import { useState } from 'react';

export default function MenuTypeModal({ templates, onSelect, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const foldTypes = {
    einbruchfalz: {
      title: 'Einbruchfalz',
      description: 'Tek kırımlı orta katlama; yaprak ortadan bir kez katlanır ve iki panel oluşur.',
      icon: '📄'
    },
    wickelfalz: {
      title: 'Wickelfalz',
      description: 'Sargı/rulo katlama; paneller aynı yöne doğru içe doğru sırayla katlanır.',
      icon: '📜'
    },
    zickzackfalz: {
      title: 'Zickzackfalz',
      description: 'Zarf/akordeon (zigzag) katlama; yaprak bir ileri bir geri yönlerde art arda katlanır.',
      icon: '🗂️'
    }
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.fold_type]) {
      acc[template.fold_type] = [];
    }
    acc[template.fold_type].push(template);
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Menü Tipi ve Boyutu Seçin</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          {Object.entries(groupedTemplates).map(([foldType, foldTemplates]) => (
            <div key={foldType} className="fold-type-section">
              <div className="fold-type-header">
                <span className="fold-type-icon">{foldTypes[foldType]?.icon}</span>
                <div className="fold-type-info">
                  <h3>{foldTypes[foldType]?.title}</h3>
                  <p>{foldTypes[foldType]?.description}</p>
                </div>
              </div>

              <div className="template-grid">
                {foldTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="template-card-header">
                      <h4>{template.name}</h4>
                    </div>
                    <div className="template-card-body">
                      <div className="template-spec">
                        <span className="spec-label">Boyut:</span>
                        <span className="spec-value">{template.width_mm}×{template.height_mm}mm</span>
                      </div>
                      <div className="template-spec">
                        <span className="spec-label">Panel:</span>
                        <span className="spec-value">{template.panels} panel</span>
                      </div>
                      <div className="template-spec">
                        <span className="spec-label">Bleed:</span>
                        <span className="spec-value">{template.bleed_mm}mm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            İptal
          </button>
          <button
            onClick={() => {
              if (selectedTemplate) {
                onSelect(selectedTemplate);
              }
            }}
            disabled={!selectedTemplate}
            className="btn-primary"
          >
            Menü Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}
