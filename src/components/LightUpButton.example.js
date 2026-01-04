import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// 使用範例：如何在集氣活動詳情頁中使用 LightUpButton
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LightUpButton from './LightUpButton';
export default function LightUpButtonExample({ chantWishId }) {
    const [lightCount, setLightCount] = useState(0);
    const [isLighted, setIsLighted] = useState(false);
    // 載入點燈狀態和數量
    useEffect(() => {
        loadLightStatus();
        loadLightCount();
    }, [chantWishId]);
    // 檢查用戶是否已點燈
    const loadLightStatus = () => {
        const key = `lighted-${chantWishId}`;
        const hasLighted = localStorage.getItem(key) === '1';
        setIsLighted(hasLighted);
    };
    // 載入點燈總數
    const loadLightCount = async () => {
        try {
            const { count, error } = await supabase
                .from('chant_wish_lights')
                .select('*', { count: 'exact', head: true })
                .eq('chant_wish_id', chantWishId);
            if (!error && count !== null) {
                setLightCount(count);
            }
        }
        catch (err) {
            console.error('載入點燈數量失敗:', err);
        }
    };
    // 處理點燈
    const handleLight = async () => {
        try {
            const { error } = await supabase
                .from('chant_wish_lights')
                .insert({ chant_wish_id: chantWishId });
            if (error) {
                console.error('點燈失敗:', error);
                alert('點燈失敗，請稍後再試');
                return;
            }
            // 更新狀態
            setIsLighted(true);
            setLightCount(prev => prev + 1);
            localStorage.setItem(`lighted-${chantWishId}`, '1');
            alert('🪔 點燈成功！');
        }
        catch (err) {
            console.error('點燈異常:', err);
            alert('點燈失敗，請稍後再試');
        }
    };
    return (_jsxs("div", { className: "flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800", children: "\uD83D\uDE4F \u70BA\u6B64\u9858\u671B\u9EDE\u71C8\u7948\u798F" }), _jsx(LightUpButton, { onLight: handleLight, disabled: isLighted, lightCount: lightCount }), !isLighted && (_jsx("p", { className: "text-sm text-gray-600 text-center", children: "\u9EDE\u64CA\u84EE\u82B1\u71C8\u70BA\u6B64\u9858\u671B\u7948\u798F" }))] }));
}
