import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { saveAs } from 'file-saver';
// 根據 focusItemId 獲取專注項目名稱
const getFocusItemName = (focusItemId, focusItems) => {
    if (!focusItemId) {
        return '未選擇';
    }
    const focusItem = focusItems.find(item => item.id === focusItemId);
    return focusItem ? focusItem.name : '未知項目';
};
// 生成 CSV 內容
const generateCsvContent = (records, focusItems, isSearchActive = false, searchKeyword = '') => {
    // 如果沒有記錄，生成一個顯示「0筆」的 CSV
    if (records.length === 0) {
        const noDataMessage = isSearchActive && searchKeyword
            ? `搜尋條件：「${searchKeyword}」無符合條件的資料 (0筆)`
            : '無資料可匯出 (0筆)';
        const csvContent = [
            '"狀態","說明","記錄筆數"',
            `"無資料","${noDataMessage}","0"`
        ].join('\n');
        const BOM = '\uFEFF';
        return BOM + csvContent;
    }
    // CSV 標題行（添加 padding 讓寬度一致）
    const headers = [
        '專注項目      ', // 10 字寬度
        ' 開始時間 ', // 左右各 1 格空白
        ' 結束時間 ', // 左右各 1 格空白
        ' 時長（分鐘） ', // 左右各 1 格空白
        ' 是否完成 ', // 左右各 1 格空白
        ' 工作時間（分鐘） ', // 左右各 1 格空白
        ' 休息時間（分鐘） ' // 左右各 1 格空白
    ];
    // 轉換記錄為 CSV 行
    const csvRows = records.map(record => {
        const completedAt = new Date(record.completedAt);
        // 計算開始時間（結束時間 - 工作時間）
        const startTime = new Date(completedAt.getTime() - (record.workMinutes * 60 * 1000));
        // 格式化時間為 yyyy-mm-dd hh:mm:ss（添加左右空白）
        const formatDateTime = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return ` ${year}-${month}-${day} ${hours}:${minutes}:${seconds} `;
        };
        // 格式化專注項目名稱（補足到 10 字寬度）
        const formatFocusItem = (focusItemId) => {
            const displayName = getFocusItemName(focusItemId, focusItems);
            return displayName.padEnd(10, ' ');
        };
        // 格式化數字欄位（添加左右空白）
        const formatNumber = (num) => ` ${num} `;
        return [
            formatFocusItem(record.focusItemId),
            formatDateTime(startTime),
            formatDateTime(completedAt),
            formatNumber(record.workMinutes),
            ' 是 ', // 統一兩字寬度
            formatNumber(record.workMinutes),
            formatNumber(record.breakMinutes)
        ];
    });
    // 組合 CSV 內容
    const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    // 創建 BOM 以確保 UTF-8 編碼正確顯示
    const BOM = '\uFEFF';
    return BOM + csvContent;
};
// 生成檔案名
const generateFileName = (records, isSearchActive = false, searchKeyword = '') => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    let fileName = `Pomodoro_Log_${year}-${month}-${day}`;
    if (isSearchActive && searchKeyword) {
        // 清理搜尋關鍵字，移除特殊字符以適合檔案名
        const cleanKeyword = searchKeyword.replace(/[<>:"/\\|?*]/g, '_').substring(0, 20);
        fileName += `_搜尋_${cleanKeyword}`;
    }
    if (records.length === 0) {
        fileName += '_無資料';
    }
    fileName += '.csv';
    return fileName;
};
// 檢查是否在 Capacitor 環境中
const isCapacitorEnvironment = () => {
    return Capacitor.isNativePlatform();
};
// 使用 Capacitor Filesystem 匯出 CSV
export const exportPomodoroRecordsToCSVWithCapacitor = async (records, focusItems, isSearchActive = false, searchKeyword = '') => {
    try {
        // 檢查是否在 Capacitor 環境中
        if (!isCapacitorEnvironment()) {
            // 在 Web 環境中，回退到原本的下載方式
            return await exportPomodoroRecordsToCSVWeb(records, focusItems, isSearchActive, searchKeyword);
        }
        // 生成 CSV 內容和檔案名
        const csvContent = generateCsvContent(records, focusItems, isSearchActive, searchKeyword);
        const fileName = generateFileName(records, isSearchActive, searchKeyword);
        // 寫入檔案到 Documents 目錄
        const result = await Filesystem.writeFile({
            path: fileName,
            data: csvContent,
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });
        const filePath = result.uri;
        const recordCount = records.length;
        let message = '';
        if (recordCount === 0) {
            message = isSearchActive && searchKeyword
                ? `搜尋條件：「${searchKeyword}」無符合條件的資料 (0筆)`
                : '無資料可匯出 (0筆)';
        }
        else if (isSearchActive) {
            message = `已匯出 ${recordCount} 筆搜尋結果${searchKeyword ? ` (關鍵字: "${searchKeyword}")` : ''}`;
        }
        else {
            message = `已匯出 ${recordCount} 筆記錄`;
        }
        return {
            success: true,
            message: `${message}\n\n檔案已儲存至：\n${fileName}\n\n儲存位置：Documents 資料夾`,
            filePath,
            fileName
        };
    }
    catch (error) {
        console.error('Capacitor CSV 匯出失敗:', error);
        return {
            success: false,
            message: `匯出失敗：${error instanceof Error ? error.message : '未知錯誤'}`
        };
    }
};
// Web 環境的匯出功能（回退方案）
const exportPomodoroRecordsToCSVWeb = async (records, focusItems, isSearchActive = false, searchKeyword = '') => {
    try {
        const csvContent = generateCsvContent(records, focusItems, isSearchActive, searchKeyword);
        const fileName = generateFileName(records, isSearchActive, searchKeyword);
        // 使用 file-saver 下載檔案，提升手機支援度
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // 手機版相容性處理
        try {
            console.log('嘗試使用 file-saver 下載番茄鐘記錄 CSV');
            saveAs(blob, fileName);
        } catch (saveError) {
            console.warn('file-saver 失敗，嘗試備用方法:', saveError);
            
            // 備用方法：創建下載連結
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            
            // 觸發下載
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 清理 URL
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        const recordCount = records.length;
        let message = '';
        if (recordCount === 0) {
            message = isSearchActive && searchKeyword
                ? `搜尋條件：「${searchKeyword}」無符合條件的資料 (0筆)`
                : '無資料可匯出 (0筆)';
        }
        else if (isSearchActive) {
            message = `已匯出 ${recordCount} 筆搜尋結果${searchKeyword ? ` (關鍵字: "${searchKeyword}")` : ''}`;
        }
        else {
            message = `已匯出 ${recordCount} 筆記錄`;
        }
        return {
            success: true,
            message: `${message}\n\n檔案已下載：${fileName}`,
            fileName
        };
    }
    catch (error) {
        console.error('Web CSV 匯出失敗:', error);
        return {
            success: false,
            message: `匯出失敗：${error instanceof Error ? error.message : '未知錯誤'}`
        };
    }
};
// 分享檔案功能
export const shareCsvFile = async (filePath, fileName) => {
    try {
        if (!isCapacitorEnvironment()) {
            return {
                success: false,
                message: '分享功能僅在手機應用程式中可用'
            };
        }
        await Share.share({
            title: '番茄鐘記錄匯出',
            text: `番茄鐘記錄匯出檔案：${fileName}`,
            url: filePath,
            dialogTitle: '分享番茄鐘記錄'
        });
        return {
            success: true,
            message: '分享選單已開啟'
        };
    }
    catch (error) {
        console.error('分享失敗:', error);
        return {
            success: false,
            message: `分享失敗：${error instanceof Error ? error.message : '未知錯誤'}`
        };
    }
};
// 檢查是否有記錄可匯出
export const hasRecordsToExport = (records) => {
    return records.length > 0;
};
