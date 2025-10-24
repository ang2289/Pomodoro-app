import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import clsx from 'clsx';
export default function SupportButton({ initialCount = 0, disabled = false, onSupport }) {
    console.log('SupportButton rendered with count:', initialCount);
    const [clicked, setClicked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [showText, setShowText] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const handleClick = async () => {
        if (clicked || disabled || isProcessing)
            return;
        setIsProcessing(true);
        // 立即播放動畫與本地 +1
        setClicked(true);
        setCount((c) => c + 1);
        setShowText(true);
        setTimeout(() => setClicked(false), 300);
        setTimeout(() => setShowText(false), 1200);
        try {
            if (typeof onSupport === 'function')
                await onSupport();
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (_jsxs("div", { className: "w-full", children: [_jsxs("button", { onClick: handleClick, disabled: disabled || isProcessing, className: clsx('w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg', 'bg-white border border-pink-300 hover:border-pink-400', 'text-pink-500 font-bold text-base shadow-md hover:shadow-lg', 'hover:scale-105 transition-transform duration-300', (disabled || isProcessing) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'), children: [_jsx("span", { className: "text-2xl drop-shadow-md", style: { filter: 'drop-shadow(0 2px 2px rgba(219, 39, 119, 0.3))' }, children: "\uD83D\uDC96" }), _jsxs("span", { className: "font-bold", children: [disabled ? '已支持' : '愛心支持', " (", count, ")"] })] }), showText && (_jsx("div", { className: "text-center text-rose-500 text-sm animate-fadeInOut mt-2", children: "\u611F\u8B1D\u60A8\u7684\u652F\u6301\uFF0C\u529F\u5FB7\u7121\u91CF \uD83D\uDE4F" }))] }));
}
