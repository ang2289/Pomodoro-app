import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
export default function AnimatedMusicPlayer({ onPlayStateChange } = {}) {
    const { t } = useTranslation();
    const audioRef = useRef(null);
    // 根據語言動態生成音樂選項
    const getDefaultMusicOptions = () => [
        { label: t('chant_config.music.namo_1'), file: '/music/namo1.mp3' },
        { label: t('chant_config.music.namo_2'), file: '/music/namo2.mp3' },
        { label: t('chant_config.music.namo_3'), file: '/music/namo3.mp3' }
    ];
    const [isPlaying, setIsPlaying] = useState(() => {
        // 從 localStorage 讀取播放狀態，預設為暫停
        const savedPlayState = localStorage.getItem('animatedMusicPlayState');
        return savedPlayState === 'true';
    });
    const [selected, setSelected] = useState(() => {
        // 從 localStorage 讀取音樂選擇，預設為第一個選項
        const defaultOptions = getDefaultMusicOptions();
        return localStorage.getItem('selectedAnimatedMusic') || defaultOptions[0].file;
    });
    const [customMusic, setCustomMusic] = useState(null);
    const [musicOptions, setMusicOptions] = useState(getDefaultMusicOptions());
    // 載入儲存的自訂音樂（只在初始化時）
    useEffect(() => {
        const savedCustomMusic = localStorage.getItem('customAnimatedMusic');
        if (savedCustomMusic) {
            setCustomMusic(savedCustomMusic);
        }
    }, []);
    
    // 更新音樂選項（當語言變更時）
    useEffect(() => {
        if (customMusic) {
            const customOption = {
                label: t('chant_config.music.custom_music') + ': ' + (localStorage.getItem('customMusicName') || ''),
                file: customMusic
            };
            setMusicOptions([customOption, ...getDefaultMusicOptions()]);
        } else {
            setMusicOptions(getDefaultMusicOptions());
        }
    }, [t, i18n.language, customMusic]);
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
                alert(t('chant_config.alert.file_too_large'));
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
                        label: t('chant_config.music.custom_music') + ': ' + file.name,
                        file: result
                    };
                    localStorage.setItem('customMusicName', file.name);
                    setMusicOptions([customOption, ...getDefaultMusicOptions()]);
                    setSelected(result);
                } catch (error) {
                    console.error(t('chant_config.error.process_custom_music_failed'), error);
                    alert(t('chant_config.alert.file_process_failed'));
                    setCustomMusic(null);
                    localStorage.removeItem('customAnimatedMusic');
                }
            };
            reader.onerror = () => {
                console.error(t('chant_config.error.read_file_failed'));
                alert(t('chant_config.alert.file_read_failed'));
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
        localStorage.removeItem('customMusicName');
        const defaultOptions = getDefaultMusicOptions();
        setMusicOptions(defaultOptions);
        setSelected(defaultOptions[0].file);
    };
    return (_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500", children: [_jsx("h3", { className: "text-xl font-bold mb-2 text-center text-gray-800", children: "\uD83C\uDFB5 " + t('background_music_animated') }), _jsx("p", { className: "text-sm text-gray-500 text-center mb-4", children: t('chant_config.music.spacebar_hint') }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('select_music') }), _jsx("select", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", value: selected, onChange: (e) => setSelected(e.target.value), children: musicOptions.map((music) => (_jsx("option", { value: music.file, children: music.label }, music.file))) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('upload_custom_music') }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "block cursor-pointer", children: [_jsx("input", { type: "file", accept: "audio/mp3,audio/*", onChange: handleCustomMusicUpload, className: "hidden" }), _jsx("div", { className: "w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors duration-200 shadow-md hover:shadow-lg", children: t('select_mp3_file') })] }), customMusic && (_jsx("button", { onClick: clearCustomMusic, className: "w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] mt-3 mb-2", children: t('clear_custom_music') }))] })] }), _jsx("div", { className: "text-center", children: _jsx("button", { onClick: togglePlay, className: "text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg", style: { backgroundColor: '#3b82f6', border: 'none', color: '#ffffff' }, onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#ffffff'; }, onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.color = '#ffffff'; }, children: isPlaying ? "\u23F8\uFE0F " + t('pause_music') : "\u25B6\uFE0F " + t('play_music') }) }), _jsx("audio", { ref: audioRef, loop: true, hidden: true })] }));
}
