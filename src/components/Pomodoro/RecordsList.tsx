import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
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
  const { t } = useTranslation();

  const formatDateTime = (dateTime: string) => {
    const locale = i18n.language === 'zh_TW' ? 'zh-TW' : 'en-US';
    return new Date(dateTime).toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFocusItemName = (focusItemId: string) => {
    const item = focusItems.find(item => item.id === focusItemId);
    if (!item) {
      return t('pomodoro_focus_item_unknown');
    }
    // 獲取翻譯後的專注項目名稱
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
    // 對於自定義專注項目，使用原始名稱
    return item.name;
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
            📋 {t('completed_records')}
          </h3>
          {isSearchActive ? (
            <div style={{
              marginTop: '5px',
              fontSize: '14px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              {t('search_results')}: {t('found')} {records.length} {t('records')}
              {searchKeyword && (
                <span style={{ marginLeft: '8px' }}>
                  ({t('keyword')}: "{searchKeyword}")
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
              {t('currently_showing_all_records')}, {t('total')} {totalRecords} {t('records')}.
              <br />
              {t('if_too_much_data_suggest_search_or_pagination')}
            </div>
          ) : (
            // 預設顯示提示文字
            <div style={{
              marginTop: '5px',
              fontSize: '14px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              {t('default_five_records_more_available_with_search')}
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
              label={t('export_csv')}
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
          📝 {t('no_completed_records')}
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
                    {record.focusItemId ? getFocusItemName(record.focusItemId) : t('pomodoro_focus_item_unknown')}
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
                    label={t('edit')}
                    onClick={() => onEditRecord(record)}
                    variant="primary"
                    className="px-3 py-1 text-xs hover:scale-105"
                  />
                  <IconButton
                    icon="🗑️"
                    label={t('delete')}
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
