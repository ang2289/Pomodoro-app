import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './native-inputs.css';
// 在應用掛載前，根據 localStorage 中的 theme 同步 html 的 dark 類
const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('theme')) || 'light';
if (typeof document !== 'undefined') {
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
    else {
        document.documentElement.classList.remove('dark');
    }
}
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }, children: _jsx(App, {}) }) }));
