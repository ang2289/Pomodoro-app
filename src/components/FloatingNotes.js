import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
export default function FloatingNotes({ isPlaying }) {
    const [notes, setNotes] = useState([]);
    useEffect(() => {
        if (!isPlaying)
            return;
        const interval = setInterval(() => {
            const id = Date.now();
            const left = Math.random() * 80 + 10 + '%';
            setNotes((prev) => [...prev, { id, left }]);
            setTimeout(() => {
                setNotes((prev) => prev.filter((n) => n.id !== id));
            }, 3000);
        }, 800);
        return () => clearInterval(interval);
    }, [isPlaying]);
    return (_jsx("div", { className: "pointer-events-none fixed top-0 left-0 w-full h-full z-50", children: _jsx(AnimatePresence, { children: notes.map((note) => (_jsx(motion.div, { initial: { opacity: 0, y: 0 }, animate: { opacity: 1, y: -150 }, exit: { opacity: 0 }, transition: { duration: 2 }, className: "absolute text-3xl", style: { left: note.left, top: '60px' }, children: "\uD83C\uDFB5\uD83C\uDFB6" }, note.id))) }) }));
}
