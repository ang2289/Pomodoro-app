import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { supabase } from '../utils/supabaseClient';
import ImageUpload from '../components/ImageUpload.tsx';
import { useNavigate } from 'react-router-dom';
import { containsSensitiveWords } from '../utils/sensitiveWords';
export default function CreateChantWishPage() {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [chantText, setChantText] = useState('');
    const [chantTargetCount, setChantTargetCount] = useState(108);
    const [chantUnit, setChantUnit] = useState('');
    const [forPersonName, setForPersonName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [createdBy, setCreatedBy] = useState('');
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
    }, [t]);
    
    // 設置初始值（使用翻譯）- 只在首次載入時執行
    useEffect(() => {
        const defaultChant = t('南無阿彌陀佛');
        const defaultUnit = t('chant_unit');
        if (!chantText) {
            setChantText(defaultChant);
        }
        if (!chantUnit) {
            setChantUnit(defaultUnit);
        }
        if (!createdBy) {
            setCreatedBy(i18n.language === 'zh_TW' ? '我' : 'Me');
        }
    }, []);
    
    // 當語言改變時，更新預設值（如果當前值等於舊的預設值）
    useEffect(() => {
        const updateDefaults = () => {
            const defaultChant = t('南無阿彌陀佛');
            const defaultUnit = t('chant_unit');
            // 如果當前值是預設值，則更新為新語言的預設值
            setChantText((prev) => {
                if (prev === '南無阿彌陀佛' || prev === 'Namo Amitabha Buddha' || !prev) {
                    return defaultChant;
                }
                return prev;
            });
            setChantUnit((prev) => {
                if (prev === '遍' || prev === 'times' || !prev) {
                    return defaultUnit;
                }
                return prev;
            });
            setCreatedBy((prev) => {
                if (prev === '我' || prev === 'Me' || !prev) {
                    return i18n.language === 'zh_TW' ? '我' : 'Me';
                }
                return prev;
            });
        };
        
        // 監聽語言變化事件
        i18n.on('languageChanged', updateDefaults);
        
        // 立即執行一次，以防語言已經改變
        updateDefaults();
        
        return () => {
            i18n.off('languageChanged', updateDefaults);
        };
    }, [t]);
    
    const handleSubmit = async () => {
        if (!title || !chantText || !startDate || !endDate) {
            alert(t('fill_complete_fields'));
            return;
        }
        // 確保日期格式正確
        if (!startDate || !endDate) {
            alert(t('date_field_empty'));
            return;
        }
        // 檢查是否已勾選圖片使用權確認（只有當有選擇圖片時才需要檢查）
        if (imageUrl && !agree) {
            alert(t('check_image_permission'));
            return;
        }
        
        // 檢查敏感詞
        if (containsSensitiveWords(title)) {
            alert(t('title_contains_inappropriate'));
            return;
        }
        
        if (containsSensitiveWords(description)) {
            alert(t('wish_description_inappropriate'));
            return;
        }
        
        if (containsSensitiveWords(createdBy)) {
            alert(t('creator_name_inappropriate'));
            return;
        }
        
        if (containsSensitiveWords(forPersonName)) {
            alert(t('dedication_recipient_inappropriate'));
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
                alert(t('database_connection_failed'));
                setIsSubmitting(false);
                return;
            }
            console.log('Supabase 連線正常');
        }
        catch (testErr) {
            console.error('Supabase 連線測試異常:', testErr);
            alert(t('cannot_connect_database'));
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
                let errorMessage = t('chant_wish_submit_failed');
                if (error.message) {
                    if (error.message.includes('row-level security') || error.message.includes('RLS')) {
                        errorMessage = t('chant_wish_submit_failed_permission');
                    }
                    else if (error.message.includes('null value') || error.message.includes('not-null constraint')) {
                        errorMessage = t('chant_wish_submit_failed_fields');
                    }
                    else if (error.message.includes('duplicate')) {
                        errorMessage = t('chant_wish_submit_failed_duplicate');
                    }
                    else if (error.message.includes('network')) {
                        errorMessage = t('chant_wish_submit_failed_network');
                    }
                    else {
                        errorMessage = `${t('chant_wish_submit_failed')}: ${error.message}`;
                    }
                }
                alert(errorMessage);
                return;
            }
            alert(t('chant_wish_submit_success'));
            navigate('/chant-wish-wall');
        }
        catch (err) {
            console.error('發起失敗:', err);
            let errorMessage = t('chant_wish_submit_failed_retry');
            if (err instanceof Error) {
                if (err.message.includes('Failed to fetch')) {
                    errorMessage = t('chant_wish_submit_failed_server');
                }
                else if (err.message.includes('timeout')) {
                    errorMessage = t('chant_wish_submit_failed_timeout');
                }
                else {
                    errorMessage = `${t('chant_wish_submit_failed')}: ${err.message}`;
                }
            }
            alert(errorMessage);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx("div", { className: "responsive-container bg-gray-50 min-h-screen", children: _jsxs("main", { className: "flex-1", children: [_jsx("button", { onClick: () => navigate(-1), className: "mb-4 sm:mb-6 bg-blue-500 text-white font-semibold py-2 px-4 rounded w-full sm:w-auto hover:bg-blue-600 text-sm sm:text-base", children: `← ${t('back')}` }), _jsxs("div", { className: "card", style: { backgroundColor: '#ffffff', color: '#213547' }, children: [_jsx("h1", { className: "text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center", children: `🙏 ${t('create_chant_wish_title')}` }), _jsxs("div", { className: "space-y-4 sm:space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: `✨ ${t('activity_title')}:` }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", placeholder: t('activity_title_placeholder'), value: title, onChange: (e) => setTitle(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: `🧘 ${t('chant_content')}:` }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", value: chantText, onChange: (e) => setChantText(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: `🔢 ${t('chant_count')}:` }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:gap-4 flex-wrap", children: [_jsx("input", { className: "w-full sm:w-1/2 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", type: "number", value: chantTargetCount, onChange: (e) => setChantTargetCount(Number(e.target.value)), disabled: isSubmitting }), _jsx("input", { className: "w-full sm:w-1/2 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", value: chantUnit, onChange: (e) => setChantUnit(e.target.value), disabled: isSubmitting })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: `🧑‍🦱 ${t('dedication_recipient_optional')}:` }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", placeholder: t('dedication_recipient_placeholder'), value: forPersonName, onChange: (e) => setForPersonName(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: `📅 ${t('start_date')}:` }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: `📅 ${t('end_date')}:` }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: `📝 ${t('wish_content_optional')}:` }), _jsx("textarea", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm sm:text-base", rows: 3, value: description, onChange: (e) => setDescription(e.target.value), disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm sm:text-base font-medium text-gray-700 mb-2", children: `✍️ ${t('creator_name')}:` }), _jsx("input", { className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base", value: createdBy, onChange: (e) => setCreatedBy(e.target.value), disabled: isSubmitting })] }), _jsx("button", { className: "w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 !text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-sm sm:text-base", style: { color: '#ffffff' }, onClick: handleSubmit, disabled: isSubmitting, children: isSubmitting ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), t('submitting')] })) : (`${t('submit_chant_wish')} 🔔`) })] }), _jsxs("div", { children: [_jsx(ImageUpload, { onUpload: (url) => setImageUrl(url) }), imageUrl && (_jsxs("label", { className: "inline-flex items-center text-sm mt-4", children: [_jsx("input", { type: "checkbox", required: true, className: "mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-0 rounded focus:ring-0 focus:ring-offset-0", checked: agree, onChange: (e) => setAgree(e.target.checked) }), t('image_permission')] }))] })] })] }) }));
}
