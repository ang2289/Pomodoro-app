import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { initializeTestData, clearTestData, hasTestData } from '../utils/testData';
import IconButton from '../components/ui/IconButton';
const TestDataPage = () => {
    const [hasData, setHasData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => {
        setHasData(hasTestData());
    }, []);
    const handleInitializeData = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const success = initializeTestData();
            if (success) {
                setMessage('✅ 測試資料初始化成功！');
                setHasData(true);
            }
            else {
                setMessage('❌ 測試資料初始化失敗');
            }
        }
        catch (error) {
            setMessage('❌ 初始化過程中發生錯誤');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleClearData = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const success = clearTestData();
            if (success) {
                setMessage('🗑️ 測試資料已清除');
                setHasData(false);
            }
            else {
                setMessage('❌ 清除測試資料失敗');
            }
        }
        catch (error) {
            setMessage('❌ 清除過程中發生錯誤');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRefresh = () => {
        setHasData(hasTestData());
        setMessage('');
    };
    return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83E\uDDEA \u6E2C\u8A66\u8CC7\u6599\u7BA1\u7406" }), _jsx("p", { style: { fontSize: '1.2em', fontWeight: '500', marginBottom: '40px' }, children: "\u7BA1\u7406\u6E2C\u8A66\u7FA4\u7D44\u548C\u4EFB\u52D9\u8CC7\u6599" }), _jsxs("div", { style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '16px',
                    padding: '30px',
                    marginBottom: '30px'
                }, children: [_jsx("h2", { style: {
                            color: '#4ecdc4',
                            marginBottom: '20px',
                            fontSize: '1.4em',
                            fontWeight: '600'
                        }, children: "\uD83D\uDCCA \u6E2C\u8A66\u8CC7\u6599\u72C0\u614B" }), _jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: hasData ? '#1a3a1a' : '#3a1a1a',
                            borderRadius: '8px',
                            border: hasData ? '2px solid #4ecdc4' : '2px solid #ff6b6b'
                        }, children: [_jsx("span", { style: { fontSize: '24px' }, children: hasData ? '✅' : '❌' }), _jsx("span", { style: {
                                    color: hasData ? '#4ecdc4' : '#ff6b6b',
                                    fontSize: '16px',
                                    fontWeight: '500'
                                }, children: hasData ? '測試資料已載入' : '尚未載入測試資料' })] }), message && (_jsx("div", { style: {
                            backgroundColor: message.includes('✅') ? '#1a3a1a' : message.includes('🗑️') ? '#1a1a3a' : '#3a1a1a',
                            color: message.includes('✅') ? '#4ecdc4' : message.includes('🗑️') ? '#4ecdc4' : '#ff6b6b',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '16px',
                            fontWeight: '500',
                            textAlign: 'center'
                        }, children: message })), _jsxs("div", { style: { display: 'flex', gap: '15px', flexWrap: 'wrap' }, children: [_jsx(IconButton, { onClick: handleInitializeData, disabled: isLoading, variant: "primary", label: isLoading ? '處理中...' : '初始化測試資料', className: "w-full" }), _jsx(IconButton, { onClick: handleClearData, disabled: isLoading || !hasData, label: isLoading ? '處理中...' : '清除測試資料', className: "w-full bg-blue-700 text-white" }), _jsx(IconButton, { onClick: handleRefresh, disabled: isLoading, label: "\u91CD\u65B0\u6574\u7406", className: "w-full bg-blue-700 text-white" })] })] }), _jsxs("div", { style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '16px',
                    padding: '30px'
                }, children: [_jsx("h2", { style: {
                            color: '#4ecdc4',
                            marginBottom: '20px',
                            fontSize: '1.4em',
                            fontWeight: '600'
                        }, children: "\uD83D\uDCCB \u6E2C\u8A66\u8CC7\u6599\u5167\u5BB9" }), _jsxs("div", { style: { display: 'grid', gap: '20px' }, children: [_jsxs("div", { style: {
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '12px',
                                    padding: '20px'
                                }, children: [_jsx("h3", { style: {
                                            color: '#fff',
                                            marginBottom: '10px',
                                            fontSize: '1.2em',
                                            fontWeight: '600'
                                        }, children: "\uD83D\uDC65 \u6E2C\u8A66\u7FA4\u7D44" }), _jsxs("div", { style: { color: '#ccc', fontSize: '16px', lineHeight: '1.6' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "\u7FA4\u7D44\u540D\u7A31\uFF1A" }), "\u86CB\u5854\u5C0F\u7D44"] }), _jsxs("div", { children: [_jsx("strong", { children: "\u7FA4\u7D44\u4EE3\u78BC\uFF1A" }), "A1B2C3"] }), _jsxs("div", { children: [_jsx("strong", { children: "\u6210\u54E1\u6578\u91CF\uFF1A" }), "3 \u4EBA"] })] })] }), _jsxs("div", { style: {
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '12px',
                                    padding: '20px'
                                }, children: [_jsx("h3", { style: {
                                            color: '#fff',
                                            marginBottom: '10px',
                                            fontSize: '1.2em',
                                            fontWeight: '600'
                                        }, children: "\uD83D\uDCCB \u6E2C\u8A66\u4EFB\u52D9" }), _jsxs("div", { style: { color: '#ccc', fontSize: '16px', lineHeight: '1.6' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "\u4EFB\u52D9\u6A19\u984C\uFF1A" }), "9/12 \u96DE\u86CB\u7CD5\u53D6\u8CA8"] }), _jsxs("div", { children: [_jsx("strong", { children: "\u9818\u8CA8\u6642\u9593\uFF1A" }), "9/12 \u665A\u4E0A 7 \u9EDE\uFF5E9 \u9EDE"] }), _jsxs("div", { children: [_jsx("strong", { children: "\u5831\u540D\u4EBA\u6578\uFF1A" }), "3 \u4EBA"] }), _jsxs("div", { children: [_jsx("strong", { children: "\u5DF2\u9818\u53D6\uFF1A" }), "2 \u4EBA"] })] })] }), _jsxs("div", { style: {
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '12px',
                                    padding: '20px'
                                }, children: [_jsx("h3", { style: {
                                            color: '#fff',
                                            marginBottom: '10px',
                                            fontSize: '1.2em',
                                            fontWeight: '600'
                                        }, children: "\uD83D\uDC64 \u6E2C\u8A66\u5718\u53CB" }), _jsxs("div", { style: { color: '#ccc', fontSize: '16px', lineHeight: '1.6' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "\u5F35\u5C0F\u660E\uFF1A" }), "2 \u500B\uFF0C\u5DF2\u9818\u53D6 \u2705"] }), _jsxs("div", { children: [_jsx("strong", { children: "\u674E\u7F8E\u83EF\uFF1A" }), "1 \u500B\uFF0C\u672A\u9818\u53D6 \u23F3"] }), _jsxs("div", { children: [_jsx("strong", { children: "\u738B\u5927\u96C4\uFF1A" }), "3 \u500B\uFF0C\u5DF2\u9818\u53D6 \u2705"] })] })] })] })] })] }));
};
export default TestDataPage;
