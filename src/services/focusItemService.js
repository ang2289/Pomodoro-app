const FOCUS_ITEMS_KEY = 'focus_items';
const FOCUS_ITEM_USAGE_KEY = 'focus_item_usage';
// 預設專注項目
const DEFAULT_FOCUS_ITEMS = [
    { name: '讀書', isDefault: true, color: '#3b82f6' },
    { name: '寫作', isDefault: true, color: '#3b82f6' },
    { name: '工作', isDefault: true, color: '#3b82f6' },
    { name: '運動', isDefault: true, color: '#3b82f6' },
    { name: '冥想', isDefault: true, color: '#3b82f6' }
];
// 還原預設分類（不包含讀書）
const RESTORE_FOCUS_ITEMS = [
    { name: '寫作', isDefault: true, color: '#3b82f6' },
    { name: '工作', isDefault: true, color: '#3b82f6' },
    { name: '運動', isDefault: true, color: '#3b82f6' },
    { name: '冥想', isDefault: true, color: '#3b82f6' }
];
// 預設顏色列表
const DEFAULT_COLORS = [
    '#4caf50', // 綠色
    '#2196f3', // 藍色
    '#ff9800', // 橙色
    '#9c27b0', // 紫色
    '#f44336', // 紅色
    '#607d8b', // 藍灰色
    '#795548', // 棕色
    '#e91e63' // 粉紅色
];
// 未來可能用於顏色選擇器，暫時避免 TS6133
void DEFAULT_COLORS;
// 生成 UUID
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
// 初始化預設專注項目
export const initializeDefaultFocusItems = () => {
    const existingItems = getFocusItems();
    if (existingItems.length === 0) {
        const defaultItems = DEFAULT_FOCUS_ITEMS.map(item => ({
            ...item,
            id: generateUUID(),
            createdAt: new Date().toISOString(),
            createdBy: 'system'
        }));
        localStorage.setItem(FOCUS_ITEMS_KEY, JSON.stringify(defaultItems));
    }
};
// 還原預設分類（不刪除自訂分類）
export const restoreDefaultFocusItems = () => {
    const existingItems = getFocusItems();
    const existingNames = existingItems.map(item => item.name);
    // 只添加不存在的預設分類
    const newDefaultItems = RESTORE_FOCUS_ITEMS
        .filter(item => !existingNames.includes(item.name))
        .map(item => ({
        ...item,
        id: generateUUID(),
        createdAt: new Date().toISOString(),
        createdBy: 'system'
    }));
    if (newDefaultItems.length > 0) {
        const updatedItems = [...existingItems, ...newDefaultItems];
        localStorage.setItem(FOCUS_ITEMS_KEY, JSON.stringify(updatedItems));
        return true;
    }
    return false;
};
// 獲取所有專注項目
export const getFocusItems = () => {
    try {
        const items = localStorage.getItem(FOCUS_ITEMS_KEY);
        const parsedItems = items ? JSON.parse(items) : [];
        // 確保所有項目都有 color 屬性，如果沒有則使用預設值
        return parsedItems.map((item) => ({
            ...item,
            color: item.color || '#3b82f6'
        }));
    }
    catch (error) {
        console.error('Error loading focus items:', error);
        return [];
    }
};
// 獲取專注項目（包含使用次數）
export const getFocusItemsWithCount = () => {
    const items = getFocusItems();
    const usageData = getFocusItemUsage();
    return items.map(item => ({
        ...item,
        usageCount: usageData[item.id] || 0
    }));
};
// 新增專注項目
export const addFocusItem = (name, color = '#3b82f6', createdBy = 'user') => {
    const newItem = {
        id: generateUUID(),
        name: name.trim(),
        isDefault: false,
        createdAt: new Date().toISOString(),
        createdBy,
        color: color
    };
    const existingItems = getFocusItems();
    const updatedItems = [...existingItems, newItem];
    localStorage.setItem(FOCUS_ITEMS_KEY, JSON.stringify(updatedItems));
    return newItem;
};
// 更新專注項目
export const updateFocusItem = (id, name, color) => {
    const items = getFocusItems();
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1)
        return false;
    // 允許編輯預設項目和自訂項目
    items[itemIndex].name = name.trim();
    if (color) {
        items[itemIndex].color = color;
    }
    localStorage.setItem(FOCUS_ITEMS_KEY, JSON.stringify(items));
    return true;
};
// 刪除專注項目
export const deleteFocusItem = (id) => {
    const items = getFocusItems();
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1)
        return false;
    // 允許刪除預設項目和自訂項目
    const updatedItems = items.filter(item => item.id !== id);
    localStorage.setItem(FOCUS_ITEMS_KEY, JSON.stringify(updatedItems));
    return true;
};
// 獲取專注項目使用次數
const getFocusItemUsage = () => {
    try {
        const usage = localStorage.getItem(FOCUS_ITEM_USAGE_KEY);
        return usage ? JSON.parse(usage) : {};
    }
    catch (error) {
        console.error('Error loading focus item usage:', error);
        return {};
    }
};
// 記錄專注項目使用
export const recordFocusItemUsage = (focusItemId) => {
    const usage = getFocusItemUsage();
    usage[focusItemId] = (usage[focusItemId] || 0) + 1;
    localStorage.setItem(FOCUS_ITEM_USAGE_KEY, JSON.stringify(usage));
};
// 獲取最常用的專注項目
export const getMostUsedFocusItems = (limit = 5) => {
    const itemsWithCount = getFocusItemsWithCount();
    return itemsWithCount
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
};
