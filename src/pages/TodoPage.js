import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import ModuleDropdown from '../components/ModuleDropdown';
import TaskCard from '../components/TaskCard';
import { addTaskRecord, getAllTaskRecords, deleteTaskRecord } from '../services/db';
import { saveAs } from 'file-saver';
export default function TodoPage() {
    // 分類：初始不寫死，避免覆蓋 localStorage 內容
    const [categories, setCategories] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        content: '',
        category: '',
        priority: '中',
        date: '',
        startHour: '',
        startMinute: '',
        endHour: '',
        endMinute: '',
        reminder: '10',
        remindBeforeMinutes: 10,
        status: '未開始'
    });
    // 預設時間
    useEffect(() => {
        const now = new Date();
        now.setSeconds(0, 0);
        const rounded = new Date(now);
        rounded.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
        const end = new Date(rounded);
        end.setMinutes(end.getMinutes() + 30);
        setNewTask(task => ({
            ...task,
            date: rounded.toISOString().split('T')[0],
            startHour: String(rounded.getHours()).padStart(2, '0'),
            startMinute: String(rounded.getMinutes()).padStart(2, '0'),
            endHour: String(end.getHours()).padStart(2, '0'),
            endMinute: String(end.getMinutes()).padStart(2, '0')
        }));
    }, []);
    // 載入分類與任務（僅在首次掛載時）
    useEffect(() => {
        // 優先從 localStorage 載入，如果沒有則使用預設分類
        const savedCats = localStorage.getItem('categories');
        const savedTasks = localStorage.getItem('tasks');
        if (savedCats) {
            setCategories(JSON.parse(savedCats));
        }
        else {
            // 如果沒有儲存的分類，給一組預設分類
            const defaults = [
                { id: 'work', name: '工作', color: '#3b82f6' },
                { id: 'exercise', name: '運動', color: '#10b981' },
                { id: 'reading', name: '閱讀', color: '#f59e0b' }
            ];
            setCategories(defaults);
            localStorage.setItem('categories', JSON.stringify(defaults));
        }
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }
        // 從 Dexie 載入（若存在），優先以 Dexie 覆蓋
        getAllTaskRecords().then(list => {
            if (list && list.length > 0) {
                setTasks(list);
            }
        }).catch(() => { });
        // 可選：從 API 載入分類（取消註釋以啟用）
        // fetchCategories().then(data => setCategories(data))
        setLoaded(true);
    }, []);
    // 儲存分類與任務（避免在尚未載入完成時覆蓋既有資料）
    useEffect(() => {
        if (!loaded)
            return;
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [categories, tasks, loaded]);
    const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '未分類';
    const getCategoryColor = (id) => categories.find(c => c.id === id)?.color || '#3B82F6';
    const addTask = () => {
        if (!newTask.content.trim())
            return;
        const id = Date.now().toString();
        const task = {
            id,
            title: newTask.content.trim(),
            description: '',
            category: newTask.category,
            priority: newTask.priority,
            date: newTask.date,
            startHour: newTask.startHour,
            startMinute: newTask.startMinute,
            endHour: newTask.endHour,
            endMinute: newTask.endMinute,
            reminder: newTask.reminder,
            remindBeforeMinutes: Number(newTask.reminder || '10'),
            status: newTask.status
        };
        setTasks(prev => [...prev, task]);
        // 寫入 Dexie
        addTaskRecord({
            ...task,
            createdAt: new Date().toISOString()
        });
        setNewTask(t => ({ ...t, content: '' }));
    };
    // 切換任務狀態
    const toggleTaskStatus = (taskId) => {
        setTasks(prev => prev.map(task => task.id === taskId
            ? { ...task, status: task.status === '已完成' ? '未開始' : '已完成' }
            : task));
    };
    // 刪除任務（帶確認）
    const deleteTask = (taskId, taskTitle) => {
        if (window.confirm(`確定要刪除任務「${taskTitle}」嗎？`)) {
            setTasks(prev => prev.filter(task => task.id !== taskId));
            deleteTaskRecord(taskId);
        }
    };
    // 匯出 CSV（使用 Capacitor 匯出功能）
    const handleExportCSV = async () => {
        try {
            // 使用 TodoExportButton 組件的匯出邏輯
            const { exportTodosToCSVWithCapacitor } = await import('../services/todoCsvExportService');
            
            const result = await exportTodosToCSVWithCapacitor(tasks, categories);
            
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsxs("div", { className: "w-full px-4 py-4", children: [_jsx(ModuleDropdown, {}), _jsx("h1", { className: "text-2xl font-bold mb-6 text-center", children: "\uD83D\uDCDD \u5F85\u8FA6\u6E05\u55AE" }), _jsxs("div", { className: "rounded-lg bg-white shadow-md mb-4 p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-4 text-center text-gray-900 dark:text-white", children: "\uD83D\uDCCB \u65B0\u589E\u4EFB\u52D9" }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "w-full", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "\uD83D\uDCCB \u4EFB\u52D9\u5167\u5BB9" }), _jsx("textarea", { title: "\u8F38\u5165\u4EFB\u52D9\u5167\u5BB9", placeholder: "\u8ACB\u8F38\u5165\u4ECA\u5929\u60F3\u5B8C\u6210\u7684\u4EFB\u52D9...", value: newTask.content, onChange: e => setNewTask({ ...newTask, content: e.target.value }), className: "w-full px-3 py-2 rounded shadow-md text-sm border border-gray-300 focus:border-blue-500 focus:outline-none resize-none", rows: 2 })] }), _jsxs("div", { className: "w-full", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "\uD83C\uDFF7\uFE0F \u5206\u985E" }), _jsxs("select", { title: "\u9078\u64C7\u5206\u985E", value: newTask.category, onChange: e => setNewTask({ ...newTask, category: e.target.value }), className: "w-full px-3 py-2 text-base rounded border border-gray-300 leading-normal", style: { color: newTask.category ? getCategoryColor(newTask.category) : undefined }, children: [_jsx("option", { value: "", children: "\u9078\u64C7\u5206\u985E" }), categories.map(c => (_jsx("option", { value: c.id, style: { color: c.color }, children: `● ${c.name}` }, c.id)))] }), _jsx("button", { onClick: () => window.location.href = '/category-manager', className: "mt-2 w-full px-3 py-2 rounded-lg shadow text-sm bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] border-0", style: { background: '#3b82f6', border: 'none', color: '#ffffff' }, children: "\uD83D\uDEE0\uFE0F \u7BA1\u7406\u5206\u985E" }), newTask.category && (_jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 rounded-full border-2 border-gray-300 category-color-preview", style: { backgroundColor: getCategoryColor(newTask.category) } }), _jsx("span", { className: "text-sm text-gray-600", children: "\u5206\u985E\u984F\u8272\u9810\u89BD" })] }))] }), _jsxs("div", { className: "w-full", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "\uD83D\uDEA6 \u512A\u5148\u9806\u5E8F" }), _jsxs("select", { title: "\u9078\u64C7\u512A\u5148\u9806\u5E8F", value: newTask.priority, onChange: e => setNewTask({ ...newTask, priority: e.target.value }), className: "w-full px-3 py-2 text-base rounded border border-gray-300 leading-normal", children: [_jsx("option", { value: "\u4F4E", children: "\u4F4E" }), _jsx("option", { value: "\u4E2D", children: "\u4E2D" }), _jsx("option", { value: "\u9AD8", children: "\u9AD8" })] })] }), _jsxs("div", { className: "w-full", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "\uD83D\uDDD3\uFE0F \u4EFB\u52D9\u65E5\u671F" }), _jsx("input", { type: "date", title: "\u9078\u64C7\u4EFB\u52D9\u65E5\u671F", placeholder: "\u8ACB\u9078\u64C7\u65E5\u671F", value: newTask.date, onChange: e => setNewTask({ ...newTask, date: e.target.value }), className: "w-full text-base py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "w-full", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "\uD83D\uDD50 \u958B\u59CB\u6642\u9593" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("select", { title: "\u9078\u64C7\u958B\u59CB\u5C0F\u6642", className: "flex-1 px-3 py-2 text-base rounded border border-gray-300 leading-normal", value: newTask.startHour, onChange: e => setNewTask({ ...newTask, startHour: e.target.value }), children: Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (_jsx("option", { value: h, children: h }, h))) }), _jsx("span", { className: "flex items-center text-lg", children: ":" }), _jsx("select", { title: "\u9078\u64C7\u958B\u59CB\u5206\u9418", className: "flex-1 px-3 py-2 text-base rounded border border-gray-300 leading-normal", value: newTask.startMinute, onChange: e => setNewTask({ ...newTask, startMinute: e.target.value }), children: ["00", "15", "30", "45"].map(m => (_jsx("option", { value: m, children: m }, m))) })] })] }), _jsxs("div", { className: "w-full", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "\u23F0 \u7D50\u675F\u6642\u9593" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("select", { title: "\u9078\u64C7\u7D50\u675F\u5C0F\u6642", className: "flex-1 px-3 py-2 text-base rounded border border-gray-300 leading-normal", value: newTask.endHour, onChange: e => setNewTask({ ...newTask, endHour: e.target.value }), children: Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (_jsx("option", { value: h, children: h }, h))) }), _jsx("span", { className: "flex items-center text-lg", children: ":" }), _jsx("select", { title: "\u9078\u64C7\u7D50\u675F\u5206\u9418", className: "flex-1 px-3 py-2 text-base rounded border border-gray-300 leading-normal", value: newTask.endMinute, onChange: e => setNewTask({ ...newTask, endMinute: e.target.value }), children: ["00", "15", "30", "45"].map(m => (_jsx("option", { value: m, children: m }, m))) })] })] }), _jsxs("div", { className: "w-full", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "\uD83D\uDD14 \u63D0\u9192\u6642\u9593" }), (() => {
                                        const reminderEnabled = newTask.reminder !== '0';
                                        const reminderValue = Math.max(1, Math.min(600, Number(newTask.reminder || '10')));
                                        return (_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center gap-3 cursor-pointer text-sm", children: [_jsx("input", { type: "checkbox", checked: reminderEnabled, onChange: (e) => {
                                                                const enabled = e.target.checked;
                                                                setNewTask({ ...newTask, reminder: enabled ? (newTask.reminder === '0' ? '10' : newTask.reminder) : '0' });
                                                            }, className: "rounded border-gray-300 text-purple-600 focus:ring-purple-500", style: { accentColor: '#8b5cf6' } }), _jsx("span", { className: "text-gray-800 dark:text-gray-200", children: "\u555F\u7528\u63D0\u9192" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 dark:text-gray-300 mb-1", children: "\u63D0\u9192\u524D\uFF08\u5E7E\u5206\u9418\uFF09" }), _jsx("input", { type: "number", min: 1, max: 600, value: reminderEnabled ? reminderValue : '', onChange: (e) => {
                                                                const v = e.target.value;
                                                                if (v === '') {
                                                                    setNewTask({ ...newTask, reminder: '0' });
                                                                }
                                                                else {
                                                                    const num = Math.max(1, Math.min(600, Number(v)));
                                                                    setNewTask({ ...newTask, reminder: String(num) });
                                                                }
                                                            }, placeholder: "\u8F38\u5165\u63D0\u9192\u6642\u9593\uFF08\u5206\u9418\uFF09", className: "w-full rounded border border-gray-300 p-2 text-sm", disabled: !reminderEnabled }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u8F38\u5165\u63D0\u9192\u6642\u9593\uFF08\u55AE\u4F4D\uFF1A\u5206\u9418\uFF09\uFF0C\u5EFA\u8B70 1\uFF5E600\uFF0810 \u5C0F\u6642\uFF09" })] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [10, 30, 60].map((m) => (_jsx("button", { type: "button", onClick: () => reminderEnabled && setNewTask({ ...newTask, reminder: String(m) }), className: `px-3 py-1 rounded border text-sm whitespace-nowrap ${Number(newTask.reminder) === m ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`, disabled: !reminderEnabled, children: `常用${m}分` }, m))) })] }));
                                    })()] }), _jsx("div", { className: "w-full", children: _jsx("button", { onClick: addTask, className: "w-full text-base px-4 py-2 rounded-lg shadow bg-purple-500 text-white hover:bg-purple-600 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] flex items-center justify-center gap-2 border-0", style: { background: '#8b5cf6', border: 'none', color: '#ffffff' }, children: "\uD83D\uDCBE \u5132\u5B58\u4EFB\u52D9" }) })] })] }), _jsx("div", { className: "flex justify-center mb-3", children: _jsx("div", { className: "w-full max-w-xs", children: _jsx("button", { onClick: handleExportCSV, className: "w-full text-base px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:outline-none border-0", style: { background: '#16a34a', border: 'none', color: '#ffffff', boxShadow: 'none' }, onMouseEnter: (e) => { e.currentTarget.style.background = '#15803d'; }, onMouseLeave: (e) => { e.currentTarget.style.background = '#16a34a'; }, children: "\uD83D\uDCE4 \u532F\u51FA\u5F85\u8FA6\u8A18\u9304\uFF08CSV\uFF09" }) }) }), tasks.length > 0 && (_jsxs("div", { className: "rounded-lg bg-white shadow-md mb-4 p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-4 text-center text-gray-900 dark:text-white", children: "\uD83D\uDCCA \u4EFB\u52D9\u7D71\u8A08" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm py-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: tasks.length }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "\u7E3D\u4EFB\u52D9" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-green-600", children: tasks.filter(t => t.status === '已完成').length }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "\u5DF2\u5B8C\u6210" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-yellow-600", children: tasks.filter(t => t.status === '進行中').length }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "\u9032\u884C\u4E2D" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-bold text-gray-600", children: tasks.filter(t => t.status === '未開始').length }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "\u672A\u958B\u59CB" })] })] })] })), _jsx("h2", { className: "mt-8 text-xl font-bold mb-4 text-gray-900 dark:text-white", children: "\uD83D\uDCC4 \u4EFB\u52D9\u5217\u8868" }), _jsx("div", { className: "space-y-3", children: tasks.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: [_jsx("p", { className: "text-lg", children: "\uD83D\uDCDD \u9084\u6C92\u6709\u4EFB\u52D9" }), _jsx("p", { className: "text-sm mt-2", children: "\u8ACB\u5728\u4E0A\u65B9\u65B0\u589E\u60A8\u7684\u7B2C\u4E00\u500B\u4EFB\u52D9" })] })) : (tasks.map(t => (_jsx(TaskCard, { task: t, onToggleStatus: toggleTaskStatus, onDelete: deleteTask, getCategoryColor: getCategoryColor, getCategoryName: getCategoryName }, t.id)))) })] })] }));
}
