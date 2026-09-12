import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const FocusItemModal = ({ show, onClose, focusItems, newFocusItemName, onNewFocusItemNameChange, onAddFocusItem, editingFocusItem, editingFocusItemName, onEditingFocusItemNameChange, onSaveEdit, onCancelEdit, onDeleteFocusItem, selectedColor, onSelectedColorChange }) => {
    const colors = [
        { hex: '#3b82f6', name: '藍色' },
        { hex: '#22c55e', name: '綠色' },
        { hex: '#f97316', name: '橘色' },
        { hex: '#a855f7', name: '紫色' },
        { hex: '#ef4444', name: '紅色' },
        { hex: '#eab308', name: '黃色' }
    ];
    if (!show)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
        }, children: _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '25px'
                    }, children: [_jsx("h2", { style: {
                                margin: 0,
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                color: '#333'
                            }, children: "\uD83C\uDFAF \u5C08\u6CE8\u9805\u76EE\u7BA1\u7406" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '5px',
                                borderRadius: '50%',
                                width: '35px',
                                height: '35px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s'
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }, children: "\u00D7" })] }), _jsxs("div", { className: "card", style: {
                        marginBottom: '30px',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }, children: [_jsx("h3", { style: {
                                margin: '0 0 15px 0',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#333'
                            }, children: "\u2795 \u65B0\u589E\u5C08\u6CE8\u9805\u76EE" }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#555'
                                    }, children: "\u9805\u76EE\u540D\u7A31\uFF1A" }), _jsx("input", { type: "text", placeholder: "\u8F38\u5165\u5C08\u6CE8\u9805\u76EE\u540D\u7A31...", value: newFocusItemName, onChange: (e) => onNewFocusItemNameChange(e.target.value), style: {
                                        width: '100%',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '6px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    } })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#555'
                                    }, children: "\u9078\u64C7\u984F\u8272\uFF1A" }), _jsx("div", { style: {
                                        display: 'flex',
                                        gap: '10px',
                                        flexWrap: 'wrap'
                                    }, children: colors.map((color) => (_jsx("button", { onClick: () => onSelectedColorChange(color.hex), style: {
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: selectedColor === color.hex ? '3px solid #333' : '2px solid #ddd',
                                            backgroundColor: color.hex,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                        }, title: color.name, children: selectedColor === color.hex ? '✓' : '' }, color.hex))) })] }), _jsx("button", { onClick: onAddFocusItem, disabled: !newFocusItemName.trim(), style: {
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: newFocusItemName.trim() ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                backgroundColor: newFocusItemName.trim() ? '#4ecdc4' : '#ccc',
                                color: 'white'
                            }, children: "\u2795 \u65B0\u589E\u9805\u76EE" })] }), _jsxs("div", { children: [_jsx("h3", { style: {
                                margin: '0 0 15px 0',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#333'
                            }, children: "\uD83D\uDCCB \u73FE\u6709\u5C08\u6CE8\u9805\u76EE" }), focusItems.length === 0 ? (_jsx("div", { style: {
                                textAlign: 'center',
                                padding: '20px',
                                color: '#666',
                                fontSize: '14px'
                            }, children: "\u5C1A\u7121\u5C08\u6CE8\u9805\u76EE" })) : (_jsx("div", { style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }, children: focusItems.map((item) => (_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '6px',
                                    transition: 'background-color 0.2s'
                                }, children: [_jsx("div", { style: {
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            backgroundColor: item.color || '#4caf50',
                                            flexShrink: 0
                                        } }), editingFocusItem?.id === item.id ? (_jsx("input", { type: "text", value: editingFocusItemName, onChange: (e) => onEditingFocusItemNameChange(e.target.value), style: {
                                            flex: 1,
                                            padding: '6px 8px',
                                            fontSize: '14px',
                                            border: '1px solid #4ecdc4',
                                            borderRadius: '4px',
                                            outline: 'none'
                                        } })) : (_jsx("span", { style: {
                                            flex: 1,
                                            fontSize: '14px',
                                            color: '#333',
                                            fontWeight: '500'
                                        }, children: item.name })), _jsx("div", { style: {
                                            display: 'flex',
                                            gap: '6px',
                                            flexShrink: 0
                                        }, children: editingFocusItem?.id === item.id ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: onSaveEdit, disabled: !editingFocusItemName.trim(), style: {
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: editingFocusItemName.trim() ? 'pointer' : 'not-allowed',
                                                        backgroundColor: editingFocusItemName.trim() ? '#28a745' : '#ccc',
                                                        color: 'white'
                                                    }, children: "\u5132\u5B58" }), _jsx("button", { onClick: onCancelEdit, style: {
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        border: '1px solid #6c757d',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        backgroundColor: 'transparent',
                                                        color: '#6c757d'
                                                    }, children: "\u53D6\u6D88" })] })) : (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => {
                                                        onEditingFocusItemNameChange(item.name);
                                                        // 這裡需要觸發編輯模式，但需要從父組件傳入
                                                    }, className: "flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:scale-105", children: [_jsx("span", { children: "\u270F\uFE0F" }), _jsx("span", { children: "\u7DE8\u8F2F" })] }), _jsxs("button", { onClick: () => onDeleteFocusItem(item.id), className: "flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:scale-105", children: [_jsx("span", { children: "\uD83D\uDDD1\uFE0F" }), _jsx("span", { children: "\u522A\u9664" })] })] })) })] }, item.id))) }))] })] }) }));
};
export default FocusItemModal;
