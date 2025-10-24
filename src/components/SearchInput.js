import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function SearchInput({ onSearch }) {
    const [keyword, setKeyword] = useState('');
    const handleSearch = () => {
        onSearch(keyword.trim());
    };
    return (_jsxs("div", { className: "flex items-center gap-2 sm:gap-4 mb-4 w-full", children: [_jsx("input", { type: "text", placeholder: "\uD83D\uDD0D \u641C\u5C0B\u6A19\u984C\u3001\u5C0D\u8C61\u6216\u767C\u8D77\u4EBA", className: "flex-1 p-2 border rounded text-sm sm:text-base", value: keyword, onChange: (e) => setKeyword(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter')
                    handleSearch(); } }), _jsx("button", { onClick: handleSearch, className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm sm:text-base", children: "\u641C\u5C0B" })] }));
}
