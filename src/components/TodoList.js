import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export default function TodoList({ todos, onDelete, onToggleComplete, onEdit, formatDate }) {
    const [tasks, setTasks] = useState(todos);
    const [statistics, setStatistics] = useState({
        total: 0,
        done: 0,
        notStarted: 0,
        doing: 0,
    });
    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        const total = tasks.length;
        const done = tasks.filter(t => t.status === '已完成').length;
        const notStarted = tasks.filter(t => t.status === '未開始').length;
        const doing = tasks.filter(t => t.status === '進行中').length;
        setStatistics({ total, done, notStarted, doing });
    }, [tasks]);
    const handleToggleStatus = (id) => {
        setTasks(prev => prev.map(task => task.id === id
            ? {
                ...task,
                status: task.status === '已完成' ? '未開始' : '已完成'
            }
            : task));
    };
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("p", { children: ["\u7E3D\u4EFB\u52D9\u6578\uFF1A", statistics.total] }), _jsxs("p", { children: ["\u5DF2\u5B8C\u6210\uFF1A", statistics.done] }), _jsxs("p", { children: ["\u672A\u958B\u59CB\uFF1A", statistics.notStarted] }), _jsxs("p", { children: ["\u9032\u884C\u4E2D\uFF1A", statistics.doing] })] }), tasks.map(todo => (_jsxs("div", { className: "w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-4 mb-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: `text-base font-medium mb-2 ${todo.status === '已完成'
                                            ? 'line-through text-gray-400'
                                            : 'text-gray-800'}`, children: todo.title }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\uD83D\uDDD3 ", formatDate(todo.datetime)] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\uD83C\uDFF7\uFE0F \u512A\u5148\u5EA6\uFF1A", _jsx("span", { className: `font-bold ${todo.priority === 'high' ? 'text-red-600' :
                                                    todo.priority === 'medium' ? 'text-orange-600' :
                                                        'text-green-600'}`, children: todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低' })] })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: todo.status === '已完成', onChange: () => {
                                            handleToggleStatus(todo.id);
                                            onToggleComplete?.(todo.id);
                                        }, className: "h-5 w-5 mt-1 text-green-500 cursor-pointer" }), _jsx("span", { className: "sr-only", children: "Toggle task status" })] })] }), _jsxs("div", { className: "mt-4 flex gap-2 justify-end", children: [_jsx("button", { onClick: () => onEdit?.(todo.id), className: "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm transition-colors duration-200", children: "\u270F\uFE0F \u7DE8\u8F2F" }), _jsx("button", { onClick: () => {
                                    if (window.confirm('確定要刪除這個任務嗎？')) {
                                        onDelete(todo.id);
                                    }
                                }, className: "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm transition-colors duration-200", children: "\uD83D\uDDD1\uFE0F \u522A\u9664" })] })] }, todo.id)))] }));
}
