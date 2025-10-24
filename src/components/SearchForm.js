import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
export default function SearchForm({ scriptureOptions = [], onSearch, onReset }) {
    // checkbox enable states
    const [useKeyword, setUseKeyword] = useState(true); // 預設只勾選關鍵字
    const [useDate, setUseDate] = useState(false);
    const [useScripture, setUseScripture] = useState(false);
    const [useSort, setUseSort] = useState(false);
    // field values
    const [keyword, setKeyword] = useState('');
    // 預設日期為今天
    const todayStr = new Date().toISOString().split('T')[0];
    const [dateFrom, setDateFrom] = useState(todayStr);
    const [dateTo, setDateTo] = useState(todayStr);
    const [scripture, setScripture] = useState('');
    const [sortBy, setSortBy] = useState('start_desc'); // 預設開始日（新→舊）
    const canSearch = useMemo(() => useKeyword || useDate || useScripture || useSort, [useKeyword, useDate, useScripture, useSort]);
    const handleSearch = () => {
        const payload = {};
        if (useKeyword && keyword.trim())
            payload.keyword = keyword.trim();
        if (useDate) {
            if (dateFrom)
                payload.dateFrom = dateFrom;
            if (dateTo)
                payload.dateTo = dateTo;
        }
        if (useScripture && scripture)
            payload.scripture = scripture;
        if (useSort)
            payload.sortBy = sortBy;
        onSearch(payload);
    };
    const handleReset = () => {
        setUseKeyword(true);
        setUseDate(false);
        setUseScripture(false);
        setUseSort(false);
        setKeyword('');
        // 日期保持使用者當下日期（不變動）
        setScripture('');
        setSortBy('start_desc');
        onReset?.();
    };
    return (_jsx("div", { className: "bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4", children: _jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm text-gray-700", children: "\u555F\u7528\u641C\u5C0B" }), _jsx("input", { type: "checkbox", checked: useKeyword || useDate || useScripture || useSort, onChange: (e) => { const v = e.target.checked; setUseKeyword(v); setUseDate(v && useDate); setUseScripture(v && useScripture); setUseSort(v && useSort); } }), _jsx("span", { className: "text-xs text-gray-500", children: "\uFF08\u53EF\u500B\u5225\u5207\u63DB\u4E0B\u65B9\u689D\u4EF6\uFF09" })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: useKeyword, onChange: (e) => setUseKeyword(e.target.checked) }), _jsx("label", { className: "text-sm text-gray-700 whitespace-nowrap", children: "\u95DC\u9375\u5B57" })] }), _jsx("input", { type: "text", placeholder: "\uD83D\uDD0D \u641C\u5C0B\u6A19\u984C\u3001\u5C0D\u8C61\u6216\u767C\u8D77\u4EBA", className: "w-full border rounded-lg px-4 py-3 text-base h-12", value: keyword, onChange: (e) => setKeyword(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter')
                                handleSearch(); }, disabled: false })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: useDate, onChange: (e) => setUseDate(e.target.checked) }), _jsx("label", { className: "text-sm text-gray-700 whitespace-nowrap", children: "\u65E5\u671F\u7BC4\u570D" })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "\u958B\u59CB\u65E5\u671F" }), _jsx("input", { type: "date", className: "w-full border rounded-lg px-4 py-3 text-base h-12", value: dateFrom, onChange: (e) => setDateFrom(e.target.value), disabled: false })] }), _jsx("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "\u622A\u6B62\u65E5\u671F" }), _jsx("input", { type: "date", className: "w-full border rounded-lg px-4 py-3 text-base h-12", value: dateTo, onChange: (e) => setDateTo(e.target.value), disabled: false })] })] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: useScripture, onChange: (e) => setUseScripture(e.target.checked) }), _jsx("label", { className: "text-sm text-gray-700 whitespace-nowrap", children: "\u7D93\u6587" })] }), _jsxs("select", { className: "w-full px-3 py-2 text-base rounded border border-gray-300 leading-normal", value: scripture, onChange: (e) => setScripture(e.target.value), disabled: false, children: [_jsx("option", { value: "", children: "\u5168\u90E8" }), scriptureOptions.map((opt) => (_jsx("option", { value: opt, children: opt }, opt)))] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: useSort, onChange: (e) => setUseSort(e.target.checked) }), _jsx("label", { className: "text-sm text-gray-700 whitespace-nowrap", children: "\u6392\u5E8F" })] }), _jsxs("select", { className: "w-full px-3 py-2 text-base rounded border border-gray-300 leading-normal", value: sortBy, onChange: (e) => setSortBy(e.target.value), disabled: false, children: [_jsx("option", { value: "start_desc", children: "\u958B\u59CB\u65E5\uFF08\u65B0\u2192\u820A\uFF09" }), _jsx("option", { value: "start_asc", children: "\u958B\u59CB\u65E5\uFF08\u820A\u2192\u65B0\uFF09" }), _jsx("option", { value: "created_desc", children: "\u5EFA\u7ACB\u6642\u9593\uFF08\u65B0\u2192\u820A\uFF09" }), _jsx("option", { value: "created_asc", children: "\u5EFA\u7ACB\u6642\u9593\uFF08\u820A\u2192\u65B0\uFF09" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:gap-4", children: [_jsx("button", { onClick: handleSearch, disabled: !canSearch, className: "w-full sm:w-auto px-5 py-3 rounded-lg font-semibold !text-white shadow-sm transition-all duration-200 disabled:opacity-60", style: { background: '#4f46e5', color: '#ffffff' }, onMouseEnter: (e) => { e.currentTarget.style.background = '#4338ca'; }, onMouseLeave: (e) => { e.currentTarget.style.background = '#4f46e5'; }, children: "\u67E5\u8A62" }), _jsx("button", { onClick: handleReset, className: "w-full sm:w-auto px-5 py-3 rounded-lg font-semibold !text-white shadow-sm transition-all duration-200", style: { background: '#6b7280', color: '#ffffff' }, onMouseEnter: (e) => { e.currentTarget.style.background = '#4b5563'; }, onMouseLeave: (e) => { e.currentTarget.style.background = '#6b7280'; }, children: "\u91CD\u8A2D" })] })] }) }));
}
