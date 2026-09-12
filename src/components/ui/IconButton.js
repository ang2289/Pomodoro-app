import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
const IconButton = ({ icon, label, onClick, onTouchEnd, className = '', variant = 'primary', disabled = false, fullWidth = false }) => {
    const baseStyle = 'flex items-center justify-center gap-1 font-bold rounded-xl px-4 py-2 shadow transition active:scale-95 text-base';
    const variants = {
        primary: '!bg-blue-700 !text-white hover:!bg-blue-800',
        secondary: '!bg-gray-200 !text-gray-800 hover:!bg-gray-300',
        danger: '!bg-red-600 !text-white hover:!bg-red-700'
    };
    const combined = clsx('icon-button', baseStyle, variants[variant], className, disabled && 'opacity-50 pointer-events-none cursor-not-allowed', fullWidth && 'w-full');
    return (_jsxs("button", { onClick: onClick, onTouchEnd: onTouchEnd, className: combined, disabled: disabled, style: { backgroundColor: variant === 'primary' ? '#1d4ed8' : variant === 'danger' ? '#dc2626' : '#e5e7eb', color: variant === 'primary' || variant === 'danger' ? 'white' : '#1f2937' }, children: [icon && _jsx("span", { style: { color: 'white !important', textShadow: 'none' }, children: icon }), _jsx("span", { style: { color: 'inherit' }, children: label })] }));
};
export default IconButton;
