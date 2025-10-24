import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SupportButton from './SupportButton';
export default function SupportSection({ supportCount, supported, onSupport, commentCount }) {
    console.log('SupportSection rendered with count:', supportCount, 'comments:', commentCount);
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-4 mb-6", children: [_jsxs("div", { className: "flex flex-col gap-3 mb-3", children: [_jsx("div", { className: "w-full", children: _jsx(SupportButton, { initialCount: supportCount, disabled: supported, onSupport: onSupport }) }), _jsx("div", { className: "w-full", children: _jsxs("span", { className: "inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm font-medium", children: ["\uD83D\uDCAC \u7559\u8A00 ", commentCount, " \u5247"] }) })] }), _jsx("p", { className: "text-xs text-gray-500 text-center", children: "\u6BCF\u4EBA\u5C0D\u6BCF\u500B\u6D3B\u52D5\u50C5\u80FD\u6309\u4E00\u6B21\u652F\u6301" })] }));
}
