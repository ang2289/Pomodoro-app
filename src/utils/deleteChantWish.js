import { supabase } from './supabaseClient';
export const deleteChantWish = async ({ id, imageUrl }) => {
    try {
        // 1. 如果有圖片，先從 Storage 刪除
        if (imageUrl) {
            try {
                // 從 URL 中提取檔案名稱
                const urlParts = imageUrl.split('/');
                const fileName = urlParts[urlParts.length - 1];
                if (fileName) {
                    const { error: storageError } = await supabase.storage
                        .from('chant-wish-images')
                        .remove([fileName]);
                    if (storageError) {
                        console.warn('刪除圖片檔案失敗:', storageError);
                        // 圖片刪除失敗不影響主流程，繼續執行
                    }
                    else {
                        console.log('圖片檔案刪除成功:', fileName);
                    }
                }
            }
            catch (storageErr) {
                console.warn('刪除圖片檔案時發生錯誤:', storageErr);
                // 圖片刪除失敗不影響主流程，繼續執行
            }
        }
        // 2. 刪除資料表中的記錄
        const { error: deleteError } = await supabase
            .from('chant_wishes')
            .delete()
            .eq('id', id);
        if (deleteError) {
            console.error('刪除集氣活動失敗:', deleteError);
            alert('刪除集氣活動失敗：' + deleteError.message);
            return false;
        }
        console.log('集氣活動刪除成功:', id);
        return true;
    }
    catch (error) {
        console.error('刪除集氣活動時發生錯誤:', error);
        alert('刪除集氣活動時發生錯誤，請稍後再試');
        return false;
    }
};
