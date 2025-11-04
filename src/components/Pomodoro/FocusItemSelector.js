import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '../IconButton';
const FocusItemSelector = ({ focusItems, selectedFocusItemId, onFocusItemChange }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const selectedItem = focusItems.find(i => i.id === selectedFocusItemId) || focusItems[0];
    // 獲取翻譯後的專注項目名稱
    const getFocusItemName = (name) => {
        const defaultFocusItemNames = ['讀書', '寫作', '工作', '運動', '冥想', '抄經'];
        if (defaultFocusItemNames.includes(name)) {
            const translationKey = `focus_items_list.${name}`;
            const translated = t(translationKey);
            // 如果翻譯返回的是對象或與鍵相同，則使用原始名稱
            if (typeof translated === 'string' && translated !== translationKey) {
                return translated;
            }
            return name;
        }
        // 對於自定義專注項目，使用原始名稱
        return name;
    };
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (_jsxs("div", { className: "card", children: [_jsx("h3", { style: {
                    margin: '0 0 20px 0',
                    color: '#333',
                    fontSize: '1.3rem',
                    fontWeight: '600'
                }, children: "🎯 " + t('focus_items') }), _jsxs("div", { style: { marginBottom: '20px' }, ref: wrapperRef, children: [_jsxs("button", { type: "button", onClick: () => setOpen(v => !v), className: "w-full border border-gray-300 rounded-lg bg-white px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500", style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }, children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 rounded-full border border-black/5", style: { backgroundColor: selectedItem?.color || '#3b82f6' } }), _jsx("span", { className: "text-gray-800", children: selectedItem ? getFocusItemName(selectedItem.name) : '—' })] }), _jsx("svg", { className: `h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`, viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z", clipRule: "evenodd" }) })] }), open && (_jsx("div", { className: "mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden", children: focusItems.map((item) => (_jsxs("div", { className: "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100", onClick: () => {
                                onFocusItemChange(item.id);
                                setOpen(false);
                            }, children: [_jsx("span", { className: "w-3 h-3 rounded-full border border-black/5", style: { backgroundColor: item.color } }), _jsx("span", { className: "text-gray-800", children: getFocusItemName(item.name) })] }, item.id))) }))] }), _jsx("div", { style: { display: 'flex', justifyContent: 'center' }, children: _jsx(IconButton, { label: "🗂 " + t('manage_categories'), to: "/projects" }) })] }));
};
export default FocusItemSelector;
