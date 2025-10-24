import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFocusItemsWithCount, addFocusItem, updateFocusItem, deleteFocusItem, restoreDefaultFocusItems } from '../services/focusItemService';
import IconButton from '../components/ui/IconButton';
import { ArrowLeft, Plus } from 'lucide-react';
const FocusProjectsPage = () => {
    const navigate = useNavigate();
    const [focusItems, setFocusItems] = useState([]);
    const [newFocusItemName, setNewFocusItemName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#3b82f6'); // 預設藍色
    const [customColor, setCustomColor] = useState('#3b82f6'); // 自訂顏色
    const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
    const [editingFocusItem, setEditingFocusItem] = useState(null);
    const [editingFocusItemName, setEditingFocusItemName] = useState('');
    useEffect(() => {
        setFocusItems(getFocusItemsWithCount());
    }, []);
    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setCustomColor(color);
        setShowCustomColorPicker(false);
    };
    const handleCustomColorChange = (color) => {
        setCustomColor(color);
        setSelectedColor(color);
    };
    const handleAdd = () => {
        if (!newFocusItemName.trim())
            return;
        addFocusItem(newFocusItemName.trim(), selectedColor);
        setFocusItems(getFocusItemsWithCount());
        setNewFocusItemName('');
        setSelectedColor('#3b82f6'); // 重置為預設顏色
        setCustomColor('#3b82f6');
        setShowCustomColorPicker(false);
    };
    const handleUpdate = () => {
        if (!editingFocusItem || !editingFocusItemName.trim())
            return;
        updateFocusItem(editingFocusItem.id, editingFocusItemName.trim(), selectedColor);
        setFocusItems(getFocusItemsWithCount());
        setEditingFocusItem(null);
        setEditingFocusItemName('');
        setSelectedColor('#3b82f6'); // 重置為預設顏色
        setCustomColor('#3b82f6');
        setShowCustomColorPicker(false);
    };
    const handleDelete = (id, itemName, isDefault) => {
        const confirmMessage = isDefault
            ? `是否刪除預設分類：${itemName}？`
            : '確定要刪除這個專注項目嗎？';
        if (!window.confirm(confirmMessage))
            return;
        deleteFocusItem(id);
        setFocusItems(getFocusItemsWithCount());
    };
    const handleRestoreDefaults = () => {
        if (!window.confirm('是否還原所有預設分類？（不會刪除你的自訂分類）'))
            return;
        const restored = restoreDefaultFocusItems();
        setFocusItems(getFocusItemsWithCount());
        if (restored) {
            alert('已還原預設分類！');
        }
        else {
            alert('所有預設分類已存在，無需還原。');
        }
    };
    const handleGoBack = () => {
        navigate(-1); // 回上一頁
    };
    return (_jsxs("div", { className: "page bg-white text-black dark:bg-gray-900 dark:text-gray-100", children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f0f0f0'
                }, children: [_jsx("h1", { style: { margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#333' }, children: "\uD83C\uDFAF \u5C08\u6CE8\u9805\u76EE\u7BA1\u7406" }), _jsxs("button", { onClick: handleGoBack, style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.backgroundColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.15)';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                        }, children: [_jsx(ArrowLeft, { size: 16 }), _jsx("span", { children: "\u56DE\u4E0A\u4E00\u9801" })] })] }), _jsxs("div", { className: "card", style: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }, children: [_jsx("h3", { style: { margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600', color: '#333' }, children: "\uD83D\uDCDD \u65B0\u589E\u5C08\u6CE8\u9805\u76EE" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '15px' }, children: [_jsx("input", { type: "text", placeholder: "\u8F38\u5165\u5C08\u6CE8\u9805\u76EE\u540D\u7A31...", value: newFocusItemName, onChange: (e) => setNewFocusItemName(e.target.value), style: {
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '16px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box',
                                    backgroundColor: '#ffffff',
                                    color: '#333'
                                } }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '15px' }, children: [_jsx("label", { style: { fontSize: '14px', fontWeight: '600', color: '#555' }, children: "\u9078\u64C7\u984F\u8272\uFF1A" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx("div", { style: { fontSize: '13px', color: '#666', fontWeight: '500' }, children: "\u9810\u8A2D\u984F\u8272\uFF1A" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }, children: [
                                                    { name: '藍色', value: '#3b82f6' },
                                                    { name: '綠色', value: '#10b981' },
                                                    { name: '紫色', value: '#8b5cf6' },
                                                    { name: '橘色', value: '#f59e0b' },
                                                    { name: '紅色', value: '#ef4444' },
                                                    { name: '青色', value: '#06b6d4' },
                                                    { name: '粉色', value: '#ec4899' },
                                                    { name: '灰色', value: '#6b7280' },
                                                    { name: '深藍', value: '#1e40af' },
                                                    { name: '深綠', value: '#059669' },
                                                    { name: '深紫', value: '#7c3aed' },
                                                    { name: '深紅', value: '#dc2626' },
                                                    { name: '黃色', value: '#eab308' },
                                                    { name: '靛色', value: '#6366f1' },
                                                    { name: '玫瑰', value: '#f43f5e' },
                                                    { name: '薄荷', value: '#14b8a6' }
                                                ].map((color) => (_jsxs("label", { style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        cursor: 'pointer',
                                                        padding: '10px 8px',
                                                        borderRadius: '8px',
                                                        border: selectedColor === color.value ? '2px solid #3b82f6' : '2px solid #e0e0e0',
                                                        backgroundColor: selectedColor === color.value ? '#f0f9ff' : '#ffffff',
                                                        transition: 'all 0.2s'
                                                    }, onClick: () => handleColorSelect(color.value), children: [_jsx("input", { type: "radio", name: "color", value: color.value, checked: selectedColor === color.value, onChange: (e) => handleColorSelect(e.target.value), style: { display: 'none' } }), _jsx("div", { style: {
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '50%',
                                                                backgroundColor: color.value,
                                                                border: '2px solid #ffffff',
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                            } }), _jsx("span", { style: { fontSize: '11px', color: '#333', fontWeight: '500', textAlign: 'center' }, children: color.name })] }, color.value))) })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' }, children: [_jsx("div", { style: { fontSize: '13px', color: '#666', fontWeight: '500' }, children: "\u81EA\u8A02\u984F\u8272\uFF1A" }), _jsxs("div", { style: { display: 'flex', gap: '10px', alignItems: 'center' }, children: [_jsxs("label", { style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            cursor: 'pointer',
                                                            padding: '10px 12px',
                                                            borderRadius: '8px',
                                                            border: showCustomColorPicker ? '2px solid #3b82f6' : '2px solid #e0e0e0',
                                                            backgroundColor: showCustomColorPicker ? '#f0f9ff' : '#ffffff',
                                                            transition: 'all 0.2s'
                                                        }, onClick: () => setShowCustomColorPicker(!showCustomColorPicker), children: [_jsx("div", { style: {
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: customColor,
                                                                    border: '2px solid #ffffff',
                                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                                } }), _jsx("span", { style: { fontSize: '14px', color: '#333', fontWeight: '500' }, children: "\u66F4\u591A\u984F\u8272" })] }), showCustomColorPicker && (_jsxs("div", { style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            flexWrap: 'wrap',
                                                            width: '100%'
                                                        }, children: [_jsx("input", { type: "color", value: customColor, onChange: (e) => handleCustomColorChange(e.target.value), style: {
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    border: '2px solid #e0e0e0',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    flexShrink: 0
                                                                } }), _jsx("input", { type: "text", value: customColor, onChange: (e) => handleCustomColorChange(e.target.value), placeholder: "#000000", style: {
                                                                    padding: '8px 12px',
                                                                    fontSize: '14px',
                                                                    border: '2px solid #e0e0e0',
                                                                    borderRadius: '6px',
                                                                    outline: 'none',
                                                                    minWidth: '120px',
                                                                    width: 'calc(100% - 56px)',
                                                                    maxWidth: '150px',
                                                                    fontFamily: 'monospace'
                                                                } })] }))] })] }), _jsxs("div", { style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0'
                                        }, children: [_jsx("span", { style: { fontSize: '14px', color: '#666', fontWeight: '500' }, children: "\u7576\u524D\u9078\u64C7\uFF1A" }), _jsx("div", { style: {
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    backgroundColor: selectedColor,
                                                    border: '3px solid #ffffff',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                                                } }), _jsx("span", { style: { fontSize: '14px', color: '#333', fontWeight: '600', fontFamily: 'monospace' }, children: selectedColor.toUpperCase() })] })] }), _jsxs("button", { onClick: handleAdd, disabled: !newFocusItemName.trim(), style: {
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: 'white',
                                    backgroundColor: '#2563eb',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    opacity: !newFocusItemName.trim() ? 0.5 : 1,
                                    pointerEvents: !newFocusItemName.trim() ? 'none' : 'auto'
                                }, onMouseEnter: (e) => {
                                    if (newFocusItemName.trim()) {
                                        e.currentTarget.style.backgroundColor = '#1d4ed8';
                                        e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
                                    }
                                }, onMouseLeave: (e) => {
                                    if (newFocusItemName.trim()) {
                                        e.currentTarget.style.backgroundColor = '#2563eb';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                    }
                                }, children: [_jsx(Plus, { size: 16 }), _jsx("span", { children: "\u65B0\u589E\u5C08\u6CE8\u9805\u76EE" })] })] })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: focusItems.map((item) => (_jsxs("div", { style: {
                        backgroundColor: '#ffffff',
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("span", { style: {
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                backgroundColor: item.color || '#4caf50',
                                                border: '2px solid #ffffff',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                            } }), editingFocusItem?.id === item.id ? (_jsx("input", { value: editingFocusItemName, onChange: (e) => setEditingFocusItemName(e.target.value), style: {
                                                padding: '8px 12px',
                                                fontSize: '16px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '6px',
                                                outline: 'none',
                                                backgroundColor: '#ffffff',
                                                color: '#333',
                                                minWidth: '200px'
                                            } })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("span", { style: {
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        color: '#333'
                                                    }, children: item.name }), item.isDefault && (_jsx("span", { style: {
                                                        fontSize: '12px',
                                                        color: '#666',
                                                        backgroundColor: '#f0f0f0',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontWeight: '500'
                                                    }, children: "\u9810\u8A2D" }))] }))] }), _jsx("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        flexWrap: 'wrap',
                                        justifyContent: 'flex-end'
                                    }, children: editingFocusItem?.id === item.id ? (_jsxs(_Fragment, { children: [_jsx(IconButton, { icon: "\uD83D\uDCBE", label: "\u5132\u5B58", onClick: handleUpdate, variant: "primary", className: "px-3 py-1 text-sm" }), _jsx(IconButton, { icon: "\u274C", label: "\u53D6\u6D88", onClick: () => {
                                                    setEditingFocusItem(null);
                                                    setEditingFocusItemName('');
                                                    setSelectedColor('#3b82f6');
                                                    setCustomColor('#3b82f6');
                                                    setShowCustomColorPicker(false);
                                                }, variant: "secondary", className: "px-3 py-1 text-sm" })] })) : (_jsxs(_Fragment, { children: [_jsx(IconButton, { icon: "\u270F\uFE0F", label: "\u7DE8\u8F2F", onClick: () => {
                                                    setEditingFocusItem(item);
                                                    setEditingFocusItemName(item.name);
                                                    setSelectedColor(item.color || '#3b82f6');
                                                    setCustomColor(item.color || '#3b82f6');
                                                }, variant: "secondary", className: "px-3 py-1 text-sm" }), _jsx(IconButton, { icon: "\uD83D\uDDD1\uFE0F", label: "\u522A\u9664", onClick: () => handleDelete(item.id, item.name, item.isDefault), variant: "danger", className: "px-3 py-1 text-sm" })] })) })] }), editingFocusItem?.id === item.id && (_jsxs("div", { style: {
                                marginTop: '12px',
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0'
                            }, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' }, children: "\u9078\u64C7\u984F\u8272\uFF1A" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }, children: [
                                        { name: '藍色', value: '#3b82f6' },
                                        { name: '綠色', value: '#10b981' },
                                        { name: '紫色', value: '#8b5cf6' },
                                        { name: '橘色', value: '#f59e0b' },
                                        { name: '紅色', value: '#ef4444' },
                                        { name: '青色', value: '#06b6d4' },
                                        { name: '粉色', value: '#ec4899' },
                                        { name: '灰色', value: '#6b7280' }
                                    ].map((color) => (_jsx("button", { onClick: () => {
                                            setSelectedColor(color.value);
                                            setCustomColor(color.value);
                                        }, style: {
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: selectedColor === color.value ? '3px solid #333' : '2px solid #ddd',
                                            backgroundColor: color.value,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                        }, title: color.name, children: selectedColor === color.value ? '✓' : '' }, color.value))) })] })), _jsxs("div", { style: {
                                marginTop: '8px',
                                fontSize: '14px',
                                color: '#666',
                                fontWeight: '500'
                            }, children: ["\u4F7F\u7528 ", item.usageCount, " \u6B21"] })] }, item.id))) }), _jsx("div", { style: {
                    marginTop: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '16px 0'
                }, children: _jsxs("button", { onClick: handleRestoreDefaults, style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333',
                        backgroundColor: '#f5f5f5',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        outline: 'none'
                    }, onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = '#e8e8e8';
                        e.currentTarget.style.borderColor = '#ccc';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }, children: [_jsx("span", { style: { fontSize: '18px' }, children: "\uD83D\uDD01" }), _jsx("span", { children: "\u9084\u539F\u9810\u8A2D\u5206\u985E" })] }) })] }));
};
export default FocusProjectsPage;
