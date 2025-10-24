import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import ImageUpload from '../components/ImageUpload.tsx';
import { useNavigate } from 'react-router-dom';
import { containsSensitiveWords } from '../utils/sensitiveWords';
export default function CreateChantWishPage() {
    const [title, setTitle] = useState('');
    const [chantText, setChantText] = useState('南無阿彌陀佛');
    const [chantTargetCount, setChantTargetCount] = useState(108);
    const [chantUnit, setChantUnit] = useState('遍');
    const [forPersonName, setForPersonName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [createdBy, setCreatedBy] = useState('我');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agree, setAgree] = useState(false);
    const navigate = useNavigate();
    // 預帶當天日期 (yyyy-MM-dd)
    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        setStartDate((prev) => prev || todayStr);
        setEndDate((prev) => prev || todayStr);
    }, []);
    const handleSubmit = async () => {
        if (!title || !chantText || !startDate || !endDate) {
            alert('請完整填寫標題、念誦內容、起訖日期');
            return;
        }
        // 確保日期格式正確
        if (!startDate || !endDate) {
            alert('日期欄位不能為空，請重新選擇日期');
            return;
        }
        // 檢查是否已勾選圖片使用權確認（只有當有選擇圖片時才需要檢查）
        if (imageUrl && !agree) {
            alert('請勾選「我確認這是我有權使用的圖片」');
            return;
        }
        
        // 檢查敏感詞
        if (containsSensitiveWords(title)) {
            alert('標題包含不當詞彙（如色情、暴力），請重新編輯。');
            return;
        }
        
        if (containsSensitiveWords(description)) {
            alert('願望說明包含不當詞彙（如色情、暴力），請重新編輯。');
            return;
        }
        
        if (containsSensitiveWords(createdBy)) {
            alert('發起人名字包含不當詞彙（如色情、暴力），請重新編輯。');
            return;
        }
        
        if (containsSensitiveWords(forPersonName)) {
            alert('迴向對象名字包含不當詞彙（如色情、暴力），請重新編輯。');
            return;
        }
        setIsSubmitting(true);
        // 測試 Supabase 連線
        try {
            const { data: testData, error: testError } = await supabase
                .from('chant_wishes')
                .select('id')
                .limit(1);
            if (testError) {
                console.error('Supabase 連線測試失敗:', testError);
                alert('資料庫連線失敗，請檢查網路連線或稍後再試');
                setIsSubmitting(false);
                return;
            }
            console.log('Supabase 連線正常');
        }
        catch (testErr) {
            console.error('Supabase 連線測試異常:', testErr);
            alert('無法連接到資料庫，請檢查網路連線');
            setIsSubmitting(false);
            return;
        }
        try {
            const insertData = {
                title,
                chant_text: chantText,
                chant_target_count: chantTargetCount,
                chant_unit: chantUnit,
                for_person_name: forPersonName,
                start_date: startDate,
                end_date: endDate,
                description,
                created_by: createdBy,
                image_url: imageUrl || null
            };
            console.log('準備插入的資料:', insertData);
            console.log('startDate:', startDate, 'endDate:', endDate);
            // 插入完整的資料
            const { error } = await supabase.from('chant_wishes').insert([insertData]);
            if (error) {
                console.error('Supabase 錯誤:', error);
                let errorMessage = '發起失敗！請稍後再試';
                if (error.message) {
                    if (error.message.includes('row-level security') || error.message.includes('RLS')) {
                        errorMessage = '發起失敗：資料庫權限問題。請在 Supabase 中設定 RLS 政策允許匿名用戶插入資料，或聯絡管理員。';
                    }
                    else if (error.message.includes('null value') || error.message.includes('not-null constraint')) {
                        errorMessage = '發起失敗：必填欄位未填寫完整，請檢查所有必填項目';
                    }
                    else if (error.message.includes('duplicate')) {
                        errorMessage = '發起失敗：資料重複，請檢查輸入內容';
                    }
                    else if (error.message.includes('network')) {
                        errorMessage = '發起失敗：網路連線問題，請檢查網路連線';
                    }
                    else {
                        errorMessage = `發起失敗：${error.message}`;
                    }
                }
                alert(errorMessage);
                return;
            }
            alert('✅ 集氣活動已成功發起！');
            navigate('/chant-wish-wall');
        }
        catch (err) {
            console.error('發起失敗:', err);
            let errorMessage = '發起失敗，請重試';
            if (err instanceof Error) {
                if (err.message.includes('Failed to fetch')) {
                    errorMessage = '發起失敗：無法連接到伺服器，請檢查網路連線';
                }
                else if (err.message.includes('timeout')) {
                    errorMessage = '發起失敗：請求超時，請稍後再試';
                }
                else {
                    errorMessage = `發起失敗：${err.message}`;
                }
            }
            alert(errorMessage);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx("div", { className: "responsive-container bg-gray-50 min-h-screen", children: _jsxs("main", { className: "flex-1", children: [_jsx("button", { onClick: () => navigate(-1), className: "mb-4 sm:mb-6 bg-blue-500 text-white font-semibold py-2 px-4 rounded w-full sm:w-auto hover:bg-blue-600 text-sm sm:text-base", children: "\u2190 \u8FD4\u56DE" }), _jsxs("div", { className: "card", style: { backgroundColor: '#ffffff', color: '#213547' }, children: [_jsx("h1", { className: "text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center", children: "\uD83D\uDE4F \u767C\u8D77\u96C6\u6C23\u52A9\u5FF5\u6D3B\u52D5" }), _jsxs("div", { className: "space-y-4 sm:space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: "\u2728 \u6D3B\u52D5\u6A19\u984C\uFF1A" }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", placeholder: "\u70BA\u5ABD\u5ABD\u7948\u9858\u8EAB\u9AD4\u5065\u5EB7", value: title, onChange: (e) => setTitle(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: "\uD83E\uDDD8 \u5FF5\u8AA6\u5167\u5BB9\uFF1A" }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", value: chantText, onChange: (e) => setChantText(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: "\uD83D\uDD22 \u5FF5\u8AA6\u6B21\u6578\uFF1A" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:gap-4 flex-wrap", children: [_jsx("input", { className: "w-full sm:w-1/2 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", type: "number", value: chantTargetCount, onChange: (e) => setChantTargetCount(Number(e.target.value)), disabled: isSubmitting }), _jsx("input", { className: "w-full sm:w-1/2 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", value: chantUnit, onChange: (e) => setChantUnit(e.target.value), disabled: isSubmitting })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: "\uD83E\uDDD1\u200D\uD83E\uDDB1 \u8FF4\u5411\u5C0D\u8C61\uFF08\u53EF\u9078\u586B\uFF09\uFF1A" }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", placeholder: "\u5ABD\u5ABD\u3001\u5C0F\u660E\u3001\u89AA\u4EBA\u540D\u5B57...", value: forPersonName, onChange: (e) => setForPersonName(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: "\uD83D\uDCC5 \u8D77\u59CB\u65E5\uFF1A" }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: "\uD83D\uDCC5 \u622A\u6B62\u65E5\uFF1A" }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: "\uD83D\uDCDD \u9858\u671B\u5167\u5BB9\uFF08\u53EF\u9078\u586B\uFF09\uFF1A" }), _jsx("textarea", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm sm:text-base", rows: 3, value: description, onChange: (e) => setDescription(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: "\u270D\uFE0F \u767C\u8D77\u4EBA\u66B1\u7A31\uFF1A" }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", value: createdBy, onChange: (e) => setCreatedBy(e.target.value), disabled: isSubmitting })] }), _jsx("button", { className: "w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 !text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-sm sm:text-base", style: { color: '#ffffff' }, onClick: handleSubmit, disabled: isSubmitting, children: isSubmitting ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "\u767C\u8D77\u4E2D..."] })) : ('發起集氣活動 🔔') })] }), _jsxs("div", { children: [_jsx(ImageUpload, { onUpload: (url) => setImageUrl(url) }), imageUrl && (_jsxs("label", { className: "inline-flex items-center text-sm mt-4", children: [_jsx("input", { type: "checkbox", required: true, className: "mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-0 rounded focus:ring-0 focus:ring-offset-0", checked: agree, onChange: (e) => setAgree(e.target.checked) }), "\u6211\u78BA\u8A8D\u9019\u662F\u6211\u6709\u6B0A\u4F7F\u7528\u7684\u5716\u7247"] }))] })] })] }) }));
}
