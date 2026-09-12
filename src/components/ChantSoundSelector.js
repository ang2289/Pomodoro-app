import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
const chantSounds = [
    { label: '音效 1', value: 'chant1.mp3' },
    { label: '音效 2', value: 'chant2.mp3' },
    { label: '音效 3', value: 'chant3.mp3' },
];
export default function ChantSoundSelector() {
    const [selectedSound, setSelectedSound] = useState(() => {
        return localStorage.getItem('chant-sound') || 'chant1.mp3';
    });
    const [isPlaying, setIsPlaying] = useState(() => {
        return localStorage.getItem('chantPlayStatus') === 'true';
    });
    const audioRef = useRef(null);
    useEffect(() => {
        const audio = new Audio(`/sounds/chant/${selectedSound}`);
        audio.loop = true;
        audioRef.current = audio;
        if (isPlaying) {
            audio.play().catch(console.error);
        }
        const handleKeydown = (e) => {
            if (e.code === 'Space') {
                togglePlay();
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
            audio.pause();
        };
    }, [selectedSound, isPlaying]);
    // 處理音效選擇變化
    useEffect(() => {
        localStorage.setItem('chant-sound', selectedSound);
    }, [selectedSound]);
    const togglePlay = () => {
        if (!audioRef.current)
            return;
        if (isPlaying) {
            audioRef.current.pause();
        }
        else {
            audioRef.current.play().catch(console.error);
        }
        const newPlayingState = !isPlaying;
        setIsPlaying(newPlayingState);
        localStorage.setItem('chantPlayStatus', String(newPlayingState));
    };
    return (_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-xl font-bold text-center", children: "\uD83C\uDFB5 \u80CC\u666F\u97F3\u6548" }), _jsx("select", { className: "w-full px-3 py-2 text-base rounded border border-gray-300 leading-normal", value: selectedSound, onChange: (e) => setSelectedSound(e.target.value), children: chantSounds.map((sound) => (_jsx("option", { value: sound.value, children: sound.label }, sound.value))) }), _jsx("button", { onClick: togglePlay, className: "w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-2 px-4 rounded", children: isPlaying ? '⏸️ 暫停音效' : '▶️ 播放音效' })] }));
}
