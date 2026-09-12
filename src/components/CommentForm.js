import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
export default function CommentForm({ wishId, onCommented }) {
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        if (!comment.trim() || !wishId || loading)
            return;
        setLoading(true);
        try {
            await supabase.from('chant_comments').insert({
                wish_id: wishId,
                comment: comment.trim(),
                user_name: name.trim() || '匿名'
            });
            setComment('');
            setName('');
            onCommented?.();
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-2 mt-4", children: [_jsx("input", { className: "w-full border p-2 rounded text-sm sm:text-base", placeholder: "\u4F60\u7684\u540D\u5B57\uFF08\u53EF\u7A7A\u767D\uFF09", value: name, onChange: e => setName(e.target.value) }), _jsx("textarea", { className: "w-full border p-2 rounded text-sm sm:text-base", placeholder: "\u7559\u8A00...", value: comment, onChange: e => setComment(e.target.value) }), _jsx("button", { onClick: handleSubmit, disabled: loading, className: "w-full !text-white font-semibold px-4 py-2 rounded disabled:opacity-60 shadow-md transition-all duration-200", style: { background: '#4f46e5', color: '#ffffff', border: 'none' }, onMouseEnter: (e) => { e.currentTarget.style.background = '#4338ca'; }, onMouseLeave: (e) => { e.currentTarget.style.background = '#4f46e5'; }, children: "\u767C\u8868\u7559\u8A00" })] }));
}
