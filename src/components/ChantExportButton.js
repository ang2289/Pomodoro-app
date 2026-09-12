import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exportChantRecordsToCSVWithCapacitor } from '../services/chantCsvExportService';
import IconButton from '../components/ui/IconButton';
const ChantExportButton = () => {
    const { t } = useTranslation();
    const exportAllChantDataToCSV = async () => {
        try {
            const result = await exportChantRecordsToCSVWithCapacitor();
            
            if (result.success) {
                alert(result.message);
            } else {
                alert(`${t('export_failed')}: ${result.message}`);
            }
        } catch (error) {
            console.error(t('export_failed') + ':', error);
            alert(t('export_failed_try_again'));
        }
    };
    return (_jsx(IconButton, { onClick: exportAllChantDataToCSV, onTouchEnd: (e) => {
            // 防止觸控事件重複觸發
            e.preventDefault();
            e.stopPropagation();
            exportAllChantDataToCSV();
        }, onTouchStart: (e) => {
            e.preventDefault();
        }, variant: "primary", label: "\uD83D\uDCC4 " + t('export_all_scripture_records_csv'), className: "w-1/2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-1.5 px-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg" }));
};
export default ChantExportButton;
