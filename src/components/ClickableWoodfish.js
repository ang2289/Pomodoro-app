import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
const ClickableWoodfish = ({ onWoodfishClick }) => {
    const [woodfishImage, setWoodfishImage] = useState('/assets/woodfish.png');
    const [isAnimating, setIsAnimating] = useState(false);
    const audioRef = useRef(null);
    // 載入儲存的木魚圖片
    useEffect(() => {
        const savedImage = localStorage.getItem('customWoodfishImage');
        if (savedImage) {
            setWoodfishImage(savedImage);
        }
    }, []);
    // 處理木魚點擊
    const handleWoodfishClick = () => {
        // 播放音效
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
        }
        // 觸發動畫
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        // 回調函數（用於計數）
        onWoodfishClick?.();
    };
    // 處理自訂木魚圖片上傳
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                setWoodfishImage(result);
                localStorage.setItem('customWoodfishImage', result);
            };
            reader.readAsDataURL(file);
        }
    };
    // 還原預設木魚圖片
    const resetToDefault = () => {
        setWoodfishImage('/assets/woodfish.png');
        localStorage.removeItem('customWoodfishImage');
    };
    return (_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-500", children: [_jsx("h3", { className: "text-xl font-bold mb-4 text-center text-gray-800", children: "\uD83D\uDC1F \u6572\u6728\u9B5A" }), _jsx("div", { className: "flex justify-center mb-4", children: _jsxs(motion.div, { className: "relative cursor-pointer", onClick: handleWoodfishClick, animate: {
                        scale: isAnimating ? [1, 1.2, 0.9, 1] : 1,
                        rotate: isAnimating ? [0, -5, 5, 0] : 0,
                        y: isAnimating ? [0, -10, 0] : 0,
                    }, transition: {
                        duration: 0.3,
                        ease: "easeInOut"
                    }, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx("img", { src: woodfishImage, alt: "\u6728\u9B5A", className: "w-32 h-32 object-contain rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200", style: {
                                maxWidth: '128px',
                                maxHeight: '128px'
                            } }), _jsx("div", { className: "absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm", children: "\u9EDE\u64CA\u6572\u64CA" })] }) }), _jsx("div", { className: "space-y-3", children: _jsxs("div", { className: "flex gap-4 sm:gap-6", children: [_jsxs("label", { className: "flex-1 cursor-pointer", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleImageUpload, className: "hidden" }), _jsx("div", { className: "w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors duration-200", children: "\u4E0A\u50B3\u81EA\u8A02\u6728\u9B5A\u5716" })] }), _jsx("button", { onClick: resetToDefault, className: "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200", children: "\u9084\u539F\u9810\u8A2D" })] }) }), _jsx("audio", { ref: audioRef, preload: "auto", children: _jsx("source", { src: "/sounds/wood.mp3", type: "audio/mpeg" }) })] }));
};
export default ClickableWoodfish;
