import { jsx as _jsx } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
export default function MainLayout() {
    return (_jsx("div", { className: "flex flex-col h-screen bg-white dark:bg-gray-900 text-black dark:text-white", children: _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsx(Outlet, {}) }) }));
}
