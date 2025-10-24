import { saveAs } from 'file-saver';
// 根據 focusItemId 獲取專注項目名稱
const getFocusItemName = (focusItemId, focusItems) => {
    if (!focusItemId) {
        return '未選擇';
    }
    const focusItem = focusItems.find(item => item.id === focusItemId);
    return focusItem ? focusItem.name : '未知項目';
};
// 匯出番茄鐘記錄為 CSV
export const exportPomodoroRecordsToCSV = (records, focusItems, isSearchActive = false, searchKeyword = '') => {
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
        const csvWithBOM = BOM + csvContent;
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const fileName = `Pomodoro_Log_${year}-${month}-${day}_無資料.csv`;
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        // 使用 file-saver 下載檔案，提升手機支援度
        saveAs(blob, fileName);
        return;
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
    const csvWithBOM = BOM + csvContent;
    // 生成檔案名（包含當前日期和搜尋條件）
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
    fileName += `.csv`;
    // 創建 Blob 並使用 file-saver 下載
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    // 使用 file-saver 下載檔案，提升手機支援度
    saveAs(blob, fileName);
};
// 檢查是否有記錄可匯出
export const hasRecordsToExport = (records) => {
    return records.length > 0;
};
