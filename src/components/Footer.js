import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
const navigationItems = [
    { path: '/chant', icon: '/src/assets/icon_flower.png', label: '唸經' },
    { path: '/todo', icon: '/src/assets/icon_todo.png', label: '待辦' },
    { path: '/pomodoro', icon: '/src/assets/icon_tomato.png', label: '專注' },
    { path: '/wish', icon: '/src/assets/icon_wish.png', label: '許願' },
    { path: '/settings', icon: '/src/assets/icon_settings.png', label: '設定' }
];
export default function Footer() {
    const location = useLocation();
    const currentPath = location.pathname;
    return (_jsx("footer", { className: "fixed bottom-0 w-full bg-white border-t border-gray-200 shadow z-50", children: _jsx("div", { className: "flex justify-around items-center py-3 px-2", children: navigationItems.map((item) => {
                const isActive = currentPath === item.path ||
                    (item.path === '/chant' && currentPath === '/');
                return (_jsxs(Link, { to: item.path, className: `flex flex-col items-center justify-center transition-all duration-150 ${isActive
                        ? 'scale-110 text-pink-500'
                        : 'hover:scale-105 text-gray-600 hover:text-pink-400'}`, children: [_jsx("img", { src: item.icon, alt: item.label, className: "w-6 h-6 object-contain mb-1" }), _jsx("span", { className: "text-xs font-medium", children: item.label })] }, item.path));
            }) }) }));
}
