import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { joinGroup } from '../services/groupMemberService';
import { findGroupByCode } from '../services/groupService';
const JoinGroupPage = () => {
    const [groupCode, setGroupCode] = useState('');
    const [userName, setUserName] = useState('');
    const [foundGroup, setFoundGroup] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    // 自動搜尋群組
    useEffect(() => {
        if (groupCode.length === 6) {
            handleSearchGroup();
        }
        else {
            setFoundGroup(null);
            setErrorMessage('');
        }
    }, [groupCode]);
    const handleSearchGroup = async () => {
        if (groupCode.length !== 6) {
            setErrorMessage('請輸入 6 碼群組代碼');
            return;
        }
        setIsSearching(true);
        setErrorMessage('');
        try {
            const group = findGroupByCode(groupCode.toUpperCase());
            if (group) {
                setFoundGroup(group);
            }
            else {
                setFoundGroup(null);
                setErrorMessage('找不到該群組代碼');
            }
        }
        catch (error) {
            console.error('搜尋群組失敗:', error);
            setErrorMessage('搜尋群組失敗，請重試');
        }
        finally {
            setIsSearching(false);
        }
    };
    const handleJoinGroup = async () => {
        if (!foundGroup || !userName.trim()) {
            setErrorMessage('請輸入您的姓名');
            return;
        }
        setIsJoining(true);
        setErrorMessage('');
        try {
            // 模擬使用者 ID（實際應用中應該從用戶認證系統取得）
            const userId = 'user-' + Date.now();
            const result = joinGroup({
                groupCode: groupCode.toUpperCase(),
                userId,
                userName: userName.trim()
            });
            if (result.success) {
                setShowSuccess(true);
                setGroupCode('');
                setUserName('');
                setFoundGroup(null);
            }
            else {
                setErrorMessage(result.message);
            }
        }
        catch (error) {
            console.error('加入群組失敗:', error);
            setErrorMessage('加入群組失敗，請重試');
        }
        finally {
            setIsJoining(false);
        }
    };
    const handleJoinAnother = () => {
        setShowSuccess(false);
        setGroupCode('');
        setUserName('');
        setFoundGroup(null);
        setErrorMessage('');
    };
    if (showSuccess) {
        return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83C\uDF89 \u52A0\u5165\u6210\u529F\uFF01" }), _jsxs("div", { style: {
                        backgroundColor: '#2a2a2a',
                        borderRadius: '16px',
                        padding: '30px',
                        margin: '30px 0',
                        textAlign: 'center'
                    }, children: [_jsx("div", { style: {
                                fontSize: '24px',
                                marginBottom: '20px'
                            }, children: "\u2705" }), _jsx("h2", { style: {
                                color: '#4ecdc4',
                                marginBottom: '20px',
                                fontSize: '1.8em',
                                fontWeight: '600'
                            }, children: "\u6210\u529F\u52A0\u5165\u7FA4\u7D44\uFF01" }), _jsx("div", { style: {
                                color: '#ccc',
                                fontSize: '18px',
                                fontWeight: '500',
                                lineHeight: '1.6',
                                marginBottom: '30px'
                            }, children: "\u73FE\u5728\u60A8\u53EF\u4EE5\u8207\u7FA4\u7D44\u6210\u54E1\u4E00\u8D77\u4F7F\u7528\u756A\u8304\u9418\u4E86" }), _jsx("div", { style: { display: 'flex', gap: '15px', justifyContent: 'center' }, children: _jsx("button", { onClick: handleJoinAnother, style: {
                                    backgroundColor: '#4ecdc4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 24px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }, children: "\u52A0\u5165\u5176\u4ED6\u7FA4\u7D44" }) })] })] }));
    }
    return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83D\uDC65 \u52A0\u5165\u7FA4\u7D44" }), _jsx("p", { style: { fontSize: '1.2em', fontWeight: '500', marginBottom: '40px' }, children: "\u8F38\u5165\u7FA4\u7D44\u4EE3\u78BC\u52A0\u5165\u670B\u53CB\u7684\u7FA4\u7D44" }), _jsxs("div", { style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '16px',
                    padding: '30px',
                    maxWidth: '500px',
                    margin: '0 auto'
                }, children: [_jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    marginBottom: '12px'
                                }, children: "\u7FA4\u7D44\u4EE3\u78BC" }), _jsx("input", { type: "text", value: groupCode, onChange: (e) => setGroupCode(e.target.value.toUpperCase()), placeholder: "\u8ACB\u8F38\u5165 6 \u78BC\u7FA4\u7D44\u4EE3\u78BC", maxLength: 6, style: {
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '2px solid #333',
                                    backgroundColor: '#1a1a1a',
                                    color: 'white',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    textAlign: 'center',
                                    letterSpacing: '0.2em',
                                    boxSizing: 'border-box'
                                } }), isSearching && (_jsx("div", { style: {
                                    textAlign: 'center',
                                    color: '#4ecdc4',
                                    marginTop: '10px',
                                    fontSize: '16px'
                                }, children: "\u641C\u5C0B\u4E2D..." }))] }), foundGroup && (_jsxs("div", { style: {
                            backgroundColor: '#1a1a1a',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px',
                            border: '2px solid #4ecdc4'
                        }, children: [_jsx("h3", { style: {
                                    color: '#4ecdc4',
                                    marginBottom: '10px',
                                    fontSize: '1.4em',
                                    fontWeight: '600'
                                }, children: foundGroup.name }), _jsxs("p", { style: {
                                    color: '#ccc',
                                    fontSize: '16px',
                                    marginBottom: '15px'
                                }, children: ["\u7FA4\u7D44\u4EE3\u78BC\uFF1A", foundGroup.code] }), _jsxs("p", { style: {
                                    color: '#888',
                                    fontSize: '14px'
                                }, children: ["\u5EFA\u7ACB\u6642\u9593\uFF1A", new Date(foundGroup.createdAt).toLocaleDateString('zh-TW')] })] })), foundGroup && (_jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    marginBottom: '12px'
                                }, children: "\u60A8\u7684\u59D3\u540D" }), _jsx("input", { type: "text", value: userName, onChange: (e) => setUserName(e.target.value), placeholder: "\u8ACB\u8F38\u5165\u60A8\u7684\u59D3\u540D", style: {
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '2px solid #333',
                                    backgroundColor: '#1a1a1a',
                                    color: 'white',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    boxSizing: 'border-box'
                                } })] })), errorMessage && (_jsx("div", { style: {
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '16px',
                            fontWeight: '500',
                            textAlign: 'center'
                        }, children: errorMessage })), _jsx("button", { onClick: foundGroup ? handleJoinGroup : handleSearchGroup, disabled: isSearching || isJoining || (!foundGroup && groupCode.length !== 6), style: {
                            width: '100%',
                            backgroundColor: (isSearching || isJoining || (!foundGroup && groupCode.length !== 6)) ? '#95a5a6' : '#4ecdc4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '18px',
                            cursor: (isSearching || isJoining || (!foundGroup && groupCode.length !== 6)) ? 'not-allowed' : 'pointer',
                            fontSize: '18px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }, children: isJoining ? '加入中...' : foundGroup ? '確認加入群組' : '搜尋群組' }), _jsxs("div", { style: {
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#888',
                            lineHeight: '1.5'
                        }, children: [_jsx("div", { style: { fontWeight: '600', marginBottom: '8px' }, children: "\uD83D\uDCA1 \u63D0\u793A\uFF1A" }), _jsx("div", { children: "\u2022 \u8F38\u5165\u5B8C\u6574\u7684 6 \u78BC\u7FA4\u7D44\u4EE3\u78BC" }), _jsx("div", { children: "\u2022 \u6BCF\u500B\u4F7F\u7528\u8005\u53EF\u52A0\u5165\u591A\u500B\u7FA4\u7D44" }), _jsx("div", { children: "\u2022 \u4E0D\u53EF\u91CD\u8907\u52A0\u5165\u540C\u4E00\u7FA4\u7D44" })] })] })] }));
};
export default JoinGroupPage;
