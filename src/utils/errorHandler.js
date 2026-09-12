/**
 * 錯誤處理工具函數
 */
// 定義錯誤類型
export var ErrorType;
(function (ErrorType) {
    ErrorType["NETWORK"] = "network";
    ErrorType["VALIDATION"] = "validation";
    ErrorType["PERMISSION"] = "permission";
    ErrorType["STORAGE"] = "storage";
    ErrorType["UNKNOWN"] = "unknown";
})(ErrorType || (ErrorType = {}));
// 錯誤處理函數
export function handleError(error, type = ErrorType.UNKNOWN) {
    const timestamp = Date.now();
    // 如果是標準 Error 物件
    if (error instanceof Error) {
        return {
            type,
            message: error.message,
            details: error.stack,
            timestamp
        };
    }
    // 如果是字串
    if (typeof error === 'string') {
        return {
            type,
            message: error,
            timestamp
        };
    }
    // 其他未知類型
    return {
        type: ErrorType.UNKNOWN,
        message: '發生未知錯誤',
        details: JSON.stringify(error),
        timestamp
    };
}
// 顯示使用者友善的錯誤訊息
export function getUserFriendlyErrorMessage(error) {
    switch (error.type) {
        case ErrorType.NETWORK:
            return '網路連線發生問題，請檢查您的網路連線後再試一次。';
        case ErrorType.VALIDATION:
            return '輸入資料有誤，請檢查並更正。';
        case ErrorType.PERMISSION:
            return '權限不足，無法執行此操作。';
        case ErrorType.STORAGE:
            return '儲存資料時發生問題，可能是儲存空間不足。';
        case ErrorType.UNKNOWN:
        default:
            return '發生未預期的錯誤，請稍後再試。';
    }
}
// 記錄錯誤
export function logError(error) {
    console.error(`[${new Date(error.timestamp).toLocaleString()}] [${error.type}] ${error.message}`);
    if (error.details) {
        console.error('詳細資訊:', error.details);
    }
    // 這裡可以擴展加入錯誤追蹤服務，如 Sentry 等
}
// 處理並記錄錯誤，返回使用者友善的訊息
export function processError(error, type = ErrorType.UNKNOWN) {
    const appError = handleError(error, type);
    logError(appError);
    return getUserFriendlyErrorMessage(appError);
}
