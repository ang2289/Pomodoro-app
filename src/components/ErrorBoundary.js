import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, errorMessage: error instanceof Error ? error.message : String(error) };
    }
    componentDidCatch(error, info) {
        // 可以在此上報錯誤
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary 捕捉到錯誤:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "flex flex-col min-h-screen bg-white px-4 pt-4 text-black", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-red-600 mb-4", children: "\u274C \u9801\u9762\u8F09\u5165\u932F\u8AA4" }), _jsx("p", { className: "text-gray-600 mb-2", children: this.state.errorMessage }), _jsx("button", { onClick: () => window.location.reload(), className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600", children: "\u91CD\u65B0\u6574\u7406\u9801\u9762" })] }) }));
        }
        return this.props.children;
    }
}
