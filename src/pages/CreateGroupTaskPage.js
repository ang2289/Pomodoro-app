import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createGroupTask } from '../services/groupTaskService';
import { getGroupsByUserId } from '../services/groupMemberService';
const CreateGroupTaskPage = () => {
    const [title, setTitle] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [userGroups, setUserGroups] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    // 載入使用者加入的群組
    useEffect(() => {
        const loadUserGroups = () => {
            try {
                // 模擬使用者 ID（實際應用中應該從用戶認證系統取得）
                const userId = 'user-' + Date.now();
                const groups = getGroupsByUserId(userId);
                setUserGroups(groups);
            }
            catch (error) {
                console.error('載入群組失敗:', error);
                setErrorMessage('載入群組失敗，請重試');
            }
        };
        loadUserGroups();
    }, []);
    const handleCreateTask = async () => {
        if (!title.trim()) {
            setErrorMessage('請輸入任務標題');
            return;
        }
        if (!selectedGroupId) {
            setErrorMessage('請選擇所屬群組');
            return;
        }
        if (!deliveryTime.trim()) {
            setErrorMessage('請輸入領貨時間');
            return;
        }
        setIsCreating(true);
        setErrorMessage('');
        try {
            // 模擬創建者 ID（實際應用中應該從用戶認證系統取得）
            const createdBy = 'user-' + Date.now();
            createGroupTask({
                title: title.trim(),
                groupId: selectedGroupId,
                deliveryTime: deliveryTime.trim(),
                createdBy
            });
            setShowSuccess(true);
            setTitle('');
            setSelectedGroupId('');
            setDeliveryTime('');
        }
        catch (error) {
            console.error('建立任務失敗:', error);
            setErrorMessage('建立任務失敗，請重試');
        }
        finally {
            setIsCreating(false);
        }
    };
    const handleCreateAnother = () => {
        setShowSuccess(false);
        setTitle('');
        setSelectedGroupId('');
        setDeliveryTime('');
        setErrorMessage('');
    };
    if (showSuccess) {
        return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83C\uDF89 \u4EFB\u52D9\u5EFA\u7ACB\u6210\u529F\uFF01" }), _jsxs("div", { style: {
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
                            }, children: "\u4EFB\u52D9\u5DF2\u6210\u529F\u5EFA\u7ACB\uFF01" }), _jsx("div", { style: {
                                color: '#ccc',
                                fontSize: '18px',
                                fontWeight: '500',
                                lineHeight: '1.6',
                                marginBottom: '30px'
                            }, children: "\u7FA4\u7D44\u6210\u54E1\u73FE\u5728\u53EF\u4EE5\u770B\u5230\u9019\u500B\u4EFB\u52D9\u4E86" }), _jsx("div", { style: { display: 'flex', gap: '15px', justifyContent: 'center' }, children: _jsx("button", { onClick: handleCreateAnother, style: {
                                    backgroundColor: '#4ecdc4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 24px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }, children: "\u5EFA\u7ACB\u65B0\u4EFB\u52D9" }) })] })] }));
    }
    if (userGroups.length === 0) {
        return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83D\uDCDD \u5EFA\u7ACB\u7FA4\u7D44\u4EFB\u52D9" }), _jsxs("div", { style: {
                        backgroundColor: '#2a2a2a',
                        borderRadius: '16px',
                        padding: '30px',
                        margin: '30px 0',
                        textAlign: 'center'
                    }, children: [_jsx("div", { style: {
                                fontSize: '48px',
                                marginBottom: '20px'
                            }, children: "\uD83D\uDC65" }), _jsx("h2", { style: {
                                color: '#4ecdc4',
                                marginBottom: '20px',
                                fontSize: '1.8em',
                                fontWeight: '600'
                            }, children: "\u5C1A\u672A\u52A0\u5165\u4EFB\u4F55\u7FA4\u7D44" }), _jsx("div", { style: {
                                color: '#ccc',
                                fontSize: '18px',
                                fontWeight: '500',
                                lineHeight: '1.6',
                                marginBottom: '30px'
                            }, children: "\u8ACB\u5148\u52A0\u5165\u7FA4\u7D44\u624D\u80FD\u5EFA\u7ACB\u4EFB\u52D9" }), _jsx("div", { style: { display: 'flex', gap: '15px', justifyContent: 'center' }, children: _jsx("a", { href: "/group/join", style: {
                                    backgroundColor: '#4ecdc4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 24px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    display: 'inline-block'
                                }, children: "\u52A0\u5165\u7FA4\u7D44" }) })] })] }));
    }
    return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83D\uDCDD \u5EFA\u7ACB\u7FA4\u7D44\u4EFB\u52D9" }), _jsx("p", { style: { fontSize: '1.2em', fontWeight: '500', marginBottom: '40px' }, children: "\u70BA\u7FA4\u7D44\u5EFA\u7ACB\u65B0\u7684\u4EFB\u52D9" }), _jsxs("div", { style: {
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
                                }, children: "\u4EFB\u52D9\u6A19\u984C" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "\u4F8B\u5982\uFF1A9/12 \u86CB\u5854\u767C\u8CA8", style: {
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '2px solid #333',
                                    backgroundColor: '#1a1a1a',
                                    color: 'white',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    boxSizing: 'border-box'
                                } })] }), _jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    marginBottom: '12px'
                                }, children: "\u6240\u5C6C\u7FA4\u7D44" }), _jsxs("select", { value: selectedGroupId, onChange: (e) => setSelectedGroupId(e.target.value), className: "w-full border border-gray-300 rounded-md text-sm hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white px-3 py-2", children: [_jsx("option", { value: "", children: "\u8ACB\u9078\u64C7\u7FA4\u7D44" }), userGroups.map(group => (_jsxs("option", { value: group.id, children: [group.name, " (", group.code, ")"] }, group.id)))] })] }), _jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    marginBottom: '12px'
                                }, children: "\u9818\u8CA8\u6642\u9593" }), _jsx("input", { type: "text", value: deliveryTime, onChange: (e) => setDeliveryTime(e.target.value), placeholder: "\u4F8B\u5982\uFF1A9/13 \u665A\u4E0A 7 \u9EDE\uFF5E9 \u9EDE", className: "w-full border border-gray-300 rounded-md text-sm hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white px-3 py-2" })] }), errorMessage && (_jsx("div", { style: {
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '16px',
                            fontWeight: '500',
                            textAlign: 'center'
                        }, children: errorMessage })), _jsx("button", { onClick: handleCreateTask, disabled: isCreating || !title.trim() || !selectedGroupId || !deliveryTime.trim(), style: {
                            width: '100%',
                            backgroundColor: (isCreating || !title.trim() || !selectedGroupId || !deliveryTime.trim()) ? '#95a5a6' : '#4ecdc4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '18px',
                            cursor: (isCreating || !title.trim() || !selectedGroupId || !deliveryTime.trim()) ? 'not-allowed' : 'pointer',
                            fontSize: '18px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }, children: isCreating ? '建立中...' : '建立任務' }), _jsxs("div", { style: {
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#888',
                            lineHeight: '1.5'
                        }, children: [_jsx("div", { style: { fontWeight: '600', marginBottom: '8px' }, children: "\uD83D\uDCA1 \u63D0\u793A\uFF1A" }), _jsx("div", { children: "\u2022 \u4EFB\u52D9\u6A19\u984C\u8981\u6E05\u695A\u63CF\u8FF0\u4EFB\u52D9\u5167\u5BB9" }), _jsx("div", { children: "\u2022 \u9818\u8CA8\u6642\u9593\u8ACB\u8A73\u7D30\u8AAA\u660E\u6642\u9593\u7BC4\u570D" }), _jsx("div", { children: "\u2022 \u7FA4\u7D44\u6210\u54E1\u90FD\u53EF\u4EE5\u770B\u5230\u9019\u500B\u4EFB\u52D9" })] })] })] }));
};
export default CreateGroupTaskPage;
