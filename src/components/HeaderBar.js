import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
const HeaderBar = ({ icon, title, className = '', showHomeButton = false }) => {
    return (_jsxs("div", { className: `flex items-center gap-2 mb-6 ${className}`, children: [showHomeButton && _jsx(Link, { to: "/", className: "flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200", title: "回首頁", children: _jsx("span", { className: "text-lg", children: "🏠" }) }), _jsx("span", { className: "text-2xl", children: icon }), _jsx("h1", { className: "text-2xl font-bold text-gray-800 dark:text-gray-100", children: title })] }));
};
export default HeaderBar;
