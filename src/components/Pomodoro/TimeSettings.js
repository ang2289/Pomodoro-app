import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// removed unused react-icons imports
import IconButton from '../ui/IconButton';
const TimeSettings = ({ workMinutes, breakMinutes, onWorkMinutesChange, onBreakMinutesChange, onStart, onPause, onSkip, isRunning }) => {
    return (_jsxs("div", { className: "card", style: {
            marginBottom: '30px',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            padding: '20px'
        }, children: [_jsx("h3", { style: {
                    margin: '0 0 20px 0',
                    color: '#333',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    textAlign: 'center'
                }, children: "\u23F0 \u6642\u9593\u8A2D\u5B9A" }), _jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '30px'
                }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '200px' }, children: [_jsx("label", { style: {
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#666',
                                    marginBottom: '8px',
                                    textAlign: 'center'
                                }, children: "\u5DE5\u4F5C\u6642\u9593" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }, children: [_jsx(IconButton, { onClick: () => onWorkMinutesChange(Math.max(1, workMinutes - 1)), disabled: isRunning, variant: isRunning ? 'secondary' : 'primary', icon: _jsx("span", { style: { color: 'white !important', filter: 'brightness(0) invert(1)' }, children: "\u2796" }), label: "\u6E1B", className: "bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded hover:bg-blue-700 transition" }), _jsx("input", { type: "number", min: 1, step: 1, value: workMinutes, disabled: isRunning, onChange: (e) => {
                                            const v = parseInt(e.target.value || '0', 10);
                                            onWorkMinutesChange(Number.isFinite(v) ? Math.max(1, v) : 1);
                                        }, style: {
                                            width: '70px',
                                            textAlign: 'center',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#333',
                                            padding: '6px 8px',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '6px'
                                        } }), _jsx(IconButton, { onClick: () => onWorkMinutesChange(Math.min(60, workMinutes + 1)), disabled: isRunning, variant: isRunning ? 'secondary' : 'primary', icon: _jsx("span", { style: { color: 'white !important', filter: 'brightness(0) invert(1)' }, children: "\u2795" }), label: "\u52A0", className: "bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded hover:bg-blue-700 transition" })] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '200px' }, children: [_jsx("label", { style: {
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#666',
                                    marginBottom: '8px',
                                    textAlign: 'center'
                                }, children: "\u4F11\u606F\u6642\u9593" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }, children: [_jsx(IconButton, { onClick: () => onBreakMinutesChange(Math.max(0, breakMinutes - 1)), disabled: isRunning, variant: isRunning ? 'secondary' : 'primary', icon: _jsx("span", { style: { color: 'white !important', filter: 'brightness(0) invert(1)' }, children: "\u2796" }), label: "\u6E1B", className: "bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded hover:bg-blue-700 transition" }), _jsx("input", { type: "number", min: 0, step: 1, value: breakMinutes, disabled: isRunning, onChange: (e) => {
                                            const v = parseInt(e.target.value || '0', 10);
                                            onBreakMinutesChange(Number.isFinite(v) ? Math.max(0, v) : 0);
                                        }, style: {
                                            width: '70px',
                                            textAlign: 'center',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#333',
                                            padding: '6px 8px',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '6px'
                                        } }), _jsx(IconButton, { onClick: () => onBreakMinutesChange(Math.min(30, breakMinutes + 1)), disabled: isRunning, variant: isRunning ? 'secondary' : 'primary', icon: _jsx("span", { style: { color: 'white !important', filter: 'brightness(0) invert(1)' }, children: "\u2795" }), label: "\u52A0", className: "bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded hover:bg-blue-700 transition" })] })] })] }), _jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                    marginTop: '25px',
                    flexWrap: 'wrap'
                }, children: [_jsx(IconButton, { onClick: isRunning ? onPause : onStart, variant: isRunning ? 'danger' : 'primary', icon: isRunning ? _jsx("span", { style: { color: 'white', filter: 'none' }, children: "\u23F8\uFE0F" }) : _jsx("span", { style: { color: 'white', filter: 'none' }, children: "\u25B6\uFE0F" }), label: isRunning ? '暫停' : '開始', className: "flex-1 hover:scale-105" }), _jsx(IconButton, { onClick: onSkip, variant: "danger", icon: _jsx("span", { style: { color: 'white', filter: 'none' }, children: "\u23F9" }), label: "\u63D0\u65E9\u7D50\u675F", className: "flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 transition-colors duration-200 hover:scale-105" })] })] }));
};
export default TimeSettings;
