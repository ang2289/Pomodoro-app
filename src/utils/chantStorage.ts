export interface ChantData {
  chant: string;
  today: number;
  total: number;
}

// 經文計數資料格式（包含日期）
export interface ChantCountData {
  today: number;
  total: number;
  lastDate: string;
}

// 經文計數資料格式（物件形式）
export interface ChantCounts {
  [key: string]: ChantCountData;
}

const STORAGE_KEY = 'chant.counter';
const CHANT_COUNTS_KEY = 'chantCounts';
const CHANT_LIST_KEY = 'chantList';

// 取得今日日期字串 (yyyy-mm-dd)
export const getTodayStr = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 檢查並重置今日計數
export const checkAndResetToday = (chantName: string): ChantCountData => {
  const today = getTodayStr();
  const savedCounts = localStorage.getItem(CHANT_COUNTS_KEY);
  let chantCounts: ChantCounts = {};
  
  if (savedCounts) {
    try {
      chantCounts = JSON.parse(savedCounts);
    } catch (error) {
      console.error('解析經文計數資料時發生錯誤:', error);
    }
  }
  
  const currentData = chantCounts[chantName];
  if (!currentData) {
    // 如果經文不存在，創建新的
    const newData: ChantCountData = {
      today: 0,
      total: 0,
      lastDate: today
    };
    chantCounts[chantName] = newData;
    localStorage.setItem(CHANT_COUNTS_KEY, JSON.stringify(chantCounts));
    return newData;
  }
  
  // 檢查日期是否需要重置
  if (currentData.lastDate !== today) {
    const updatedData: ChantCountData = {
      today: 0,
      total: currentData.total,
      lastDate: today
    };
    chantCounts[chantName] = updatedData;
    localStorage.setItem(CHANT_COUNTS_KEY, JSON.stringify(chantCounts));
    return updatedData;
  }
  
  return currentData;
};

// 更新經文計數
export const updateChantCount = (chantName: string, newCounts: ChantCountData): void => {
  try {
    const savedCounts = localStorage.getItem(CHANT_COUNTS_KEY);
    let chantCounts: ChantCounts = {};
    
    if (savedCounts) {
      try {
        chantCounts = JSON.parse(savedCounts);
      } catch (error) {
        console.error('解析經文計數資料時發生錯誤:', error);
      }
    }
    
    chantCounts[chantName] = newCounts;
    localStorage.setItem(CHANT_COUNTS_KEY, JSON.stringify(chantCounts));
  } catch (error) {
    console.error('更新經文計數時發生錯誤:', error);
  }
};

// 載入經文清單
export const loadChantList = (): string[] => {
  try {
    const savedList = localStorage.getItem(CHANT_LIST_KEY);
    if (savedList) {
      return JSON.parse(savedList);
    }
  } catch (error) {
    console.error('載入經文清單時發生錯誤:', error);
  }
  
  // 回傳預設清單
  return ['阿彌陀佛', '觀世音菩薩', '心經', '藥師咒', '大悲咒'];
};

// 儲存經文清單
export const saveChantList = (list: string[]): void => {
  try {
    localStorage.setItem(CHANT_LIST_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('儲存經文清單時發生錯誤:', error);
  }
};

// 載入所有經文計數資料
export const loadAllChantCounts = (): ChantCounts => {
  try {
    const savedCounts = localStorage.getItem(CHANT_COUNTS_KEY);
    if (savedCounts) {
      return JSON.parse(savedCounts);
    }
  } catch (error) {
    console.error('載入所有經文計數資料時發生錯誤:', error);
  }
  
  return {};
};

// 儲存所有經文計數資料
export const saveAllChantCounts = (counts: ChantCounts): void => {
  try {
    localStorage.setItem(CHANT_COUNTS_KEY, JSON.stringify(counts));
  } catch (error) {
    console.error('儲存所有經文計數資料時發生錯誤:', error);
  }
};

// 載入所有經文資料（包含日期檢查）
export const loadAllChantData = (): ChantCounts => {
  const chantList = loadChantList();
  const allCounts: ChantCounts = {};
  
  // 為每個經文檢查並重置今日計數
  chantList.forEach(chantName => {
    allCounts[chantName] = checkAndResetToday(chantName);
  });
  
  return allCounts;
};

// 儲存所有經文資料
export const saveAllChantData = (data: ChantCounts): void => {
  try {
    localStorage.setItem(CHANT_COUNTS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('儲存所有經文資料時發生錯誤:', error);
  }
};

// 清除指定經文的今日次數
export const resetTodayFor = (chantName: string): ChantCountData => {
  const today = getTodayStr();
  const allCounts = loadAllChantCounts();
  const currentData = allCounts[chantName];
  
  if (currentData) {
    const updatedData: ChantCountData = {
      today: 0,
      total: currentData.total,
      lastDate: today
    };
    allCounts[chantName] = updatedData;
    saveAllChantCounts(allCounts);
    return updatedData;
  }
  
  // 如果經文不存在，創建新的
  const newData: ChantCountData = {
    today: 0,
    total: 0,
    lastDate: today
  };
  allCounts[chantName] = newData;
  saveAllChantCounts(allCounts);
  return newData;
};

// 清除指定經文的所有次數
export const resetTotalFor = (chantName: string): ChantCountData => {
  const today = getTodayStr();
  const allCounts = loadAllChantCounts();
  const currentData = allCounts[chantName];
  
  if (currentData) {
    const updatedData: ChantCountData = {
      today: 0,
      total: 0,
      lastDate: today
    };
    allCounts[chantName] = updatedData;
    saveAllChantCounts(allCounts);
    return updatedData;
  }
  
  // 如果經文不存在，創建新的
  const newData: ChantCountData = {
    today: 0,
    total: 0,
    lastDate: today
  };
  allCounts[chantName] = newData;
  saveAllChantCounts(allCounts);
  return newData;
};

// 為指定經文增加一次計數
export const addOneTo = (chantName: string): ChantCountData => {
  const today = getTodayStr();
  const allCounts = loadAllChantCounts();
  const currentData = allCounts[chantName];
  
  if (currentData) {
    const updatedData: ChantCountData = {
      today: currentData.today + 1,
      total: currentData.total + 1,
      lastDate: today
    };
    allCounts[chantName] = updatedData;
    saveAllChantCounts(allCounts);
    return updatedData;
  }
  
  // 如果經文不存在，創建新的並增加一次
  const newData: ChantCountData = {
    today: 1,
    total: 1,
    lastDate: today
  };
  allCounts[chantName] = newData;
  saveAllChantCounts(allCounts);
  return newData;
};

// 舊版相容性函數（保留以維持向後相容）
export const loadChantData = (): ChantData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        chant: data.chant || '',
        today: typeof data.today === 'number' ? data.today : 0,
        total: typeof data.total === 'number' ? data.total : 0
      };
    }
  } catch (error) {
    console.error('載入唸經計數資料時發生錯誤:', error);
  }
  
  // 回傳預設值
  return {
    chant: '',
    today: 0,
    total: 0
  };
};

export const saveChantData = (data: ChantData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('儲存唸經計數資料時發生錯誤:', error);
  }
};
