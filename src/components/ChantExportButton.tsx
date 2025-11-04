import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exportChantRecordsToCSVWithCapacitor } from '../services/chantCsvExportService';
import IconButton from '../components/ui/IconButton';

interface ChantExportButtonProps {
  chant?: string;
  today?: number;
  total?: number;
}

const ChantExportButton: React.FC<ChantExportButtonProps> = () => {
  const { t } = useTranslation()
  const [exportStatus, setExportStatus] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    message: ''
  })

  const exportAllChantDataToCSV = async () => {
    try {
      const result = await exportChantRecordsToCSVWithCapacitor()
      
      if (result.success) {
        setExportStatus({
          show: true,
          type: 'success',
          message: result.message
        })
        
        // 顯示 alert 提示使用者檔案已儲存
        alert(result.message)
        
        setTimeout(() => {
          setExportStatus(prev => ({ ...prev, show: false }))
        }, 5000)
      } else {
        setExportStatus({
          show: true,
          type: 'error',
          message: result.message
        })
        setTimeout(() => {
          setExportStatus(prev => ({ ...prev, show: false }))
        }, 3000)
      }
    } catch (error) {
      console.error(t('export_failed') + ':', error)
      setExportStatus({
        show: true,
        type: 'error',
        message: t('export_failed_try_again')
      })
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, show: false }))
      }, 3000)
    }
  }

  return (
    <div className="mb-4">
      {/* 匯出狀態提示 */}
      {exportStatus.show && exportStatus.type === 'success' && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid #c3e6cb',
          marginBottom: '10px'
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
          border: '1px solid #f5c6cb',
          marginBottom: '10px'
        }}>
          ❌ {exportStatus.message}
        </div>
      )}
      
      {/* 匯出按鈕 */}
      <IconButton
        onClick={exportAllChantDataToCSV}
        onTouchEnd={(e) => {
          // 防止觸控事件重複觸發
          e.preventDefault();
          e.stopPropagation();
          console.log('觸發念經記錄CSV匯出 - 觸控事件');
          exportAllChantDataToCSV();
        }}
        onTouchStart={(e) => {
          // 防止觸控事件重複觸發
          e.preventDefault();
          console.log('觸控開始 - 念經記錄CSV匯出');
        }}
        variant="primary"
        label={`📄 ${t('export_all_scripture_records_csv')}`}
        className="w-1/2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-1.5 px-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
      />
    </div>
  );
};

export default ChantExportButton;


