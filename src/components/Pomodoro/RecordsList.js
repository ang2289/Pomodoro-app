import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import IconButton from '../ui/IconButton';
import { Download } from 'lucide-react';
const RecordsList = ({ records, focusItems, onEditRecord, onDeleteRecord, onExportRecords, exportStatus, isSearchActive = false, searchKeyword = '', totalRecords = 0, showAllRecords = false }) => {
    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getFocusItemName = (focusItemId) => {
        const item = focusItems.find(item => item.id === focusItemId);
        return item ? item.name : '未知項目';
    };
    return (_jsxs("div", { className: "card max-w-md mx-auto", style: {
            marginTop: '50px',
            maxWidth: '600px'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '10px'
                }, children: [_jsxs("div", { children: [_jsx("h3", { style: {
                                    margin: '0',
                                    color: '#333',
                                    fontSize: '1.3rem',
                                    fontWeight: '600'
                                }, children: "\uD83D\uDCCB \u5B8C\u6210\u7D00\u9304" }), isSearchActive ? (_jsxs("div", { style: {
                                    marginTop: '5px',
                                    fontSize: '14px',
                                    color: '#666',
                                    fontStyle: 'italic'
                                }, children: ["\u641C\u5C0B\u7D50\u679C\uFF1A\u627E\u5230 ", records.length, " \u7B46\u8A18\u9304", searchKeyword && (_jsxs("span", { style: { marginLeft: '8px' }, children: ["(\u95DC\u9375\u5B57: \"", searchKeyword, "\")"] }))] })) : showAllRecords ? (
                            // 顯示全部紀錄時的提示文字
                            _jsxs("div", { style: {
                                    marginTop: '5px',
                                    fontSize: '14px',
                                    color: '#666',
                                    fontStyle: 'italic'
                                }, children: ["\u76EE\u524D\u986F\u793A\u5168\u90E8\u7D00\u9304\uFF0C\u5171 ", totalRecords, " \u7B46\u3002", _jsx("br", {}), "\u82E5\u8CC7\u6599\u904E\u591A\uFF0C\u5EFA\u8B70\u4F7F\u7528\u641C\u5C0B\u529F\u80FD\u6216\u8A2D\u5B9A\u5206\u9801\u986F\u793A\u3002"] })) : (
                            // 預設顯示提示文字
                            _jsx("div", { style: {
                                    marginTop: '5px',
                                    fontSize: '14px',
                                    color: '#666',
                                    fontStyle: 'italic'
                                }, children: "\u9810\u8A2D\u4E94\u7B46\uFF0C\u66F4\u591A\u8CC7\u6599\u53EF\u7528\u641C\u5C0B\u529F\u80FD" }))] }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                        }, children: [exportStatus.show && exportStatus.type === 'success' && (_jsxs("div", { style: {
                                    padding: '8px 16px',
                                    backgroundColor: '#d4edda',
                                    color: '#155724',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    border: '1px solid #c3e6cb'
                                }, children: ["\u2705 ", exportStatus.message] })), exportStatus.show && exportStatus.type === 'error' && (_jsxs("div", { style: {
                                    padding: '8px 16px',
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    border: '1px solid #f5c6cb'
                                }, children: ["\u274C ", exportStatus.message] })), _jsx("div", { style: {
                                    display: 'flex',
                                    gap: '10px',
                                    alignItems: 'center'
                                }, children: _jsx(IconButton, { icon: _jsx(Download, { size: 16 }), label: "\u532F\u51FA CSV", onClick: onExportRecords, variant: "primary", className: "px-4 py-2 text-sm" }) })] })] }), records.length === 0 ? (_jsx("div", { style: {
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#666',
                    fontSize: '16px'
                }, children: "\uD83D\uDCDD \u5C1A\u7121\u5B8C\u6210\u7D00\u9304" })) : (_jsx("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }, children: records.map((record) => (_jsx("div", { className: "card", style: {
                        padding: '16px 18px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.2s ease'
                    }, onMouseEnter: (e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }, children: _jsxs("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }, children: [_jsx("div", { style: {
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            backgroundColor: (() => {
                                                if (record.focusItemId) {
                                                    const focusItem = focusItems.find(item => item.id === record.focusItemId);
                                                    return focusItem ? focusItem.color : '#4caf50';
                                                }
                                                return '#4caf50';
                                            })(),
                                            flexShrink: 0
                                        } }), _jsx("span", { style: {
                                            fontSize: '17px',
                                            fontWeight: '600',
                                            color: '#2d3748',
                                            lineHeight: '1.3',
                                            flex: 1
                                        }, children: record.focusItemId ? getFocusItemName(record.focusItemId) : '未知項目' })] }), _jsxs("div", { style: {
                                    paddingLeft: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                }, children: [record.description && (_jsx("div", { style: {
                                            fontSize: '14px',
                                            color: '#4a5568',
                                            lineHeight: '1.5'
                                        }, children: record.description })), _jsxs("div", { style: {
                                            fontSize: '13px',
                                            color: '#718096',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }, children: [_jsx("span", { style: { fontSize: '12px' }, children: "\uD83D\uDD52" }), _jsx("span", { children: formatDateTime(record.completedAt) })] })] }), _jsxs("div", { style: {
                                    display: 'flex',
                                    gap: '8px',
                                    paddingLeft: '24px',
                                    marginTop: '4px'
                                }, children: [_jsx(IconButton, { icon: "\u270F\uFE0F", label: "\u7DE8\u8F2F", onClick: () => onEditRecord(record), variant: "primary", className: "px-3 py-1 text-xs hover:scale-105" }), _jsx(IconButton, { icon: "\uD83D\uDDD1\uFE0F", label: "\u522A\u9664", onClick: () => onDeleteRecord(record.id), variant: "danger", className: "px-3 py-1 text-xs hover:scale-105" })] })] }) }, record.id))) }))] }));
};
export default RecordsList;
