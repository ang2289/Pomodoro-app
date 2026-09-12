import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createGroup } from '../services/groupService';
const GroupCreatePage = () => {
    const [groupName, setGroupName] = useState('');
    const [createdGroup, setCreatedGroup] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            alert('請輸入群組名稱');
            return;
        }
        setIsCreating(true);
        try {
            // 模擬創建者 ID（實際應用中應該從用戶認證系統取得）
            const createdBy = 'user-' + Date.now();
            const newGroup = createGroup({
                name: groupName.trim(),
                createdBy
            });
            setCreatedGroup(newGroup);
            setShowSuccess(true);
            setGroupName('');
        }
        catch (error) {
            console.error('建立群組失敗:', error);
            alert('建立群組失敗，請重試');
        }
        finally {
            setIsCreating(false);
        }
    };
    const handleCopyCode = async () => {
        if (createdGroup) {
            try {
                await navigator.clipboard.writeText(createdGroup.code);
                alert('群組代碼已複製到剪貼簿！');
            }
            catch (error) {
                // 備用方案：使用舊的複製方法
                const textArea = document.createElement('textarea');
                textArea.value = createdGroup.code;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('群組代碼已複製到剪貼簿！');
            }
        }
    };
    const handleCreateAnother = () => {
        setCreatedGroup(null);
        setShowSuccess(false);
    };
    if (showSuccess && createdGroup) {
        return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83C\uDF89 \u7FA4\u7D44\u5EFA\u7ACB\u6210\u529F\uFF01" }), _jsxs("div", { className: "bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-md mx-auto mt-10 text-center", children: [_jsx("h2", { className: "text-indigo-600 mb-5 text-3xl font-semibold", children: createdGroup.name }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-5 my-5", children: [_jsx("div", { className: "text-gray-600 text-base mb-2 font-medium", children: "\u7FA4\u7D44\u4EE3\u78BC" }), _jsx("div", { className: "text-4xl font-bold text-indigo-600 tracking-wider mb-5", children: createdGroup.code }), _jsx("button", { onClick: handleCopyCode, className: "bg-indigo-500 text-white border-none rounded-lg py-3 px-6 cursor-pointer text-base font-semibold mb-5 hover:bg-indigo-600", children: "\uD83D\uDCCB \u8907\u88FD\u4EE3\u78BC" })] }), _jsx("div", { className: "text-gray-600 text-lg font-medium leading-relaxed mb-8", children: "\u8ACB\u9080\u8ACB\u5718\u53CB\u8F38\u5165\u4EE3\u78BC\u52A0\u5165\u7FA4\u7D44" }), _jsx("div", { className: "flex gap-4 justify-center", children: _jsx("button", { onClick: handleCreateAnother, className: "bg-gray-500 text-white border-none rounded-lg py-3 px-6 cursor-pointer text-base font-semibold hover:bg-gray-600", children: "\u5EFA\u7ACB\u65B0\u7FA4\u7D44" }) })] })] }));
    }
    return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83D\uDC65 \u5EFA\u7ACB\u7FA4\u7D44" }), _jsx("p", { style: { fontSize: '1.2em', fontWeight: '500', marginBottom: '40px' }, children: "\u5EFA\u7ACB\u4E00\u500B\u65B0\u7684\u7FA4\u7D44\uFF0C\u8207\u670B\u53CB\u4E00\u8D77\u4F7F\u7528\u756A\u8304\u9418" }), _jsxs("div", { className: "bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-md mx-auto mt-10", children: [_jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("label", { className: "block text-gray-700 text-lg font-semibold mb-3", children: "\u7FA4\u7D44\u540D\u7A31" }), _jsx("input", { type: "text", value: groupName, onChange: (e) => setGroupName(e.target.value), placeholder: "\u8ACB\u8F38\u5165\u7FA4\u7D44\u540D\u7A31...", className: "w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200", onKeyPress: (e) => e.key === 'Enter' && handleCreateGroup() })] }), _jsx("button", { onClick: handleCreateGroup, disabled: isCreating || !groupName.trim(), className: `w-full py-2 px-4 rounded mt-4 ${isCreating || !groupName.trim()
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'}`, children: isCreating ? '建立中...' : '建立群組' }), _jsxs("div", { className: "mt-5 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed", children: [_jsx("div", { className: "font-semibold mb-2", children: "\uD83D\uDCA1 \u63D0\u793A\uFF1A" }), _jsx("div", { children: "\u2022 \u7FA4\u7D44\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u7522\u751F 6 \u78BC\u4EE3\u78BC" }), _jsx("div", { children: "\u2022 \u5206\u4EAB\u4EE3\u78BC\u7D66\u670B\u53CB\u5373\u53EF\u9080\u8ACB\u52A0\u5165" }), _jsx("div", { children: "\u2022 \u7FA4\u7D44\u8CC7\u6599\u6703\u5132\u5B58\u5728\u672C\u5730\u88DD\u7F6E" })] })] })] }));
};
export default GroupCreatePage;
