import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
export default function ShareWishPage() {
    const { id: wishId } = useParams();
    const [wish, setWish] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [username, setUsername] = useState('');
    useEffect(() => {
        fetchWish();
        fetchComments();
    }, [wishId]);
    async function fetchWish() {
        const { data, error } = await supabase
            .from('wishes')
            .select('*')
            .eq('id', wishId)
            .single();
        if (!error)
            setWish(data);
    }
    async function fetchComments() {
        const { data } = await supabase
            .from('wish_comments')
            .select('*')
            .eq('wish_id', wishId)
            .order('created_at', { ascending: false });
        setComments(data || []);
    }
    async function handleSubmitComment() {
        if (!commentText.trim())
            return;
        await supabase.from('wish_comments').insert({
            wish_id: wishId,
            content: commentText,
            user_name: username || '匿名'
        });
        setCommentText('');
        fetchComments();
    }
    return (_jsxs("div", { className: "p-4 max-w-lg mx-auto", children: [_jsx("h1", { className: "text-xl font-bold mb-2", children: "\uD83C\uDF20 \u9858\u671B\u96C6\u6C23\u7246" }), wish && (_jsxs("div", { className: "bg-white shadow p-4 rounded-lg mb-6", children: [_jsx("div", { className: "text-gray-700 mb-2", children: wish.content }), _jsx("div", { className: "text-sm text-gray-400", children: new Date(wish.created_at).toLocaleString() })] })), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm mb-1", children: "\uD83D\uDE4B \u66B1\u7A31\uFF08\u53EF\u7A7A\u767D\uFF09\uFF1A" }), _jsx("input", { className: "w-full border p-2 rounded mb-2", value: username, onChange: e => setUsername(e.target.value) }), _jsx("textarea", { placeholder: "\u70BA\u9019\u500B\u9858\u671B\u6253\u6C23\u5427...", className: "w-full border p-3 rounded", value: commentText, onChange: e => setCommentText(e.target.value) }), _jsx("button", { onClick: handleSubmitComment, className: "bg-pink-500 hover:bg-pink-600 text-white mt-2 px-4 py-2 rounded", children: "\u7559\u8A00\u6253\u6C23" })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold mb-2", children: "\uD83D\uDCAC \u7559\u8A00\u6253\u6C23\u5340" }), comments.map(c => (_jsxs("div", { className: "bg-gray-100 p-3 rounded mb-2", children: [_jsx("div", { className: "text-gray-700", children: c.content }), _jsxs("div", { className: "text-xs text-gray-400", children: [c.user_name, " \u2027 ", new Date(c.created_at).toLocaleString()] })] }, c.id)))] })] }));
}
