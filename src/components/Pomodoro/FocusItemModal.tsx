import React from 'react';
import { FocusItem } from '../../types/FocusItem';

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
  const colors = [
    { hex: '#3b82f6', name: '藍色' },
    { hex: '#22c55e', name: '綠色' },
    { hex: '#f97316', name: '橘色' },
    { hex: '#a855f7', name: '紫色' },
    { hex: '#ef4444', name: '紅色' },
    { hex: '#eab308', name: '黃色' }
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
            🎯 專注項目管理
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
            ➕ 新增專注項目
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#555'
            }}>
              項目名稱：
            </label>
            <input
              type="text"
              placeholder="輸入專注項目名稱..."
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
              選擇顏色：
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
            ➕ 新增項目
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
            📋 現有專注項目
          </h3>
          
          {focusItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666',
              fontSize: '14px'
            }}>
              尚無專注項目
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
                      {item.name}
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
                          儲存
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
                          取消
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onEditingFocusItemNameChange(item.name);
                            // 這裡需要觸發編輯模式，但需要從父組件傳入
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: '1px solid #007bff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                            color: '#007bff'
                          }}
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => onDeleteFocusItem(item.id)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: '1px solid #dc3545',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                            color: '#dc3545'
                          }}
                        >
                          刪除
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
