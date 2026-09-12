import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
const IconButton = ({ icon, label, onClick, className, to }) => {
    console.log('🟢 IconButton 載入中！');
    console.log('🔵 props:', { label, to, onClick });
    const commonClasses = `flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-150 ${className}`;
    const content = (_jsxs(_Fragment, { children: [icon && (_jsx("span", { className: "w-5 h-5 flex items-center justify-center", children: icon })), _jsx("span", { className: "!text-white font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]", children: label })] }));
    return to ? (_jsx(Link, { to: to, className: commonClasses, children: content })) : (_jsx("button", { onClick: onClick, className: commonClasses, children: content }));
};
export default IconButton;
