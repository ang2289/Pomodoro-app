import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
const defaultMusicOptions = [
    { label: '南無阿彌陀佛（一）', file: '/music/namo1.mp3' },
    { label: '南無阿彌陀佛（二）', file: '/music/namo2.mp3' },
    { label: '南無阿彌陀佛（三）', file: '/music/namo3.mp3' }
];
export default function AnimatedMusicPlayer({ onPlayStateChange } = {}) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(() => {
        // 從 localStorage 讀取播放狀態，預設為暫停
        const savedPlayState = localStorage.getItem('animatedMusicPlayState');
        return savedPlayState === 'true';
    });
    const [selected, setSelected] = useState(() => {
        // 從 localStorage 讀取音樂選擇，預設為南無阿彌陀佛（一）
        return localStorage.getItem('selectedAnimatedMusic') || defaultMusicOptions[0].file;
    });
    const [customMusic, setCustomMusic] = useState(null);
    const [musicOptions, setMusicOptions] = useState(defaultMusicOptions);
    // 載入儲存的音樂設定
    useEffect(() => {
        const savedCustomMusic = localStorage.getItem('customAnimatedMusic');
        if (savedCustomMusic) {
            setCustomMusic(savedCustomMusic);
            const customOption = {
                label: '自訂音樂',
                file: savedCustomMusic
            };
            setMusicOptions([customOption, ...defaultMusicOptions]);
        }
    }, []);
    // 初始載入時通知播放狀態
    useEffect(() => {
        onPlayStateChange?.(isPlaying);
    }, [isPlaying, onPlayStateChange]);
    // 切換播放/暫停函數
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            }
            else {
                audioRef.current.play().catch(console.error);
            }
        }
        const newPlayState = !isPlaying;
        setIsPlaying(newPlayState);
        onPlayStateChange?.(newPlayState);
    };
    // 快捷鍵監聽（空白鍵切換播放/暫停）
    useEffect(() => {
        const handleKeyPress = (event) => {
            // 只在按下空白鍵且不在輸入欄位中時觸發
            if (event.code === 'Space' &&
                !['INPUT', 'TEXTAREA'].includes(event.target?.tagName)) {
                event.preventDefault(); // 防止頁面滾動
                togglePlay();
            }
        };
        // 添加事件監聽器
        document.addEventListener('keydown', handleKeyPress);
        // 清理事件監聽器
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [isPlaying]); // 依賴 isPlaying 以確保使用最新狀態
    // 音樂播放控制
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = selected;
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
            // 根據播放狀態控制音樂
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            }
            else {
                audioRef.current.pause();
            }
            // 儲存音樂選擇到 localStorage
            localStorage.setItem('selectedAnimatedMusic', selected);
        }
    }, [selected, isPlaying]);
    // 儲存播放狀態到 localStorage
    useEffect(() => {
        localStorage.setItem('animatedMusicPlayState', isPlaying.toString());
    }, [isPlaying]);
    // 處理自訂音樂上傳
    const handleCustomMusicUpload = (event) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('audio/')) {
            // 檢查檔案大小（限制為5MB）
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                alert('檔案太大！請選擇小於5MB的MP3檔案。');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                try {
                    setCustomMusic(result);
                    localStorage.setItem('customAnimatedMusic', result);
                    // 更新音樂選項
                    const customOption = {
                        label: '自訂音樂',
                        file: result
                    };
                    setMusicOptions([customOption, ...defaultMusicOptions]);
                    setSelected(result);
                } catch (error) {
                    console.error('儲存自訂音樂失敗:', error);
                    alert('檔案太大無法儲存！請選擇較小的MP3檔案。');
                    setCustomMusic(null);
                    localStorage.removeItem('customAnimatedMusic');
                }
            };
            reader.onerror = () => {
                console.error('讀取檔案失敗');
                alert('讀取檔案失敗，請重試。');
            };
            reader.readAsDataURL(file);
        }
        // 重置input值，以便能夠重新選擇相同檔案
        event.target.value = '';
    };
    // 清除自訂音樂
    const clearCustomMusic = () => {
        setCustomMusic(null);
        localStorage.removeItem('customAnimatedMusic');
        localStorage.removeItem('selectedAnimatedMusic');
        setMusicOptions(defaultMusicOptions);
        setSelected(defaultMusicOptions[0].file);
    };
    return (_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500", children: [_jsx("h3", { className: "text-xl font-bold mb-2 text-center text-gray-800", children: "\uD83C\uDFB5 \u80CC\u666F\u97F3\u6A02\uFF08\u52D5\u756B\u7248\uFF09" }), _jsx("p", { className: "text-sm text-gray-600 text-center mb-4", children: "\u6309\u7A7A\u767D\u9375\u53EF\u5FEB\u901F\u5207\u63DB\u64AD\u653E/\u66AB\u505C" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u9078\u64C7\u97F3\u6A02\uFF1A" }), _jsx("select", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", value: selected, onChange: (e) => setSelected(e.target.value), children: musicOptions.map((music) => (_jsx("option", { value: music.file, children: music.label }, music.file))) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u4E0A\u50B3\u81EA\u8A02\u97F3\u6A02\uFF1A" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "block cursor-pointer", children: [_jsx("input", { type: "file", accept: "audio/mp3,audio/*", onChange: handleCustomMusicUpload, className: "hidden" }), _jsx("div", { className: "w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors duration-200 shadow-md hover:shadow-lg", children: "\u9078\u64C7 MP3 \u6A94\u6848" })] }), customMusic && (_jsx("button", { onClick: clearCustomMusic, className: "w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] mt-3 mb-2", children: "\u6E05\u9664\u81EA\u8A02\u97F3\u6A02" }))] })] }), _jsx("div", { className: "text-center", children: _jsx("button", { onClick: togglePlay, className: "text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg", style: { backgroundColor: '#3b82f6', border: 'none', color: '#ffffff' }, onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#ffffff'; }, onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.color = '#ffffff'; }, children: isPlaying ? '⏸️ 暫停音樂' : '▶️ 播放音樂' }) }), _jsx("audio", { ref: audioRef, loop: true, hidden: true })] }));
}
