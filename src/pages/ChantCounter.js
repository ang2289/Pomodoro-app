import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';
import AnimatedMusicPlayer from '../components/AnimatedMusicPlayer.tsx';
import ChantButton from '../components/ChantButton.tsx';
import FloatingNotes from '../components/FloatingNotes';
import { checkAndResetToday, updateChantCount, loadAllChantCounts, saveAllChantCounts } from '../utils/chantStorage';
import { addChantHistoryRecord } from '../utils/chantHistoryStorage';
import ChantExportButton from '../components/ChantExportButton.tsx';
import WishMenu from '../components/WishMenu';
import { Card } from '../components/ui/card';
// import { Select, SelectContent, SelectTrigger, SelectValue } from '../components/ui/select'; // 移除未使用的導入
import * as SelectPrimitive from "@radix-ui/react-select";
import { Label } from '../components/ui/label';
import IconButton from '../components/ui/IconButton';
import { scriptureOptions } from '../data/scriptureOptions';
// 自定義 SelectItem 組件，不顯示打勾圖示
const CustomSelectItem = React.forwardRef(({ className, children, ...props }, ref) => (_jsx(SelectPrimitive.Item, { ref: ref, className: `relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`, ...props, children: _jsx(SelectPrimitive.ItemText, { children: children }) })));
CustomSelectItem.displayName = SelectPrimitive.Item.displayName;
const ChantCounter = () => {
    const { t } = useTranslation();
    const _navigate = useNavigate();
    void _navigate;
    const [selectedChant, setSelectedChant] = useState(() => {
        const saved = localStorage.getItem('selectedChant');
        return saved || '南無阿彌陀佛';
    });
    const [chantList, setChantList] = useState([]);
    const [chantStats, setChantStats] = useState({});
    const [newChantName, setNewChantName] = useState('');
    const [renameChantName, setRenameChantName] = useState('');
    const [message, setMessage] = useState('');
    // 圖片上傳相關狀態
    const [uploadedImage, setUploadedImage] = useState('/chant/default-buddha.png');
    const [customWoodfishImage, setCustomWoodfishImage] = useState(null);
    // 音效選擇狀態
    const [selected, setSelected] = useState(() => {
        return localStorage.getItem('chant-sound') || 'chant1';
    });
    // 自訂音效檔案
    const [customFile, setCustomFile] = useState(null);
    // 背景音樂播放狀態
    const [isPlaying, setIsPlaying] = useState(false);
    // 音效播放狀態
    const [isSoundPlaying, setIsSoundPlaying] = useState(false);
    // 音效開關狀態
    const [soundEnabled, setSoundEnabled] = useState(true);
    // 播放音效的 audio ref
    const audioRef = useRef(null);
    // 木魚敲擊音效的 audio ref
    const woodfishAudioRef = useRef(null);
    // 檔案上傳 input ref
    const fileInputRef = useRef(null);
    // 初始化選單與狀態（清單改用 scriptureOptions，不再從 localStorage 載入清單）
    useEffect(() => {
        const listFromOptions = scriptureOptions.map(o => o.value);
        setChantList(listFromOptions);
        // 載入自訂音效檔案
        const savedCustomFile = localStorage.getItem('custom-sound-file');
        if (savedCustomFile) {
            // 這裡可以載入之前保存的自訂檔案，但需要重新上傳
            // 為了簡化，我們清除舊的自訂檔案
            localStorage.removeItem('custom-sound-file');
        }
        // 載入所有經文的統計資料
        const allStats = loadAllChantCounts();
        setChantStats(allStats);
        // 若未有選擇值，設定為預設「南無阿彌陀佛」
        if (!selectedChant) {
            setSelectedChant('南無阿彌陀佛');
        }
        // 載入儲存的圖片
        const savedImage = localStorage.getItem('chantCounterImage');
        if (savedImage) {
            setUploadedImage(savedImage);
        }
        else {
            setUploadedImage('/chant/default-buddha.png');
        }
    }, []);
    // 當音效選擇改變時，更新 localStorage 和 audio 播放來源
    useEffect(() => {
        localStorage.setItem('chant-sound', selected);
        // 如果當前正在播放音效，同步更新 audio 播放來源
        if (isSoundPlaying && audioRef.current) {
            // 先停止當前播放
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            // 根據新選擇的音效設定 src
            if (selected === 'custom' && customFile) {
                audioRef.current.src = URL.createObjectURL(customFile);
            }
            else {
                audioRef.current.src = `/sounds/${selected}.mp3`;
            }
            // 重新播放新音效
            audioRef.current.play().catch((err) => {
                console.error('音效播放失敗', err);
                setIsSoundPlaying(false);
            });
        }
        else if (audioRef.current) {
            // 即使沒有播放，也要更新 audio 來源以備下次播放
            if (selected === 'custom' && customFile) {
                audioRef.current.src = URL.createObjectURL(customFile);
            }
            else {
                audioRef.current.src = `/sounds/${selected}.mp3`;
            }
        }
    }, [selected, customFile]);
    // 取得當前選中經文的統計資料
    const currentChantData = chantStats[selectedChant] || { today: 0, total: 0, lastDate: '' };
    // 更新經文計數並儲存
    const updateCurrentChantCount = (newCounts) => {
        const updatedStats = {
            ...chantStats,
            [selectedChant]: newCounts
        };
        setChantStats(updatedStats);
        updateChantCount(selectedChant, newCounts);
    };
    // 新增經文
    const addChant = () => {
        console.log('addChant clicked', { newChantName, chantList });
        const trimmedName = newChantName.trim();
        if (!trimmedName) {
            setMessage('請輸入經文名稱');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        if (chantList.includes(trimmedName)) {
            setMessage('此經文已存在，請選擇其他名稱');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        const newChant = trimmedName;
        const newList = [...chantList, newChant];
        setChantList(newList);
        // 為新經文創建計數資料
        const newChantData = checkAndResetToday(newChant);
        const updatedStats = {
            ...chantStats,
            [newChant]: newChantData
        };
        setChantStats(updatedStats);
        setNewChantName('');
        setMessage('經文新增成功！');
        setTimeout(() => setMessage(''), 3000);
        console.log('Chant added successfully:', newChant);
    };
    // 重新命名經文
    const renameChant = () => {
        console.log('renameChant clicked', { renameChantName, selectedChant, chantList });
        const trimmedName = renameChantName.trim();
        if (!trimmedName) {
            setMessage('請輸入新的經文名稱');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        if (trimmedName === selectedChant) {
            setMessage('新名稱與目前經文相同');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        if (chantList.includes(trimmedName)) {
            setMessage('此經文名稱已存在，請選擇其他名稱');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        const oldName = selectedChant;
        const newName = trimmedName;
        // 更新清單
        const newList = chantList.map(chant => chant === oldName ? newName : chant);
        setChantList(newList);
        // 更新統計資料
        const updatedStats = { ...chantStats };
        if (updatedStats[oldName]) {
            updatedStats[newName] = updatedStats[oldName];
            delete updatedStats[oldName];
            setChantStats(updatedStats);
            saveAllChantCounts(updatedStats);
        }
        // 更新選取的經文
        setSelectedChant(newName);
        setRenameChantName('');
        setMessage('經文重新命名成功！');
        setTimeout(() => setMessage(''), 3000);
        console.log('Chant renamed successfully:', oldName, '->', newName);
    };
    // 刪除經文
    const deleteChant = () => {
        const translatedChant = t(`scriptures.${selectedChant}`, selectedChant);
        if (window.confirm(`確定要刪除「${translatedChant}」嗎？`)) {
            const newList = chantList.filter(chant => chant !== selectedChant);
            setChantList(newList);
            // 刪除統計資料
            const updatedStats = { ...chantStats };
            delete updatedStats[selectedChant];
            setChantStats(updatedStats);
            saveAllChantCounts(updatedStats);
            // 選擇第一個經文
            if (newList.length > 0) {
                setSelectedChant(newList[0]);
            }
        }
    };
    // 增加計數
    const increment = () => {
        console.log('increment clicked', currentChantData);
        const newData = {
            today: currentChantData.today + 1,
            total: currentChantData.total + 1,
            lastDate: currentChantData.lastDate
        };
        updateCurrentChantCount(newData);
        // 記錄到歷史資料
        addChantHistoryRecord(selectedChant, 1);
    };
    // 減少計數
    const decrement = () => {
        if (currentChantData.today > 0) {
            const newData = {
                today: currentChantData.today - 1,
                total: currentChantData.total - 1,
                lastDate: currentChantData.lastDate
            };
            updateCurrentChantCount(newData);
            // 記錄到歷史資料（減少1次）
            addChantHistoryRecord(selectedChant, -1);
        }
    };
    // 清除今日
    const clearToday = () => {
        if (window.confirm('確定要清除今日次數嗎？')) {
            const newData = {
                today: 0,
                total: currentChantData.total,
                lastDate: currentChantData.lastDate
            };
            updateCurrentChantCount(newData);
            // 清除操作不記錄到歷史資料，只更新顯示數據
        }
    };
    // 清除總計
    const clearTotal = () => {
        if (window.confirm('確定要清除所有計數嗎？這將同時清除今日和總計次數。')) {
            const newData = {
                today: 0,
                total: 0,
                lastDate: currentChantData.lastDate
            };
            updateCurrentChantCount(newData);
            // 清除操作不記錄到歷史資料，只更新顯示數據
        }
    };
    // 處理圖片上傳
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                setUploadedImage(result);
                localStorage.setItem('chantCounterImage', result);
            };
            reader.readAsDataURL(file);
        }
    };
    // 清除圖片
    const clearImage = () => {
        setUploadedImage('/chant/default-buddha.png');
        localStorage.removeItem('chantCounterImage');
    };
    // 重置木魚圖片為預設
    const handleResetWoodfish = () => {
        setCustomWoodfishImage(null);
    };
    // 處理木魚圖片上傳
    const handleWoodfishUpload = (image) => {
        setCustomWoodfishImage(image);
    };
    // 音效選擇改變時
    const handleSoundChange = (e) => {
        const value = e.target.value;
        setSelected(value);
    };
    // 處理自訂音效檔案上傳
    const handleCustomFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        
        // 檢查檔案大小（限制為5MB）
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('檔案太大！請選擇小於5MB的MP3檔案。');
            e.target.value = '';
            return;
        }
        
        try {
            setCustomFile(file);
            setSelected('custom');
        } catch (error) {
            console.error('處理自訂音效檔案失敗:', error);
            alert('檔案處理失敗，請重試。');
        }
        // 重置input值，以便能夠重新選擇相同檔案
        e.target.value = '';
    };
    // 清除自訂音效
    const clearCustomSound = () => {
        setCustomFile(null);
        localStorage.removeItem('custom-sound-file');
        localStorage.removeItem('chant-sound');
        setSelected('chant1');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    // 觸發檔案選擇對話框
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };
    // 木魚敲擊音效（播放一次）
    const playWoodfishSound = () => {
        // 檢查音效開關狀態
        if (!soundEnabled)
            return;
        // 使用 new Audio 播放一次，與下拉選單選擇的音效一致
        let audioSrc = '';
        if (selected === 'custom' && customFile) {
            // 自訂音效使用 blob URL
            audioSrc = URL.createObjectURL(customFile);
        }
        else {
            // 預設音效從 /sounds/ 載入
            audioSrc = `/sounds/${selected}.mp3`;
        }
        // 創建新的 Audio 對象播放一次
        const woodfishAudio = new Audio(audioSrc);
        woodfishAudio.currentTime = 0;
        woodfishAudio.play().catch((err) => {
            console.error('木魚音效播放失敗', err);
        });
    };
    // 播放/停止音效切換
    const toggleSound = () => {
        if (!audioRef.current)
            return;
        if (isSoundPlaying) {
            // 手動停止音效
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSoundPlaying(false);
        }
        else {
            // 播放音效前先重置播放位置
            audioRef.current.currentTime = 0;
            // 根據選擇的音效設定 src
            if (selected === 'custom' && customFile) {
                // 自訂音效使用 blob URL
                audioRef.current.src = URL.createObjectURL(customFile);
            }
            else {
                // 預設音效從 /sounds/ 載入
                audioRef.current.src = `/sounds/${selected}.mp3`;
            }
            // 播放音效並立即切換狀態
            setIsSoundPlaying(true);
            audioRef.current.play().catch((err) => {
                console.error('音效播放失敗', err);
                setIsSoundPlaying(false);
            });
        }
    };
    return (_jsxs("div", { className: "responsive-container gradient-bg min-h-screen", children: [isPlaying && _jsx(FloatingNotes, { isPlaying: isPlaying }), _jsx("audio", { ref: audioRef, preload: "auto", className: "hidden" }), _jsx("audio", { ref: woodfishAudioRef, preload: "auto", className: "hidden" }), _jsxs("div", { className: "space-y-4 sm:space-y-4 md:space-y-6", children: [_jsx(HeaderBar, { icon: "\uD83D\uDE4F", title: "chant_count" }), _jsxs(Card, { className: "card rounded-2xl shadow-md p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "\uD83D\uDDBC\uFE0F " + t('image_upload') }), _jsx("div", { className: "flex justify-center", children: _jsxs("label", { className: "inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleImageUpload, className: "hidden" }), t('select_image')] }) }), _jsxs("div", { className: "flex flex-col items-center space-y-3", children: [_jsx("img", { src: uploadedImage ?? undefined, alt: "\u4F5B\u50CF\u5716\u7247", className: "w-48 rounded-lg shadow-md" }), _jsx("button", { onClick: clearImage, className: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200", children: t('restore_default_image') })] })] }), _jsx("div", { className: "relative", children: _jsx(AnimatedMusicPlayer, { onPlayStateChange: setIsPlaying }) }), _jsxs(Card, { className: "card rounded-2xl shadow-md p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "\uD83D\uDE4F " + t('select_scripture') }), _jsx("div", { className: "relative", children: _jsx("select", { value: selectedChant, onChange: (e) => {
                                        const val = e.target.value;
                                        setSelectedChant(val);
                                        localStorage.setItem('selectedChant', val);
                                    }, className: "w-full px-3 py-2 text-base rounded border border-gray-300 leading-normal", children: chantList.map((chant) => (_jsx("option", { value: chant, children: t(`scriptures.${chant}`, chant) }, chant))) }) })] }), _jsxs("div", { className: "bg-white shadow rounded-lg p-4 text-center space-y-3", children: [_jsx("h2", { className: "text-xl font-bold mb-2", children: "\uD83D\uDCCA " + t('statistics') }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-blue-600 font-bold text-lg", children: "\uD83D\uDCC5 " + t('today_date') + "\uFF1A" + new Date().toLocaleDateString('zh-TW') }), _jsx("div", { className: "text-3xl font-extrabold text-blue-700", children: currentChantData.today })] }), _jsxs("div", { children: [_jsx("div", { className: "text-purple-600 font-bold text-lg", children: "\uD83D\uDCC8 " + t('total_count') }), _jsx("div", { className: "text-3xl font-extrabold text-purple-700", children: currentChantData.total })] })] }), _jsx(ChantButton, { onSoundPlay: playWoodfishSound, onCount: increment, customWoodfishImage: customWoodfishImage, onWoodfishUpload: handleWoodfishUpload, onReset: handleResetWoodfish })] }), _jsx("div", { className: "bg-white shadow rounded-lg p-4", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("h3", { className: "text-lg font-bold", children: "\uD83C\uDFB5 " + t('sound_effect') }), _jsxs("div", { className: "flex items-center gap-3 justify-center", children: [_jsx("input", { type: "checkbox", id: "soundEnabled", checked: soundEnabled, onChange: (e) => setSoundEnabled(e.target.checked), className: "w-4 h-4" }), _jsx("span", { className: "text-lg", children: soundEnabled ? '🔊' : '🔇' }), _jsx("span", { className: "text-sm whitespace-nowrap", children: soundEnabled ? t('sound_on') : t('sound_off') })] }), _jsxs("select", { value: selected, onChange: handleSoundChange, className: "w-full rounded border px-3 py-2 text-center text-base", disabled: !soundEnabled, children: [_jsx("option", { value: "chant1", children: t('sound_effect_1') }), _jsx("option", { value: "chant2", children: t('sound_effect_2') }), _jsx("option", { value: "chant3", children: t('sound_effect_3') }), _jsx("option", { value: "custom", children: t('custom_sound') })] }), selected === 'custom' && (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm text-gray-600", children: t('upload_mp3_sound_file') }), _jsx("input", { ref: fileInputRef, type: "file", accept: "audio/mp3,audio/mpeg,audio/*", onChange: handleCustomFileUpload, style: { display: 'none' } }), _jsx("button", { onClick: triggerFileUpload, className: "w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200", children: "\uD83D\uDCC1 " + t('select_mp3_sound') }), customFile && (_jsxs("p", { className: "text-sm text-green-600", children: [t('selected'), customFile.name] }))] })), _jsx("button", { onClick: toggleSound, disabled: !soundEnabled, className: `w-full text-white px-4 py-2 rounded transition-colors duration-200 ${!soundEnabled
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600'}`, style: { backgroundColor: !soundEnabled ? '#9ca3af' : '#3b82f6', color: '#ffffff' }, children: !soundEnabled ? '🔇 ' + t('sound_disabled') : '▶️ ' + t('play_sound') })] }) }), _jsxs("div", { className: "bg-white shadow rounded-lg p-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center flex-wrap", children: [_jsx(IconButton, { onClick: decrement, label: "-1", className: "w-full sm:w-auto bg-blue-700 text-white" }), _jsx("button", { onClick: clearToday, disabled: currentChantData.today === 0, className: "w-full sm:w-auto", style: {
                                            backgroundColor: currentChantData.today === 0 ? '#95a5a6' : '#ff6b6b',
                                            color: 'white',
                                            padding: '12px 24px',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: currentChantData.today === 0 ? 'not-allowed' : 'pointer',
                                            opacity: currentChantData.today === 0 ? 0.6 : 1,
                                            transition: 'all 0.2s ease'
                                        }, onMouseEnter: (e) => {
                                            if (currentChantData.today > 0) {
                                                e.currentTarget.style.backgroundColor = '#e55a5a';
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                                            }
                                        }, onMouseLeave: (e) => {
                                            if (currentChantData.today > 0) {
                                                e.currentTarget.style.backgroundColor = '#ff6b6b';
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }, children: "\uD83D\uDDD1\uFE0F " + t('clear_today') }), _jsx(IconButton, { onClick: clearTotal, disabled: currentChantData.total === 0, variant: "danger", label: "\u274C " + t('clear_total'), className: "w-full sm:w-auto" })] }), _jsx("div", { className: "mt-4", children: _jsx(ChantExportButton, { chant: selectedChant, today: currentChantData.today, total: currentChantData.total }) })] }), _jsxs(Card, { className: "card rounded-2xl shadow-md p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8", children: [_jsx("h2", { className: "text-xl sm:text-2xl font-bold text-center", children: "\uD83D\uDEE0\uFE0F " + t('scripture_management') }), message && (_jsx("div", { className: `text-center p-3 rounded-lg font-semibold ${message.includes('成功')
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'}`, children: message })), _jsxs("div", { className: "space-y-6", children: [_jsx(Label, { htmlFor: "newChant", className: "font-bold", style: { fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem' }, children: "\u2795 " + t('add_scripture') }), _jsx("textarea", { id: "newChant", placeholder: t('enter_scripture_name'), className: "w-full p-3 sm:p-4 rounded-md border border-gray-300 resize-none", style: {
                                            fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
                                            minHeight: '48px',
                                            maxHeight: '120px',
                                            width: '100%',
                                            maxWidth: '100%',
                                            lineHeight: '1.5'
                                        }, value: newChantName, onChange: (e) => setNewChantName(e.target.value), rows: 1, onInput: (e) => {
                                            const target = e.target;
                                            target.style.height = 'auto';
                                            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                                        } }), _jsx("button", { onClick: addChant, className: "w-full", style: {
                                            backgroundColor: '#3498db',
                                            color: 'white',
                                            padding: '16px 24px',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                            zIndex: 10,
                                            position: 'relative'
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = '#2980b9';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25)';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = '#3498db';
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                        }, children: t('add') })] }), _jsxs("div", { className: "space-y-8", children: [_jsx(Label, { htmlFor: "renameChant", className: "font-bold", style: { fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem' }, children: "\u270F\uFE0F " + t('edit_scripture') }), _jsx("textarea", { id: "renameChant", placeholder: t('enter_new_name'), className: "w-full p-3 sm:p-4 rounded-md border border-gray-300 resize-none", style: {
                                            fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
                                            minHeight: '48px',
                                            maxHeight: '120px',
                                            width: '100%',
                                            maxWidth: '100%',
                                            lineHeight: '1.5'
                                        }, value: renameChantName, onChange: (e) => setRenameChantName(e.target.value), rows: 1, onInput: (e) => {
                                            const target = e.target;
                                            target.style.height = 'auto';
                                            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                                        } }), _jsx("button", { onClick: renameChant, className: "w-full", style: {
                                            backgroundColor: '#f39c12',
                                            color: 'white',
                                            padding: '16px 24px',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                            zIndex: 10,
                                            position: 'relative'
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = '#e67e22';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25)';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = '#f39c12';
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                        }, children: t('rename') })] }), _jsxs("div", { className: "space-y-6", children: [_jsx(Label, { className: "font-bold", style: { fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem' }, children: "\u274C " + t('delete_current_scripture') }), _jsxs("button", { onClick: deleteChant, className: "w-full", style: {
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            padding: '16px 24px',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = '#c0392b';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25)';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = '#e74c3c';
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                        }, children: [t('delete'), "\u300C", t(`scriptures.${selectedChant}`, selectedChant), "\u300D"] })] })] }), _jsx(WishMenu, {})] })] }));
};
export default ChantCounter;
