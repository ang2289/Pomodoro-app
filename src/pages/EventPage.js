import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/input';
export default function EventPage() {
    const { id: groupId } = useParams();
    const navigate = useNavigate();
    // 表單狀態
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [eventType, setEventType] = useState('meeting');
    const [repeatType, setRepeatType] = useState('none');
    // 活動列表狀態
    const [events, setEvents] = useState([]);
    // 處理表單提交
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !selectedDate) {
            alert('請填寫活動標題並選擇日期');
            return;
        }
        const newEvent = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            date: selectedDate,
            hour: selectedHour,
            minute: selectedMinute,
            type: eventType,
            repeat: repeatType,
            groupId: groupId || ''
        };
        setEvents(prev => [...prev, newEvent]);
        // 重置表單
        setTitle('');
        setDescription('');
        setSelectedDate(new Date());
        setSelectedHour(9);
        setSelectedMinute(0);
        setEventType('meeting');
        setRepeatType('none');
        alert('活動已建立！');
    };
    // 刪除活動
    const handleDeleteEvent = (eventId) => {
        if (confirm('確定要刪除這個活動嗎？')) {
            setEvents(prev => prev.filter(event => event.id !== eventId));
        }
    };
    // 格式化活動時間顯示
    const formatEventTime = (event) => {
        const dateStr = event.date.toLocaleDateString('zh-TW');
        const timeStr = `${event.hour.toString().padStart(2, '0')}:${event.minute.toString().padStart(2, '0')}`;
        return `${dateStr} ${timeStr}`;
    };
    // 活動類型標籤樣式
    const getTypeLabel = (type) => {
        const labels = {
            meeting: '會議',
            task: '任務',
            reminder: '提醒',
            other: '其他'
        };
        return labels[type] || type;
    };
    const getTypeColor = (type) => {
        const colors = {
            meeting: 'bg-blue-100 text-blue-800',
            task: 'bg-green-100 text-green-800',
            reminder: 'bg-yellow-100 text-yellow-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: _jsxs("div", { className: "max-w-4xl mx-auto p-4", children: [_jsxs("div", { className: "mb-6", children: [_jsx("button", { onClick: () => navigate(-1), className: "mb-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600", children: "\u2190 \u8FD4\u56DE" }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "\u6D3B\u52D5\u7BA1\u7406" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "\u5EFA\u7ACB\u548C\u7BA1\u7406\u7FA4\u7D44\u6D3B\u52D5" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4 text-gray-900 dark:text-white", children: "\u5EFA\u7ACB\u65B0\u6D3B\u52D5" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "\u6D3B\u52D5\u6A19\u984C *" }), _jsx(Input, { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "\u8F38\u5165\u6D3B\u52D5\u6A19\u984C", className: "w-full", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "\u6D3B\u52D5\u63CF\u8FF0" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "\u8F38\u5165\u6D3B\u52D5\u63CF\u8FF0\uFF08\u9078\u586B\uFF09", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white", rows: 3 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "\u6D3B\u52D5\u65E5\u671F *" }), _jsx("input", { type: "date", value: selectedDate ? selectedDate.toISOString().split('T')[0] : '', onChange: (e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "\u6D3B\u52D5\u6642\u9593 *" }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-xs text-gray-600 dark:text-gray-400 mb-1", children: "\u5C0F\u6642" }), _jsx("select", { value: selectedHour, onChange: (e) => setSelectedHour(parseInt(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center", children: Array.from({ length: 24 }, (_, i) => (_jsx("option", { value: i, children: i.toString().padStart(2, '0') }, i))) })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-xs text-gray-600 dark:text-gray-400 mb-1", children: "\u5206\u9418" }), _jsx("select", { value: selectedMinute, onChange: (e) => setSelectedMinute(parseInt(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center", children: [0, 15, 30, 45].map(minute => (_jsx("option", { value: minute, children: minute.toString().padStart(2, '0') }, minute))) })] })] }), _jsxs("div", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-600 p-2 rounded", children: ["\u9078\u64C7\u6642\u9593\uFF1A", selectedDate ? selectedDate.toLocaleDateString('zh-TW') : '未選擇日期', " ", selectedHour.toString().padStart(2, '0'), ":", selectedMinute.toString().padStart(2, '0')] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "\u6D3B\u52D5\u985E\u578B" }), _jsxs("select", { value: eventType, onChange: (e) => setEventType(e.target.value), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white", children: [_jsx("option", { value: "meeting", children: "\u6703\u8B70" }), _jsx("option", { value: "task", children: "\u4EFB\u52D9" }), _jsx("option", { value: "reminder", children: "\u63D0\u9192" }), _jsx("option", { value: "other", children: "\u5176\u4ED6" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "\u91CD\u8907\u8A2D\u5B9A" }), _jsxs("select", { value: repeatType, onChange: (e) => setRepeatType(e.target.value), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white", children: [_jsx("option", { value: "none", children: "\u4E0D\u91CD\u8907" }), _jsx("option", { value: "daily", children: "\u6BCF\u65E5" }), _jsx("option", { value: "weekly", children: "\u6BCF\u9031" }), _jsx("option", { value: "monthly", children: "\u6BCF\u6708" })] })] }), _jsx(Button, { type: "submit", variant: "blue", className: "w-full", children: "\u5EFA\u7ACB\u6D3B\u52D5" })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4 text-gray-900 dark:text-white", children: "\u6D3B\u52D5\u5217\u8868" }), events.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: [_jsx("p", { children: "\u5C1A\u7121\u6D3B\u52D5" }), _jsx("p", { className: "text-sm", children: "\u5EFA\u7ACB\u60A8\u7684\u7B2C\u4E00\u500B\u6D3B\u52D5" })] })) : (_jsx("div", { className: "space-y-3", children: events
                                        .sort((a, b) => {
                                        const dateA = new Date(a.date);
                                        const dateB = new Date(b.date);
                                        dateA.setHours(a.hour, a.minute);
                                        dateB.setHours(b.hour, b.minute);
                                        return dateA.getTime() - dateB.getTime();
                                    })
                                        .map((event) => (_jsxs("div", { className: "border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h3", { className: "font-medium text-gray-900 dark:text-white", children: event.title }), _jsx("button", { onClick: () => handleDeleteEvent(event.id), className: "bg-red-500 text-white font-semibold py-1 px-3 rounded text-sm hover:bg-red-600", children: "\u522A\u9664" })] }), event.description && (_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-2", children: event.description })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`, children: getTypeLabel(event.type) }), event.repeat !== 'none' && (_jsx("span", { className: "px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium", children: event.repeat === 'daily' ? '每日' :
                                                                    event.repeat === 'weekly' ? '每週' : '每月' }))] }), _jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: formatEventTime(event) })] })] }, event.id))) }))] })] })] }) }));
}
