import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import SupportButton from './SupportButton';
export default function SupportSection({ supportCount, supported, onSupport, commentCount }) {
    console.log('SupportSection rendered with count:', supportCount, 'comments:', commentCount);
    
    // 愛心點擊動畫狀態
    const [isAnimating, setIsAnimating] = useState(false);
    
    // 處理愛心點擊
    const handleHeartClick = async () => {
        if (supported || isAnimating) return; // 如果已經支持過或動畫正在進行中，不做任何事
        
        // 設置動畫狀態
        setIsAnimating(true);
        
        // 調用支持函數
        await onSupport();
        
        // 動畫結束後重置
        setTimeout(() => {
            setIsAnimating(false);
        }, 1000);
    };
    
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-4 mb-6", children: [
        _jsxs("div", { className: "flex flex-col gap-3 text-sm text-gray-600 mb-3", children: [
            _jsxs("div", { children: [
                _jsx("button", {
                    onClick: handleHeartClick,
                    disabled: supported || isAnimating,
                    className: `w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg 
                      ${supported ? 'bg-gray-100' : 'bg-pink-50 hover:bg-pink-100 active:bg-pink-200'}
                      transition-all duration-300 focus:outline-none`,
                    style: { border: 'none' },
                    children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [
                        _jsx("span", {
                            className: `text-pink-500 text-3xl drop-shadow-md transition-transform duration-300
                              ${isAnimating ? 'animate-heartbeat scale-125' : 'hover:scale-110'}
                              ${supported ? 'opacity-80' : ''}`,
                            children: "\uD83D\uDC96"
                        }),
                        _jsxs("span", {
                            className: `font-medium ${supported ? 'text-gray-500' : 'text-pink-600'}`,
                            children: ["\u611B\u5FC3\u652F\u6301\uFF08", supportCount, "\uFF09"]
                        })
                    ]})
                }),
                
                isAnimating && _jsx("p", {
                    className: "text-center text-pink-600 text-sm font-medium mt-2 animate-fadeIn",
                    children: "\u611F\u8B1D\u60A8\u7684\u652F\u6301\uFF01"
                }),
                
                supported && !isAnimating && _jsx("p", {
                    className: "text-center text-pink-600 text-sm font-medium mt-2",
                    children: "\u611F\u8B1D\u60A8\u7684\u652F\u6301\uFF01"
                }),
                
                !supported && !isAnimating && _jsx("p", {
                    className: "text-center text-gray-500 text-sm mt-2",
                    children: "\u9EDE\u64CA\u611B\u5FC3\u4F86\u652F\u6301"
                })
            ]}),
            
            _jsxs("div", { className: "flex items-center gap-1 mt-2", children: [
                _jsx("span", { className: "text-purple-500 text-lg", children: "\uD83D\uDCAC" }),
                _jsxs("span", { children: ["\u7559\u8A00 ", commentCount, " \u5247"] })
            ]})
        ]}),
        _jsx("p", { className: "text-xs text-gray-500 text-center", children: "\u6BCF\u4EBA\u5C0D\u6BCF\u500B\u6D3B\u52D5\u50C5\u80FD\u6309\u4E00\u6B21\u652F\u6301" })
    ]}))
}
