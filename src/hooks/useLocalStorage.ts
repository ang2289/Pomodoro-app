import { useState, useEffect } from 'react';

/**
 * 自定義 Hook，用於管理 localStorage 中的狀態
 * @param key - localStorage 的鍵名
 * @param initialValue - 初始值，如果 localStorage 中沒有值則使用此值
 * @returns [storedValue, setValue] - 存儲的值和設置值的函數
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 創建一個狀態來存儲值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // 從 localStorage 獲取值
      const item = window.localStorage.getItem(key);
      // 如果有值則解析並返回，否則返回初始值
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // 如果發生錯誤，返回初始值
      console.error(`讀取 localStorage 鍵 "${key}" 時發生錯誤:`, error);
      return initialValue;
    }
  });

  // 當值變更時更新 localStorage
  useEffect(() => {
    try {
      // 將值存入 localStorage
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`寫入 localStorage 鍵 "${key}" 時發生錯誤:`, error);
    }
  }, [key, storedValue]);

  // 返回存儲的值和設置值的函數
  return [storedValue, setStoredValue];
}

/**
 * 從 localStorage 讀取值
 * @param key - localStorage 的鍵名
 * @param defaultValue - 如果鍵不存在，返回的預設值
 * @returns 存儲的值或預設值
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`讀取 localStorage 鍵 "${key}" 時發生錯誤:`, error);
    return defaultValue;
  }
}

/**
 * 將值寫入 localStorage
 * @param key - localStorage 的鍵名
 * @param value - 要存儲的值
 * @returns 是否成功寫入
 */
export function saveToLocalStorage<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`寫入 localStorage 鍵 "${key}" 時發生錯誤:`, error);
    return false;
  }
}

/**
 * 從 localStorage 中移除鍵
 * @param key - localStorage 的鍵名
 */
export function removeFromLocalStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`移除 localStorage 鍵 "${key}" 時發生錯誤:`, error);
  }
}

























