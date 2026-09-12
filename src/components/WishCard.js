import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function WishCard({ wish }) {
    return (_jsxs("div", { className: "bg-white p-4 rounded-lg shadow mb-4 border", children: [_jsx("div", { className: "text-gray-700 text-sm", children: wish.user_name || '匿名' }), _jsx("div", { className: "font-bold text-lg mt-1", children: wish.content }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: new Date(wish.created_at).toLocaleString() })] }));
}
