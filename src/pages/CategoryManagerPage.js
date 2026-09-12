import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { defaultCategories } from '../lib/defaultCategories';
export default function CategoryManagerPage() {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [editingColor, setEditingColor] = useState('#3B82F6');
    // 載入分類資料
    useEffect(() => {
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            try {
                setCategories(JSON.parse(savedCategories));
            }
            catch (error) {
                console.error('載入分類失敗:', error);
                setCategories(defaultCategories);
            }
        }
        else {
            setCategories(defaultCategories);
            // 初始化預設分類到 localStorage
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
        }
    }, []);
    // 同步分類到 localStorage
    useEffect(() => {
        if (categories.length > 0) {
            localStorage.setItem('categories', JSON.stringify(categories));
        }
    }, [categories]);
    // 新增分類
    const handleAddCategory = () => {
        if (!newCategoryName.trim())
            return;
        const newCategory = {
            id: Date.now().toString(),
            name: newCategoryName.trim(),
            color: newCategoryColor
        };
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        setNewCategoryColor('#3B82F6');
        // 新增完成提示
        try {
            alert('存檔OK');
        }
        catch { }
    };
    // 開始編輯分類
    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setEditingName(category.name);
        setEditingColor(category.color || '#3B82F6');
    };
    // 儲存編輯
    const handleSaveEdit = () => {
        if (!editingCategory || !editingName.trim())
            return;
        const updatedCategories = categories.map(cat => cat.id === editingCategory.id
            ? { ...cat, name: editingName.trim(), color: editingColor }
            : cat);
        setCategories(updatedCategories);
        setEditingCategory(null);
        setEditingName('');
        setEditingColor('#3B82F6');
        try {
            alert('存檔OK');
        }
        catch { }
    };
    // 取消編輯
    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditingName('');
        setEditingColor('#3B82F6');
    };
    // 刪除分類
    const handleDeleteCategory = (categoryId) => {
        // 檢查是否為預設分類
        const isDefaultCategory = defaultCategories.some(cat => cat.id === categoryId);
        if (isDefaultCategory) {
            alert('預設分類無法刪除');
            return;
        }
        if (window.confirm('確定要刪除此分類嗎？使用此分類的待辦事項將變為未分類。')) {
            const updatedCategories = categories.filter(cat => cat.id !== categoryId);
            setCategories(updatedCategories);
            try {
                alert('存檔OK');
            }
            catch { }
        }
    };
    return (_jsxs("div", { className: "page bg-white text-black dark:bg-gray-900 dark:text-gray-100", children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx(Link, { to: "/todo", className: "inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 no-underline rounded-lg border border-blue-200 hover:border-blue-300 transition-colors", children: "\u2190 \u56DE\u4E0A\u9801" }), _jsx("h1", { className: "text-xl font-bold", children: "\uD83D\uDCC1 \u5206\u985E\u7BA1\u7406" })] }), _jsxs("div", { className: "card p-4 mb-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "\u65B0\u589E\u5206\u985E" }), _jsx("div", { className: "mb-4", children: _jsx("input", { type: "text", value: newCategoryName, onChange: (e) => setNewCategoryName(e.target.value), placeholder: "\u8F38\u5165\u65B0\u5206\u985E\u540D\u7A31", className: "w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-xl", style: {
                                fontSize: '22px !important',
                                height: '72px !important',
                                padding: '24px !important',
                                width: '100% !important',
                                boxSizing: 'border-box'
                            }, onKeyPress: (e) => e.key === 'Enter' && handleAddCategory() }) }), _jsxs("div", { className: "mb-4 flex items-center gap-4", children: [_jsx("label", { className: "text-lg font-medium text-gray-700", children: "\u9078\u64C7\u984F\u8272\uFF1A" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "color", value: newCategoryColor, onChange: (e) => setNewCategoryColor(e.target.value), className: "w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer" }), _jsx("div", { className: "w-8 h-8 rounded-full border-2 border-gray-300", style: { backgroundColor: newCategoryColor } }), _jsx("span", { className: "text-sm text-gray-600", children: newCategoryColor })] })] }), _jsx("div", { className: "flex justify-start", children: _jsxs("button", { onClick: handleAddCategory, style: {
                                width: '100px',
                                minWidth: '100px',
                                maxWidth: '100px',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                paddingTop: '4px',
                                paddingBottom: '4px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer'
                            }, className: "hover:opacity-80 font-bold flex items-center justify-center gap-1", children: [_jsx("span", { className: "text-sm", children: "\u2795" }), _jsx("span", { className: "text-sm", children: "\u65B0\u589E\u5206\u985E" })] }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h2", { className: "text-xl font-semibold mb-4", children: ["\u6240\u6709\u5206\u985E (", categories.length, ")"] }), categories.length === 0 ? (_jsx("div", { className: "card p-8 text-center text-gray-500", children: _jsx("p", { className: "text-lg", children: "\u5C1A\u7121\u5206\u985E\u8CC7\u6599" }) })) : (categories.map((category) => {
                        const isDefaultCategory = defaultCategories.some(cat => cat.id === category.id);
                        return (_jsxs("div", { className: "card p-4 mb-3", children: [_jsx("div", { className: "mb-3", children: editingCategory?.id === category.id ? (_jsxs("div", { className: "w-full space-y-3", children: [_jsx("input", { type: "text", value: editingName, onChange: (e) => setEditingName(e.target.value), className: "w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg", style: {
                                                    fontSize: '20px !important',
                                                    height: '52px !important',
                                                    padding: '16px !important',
                                                    width: '100% !important',
                                                    boxSizing: 'border-box'
                                                }, onKeyPress: (e) => e.key === 'Enter' && handleSaveEdit(), autoFocus: true }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("label", { className: "text-base font-medium text-gray-700", children: "\u9078\u64C7\u984F\u8272\uFF1A" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "color", value: editingColor, onChange: (e) => setEditingColor(e.target.value), className: "w-10 h-10 border-2 border-gray-300 rounded-lg cursor-pointer" }), _jsx("div", { className: "w-6 h-6 rounded-full border-2 border-gray-300", style: { backgroundColor: editingColor } }), _jsx("span", { className: "text-sm text-gray-600", children: editingColor })] })] })] })) : (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-4 h-4 rounded-full border-2 border-gray-300", style: { backgroundColor: category.color || '#3B82F6' } }), _jsx("span", { className: "text-xl font-medium", children: category.name }), isDefaultCategory && (_jsx("span", { className: "px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full font-medium", children: "\u9810\u8A2D" }))] })) }), _jsx("div", { className: "flex items-center gap-3", children: editingCategory?.id === category.id ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleSaveEdit, className: "px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-base font-medium whitespace-nowrap", style: {
                                                    width: 'auto !important',
                                                    maxWidth: 'none !important',
                                                    padding: '12px 24px !important',
                                                    fontSize: '16px !important',
                                                    height: '48px !important',
                                                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", Inter, system-ui, Avenir, Helvetica, Arial, sans-serif !important'
                                                }, children: [_jsx("span", { style: { fontSize: '18px', lineHeight: '1', marginRight: '6px' }, children: "\u2713" }), " \u5132\u5B58"] }), _jsxs("button", { onClick: handleCancelEdit, className: "px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-base font-medium whitespace-nowrap", style: {
                                                    width: 'auto !important',
                                                    maxWidth: 'none !important',
                                                    padding: '12px 24px !important',
                                                    fontSize: '16px !important',
                                                    height: '48px !important',
                                                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", Inter, system-ui, Avenir, Helvetica, Arial, sans-serif !important'
                                                }, children: [_jsx("span", { style: { fontSize: '18px', lineHeight: '1', marginRight: '6px' }, children: "\u2717" }), " \u53D6\u6D88"] })] })) : (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => handleEditCategory(category), className: "px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-base font-medium whitespace-nowrap flex items-center justify-center gap-1", style: {
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    height: '32px',
                                                    minHeight: '32px',
                                                    maxHeight: '32px',
                                                    paddingTop: '4px',
                                                    paddingBottom: '4px',
                                                    lineHeight: '1.2'
                                                }, children: [_jsx("span", { className: "text-sm", children: "\u270F\uFE0F" }), _jsx("span", { className: "text-base", children: "\u7DE8\u8F2F" })] }), _jsxs("button", { onClick: () => handleDeleteCategory(category.id), disabled: isDefaultCategory, className: `px-6 rounded-lg transition-colors text-base font-medium whitespace-nowrap flex items-center justify-center gap-1 ${isDefaultCategory
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-red-500 hover:bg-red-600 text-white'}`, style: {
                                                    backgroundColor: isDefaultCategory ? '#d1d5db' : '#ef4444',
                                                    color: isDefaultCategory ? '#6b7280' : 'white',
                                                    height: '32px',
                                                    minHeight: '32px',
                                                    maxHeight: '32px',
                                                    paddingTop: '4px',
                                                    paddingBottom: '4px',
                                                    lineHeight: '1.2'
                                                }, children: [_jsx("span", { className: "text-sm", children: "\uD83D\uDDD1\uFE0F" }), _jsx("span", { className: "text-base", children: "\u522A\u9664" })] })] })) })] }, category.id));
                    }))] }), _jsxs("div", { className: "mt-8 p-4 bg-blue-50 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-blue-800 mb-2", children: "\uD83D\uDCA1 \u4F7F\u7528\u8AAA\u660E" }), _jsxs("ul", { className: "text-blue-700 text-sm space-y-1", children: [_jsx("li", { children: "\u2022 \u9810\u8A2D\u5206\u985E\u7121\u6CD5\u522A\u9664\uFF0C\u4F46\u53EF\u4EE5\u7DE8\u8F2F\u540D\u7A31" }), _jsx("li", { children: "\u2022 \u81EA\u8A02\u5206\u985E\u53EF\u4EE5\u7DE8\u8F2F\u540D\u7A31\u548C\u522A\u9664" }), _jsx("li", { children: "\u2022 \u522A\u9664\u5206\u985E\u6642\uFF0C\u4F7F\u7528\u8A72\u5206\u985E\u7684\u5F85\u8FA6\u4E8B\u9805\u5C07\u8B8A\u70BA\u672A\u5206\u985E" }), _jsx("li", { children: "\u2022 \u5206\u985E\u8B8A\u66F4\u6703\u81EA\u52D5\u4FDD\u5B58\u5230\u672C\u5730\u5132\u5B58" })] })] })] }));
}
