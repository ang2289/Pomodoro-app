import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const TimeRangePicker = ({ className = '', onChange, defaultStart, defaultEnd, label = '時間範圍' }) => {
    // 格式化當前時間為 HTML5 datetime-local 格式
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    // 初始化狀態
    const [startTime, setStartTime] = useState(() => {
        if (defaultStart)
            return defaultStart;
        return formatDateTime(new Date());
    });
    const [endTime, setEndTime] = useState(() => {
        if (defaultEnd)
            return defaultEnd;
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + 1); // 預設結束時間為開始時間後1小時
        return formatDateTime(endDate);
    });
    // 當時間改變時，通知父組件
    useEffect(() => {
        if (onChange) {
            onChange({ start: startTime, end: endTime });
        }
    }, [startTime, endTime, onChange]);
    // 處理開始時間變更
    const handleStartTimeChange = (e) => {
        const newStartTime = e.target.value;
        setStartTime(newStartTime);
        // 如果結束時間早於開始時間，自動調整結束時間
        if (newStartTime && endTime && newStartTime >= endTime) {
            const startDate = new Date(newStartTime);
            startDate.setHours(startDate.getHours() + 1);
            setEndTime(formatDateTime(startDate));
        }
    };
    // 處理結束時間變更
    const handleEndTimeChange = (e) => {
        const newEndTime = e.target.value;
        setEndTime(newEndTime);
        // 如果結束時間早於開始時間，自動調整開始時間
        if (startTime && newEndTime && newEndTime <= startTime) {
            const endDate = new Date(newEndTime);
            endDate.setHours(endDate.getHours() - 1);
            setStartTime(formatDateTime(endDate));
        }
    };
    return (_jsxs("div", { className: `space-y-3 ${className}`, children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: label })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm text-gray-700 dark:text-gray-300", children: "\u958B\u59CB\u6642\u9593" }), _jsxs("div", { className: "flex flex-col gap-2 w-full", children: [_jsx("label", { className: "text-sm text-gray-700 dark:text-gray-300", children: "\u65E5\u671F" }), _jsx("input", { type: "date", value: startTime.split('T')[0], onChange: (e) => {
                                            const newDate = e.target.value;
                                            const time = startTime.split('T')[1] || '00:00';
                                            handleStartTimeChange({ target: { value: `${newDate}T${time}` } });
                                        }, className: "border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full", style: {
                                            fontSize: '16px',
                                            height: '40px'
                                        } }), _jsx("label", { className: "text-sm text-gray-700 dark:text-gray-300", children: "\u6642\u9593" }), _jsx("input", { type: "time", value: startTime.split('T')[1] || '00:00', onChange: (e) => {
                                            const newTime = e.target.value;
                                            const date = startTime.split('T')[0];
                                            handleStartTimeChange({ target: { value: `${date}T${newTime}` } });
                                        }, className: "border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full", style: {
                                            fontSize: '16px',
                                            height: '40px'
                                        } })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm text-gray-700 dark:text-gray-300", children: "\u7D50\u675F\u6642\u9593" }), _jsxs("div", { className: "flex flex-col gap-2 w-full", children: [_jsx("label", { className: "text-sm text-gray-700 dark:text-gray-300", children: "\u65E5\u671F" }), _jsx("input", { type: "date", value: endTime.split('T')[0], onChange: (e) => {
                                            const newDate = e.target.value;
                                            const time = endTime.split('T')[1] || '00:00';
                                            handleEndTimeChange({ target: { value: `${newDate}T${time}` } });
                                        }, className: "border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full", style: {
                                            fontSize: '16px',
                                            height: '40px'
                                        } }), _jsx("label", { className: "text-sm text-gray-700 dark:text-gray-300", children: "\u6642\u9593" }), _jsx("input", { type: "time", value: endTime.split('T')[1] || '00:00', onChange: (e) => {
                                            const newTime = e.target.value;
                                            const date = endTime.split('T')[0];
                                            handleEndTimeChange({ target: { value: `${date}T${newTime}` } });
                                        }, className: "border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full", style: {
                                            fontSize: '16px',
                                            height: '40px'
                                        } })] })] })] }), _jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-600 p-2 rounded", children: [_jsxs("div", { children: ["\u958B\u59CB\uFF1A", startTime ? new Date(startTime).toLocaleString('zh-TW') : '未選擇'] }), _jsxs("div", { children: ["\u7D50\u675F\uFF1A", endTime ? new Date(endTime).toLocaleString('zh-TW') : '未選擇'] })] })] }));
};
export default TimeRangePicker;
