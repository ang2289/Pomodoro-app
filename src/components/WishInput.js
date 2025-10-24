import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
export default function WishInput({ onSuccess }) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async () => {
        if (content.trim().length === 0) {
            alert('請輸入願望內容');
            return;
        }
        if (content.length > 200) {
            alert('願望內容不能超過 200 字');
            return;
        }
        setIsSubmitting(true);
        try {
            const { /* data, */ error } = await supabase
                .from('wishes')
                .insert({
                user_name: '我',
                content: content.trim(),
                is_public: true
            });
            if (error) {
                console.error('許願失敗:', error);
                alert('許願失敗：' + error.message);
                return;
            }
            // 成功後清空輸入框
            setContent('');
            // 觸發成功回調
            if (onSuccess) {
                onSuccess();
            }
            alert('許願成功！✨');
        }
        catch (err) {
            console.error('許願失敗:', err);
            alert('許願失敗，請重試');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 mb-4", children: "\uD83D\uDCAC \u8A31\u4E0B\u4F60\u7684\u9858\u671B" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("textarea", { className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none", rows: 4, maxLength: 200, value: content, onChange: (e) => setContent(e.target.value), placeholder: "\u5728\u9019\u88E1\u5BEB\u4E0B\u4F60\u7684\u9858\u671B...", disabled: isSubmitting }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsxs("span", { className: "text-sm text-gray-500", children: [content.length, "/200 \u5B57"] }), content.length > 180 && (_jsx("span", { className: "text-sm text-orange-500", children: "\u5373\u5C07\u9054\u5230\u5B57\u6578\u9650\u5236" }))] })] }), _jsx("button", { onClick: handleSubmit, disabled: isSubmitting || content.trim().length === 0, className: "w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed", children: isSubmitting ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "\u8A31\u9858\u4E2D..."] })) : ('許願 ✨') })] })] }));
}
