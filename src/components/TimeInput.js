import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function TimeInput({ selectedDate, selectedHour, selectedMinute, onDateChange, onHourChange, onMinuteChange, placeholder = "選擇日期和時間", className = "" }) {
    // 格式化顯示的時間
    const formatTime = () => {
        if (selectedDate) {
            const dateStr = selectedDate.toLocaleDateString('zh-TW');
            const timeStr = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
            return `${dateStr} ${timeStr}`;
        }
        return placeholder;
    };
    // 格式化日期為 YYYY-MM-DD 格式
    const formatDateForInput = (date) => {
        if (!date)
            return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    // 格式化時間為 HH:MM 格式
    const formatTimeForInput = (hour, minute) => {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };
    // 處理日期變更
    const handleDateChange = (e) => {
        const dateValue = e.target.value;
        if (dateValue) {
            const newDate = new Date(dateValue);
            newDate.setHours(selectedHour, selectedMinute, 0, 0);
            onDateChange(newDate);
        }
        else {
            onDateChange(null);
        }
    };
    // 處理時間變更
    const handleTimeChange = (e) => {
        const timeValue = e.target.value;
        if (timeValue) {
            const [hour, minute] = timeValue.split(':').map(Number);
            onHourChange(hour);
            onMinuteChange(minute);
            // 如果有選中的日期，更新完整的日期時間
            if (selectedDate) {
                const newDate = new Date(selectedDate);
                newDate.setHours(hour, minute, 0, 0);
                onDateChange(newDate);
            }
        }
    };
    return (_jsxs("div", { className: `space-y-3 ${className}`, children: [_jsxs("div", { className: "flex flex-col gap-2 w-full", children: [_jsx("label", { className: "text-sm text-gray-700", children: "\u65E5\u671F" }), _jsx("input", { type: "date", value: formatDateForInput(selectedDate), onChange: handleDateChange, className: "border border-gray-300 rounded px-2 py-1 w-full", style: {
                            fontSize: '16px',
                            height: '40px'
                        } }), _jsx("label", { className: "text-sm text-gray-700", children: "\u6642\u9593" }), _jsx("input", { type: "time", value: formatTimeForInput(selectedHour, selectedMinute), onChange: handleTimeChange, className: "border border-gray-300 rounded px-2 py-1 w-full", style: {
                            fontSize: '16px',
                            height: '40px'
                        } })] }), _jsxs("div", { className: "text-sm text-gray-600 bg-gray-50 p-2 rounded", children: ["\u9078\u64C7\u6642\u9593\uFF1A", formatTime()] })] }));
}
