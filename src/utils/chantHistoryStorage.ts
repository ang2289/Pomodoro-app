// 唸經歷史資料管理
export interface ChantHistoryRecord {
  date: string; // YYYY-MM-DD 格式
  chant: string; // 經文名稱
  count: number; // 當日唸誦次數
}

const HISTORY_STORAGE_KEY = 'chant-history-records';

// 獲取今日日期字串 (YYYY-MM-DD)
export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 載入歷史記錄
export const loadChantHistory = (): ChantHistoryRecord[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('載入唸經歷史記錄失敗:', error);
    return [];
  }
};

// 儲存歷史記錄
export const saveChantHistory = (records: ChantHistoryRecord[]): void => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('儲存唸經歷史記錄失敗:', error);
  }
};

// 增加唸經次數記錄
export const addChantHistoryRecord = (chantName: string, count: number = 1): void => {
  const today = getTodayString();
  const records = loadChantHistory();
  
  // 查找今日該經文的記錄
  const existingRecordIndex = records.findIndex(
    record => record.date === today && record.chant === chantName
  );
  
  if (existingRecordIndex >= 0) {
    // 更新現有記錄
    records[existingRecordIndex].count += count;
  } else {
    // 新增記錄
    records.push({
      date: today,
      chant: chantName,
      count: count
    });
  }
  
  // 按日期和經文名稱排序
  records.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date); // 日期降序
    }
    return a.chant.localeCompare(b.chant); // 經文名稱升序
  });
  
  saveChantHistory(records);
};

// 獲取指定經文在指定日期的唸誦次數
export const getChantCountForDate = (chantName: string, date: string): number => {
  const records = loadChantHistory();
  const record = records.find(
    r => r.date === date && r.chant === chantName
  );
  return record ? record.count : 0;
};

// 獲取指定經文最近 N 天的歷史記錄
export const getChantHistoryForDays = (chantName: string, days: number = 7): ChantHistoryRecord[] => {
  const records = loadChantHistory();
  const today = new Date();
  const result: ChantHistoryRecord[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const record = records.find(r => r.date === dateStr && r.chant === chantName);
    if (record) {
      result.push(record);
    } else {
      result.push({
        date: dateStr,
        chant: chantName,
        count: 0
      });
    }
  }
  
  return result;
};

// 獲取所有經文在指定日期的總唸誦次數
export const getTotalCountForDate = (date: string): number => {
  const records = loadChantHistory();
  return records
    .filter(record => record.date === date)
    .reduce((total, record) => total + record.count, 0);
};

// 獲取指定日期範圍內的所有記錄
export const getRecordsForDateRange = (startDate: string, endDate: string): ChantHistoryRecord[] => {
  const records = loadChantHistory();
  return records.filter(record => 
    record.date >= startDate && record.date <= endDate
  );
};

// 清除指定日期的記錄
export const clearChantHistoryForDate = (date: string): void => {
  const records = loadChantHistory();
  const filteredRecords = records.filter(record => record.date !== date);
  saveChantHistory(filteredRecords);
};

// 清除指定經文的記錄
export const clearChantHistoryForChant = (chantName: string): void => {
  const records = loadChantHistory();
  const filteredRecords = records.filter(record => record.chant !== chantName);
  saveChantHistory(filteredRecords);
};



