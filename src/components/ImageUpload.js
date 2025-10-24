import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../utils/supabaseClient';
export default function ImageUpload({ onUpload }) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };
    
    async function handleUpload(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setFileName(file.name);
        
        // 立即顯示本地預覽
        const localPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(localPreviewUrl);
        
        // 僅允許 JPG / PNG
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('僅支援 JPG 或 PNG 圖片');
            if (fileInputRef.current)
                fileInputRef.current.value = '';
            setFileName('');
            setPreviewUrl('');
            return;
        }
        // 檢查檔案大小（初步檢查）
        if (file.size > 10 * 1024 * 1024) { // 10MB
            alert('圖片檔案過大（超過 10MB），請選擇較小的圖片');
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFileName('');
            setPreviewUrl('');
            return;
        }

        setUploading(true);
        try {
            // 檢測是否為手機環境
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            console.log('設備類型:', isMobile ? '手機' : '桌面');
            
            // 根據原始檔案大小動態調整壓縮參數
            const fileSizeMB = file.size / (1024 * 1024);
            console.log('原始檔案大小:', fileSizeMB.toFixed(2), 'MB');
            
            // 手機優化的壓縮策略：更保守的設定
            let maxSizeMB = isMobile ? 0.6 : 0.8;  // 手機更保守
            let initialQuality = isMobile ? 0.6 : 0.7;  // 手機品質更低
            let maxWidthOrHeight = isMobile ? 600 : 800;  // 手機尺寸更小
            
            // 根據檔案大小調整參數
            if (fileSizeMB > 10) {
                maxSizeMB = isMobile ? 0.4 : 0.6;
                initialQuality = isMobile ? 0.3 : 0.4;
                maxWidthOrHeight = isMobile ? 400 : 500;
            } else if (fileSizeMB > 5) {
                maxSizeMB = isMobile ? 0.5 : 0.7;
                initialQuality = isMobile ? 0.4 : 0.5;
                maxWidthOrHeight = isMobile ? 500 : 600;
            } else if (fileSizeMB > 2) {
                maxSizeMB = isMobile ? 0.55 : 0.75;
                initialQuality = isMobile ? 0.5 : 0.6;
                maxWidthOrHeight = isMobile ? 550 : 700;
            }
            
            console.log(`壓縮參數: maxSizeMB=${maxSizeMB}, quality=${initialQuality}, size=${maxWidthOrHeight}`);
            
            // 第一次壓縮：使用手機優化設定
            let compressedFile;
            try {
                compressedFile = await imageCompression(file, {
                    maxSizeMB,
                    maxWidthOrHeight,
                    useWebWorker: false, // 手機上關閉 WebWorker
                    fileType: 'image/jpeg',
                    initialQuality,
                    alwaysKeepResolution: false,
                    preserveExif: false,
                    maxIteration: isMobile ? 15 : 20, // 手機減少迭代次數
                    exifOrientation: 1,
                    onProgress: (progress) => {
                        console.log('壓縮進度:', Math.round(progress * 100) + '%');
                    }
                });
            } catch (compressionError) {
                console.error('第一次壓縮失敗:', compressionError);
                // 如果壓縮失敗，嘗試更保守的設定
                console.log('嘗試更保守的壓縮設定...');
                compressedFile = await imageCompression(file, {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 400,
                    useWebWorker: false,
                    fileType: 'image/jpeg',
                    initialQuality: 0.3,
                    alwaysKeepResolution: false,
                    preserveExif: false,
                    maxIteration: 10
                });
            }
            
            console.log('第一次壓縮後檔案大小:', (compressedFile.size / (1024 * 1024)).toFixed(2), 'MB');
            
            // 如果仍然太大，進行第二次更激進的壓縮
            if (compressedFile.size > 1024 * 1024) { // 超過 1MB
                console.log('檔案仍然太大，進行第二次壓縮...');
                compressedFile = await imageCompression(compressedFile, {
                    maxSizeMB: 0.7,
                    maxWidthOrHeight: 600,
                    useWebWorker: false,
                    fileType: 'image/jpeg',
                    initialQuality: 0.4,
                    alwaysKeepResolution: false,
                    preserveExif: false,
                    maxIteration: 15
                });
                console.log('第二次壓縮後檔案大小:', (compressedFile.size / (1024 * 1024)).toFixed(2), 'MB');
            }
            
            // 如果還是太大，進行第三次壓縮
            if (compressedFile.size > 1024 * 1024) { // 超過 1MB
                console.log('檔案仍然太大，進行第三次壓縮...');
                compressedFile = await imageCompression(compressedFile, {
                    maxSizeMB: 0.6,
                    maxWidthOrHeight: 500,
                    useWebWorker: false,
                    fileType: 'image/jpeg',
                    initialQuality: 0.3,
                    alwaysKeepResolution: false,
                    preserveExif: false,
                    maxIteration: 10
                });
                console.log('第三次壓縮後檔案大小:', (compressedFile.size / (1024 * 1024)).toFixed(2), 'MB');
            }
            
            // 最終檢查：如果還是超過 1MB，拒絕上傳
            if (compressedFile.size > 1024 * 1024) {
                throw new Error('圖片壓縮後仍然過大，請選擇較小的圖片');
            }

            const fileExt = 'jpg';
            const uploadFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            console.log('上傳檔案名稱:', uploadFileName);
            
            // 手機環境使用更長的超時時間
            const uploadTimeout = isMobile ? 60000 : 30000; // 手機60秒，桌面30秒
            console.log('上傳超時設定:', uploadTimeout / 1000, '秒');
            
            // 使用 Promise.race 來處理超時
            const uploadPromise = supabase.storage
                .from('chant-wish-images')
                .upload(uploadFileName, compressedFile, { 
                    cacheControl: '3600', 
                    upsert: false, 
                    contentType: 'image/jpeg' 
                });
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('上傳超時，請檢查網路連線後重試')), uploadTimeout);
            });
            
            const { error } = await Promise.race([uploadPromise, timeoutPromise]);
            if (error) {
                console.error('Supabase 上傳錯誤:', error);
                throw new Error(`上傳失敗: ${error.message || JSON.stringify(error)}`);
            }
            const { data } = supabase.storage.from('chant-wish-images').getPublicUrl(uploadFileName);
            if (data?.publicUrl) {
                console.log('獲得公開 URL:', data.publicUrl);
                setPreviewUrl(data.publicUrl);
                onUpload(data.publicUrl);
                console.log('圖片上傳完成');
            } else {
                throw new Error('無法獲取圖片公開 URL');
            }
        }
        catch (err) {
            console.error('圖片上傳失敗:', err);
            console.error('錯誤類型:', typeof err);
            console.error('錯誤詳情:', err);
            console.error('設備類型:', isMobile ? '手機' : '桌面');
            
            let errorMessage = '圖片上傳失敗';
            
            // 首先檢查是否有具體的錯誤訊息
            if (err?.message) {
                const message = err.message.toLowerCase();
                if (message.includes('jwt') || message.includes('auth') || message.includes('unauthorized')) {
                    errorMessage = '認證失敗，請重新整理頁面後再試';
                } else if (message.includes('storage') || message.includes('bucket') || message.includes('supabase')) {
                    errorMessage = '儲存服務暫時無法使用，請稍後再試';
                } else if (message.includes('size') || message.includes('too large') || message.includes('過大') || message.includes('exceeded')) {
                    errorMessage = '圖片檔案過大，請選擇較小的圖片（建議小於 1MB）';
                } else if (message.includes('compression') || message.includes('壓縮') || message.includes('process')) {
                    errorMessage = '圖片處理失敗，請選擇較小的圖片';
                } else if (message.includes('format') || message.includes('格式') || message.includes('type')) {
                    errorMessage = '不支援的圖片格式，請選擇 JPG 或 PNG 格式';
                } else if (message.includes('timeout') || message.includes('超時')) {
                    errorMessage = isMobile ? '上傳超時，手機網路較慢，請稍後再試' : '上傳超時，請檢查網路後再試';
                } else if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
                    errorMessage = isMobile ? '網路連線不穩定，請檢查手機網路後再試' : '網路連線問題，請檢查網路後再試';
                } else {
                    errorMessage = `上傳失敗: ${err.message}`;
                }
            } else if (err instanceof ProgressEvent) {
                // 更仔細地檢查 ProgressEvent 的具體情況
                console.log('ProgressEvent 詳情:', {
                    type: err.type,
                    loaded: err.loaded,
                    total: err.total,
                    lengthComputable: err.lengthComputable
                });
                
                if (err.type === 'abort') {
                    errorMessage = '上傳被取消，請重試';
                } else if (err.type === 'error') {
                    // 檢查是否真的是網路問題
                    if (err.loaded === 0 && err.total === 0) {
                        errorMessage = isMobile ? '手機網路連線中斷，請檢查網路設定後再試' : '網路連線中斷，請檢查網路後再試';
                    } else {
                        errorMessage = isMobile ? '手機上傳過程中發生錯誤，請重試' : '上傳過程中發生錯誤，請重試';
                    }
                } else {
                    errorMessage = isMobile ? '手機上傳過程中發生錯誤，請重試' : '上傳過程中發生錯誤，請重試';
                }
            } else if (typeof err === 'string') {
                errorMessage = `上傳失敗: ${err}`;
            } else if (err && typeof err.toString === 'function') {
                const errStr = err.toString();
                console.log('錯誤字串:', errStr);
                
                if (errStr.includes('network') || errStr.includes('fetch') || errStr.includes('timeout')) {
                    errorMessage = isMobile ? '手機網路連線問題，請檢查網路後再試' : '網路連線問題，請檢查網路後再試';
                } else if (errStr.includes('size') || errStr.includes('large')) {
                    errorMessage = '圖片檔案過大，請選擇較小的圖片';
                } else {
                    errorMessage = `上傳失敗: ${errStr}`;
                }
            } else {
                errorMessage = isMobile ? '手機上傳失敗，請重試' : '上傳失敗，請重試';
            }
            
            alert(errorMessage);
            setFileName('');
            setPreviewUrl('');
        }
        finally {
            setUploading(false);
        }
    }
    function handleRemove() {
        setPreviewUrl('');
        setFileName('');
        onUpload('');
        if (fileInputRef.current)
            fileInputRef.current.value = '';
    }
    return (_jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("label", { className: "block font-semibold mb-1", children: "\uD83D\uDCF7 \u4E0A\u50B3\u5716\u7247\uFF08JPG/PNG\uFF0C\u6700\u5927 1MB\uFF0C\u9577\u908A 800px\uFF09" }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("button", { type: "button", onClick: handleButtonClick, disabled: uploading, className: "px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none", style: { color: '#ffffff' }, children: uploading ? '上傳中...' : '選擇圖片' }), _jsx("span", { className: "text-gray-500 text-xs", children: fileName ? `(${fileName})` : '(尚未選擇檔案)' })] }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/jpeg,image/png", className: "hidden", onChange: handleUpload }), uploading && _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "\u5716\u7247\u58D3\u7E2E\u8207\u4E0A\u50B3\u4E2D\u2026" }), previewUrl && (_jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "inline-block rounded-md border border-gray-200 shadow-md overflow-hidden", children: _jsx("img", { src: previewUrl, alt: "\u9810\u89BD", className: "max-h-40 object-contain bg-white" }) }), _jsx("div", { className: "mt-2", children: _jsx("button", { type: "button", onClick: handleRemove, className: "px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm", children: "\u79FB\u9664" }) })] })), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "\u8ACB\u52FF\u4E0A\u50B3\u4FB5\u6B0A\u6216\u654F\u611F\u5716\u7247" })] }));
}
