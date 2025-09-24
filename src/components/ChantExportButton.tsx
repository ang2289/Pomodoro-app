import React from 'react';
import { loadChantHistory } from '../utils/chantHistoryStorage';

interface ChantExportButtonProps {
  chant: string;
  today: number;
  total: number;
}

const ChantExportButton: React.FC<ChantExportButtonProps> = ({ chant, today, total }) => {
  const exportAllChantDataToCSV = () => {
    try {
      // 取得所有歷史紀錄
      const allRecords = loadChantHistory();
      
      if (allRecords.length === 0) {
        alert('目前沒有任何經文紀錄');
        return;
      }

      // CSV 標題行
      const headers = ['經文名稱', '日期', '次數', '記錄時間'];
      
      // 轉換資料為 CSV 格式
      const csvRows = [headers];
      
      allRecords.forEach((record: any) => {
        csvRows.push([
          record.chant,
          new Date(record.date).toLocaleDateString('zh-TW'),
          record.count.toString(),
          new Date(record.date).toLocaleString('zh-TW')
        ]);
      });
      
      // 轉換為 CSV 字串 - 使用 UTF-8 BOM 避免亂碼
      const csvContent = '\uFEFF' + csvRows.map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n');
      
      // 創建並下載檔案
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `所有經文紀錄_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('匯出 CSV 時發生錯誤:', error);
      alert('匯出失敗，請稍後再試');
    }
  };

  return (
    <button
      onClick={exportAllChantDataToCSV}
      style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        padding: '16px 32px',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '0 auto'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#2563eb';
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#3b82f6';
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
      }}
    >
      📄 匯出所有經文紀錄 CSV
    </button>
  );
};

export default ChantExportButton;


