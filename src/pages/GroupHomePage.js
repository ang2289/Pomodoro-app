import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IconButton from '../components/IconButton'; // Assuming IconButton is in ../components/
const GroupHomePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [groupCode] = useState('ABC123'); // 模擬群組代碼，實際應該從 API 或 context 取得
    const handleCreatePurchase = () => {
        navigate(`/group/${id}/purchase/create`);
    };
    const handleCreateEvent = () => {
        navigate(`/group/${id}/event`);
    };
    const handleInviteFriends = () => {
        setShowInviteModal(true);
    };
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(groupCode);
            alert('群組代碼已複製到剪貼簿！');
        }
        catch (error) {
            // 備用方案：使用舊的複製方法
            const textArea = document.createElement('textarea');
            textArea.value = groupCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('群組代碼已複製到剪貼簿！');
        }
    };
    const closeModal = () => {
        setShowInviteModal(false);
    };
    return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83D\uDC65 \u6211\u7684\u7FA4\u7D44" }), _jsxs("div", { className: "bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-md mx-auto mt-10", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-2", children: "\u7FA4\u7D44\u529F\u80FD" }), _jsx("p", { className: "text-gray-600", children: "\u9078\u64C7\u60A8\u60F3\u8981\u4F7F\u7528\u7684\u7FA4\u7D44\u529F\u80FD" })] }), _jsxs("div", { className: "grid grid-cols-1 gap-4 mt-6", children: [_jsx(IconButton, { onClick: handleCreatePurchase, label: "\u2795 \u5EFA\u7ACB\u5718\u8CFC", className: "bg-blue-700 text-white" }), _jsx(IconButton, { onClick: handleCreateEvent, label: "\uD83D\uDCC5 \u767C\u8D77\u6D3B\u52D5", className: "bg-blue-700 text-white" }), _jsx(IconButton, { onClick: handleInviteFriends, label: "\uD83D\uDC65 \u9080\u8ACB\u597D\u53CB", className: "bg-blue-700 text-white" })] }), _jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600", children: [_jsx("div", { className: "font-semibold mb-2", children: "\uD83D\uDCA1 \u63D0\u793A\uFF1A" }), _jsx("div", { children: "\u2022 \u5EFA\u7ACB\u5718\u8CFC\uFF1A\u8207\u7FA4\u7D44\u6210\u54E1\u4E00\u8D77\u8CFC\u8CB7\u5546\u54C1" }), _jsx("div", { children: "\u2022 \u767C\u8D77\u6D3B\u52D5\uFF1A\u7D44\u7E54\u7FA4\u7D44\u805A\u6703\u6216\u6D3B\u52D5" }), _jsx("div", { children: "\u2022 \u9080\u8ACB\u597D\u53CB\uFF1A\u5206\u4EAB\u7FA4\u7D44\u4EE3\u78BC\u9080\u8ACB\u65B0\u6210\u54E1" })] })] }), showInviteModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsx("div", { className: "bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl", children: _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-800 mb-4", children: "\u9080\u8ACB\u597D\u53CB\u52A0\u5165\u7FA4\u7D44" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-6", children: [_jsx("div", { className: "text-gray-600 text-sm mb-2", children: "\u7FA4\u7D44\u4EE3\u78BC" }), _jsx("div", { className: "text-3xl font-bold text-indigo-600 tracking-wider mb-4", children: groupCode }), _jsx("button", { onClick: handleCopyCode, className: "bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 font-semibold", children: "\uD83D\uDCCB \u8907\u88FD\u4EE3\u78BC" })] }), _jsx("div", { className: "text-gray-600 text-sm mb-6", children: "\u5206\u4EAB\u6B64\u4EE3\u78BC\u7D66\u670B\u53CB\uFF0C\u4ED6\u5011\u5C31\u53EF\u4EE5\u52A0\u5165\u60A8\u7684\u7FA4\u7D44" }), _jsx("button", { onClick: closeModal, className: "bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold", children: "\u95DC\u9589" })] }) }) }))] }));
};
export default GroupHomePage;
