import React from 'react';
import { PomodoroRecord } from '../../types/PomodoroRecord';
import { FocusItem } from '../../types/FocusItem';
import IconButton from '../ui/IconButton';
import { Download } from 'lucide-react';

interface RecordsListProps {
  records: PomodoroRecord[];
  focusItems: FocusItem[];
  onEditRecord: (record: PomodoroRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onExportRecords: () => void;
  exportStatus: {
    show: boolean;
    type: 'success' | 'error';
    message: string;
  };
  isSearchActive?: boolean;
  searchKeyword?: string;
  totalRecords?: number;
  showAllRecords?: boolean;
}

const RecordsList: React.FC<RecordsListProps> = ({
  records,
  focusItems,
  onEditRecord,
  onDeleteRecord,
  onExportRecords,
  exportStatus,
  isSearchActive = false,
  searchKeyword = '',
  totalRecords = 0,
  showAllRecords = false
}) => {

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFocusItemName = (focusItemId: string) => {
    const item = focusItems.find(item => item.id === focusItemId);
    return item ? item.name : '未知項目';
  };

  return (
    <div className="card max-w-md mx-auto" style={{
      marginTop: '50px',
      maxWidth: '600px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h3 style={{ 
            margin: '0', 
            color: '#333',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            📋 完成紀錄
          </h3>
          {isSearchActive ? (
            <div style={{
              marginTop: '5px',
              fontSize: '14px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              搜尋結果：找到 {records.length} 筆記錄
              {searchKeyword && (
                <span style={{ marginLeft: '8px' }}>
                  (關鍵字: "{searchKeyword}")
                </span>
              )}
            </div>
          ) : showAllRecords ? (
            // 顯示全部紀錄時的提示文字
            <div style={{
              marginTop: '5px',
              fontSize: '14px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              目前顯示全部紀錄，共 {totalRecords} 筆。
              <br />
              若資料過多，建議使用搜尋功能或設定分頁顯示。
            </div>
          ) : (
            // 預設顯示提示文字
            <div style={{
              marginTop: '5px',
              fontSize: '14px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              預設五筆，更多資料可用搜尋功能
            </div>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* 匯出狀態提示 */}
          {exportStatus.show && exportStatus.type === 'success' && (
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #c3e6cb'
            }}>
              ✅ {exportStatus.message}
            </div>
          )}
          
          {exportStatus.show && exportStatus.type === 'error' && (
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #f5c6cb'
            }}>
              ❌ {exportStatus.message}
            </div>
          )}
          
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            {/* 匯出 CSV 按鈕 */}
            <IconButton
              icon={<Download size={16} />}
              label="匯出 CSV"
              onClick={onExportRecords}
              variant="primary"
              className="px-4 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666',
          fontSize: '16px'
        }}>
          📝 尚無完成紀錄
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {records.map((record) => (
            <div
              key={record.id}
              className="card"
              style={{
                padding: '16px 18px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* 主要內容區域 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: (() => {
                      if (record.focusItemId) {
                        const focusItem = focusItems.find(item => item.id === record.focusItemId);
                        return focusItem ? focusItem.color : '#4caf50';
                      }
                      return '#4caf50';
                    })(),
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    color: '#2d3748',
                    lineHeight: '1.3',
                    flex: 1
                  }}>
                    {record.focusItemId ? getFocusItemName(record.focusItemId) : '未知項目'}
                  </span>
                </div>
                
                {/* 描述和時間區域 */}
                <div style={{
                  paddingLeft: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {record.description && (
                    <div style={{
                      fontSize: '14px',
                      color: '#4a5568',
                      lineHeight: '1.5'
                    }}>
                      {record.description}
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: '13px',
                    color: '#718096',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '12px' }}>🕒</span>
                    <span>{formatDateTime(record.completedAt)}</span>
                  </div>
                </div>
                
                {/* 編輯和刪除按鈕 - 移到下方 */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  paddingLeft: '24px',
                  marginTop: '4px'
                }}>
                  <IconButton
                    icon="✏️"
                    label="編輯"
                    onClick={() => onEditRecord(record)}
                    variant="primary"
                    className="px-3 py-1 text-xs hover:scale-105"
                  />
                  <IconButton
                    icon="🗑️"
                    label="刪除"
                    onClick={() => onDeleteRecord(record.id)}
                    variant="danger"
                    className="px-3 py-1 text-xs hover:scale-105"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordsList;
