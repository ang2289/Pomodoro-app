import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
export default function SubscriptionSettings() {
    const [subscribed, setSubscribed] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messageColor, setMessageColor] = useState('');
    const [hasInteracted, setHasInteracted] = useState(false);
    const hasInitialized = useRef(false);
    // 音效控制 refs
    const dingAudioRef = useRef(null);
    const woodAudioRef = useRef(null);
    // 第一次載入 localStorage
    useEffect(() => {
        const saved = localStorage.getItem('subscribedToNotification');
        if (saved)
            setSubscribed(saved === 'true');
        hasInitialized.current = true;
    }, []);
    // 使用者變更後才儲存並顯示對應提示
    useEffect(() => {
        if (!hasInitialized.current)
            return;
        localStorage.setItem('subscribedToNotification', subscribed.toString());
        // 只有在使用者互動後才播放音效和顯示提示訊息
        if (!hasInteracted)
            return;
        // 根據訂閱狀態顯示不同訊息並播放音效
        if (subscribed) {
            setMessageText('✅ 已訂閱通知');
            setMessageColor('text-green-600 bg-green-100');
            // 播放勾選音效
            if (dingAudioRef.current) {
                dingAudioRef.current.currentTime = 0;
                dingAudioRef.current.play().catch(err => console.log('音效播放失敗:', err));
            }
        }
        else {
            setMessageText('📭 已取消訂閱');
            setMessageColor('text-gray-600 bg-gray-100');
            // 播放取消音效
            if (woodAudioRef.current) {
                woodAudioRef.current.currentTime = 0;
                woodAudioRef.current.play().catch(err => console.log('音效播放失敗:', err));
            }
        }
        setShowMessage(true);
        const timeout = setTimeout(() => setShowMessage(false), 2000);
        return () => clearTimeout(timeout);
    }, [subscribed, hasInteracted]);
    return (_jsxs("div", { className: "card relative", style: { backgroundColor: '#ffffff', color: '#213547' }, children: [_jsx("h2", { className: "text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6", children: "\uD83D\uDCEC \u8A02\u95B1\u8A2D\u5B9A" }), _jsxs("div", { className: "flex justify-between items-center mb-4 sm:mb-6", children: [_jsx("label", { htmlFor: "subscribeCheckbox", className: "text-base sm:text-lg font-medium text-gray-700 flex-1 mr-3 whitespace-nowrap", children: "\u662F\u5426\u8A02\u95B1" }), _jsx("input", { id: "subscribeCheckbox", type: "checkbox", checked: subscribed, onChange: () => {
                            setHasInteracted(true);
                            setSubscribed(!subscribed);
                        }, className: "w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" })] }), _jsx(AnimatePresence, { children: showMessage && (_jsx(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.3 }, className: `absolute top-2 right-2 text-sm sm:text-base font-medium px-2 py-1 rounded shadow ${messageColor}`, children: messageText })) }), _jsx("audio", { ref: dingAudioRef, src: "/sounds/ding.mp3", preload: "auto" }), _jsx("audio", { ref: woodAudioRef, src: "/sounds/wood.mp3", preload: "auto" })] }));
}
