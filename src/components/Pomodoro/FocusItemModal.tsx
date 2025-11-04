import React from 'react';
import { FocusItem } from '../../types/FocusItem';
import { useTranslation } from 'react-i18next';

interface FocusItemModalProps {
  show: boolean;
  onClose: () => void;
  focusItems: FocusItem[];
  newFocusItemName: string;
  onNewFocusItemNameChange: (name: string) => void;
  onAddFocusItem: () => void;
  editingFocusItem: FocusItem | null;
  editingFocusItemName: string;
  onEditingFocusItemNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteFocusItem: (id: string) => void;
  selectedColor: string;
  onSelectedColorChange: (color: string) => void;
}

const FocusItemModal: React.FC<FocusItemModalProps> = ({
  show,
  onClose,
  focusItems,
  newFocusItemName,
  onNewFocusItemNameChange,
  onAddFocusItem,
  editingFocusItem,
  editingFocusItemName,
  onEditingFocusItemNameChange,
  onSaveEdit,
  onCancelEdit,
  onDeleteFocusItem,
  selectedColor,
  onSelectedColorChange
}) => {
  const { t } = useTranslation();
  const colors = [
    { hex: '#3b82f6', name: t('blue') },
    { hex: '#22c55e', name: t('green') },
    { hex: '#f97316', name: t('orange') },
    { hex: '#a855f7', name: t('purple') },
    { hex: '#ef4444', name: t('red') },
    { hex: '#eab308', name: t('yellow') }
  ];

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        {/* 標題和關閉按鈕 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#333'
          }}>
            🎯 {t('focus_item_management')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* 新增專注項目 */}
        <div className="card" style={{
          marginBottom: '30px',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#333'
          }}>
            ➕ {t('add_focus_item')}
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#555'
            }}>
              {t('item_name')}：
            </label>
            <input
              type="text"
              placeholder={t('enter_focus_item_name')}
              value={newFocusItemName}
              onChange={(e) => onNewFocusItemNameChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 顏色選擇器 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#555'
            }}>
              {t('select_color')}：
            </label>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => onSelectedColorChange(color.hex)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: selectedColor === color.hex ? '3px solid #333' : '2px solid #ddd',
                    backgroundColor: color.hex,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: 'white',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}
                  title={color.name}
                >
                  {selectedColor === color.hex ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onAddFocusItem}
            disabled={!newFocusItemName.trim()}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '6px',
              cursor: newFocusItemName.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              backgroundColor: newFocusItemName.trim() ? '#4ecdc4' : '#ccc',
              color: 'white'
            }}
            >
              ➕ {t('new_focus_item')}
            </button>
        </div>

        {/* 專注項目列表 */}
        <div>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#333'
          }}>
            📋 {t('existing_focus_items')}
          </h3>
          
          {focusItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666',
              fontSize: '14px'
            }}>
              {t('no_focus_items')}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {focusItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {/* 顏色圓點 */}
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: item.color || '#4caf50',
                    flexShrink: 0
                  }} />
                  
                  {/* 項目名稱 */}
                  {editingFocusItem?.id === item.id ? (
                    <input
                      type="text"
                      value={editingFocusItemName}
                      onChange={(e) => onEditingFocusItemNameChange(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        fontSize: '14px',
                        border: '1px solid #4ecdc4',
                        borderRadius: '4px',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <span style={{
                      flex: 1,
                      fontSize: '14px',
                      color: '#333',
                      fontWeight: '500'
                    }}>
                      {(() => {
                        const defaultFocusItemNames = ['讀書', '寫作', '工作', '運動', '冥想', '抄經'];
                        if (defaultFocusItemNames.includes(item.name)) {
                          const translationKey = `focus_items_list.${item.name}`;
                          const translated = t(translationKey);
                          // 如果翻譯返回的是對象或與鍵相同，則使用原始名稱
                          if (typeof translated === 'string' && translated !== translationKey) {
                            return translated;
                          }
                          return item.name;
                        }
                        return item.name;
                      })()}
                    </span>
                  )}
                  
                  {/* 操作按鈕 */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    flexShrink: 0
                  }}>
                    {editingFocusItem?.id === item.id ? (
                      <>
                        <button
                          onClick={onSaveEdit}
                          disabled={!editingFocusItemName.trim()}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: editingFocusItemName.trim() ? 'pointer' : 'not-allowed',
                            backgroundColor: editingFocusItemName.trim() ? '#28a745' : '#ccc',
                            color: 'white'
                          }}
                        >
                          {t('save')}
                        </button>
                        <button
                          onClick={onCancelEdit}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: '1px solid #6c757d',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                            color: '#6c757d'
                          }}
                        >
                          {t('cancel')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onEditingFocusItemNameChange(item.name);
                            // 這裡需要觸發編輯模式，但需要從父組件傳入
                          }}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:scale-105"
                        >
                          <span>✏️</span>
                          <span>{t('edit')}</span>
                        </button>
                        <button
                          onClick={() => onDeleteFocusItem(item.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:scale-105"
                        >
                          <span>🗑️</span>
                          <span>{t('delete')}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusItemModal;
