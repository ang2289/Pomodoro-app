import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const CircularTimer = ({ timeLeft, totalSeconds, timerColor, isRunning, isBreak: _isBreak, className }) => {
    const getProgressPercentage = () => {
        return ((totalSeconds - timeLeft) / totalSeconds) * 100;
    };
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    const progress = getProgressPercentage();
    const radius = 95;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    return (_jsxs("div", { className: className, style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            width: '240px',
            height: '240px',
            margin: '0 auto'
        }, children: [_jsxs("svg", { width: "240", height: "240", style: {
                    transform: 'rotate(-90deg)',
                    width: '240px',
                    height: '240px'
                }, children: [_jsx("circle", { stroke: "#e5e7eb", fill: "transparent", strokeWidth: "10", r: radius, cx: "120", cy: "120", style: {
                            opacity: 0.3
                        } }), _jsx("circle", { stroke: isRunning ? timerColor : '#e5e7eb', fill: "transparent", strokeWidth: "10", r: radius, cx: "120", cy: "120", strokeDasharray: strokeDasharray, strokeDashoffset: strokeDashoffset, strokeLinecap: "round", style: {
                            transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out',
                            opacity: isRunning ? 0.8 : 0.3
                        } })] }), _jsx("div", { className: "font-sans text-4xl font-bold text-blue-600 dark:text-gray-100", style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    lineHeight: 1
                }, children: formatTime(timeLeft) })] }));
};
export default CircularTimer;
