import { jsx as _jsx } from "react/jsx-runtime";
import { saveAs } from 'file-saver';
import { loadChantHistory } from '../utils/chantHistoryStorage';
import IconButton from '../components/ui/IconButton';
const ChantExportButton = () => {
    const exportAllChantDataToCSV = async () => {
        try {
            // 使用 Capacitor 匯出功能
            const { exportChantRecordsToCSVWithCapacitor } = await import('../services/chantCsvExportService');
            
            const result = await exportChantRecordsToCSVWithCapacitor();
            
            if (result.success) {
                alert(result.message);
            } else {
                alert(`匯出失敗：${result.message}`);
            }
        } catch (error) {
            console.error('匯出失敗:', error);
            alert('匯出失敗，請稍後再試');
        }
    };
    return (_jsx(IconButton, { onClick: exportAllChantDataToCSV, onTouchEnd: (e) => {
            // 防止觸控事件重複觸發
            e.preventDefault();
            exportAllChantDataToCSV();
        }, variant: "primary", label: "\uD83D\uDCC4 \u532F\u51FA\u6240\u6709\u7D93\u6587\u8A18\u9304 CSV", className: "!w-1/2 !py-1.5 !px-2" }));
};
export default ChantExportButton;
