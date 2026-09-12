import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
const musicOptions = [
    { label: '南無阿彌陀佛 1', file: '/music/namo1.mp3' },
    { label: '南無阿彌陀佛 2', file: '/music/namo2.mp3' },
    { label: '南無阿彌陀佛 3', file: '/music/namo3.mp3' }
];
export default function MusicPlayer() {
    const audioRef = useRef(null);
    const [selected, setSelected] = useState(() => {
        return localStorage.getItem('selectedMusic') || musicOptions[0].file;
    });
    const [isPlaying, setIsPlaying] = useState(true);
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = selected;
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
            if (isPlaying) {
                audioRef.current.play();
            }
            localStorage.setItem('selectedMusic', selected);
        }
    }, [selected]);
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            }
            else {
                audioRef.current.play();
            }
        }
        setIsPlaying(!isPlaying);
    };
    return (_jsxs("div", { className: "p-4 border-t mt-4 text-center", children: [_jsx("h3", { className: "text-lg font-bold mb-2", children: "\uD83C\uDFB5 \u80CC\u666F\u97F3\u6A02" }), _jsx("select", { className: "border rounded px-2 py-1", value: selected, onChange: (e) => setSelected(e.target.value), children: musicOptions.map((m) => (_jsx("option", { value: m.file, children: m.label }, m.file))) }), _jsx("div", { className: "mt-2", children: _jsx("button", { onClick: togglePlay, className: "bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600", children: isPlaying ? '⏸ 暫停音樂' : '▶️ 播放音樂' }) }), _jsx("audio", { ref: audioRef, autoPlay: true, loop: true, hidden: true })] }));
}
