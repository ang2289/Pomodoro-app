// 解析領貨時間文字，提取日期和時間
export const parseDeliveryTime = (deliveryTime) => {
    try {
        // 嘗試解析各種時間格式
        const now = new Date();
        const currentYear = now.getFullYear();
        // 處理 "9/13 晚上 7 點～9 點" 格式
        const timeMatch = deliveryTime.match(/(\d{1,2})\/(\d{1,2})\s*([早晚]上)?\s*(\d{1,2})\s*點/);
        if (timeMatch) {
            const [, month, day, period, hour] = timeMatch;
            let parsedHour = parseInt(hour);
            // 處理早晚時段
            if (period === '晚上' && parsedHour < 12) {
                parsedHour += 12;
            }
            else if (period === '早上' && parsedHour === 12) {
                parsedHour = 0;
            }
            const date = new Date(currentYear, parseInt(month) - 1, parseInt(day), parsedHour, 0, 0);
            return date;
        }
        // 處理 "9/13 19:00-21:00" 格式
        const timeRangeMatch = deliveryTime.match(/(\d{1,2})\/(\d{1,2})\s*(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
        if (timeRangeMatch) {
            const [, month, day, startHour, startMin] = timeRangeMatch;
            const date = new Date(currentYear, parseInt(month) - 1, parseInt(day), parseInt(startHour), parseInt(startMin), 0);
            return date;
        }
        // 處理 "9月13日 晚上7點" 格式
        const chineseTimeMatch = deliveryTime.match(/(\d{1,2})月(\d{1,2})日\s*([早晚]上)?\s*(\d{1,2})點/);
        if (chineseTimeMatch) {
            const [, month, day, period, hour] = chineseTimeMatch;
            let parsedHour = parseInt(hour);
            if (period === '晚上' && parsedHour < 12) {
                parsedHour += 12;
            }
            else if (period === '早上' && parsedHour === 12) {
                parsedHour = 0;
            }
            const date = new Date(currentYear, parseInt(month) - 1, parseInt(day), parsedHour, 0, 0);
            return date;
        }
        // 嘗試直接解析日期
        const directParse = new Date(deliveryTime);
        if (!isNaN(directParse.getTime())) {
            return directParse;
        }
        return null;
    }
    catch (error) {
        console.error('解析時間失敗:', error);
        return null;
    }
};
// 計算距離目標時間的剩餘時間
export const getTimeRemaining = (targetTime) => {
    const now = new Date();
    const diffMs = targetTime.getTime() - now.getTime();
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
        totalHours,
        days,
        hours,
        minutes,
        isExpired: diffMs < 0,
        isWithinOneHour: totalHours <= 1 && totalHours >= 0
    };
};
// 格式化剩餘時間顯示
export const formatTimeRemaining = (timeRemaining) => {
    const { days, hours, minutes, isExpired } = timeRemaining;
    if (isExpired) {
        return '領貨時間已過';
    }
    if (days > 0) {
        return `還有 ${days} 天 ${hours} 小時`;
    }
    else if (hours > 0) {
        return `還有 ${hours} 小時 ${minutes} 分鐘`;
    }
    else if (minutes > 0) {
        return `還有 ${minutes} 分鐘`;
    }
    else {
        return '即將開始領貨';
    }
};
// 檢查是否應該顯示提醒
export const shouldShowReminder = (timeRemaining) => {
    return timeRemaining.isWithinOneHour && !timeRemaining.isExpired;
};
