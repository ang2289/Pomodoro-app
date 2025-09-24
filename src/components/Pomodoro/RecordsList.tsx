import React from 'react';
import { PomodoroRecord } from '../../types/PomodoroRecord';
import { FocusItem } from '../../types/FocusItem';

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
}

const RecordsList: React.FC<RecordsListProps> = ({
  records,
  focusItems,
  onEditRecord,
  onDeleteRecord,
  onExportRecords,
  exportStatus
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
        <h3 style={{ 
          margin: '0', 
          color: '#333',
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          📋 完成紀錄
        </h3>
        
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
            <button
              onClick={onExportRecords}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#28a745',
                color: 'white'
              }}
            >
              📊 匯出 CSV
            </button>
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
          gap: '12px'
        }}>
          {records.map((record) => (
            <div
              key={record.id}
              className="card"
              style={{
                padding: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: record.focusItemColor || '#4caf50'
                    }} />
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {getFocusItemName(record.focusItemId)}
                    </span>
                  </div>
                  
                  {record.description && (
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      {record.description}
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: '13px',
                    color: '#888'
                  }}>
                    🕒 {formatDateTime(record.completedAt)}
                  </div>
                </div>
                
                {/* 編輯和刪除按鈕 */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexShrink: 0
                }}>
                  <button
                    onClick={() => onEditRecord(record)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: '1px solid #007bff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: 'transparent',
                      color: '#007bff'
                    }}
                  >
                    ✏️ 編輯
                  </button>
                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: '1px solid #dc3545',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: 'transparent',
                      color: '#dc3545'
                    }}
                  >
                    🗑️ 刪除
                  </button>
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
