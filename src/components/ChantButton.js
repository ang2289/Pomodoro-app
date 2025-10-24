import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function ChantButton({ onSoundPlay, onCount, customWoodfishImage, onWoodfishUpload, onReset }) {
    const [animate, setAnimate] = useState(false);
    const [showPlusOne, setShowPlusOne] = useState(false);
    const handleWoodfishUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onWoodfishUpload?.(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleClick = () => {
        // 如果正在動畫中，不重複觸發
        if (animate)
            return;
        setAnimate(true);
        setShowPlusOne(true);
        // 播放音效
        onSoundPlay?.();
        // 呼叫計數邏輯
        onCount?.();
        // 動畫完成後重置狀態
        setTimeout(() => {
            setShowPlusOne(false);
            setAnimate(false);
        }, 1000);
    };
    return (_jsxs("div", { className: "flex flex-col items-center", children: [_jsxs("div", { className: "relative", children: [_jsx("button", { type: "button", onClick: handleClick, className: `group w-42 h-42 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 
            shadow-[0_10px_20px_rgba(0,0,0,0.2)] !border-0 !outline-none !ring-0 focus:!outline-none focus:!ring-0 
            flex items-center justify-center transition-all duration-200 
            ${animate ? 'translate-y-[2px] shadow-[0_6px_14px_rgba(0,0,0,0.18)]' : 'active:translate-y-[2px] active:shadow-[0_6px_14px_rgba(0,0,0,0.18)]'}`, "aria-label": "\u6572\u6728\u9B5A", children: _jsx("img", { src: customWoodfishImage || "/assets/woodfish.png", className: `w-30 h-30 select-none pointer-events-none border-0 outline-none ${animate ? 'woodfish-clicked' : ''}`, alt: "\u6572\u6728\u9B5A", style: { WebkitTapHighlightColor: 'transparent' } }) }), showPlusOne && (_jsx("div", { className: "floating-plus-one animate-pop-bounce", children: "+1" }))] }), _jsx("input", { type: "file", accept: "image/*", onChange: handleWoodfishUpload, className: "hidden", id: "woodfish-upload" }), _jsx("div", { className: "mt-6", children: _jsx("label", { htmlFor: "woodfish-upload", children: _jsx("div", { className: "bg-yellow-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-yellow-600 transition-colors duration-200", children: "\u4E0A\u50B3\u81EA\u8A02\u6728\u9B5A\u5716" }) }) }), _jsx("div", { onClick: onReset, className: "mt-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 cursor-pointer transition-colors duration-200", children: "\u9084\u539F\u9810\u8A2D" })] }));
}
