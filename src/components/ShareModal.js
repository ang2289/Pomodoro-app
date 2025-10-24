import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import toast from 'react-hot-toast';
export default function ShareModal({ wishText, wishUrl, onClose }) {
    const [shareLine, setShareLine] = useState(true);
    const [shareTikTok, setShareTikTok] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const shareMessage = `🌟 我的願望：「${wishText}」\n✨ 幫我集氣 ➜ ${wishUrl}\n#集氣任務 #許願池 #AI願望牆`;
    const handleConfirmShare = async () => {
        // 如果沒有選擇任何平台，顯示提示
        if (!shareLine && !shareTikTok) {
            toast.info('請至少選擇一個分享平台');
            return;
        }
        setIsSharing(true);
        try {
            // 先處理 TikTok 分享（複製到剪貼簿）
            if (shareTikTok) {
                await navigator.clipboard.writeText(shareMessage);
                toast.success('已複製願望文字，可貼到 TikTok！');
                // 等待一下讓用戶看到 toast
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            // 然後處理 LINE 分享（開啟新視窗）
            if (shareLine) {
                const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(wishUrl)}&text=${encodeURIComponent(shareMessage)}`;
                window.open(lineUrl, '_blank');
                // 顯示 LINE 分享成功訊息
                toast.success('LINE 分享視窗已開啟！');
                // 等待一下讓 LINE 視窗開啟
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            // 如果兩個都選擇了，顯示完成訊息
            if (shareLine && shareTikTok) {
                toast.success('分享完成！LINE 已開啟，TikTok 文字已複製');
            }
            // 延遲關閉 Modal，讓用戶看到所有訊息
            setTimeout(() => {
                onClose();
            }, 2000);
        }
        catch (err) {
            console.error('分享失敗:', err);
            toast.error('分享失敗，請重試');
        }
        finally {
            setIsSharing(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center px-4", children: _jsxs("div", { className: "bg-white w-full max-w-sm rounded-xl p-6 shadow-xl text-center", children: [_jsx("h2", { className: "text-xl font-bold mb-4 text-gray-800", children: "\uD83C\uDF89 \u9858\u671B\u5DF2\u9001\u51FA\uFF01\u8981\u5206\u4EAB\u55CE\uFF1F" }), _jsxs("div", { className: "text-left mb-6 space-y-4", children: [_jsxs("label", { className: "flex items-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors", children: [_jsx("input", { type: "checkbox", checked: shareLine, onChange: () => setShareLine(!shareLine), className: "w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2" }), _jsxs("div", { className: "ml-3 flex items-center", children: [_jsx("div", { className: "w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3", children: _jsx("span", { className: "text-white font-bold text-sm", children: "L" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-800", children: "\u5206\u4EAB\u81F3 LINE" }), _jsx("div", { className: "text-sm text-gray-500", children: "\u958B\u555F LINE \u5206\u4EAB" })] })] })] }), _jsxs("label", { className: "flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors", children: [_jsx("input", { type: "checkbox", checked: shareTikTok, onChange: () => setShareTikTok(!shareTikTok), className: "w-5 h-5 text-gray-600 border-gray-300 rounded focus:ring-gray-500 focus:ring-2" }), _jsxs("div", { className: "ml-3 flex items-center", children: [_jsx("div", { className: "w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3", children: _jsx("span", { className: "text-white font-bold text-sm", children: "\u266A" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-800", children: "\u5206\u4EAB\u5230 TikTok" }), _jsx("div", { className: "text-sm text-gray-500", children: "\u8907\u88FD\u6587\u5B57\u5230\u526A\u8CBC\u7C3F" })] })] })] })] }), _jsx("button", { onClick: handleConfirmShare, disabled: isSharing, className: "w-full py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed", children: isSharing ? (_jsxs("div", { className: "flex items-center justify-center", children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" }), "\u5206\u4EAB\u4E2D..."] })) : ('✅ 確認分享') }), _jsx("button", { onClick: onClose, className: "mt-3 text-gray-500 hover:text-gray-800 underline text-sm", children: "\u53D6\u6D88" })] }) }));
}
