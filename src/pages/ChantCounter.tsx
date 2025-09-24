import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  checkAndResetToday, 
  updateChantCount, 
  loadChantList, 
  saveChantList,
  loadAllChantCounts,
  saveAllChantCounts,
  ChantCountData
} from '../utils/chantStorage';
import { addChantHistoryRecord } from '../utils/chantHistoryStorage';
import ChantExportButton from '../components/ChantExportButton';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectTrigger, SelectValue } from '../components/ui/select';
import * as SelectPrimitive from "@radix-ui/react-select";
import { Label } from '../components/ui/label';

// 自定義 SelectItem 組件，不顯示打勾圖示
const CustomSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
CustomSelectItem.displayName = SelectPrimitive.Item.displayName;

const ChantCounter = () => {
  const navigate = useNavigate();
  const [selectedChant, setSelectedChant] = useState<string>('阿彌陀佛');
  const [chantList, setChantList] = useState<string[]>([]);
  const [chantStats, setChantStats] = useState<{
    [chantName: string]: {
      today: number
      total: number
      lastDate: string
    }
  }>({});
  const [newChantName, setNewChantName] = useState<string>('');
  const [renameChantName, setRenameChantName] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // 從 localStorage 載入資料
  useEffect(() => {
    const loadedList = loadChantList();
    setChantList(loadedList);
    
    // 載入所有經文的統計資料
    const allStats = loadAllChantCounts();
    setChantStats(allStats);
    
    // 載入第一個經文的資料並檢查日期
    if (loadedList.length > 0) {
      const firstChant = loadedList[0];
      setSelectedChant(firstChant);
    }
  }, []);

  // 取得當前選中經文的統計資料
  const currentChantData = chantStats[selectedChant] || { today: 0, total: 0, lastDate: '' };

  // 更新經文計數並儲存
  const updateCurrentChantCount = (newCounts: ChantCountData) => {
    const updatedStats = {
      ...chantStats,
      [selectedChant]: newCounts
    };
    setChantStats(updatedStats);
    updateChantCount(selectedChant, newCounts);
  };

  // 新增經文
  const addChant = () => {
    console.log('addChant clicked', { newChantName, chantList });
    const trimmedName = newChantName.trim();
    
    if (!trimmedName) {
      setMessage('請輸入經文名稱');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (chantList.includes(trimmedName)) {
      setMessage('此經文已存在，請選擇其他名稱');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const newChant = trimmedName;
    const newList = [...chantList, newChant];
    setChantList(newList);
    saveChantList(newList);
    
    // 為新經文創建計數資料
    const newChantData = checkAndResetToday(newChant);
    const updatedStats = {
      ...chantStats,
      [newChant]: newChantData
    };
    setChantStats(updatedStats);
    
    setNewChantName('');
    setMessage('經文新增成功！');
    setTimeout(() => setMessage(''), 3000);
    console.log('Chant added successfully:', newChant);
  };

  // 重新命名經文
  const renameChant = () => {
    console.log('renameChant clicked', { renameChantName, selectedChant, chantList });
    const trimmedName = renameChantName.trim();
    
    if (!trimmedName) {
      setMessage('請輸入新的經文名稱');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (trimmedName === selectedChant) {
      setMessage('新名稱與目前經文相同');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (chantList.includes(trimmedName)) {
      setMessage('此經文名稱已存在，請選擇其他名稱');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const oldName = selectedChant;
    const newName = trimmedName;
    
    // 更新清單
    const newList = chantList.map(chant => chant === oldName ? newName : chant);
    setChantList(newList);
    saveChantList(newList);
    
    // 更新統計資料
    const updatedStats = { ...chantStats };
    if (updatedStats[oldName]) {
      updatedStats[newName] = updatedStats[oldName];
      delete updatedStats[oldName];
      setChantStats(updatedStats);
      saveAllChantCounts(updatedStats);
    }
    
    // 更新選取的經文
    setSelectedChant(newName);
    setRenameChantName('');
    setMessage('經文重新命名成功！');
    setTimeout(() => setMessage(''), 3000);
    console.log('Chant renamed successfully:', oldName, '->', newName);
  };

  // 刪除經文
  const deleteChant = () => {
    if (window.confirm(`確定要刪除「${selectedChant}」嗎？`)) {
      const newList = chantList.filter(chant => chant !== selectedChant);
      setChantList(newList);
      saveChantList(newList);
      
      // 刪除統計資料
      const updatedStats = { ...chantStats };
      delete updatedStats[selectedChant];
      setChantStats(updatedStats);
      saveAllChantCounts(updatedStats);
      
      // 選擇第一個經文
      if (newList.length > 0) {
        setSelectedChant(newList[0]);
      }
    }
  };

  // 增加計數
  const increment = () => {
    console.log('increment clicked', currentChantData);
    const newData: ChantCountData = {
      today: currentChantData.today + 1,
      total: currentChantData.total + 1,
      lastDate: currentChantData.lastDate
    };
    updateCurrentChantCount(newData);
    
    // 記錄到歷史資料
    addChantHistoryRecord(selectedChant, 1);
  };

  // 減少計數
  const decrement = () => {
    if (currentChantData.today > 0) {
      const newData: ChantCountData = {
        today: currentChantData.today - 1,
        total: currentChantData.total - 1,
        lastDate: currentChantData.lastDate
      };
      updateCurrentChantCount(newData);
    }
  };

  // 清除今日
  const clearToday = () => {
    if (window.confirm('確定要清除今日次數嗎？')) {
      const newData: ChantCountData = {
        today: 0,
        total: currentChantData.total,
        lastDate: currentChantData.lastDate
      };
      updateCurrentChantCount(newData);
    }
  };

  // 清除總計
  const clearTotal = () => {
    if (window.confirm('確定要清除所有計數嗎？這將同時清除今日和總計次數。')) {
      const newData: ChantCountData = {
        today: 0,
        total: 0,
        lastDate: currentChantData.lastDate
      };
      updateCurrentChantCount(newData);
    }
  };




  return (
    <div className="page bg-white text-black dark:bg-gray-900 dark:text-gray-100">
      <div className="space-y-4 sm:space-y-4 md:space-y-6">
        {/* 標題和回首頁按鈕 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
            style={{
              backgroundColor: '#4ecdc4',
              color: 'white',
              padding: '12px 24px',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#45b7aa'
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4ecdc4'
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            ← 回首頁
          </button>
          <h1 className="text-xl font-bold">🧘 念經記錄</h1>
          <div className="hidden sm:block" style={{ width: '120px' }}></div> {/* 佔位元素，保持標題居中 */}
        </div>
        
        {/* 選擇經文卡片 */}
        <Card className="card rounded-2xl shadow-md p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          <h2 className="text-xl font-bold">🙏 選擇經文</h2>
          <Select value={selectedChant} onValueChange={setSelectedChant}>
            <SelectTrigger 
              className="text-lg py-3"
              style={{ fontSize: '1.125rem', padding: '12px 16px' }}
            >
              <SelectValue placeholder="目前選擇" />
            </SelectTrigger>
            <SelectContent 
              className="!bg-blue-50 !border-2 !border-blue-200 !shadow-lg !z-[9999]"
              style={{ 
                zIndex: 9999,
                backgroundColor: '#dbeafe',
                border: '2px solid #93c5fd',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
            >
              {chantList.map((chant) => (
                <CustomSelectItem 
                  key={chant} 
                  value={chant}
                  className="!text-lg !py-3 hover:!bg-blue-100 focus:!bg-blue-100"
                  style={{ 
                    fontSize: '1.125rem', 
                    padding: '12px 16px',
                    color: '#1e40af',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {chant}
                </CustomSelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* 唸誦統計卡片 */}
        <Card className="card rounded-2xl shadow-md p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">📊 唸誦統計</h2>

          <div className="space-y-2 text-center">
            <div>
              <p 
                className="text-5xl font-bold flex justify-center items-center gap-2 mb-2"
                style={{ color: '#2563eb', fontSize: '2rem', fontWeight: '900' }}
              >
                📅 今日次數
              </p>
              <p 
                className="font-bold"
                style={{ 
                  fontSize: '4.5rem', 
                  lineHeight: '0.8',
                  color: '#2563eb'
                }}
              >
                {currentChantData.today}
              </p>
            </div>

            <div>
              <p 
                className="text-5xl font-bold flex justify-center items-center gap-2 mb-2"
                style={{ color: '#9333ea', fontSize: '2rem', fontWeight: '900' }}
              >
                📈 總次數
              </p>
              <p 
                className="font-bold"
                style={{ 
                  fontSize: '4.5rem', 
                  lineHeight: '0.8',
                  color: '#9333ea'
                }}
              >
                {currentChantData.total}
              </p>
            </div>
          </div>

          {/* 匯出按鈕 */}
          <div className="mt-6">
            <ChantExportButton 
              chant={selectedChant}
              today={currentChantData.today}
              total={currentChantData.total}
            />
          </div>
        </Card>

        {/* 操作控制卡片 */}
        <Card className="card rounded-2xl shadow-md p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">⚡ 操作控制</h2>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center flex-wrap mb-5">
            {/* +1 按鈕 */}
            <button 
              onClick={increment}
              className="w-full sm:w-auto"
              style={{
                backgroundColor: '#4ecdc4',
                color: 'white',
                padding: '14px 28px',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                zIndex: 10,
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#45b7aa'
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4ecdc4'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              +1
            </button>

            {/* -1 按鈕 */}
            <button 
              onClick={decrement}
              disabled={currentChantData.today === 0}
              className="w-full sm:w-auto"
              style={{
                backgroundColor: currentChantData.today === 0 ? '#95a5a6' : '#ffc107',
                color: currentChantData.today === 0 ? '#fff' : '#333',
                padding: '14px 28px',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: currentChantData.today === 0 ? 'not-allowed' : 'pointer',
                opacity: currentChantData.today === 0 ? 0.6 : 1,
                zIndex: 10,
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentChantData.today > 0) {
                  e.currentTarget.style.backgroundColor = '#e6ac00'
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentChantData.today > 0) {
                  e.currentTarget.style.backgroundColor = '#ffc107'
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              -1
            </button>

            {/* 清除今日按鈕 */}
            <button 
              onClick={clearToday}
              disabled={currentChantData.today === 0}
              className="w-full sm:w-auto"
              style={{
                backgroundColor: currentChantData.today === 0 ? '#95a5a6' : '#ff6b6b',
                color: 'white',
                padding: '14px 28px',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: currentChantData.today === 0 ? 'not-allowed' : 'pointer',
                opacity: currentChantData.today === 0 ? 0.6 : 1,
                zIndex: 10,
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentChantData.today > 0) {
                  e.currentTarget.style.backgroundColor = '#e55a5a'
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentChantData.today > 0) {
                  e.currentTarget.style.backgroundColor = '#ff6b6b'
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              🗑️ 清除今日
            </button>

            {/* 清除總計按鈕 */}
            <button 
              onClick={clearTotal}
              disabled={currentChantData.total === 0}
              className="w-full sm:w-auto"
              style={{
                backgroundColor: currentChantData.total === 0 ? '#95a5a6' : '#8e44ad',
                color: 'white',
                padding: '14px 28px',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: currentChantData.total === 0 ? 'not-allowed' : 'pointer',
                opacity: currentChantData.total === 0 ? 0.6 : 1,
                zIndex: 10,
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentChantData.total > 0) {
                  e.currentTarget.style.backgroundColor = '#7d3c98'
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentChantData.total > 0) {
                  e.currentTarget.style.backgroundColor = '#8e44ad'
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              ❌ 清除總計
            </button>
          </div>
        </Card>

        {/* 經文管理卡片 */}
        <Card className="card rounded-2xl shadow-md p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center">🛠️ 經文管理</h2>
          
          {/* 訊息顯示區域 */}
          {message && (
            <div className={`text-center p-3 rounded-lg font-semibold ${
              message.includes('成功') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* 新增經文 */}
          <div className="space-y-6">
            <Label htmlFor="newChant" className="font-bold" style={{ fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem' }}>➕ 新增經文</Label>
            <textarea 
              id="newChant" 
              placeholder="輸入新經文名稱…" 
              className="w-full p-3 sm:p-4 rounded-md border border-gray-300 resize-none"
              style={{ 
                fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem', 
                minHeight: '48px',
                maxHeight: '120px',
                width: '100%', 
                maxWidth: '100%',
                lineHeight: '1.5'
              }}
              value={newChantName}
              onChange={(e) => setNewChantName(e.target.value)}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button 
              onClick={addChant}
              className="w-full"
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                padding: '16px 24px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                zIndex: 10,
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2980b9'
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3498db'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
              }}
            >
              新增
            </button>
          </div>

          {/* 修改經文 */}
          <div className="space-y-8">
            <Label htmlFor="renameChant" className="font-bold" style={{ fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem' }}>✏️ 修改經文</Label>
            <textarea 
              id="renameChant" 
              placeholder="輸入新名稱…" 
              className="w-full p-3 sm:p-4 rounded-md border border-gray-300 resize-none"
              style={{ 
                fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem', 
                minHeight: '48px',
                maxHeight: '120px',
                width: '100%', 
                maxWidth: '100%',
                lineHeight: '1.5'
              }}
              value={renameChantName}
              onChange={(e) => setRenameChantName(e.target.value)}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button 
              onClick={renameChant}
              className="w-full"
              style={{
                backgroundColor: '#f39c12',
                color: 'white',
                padding: '16px 24px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                zIndex: 10,
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e67e22'
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f39c12'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
              }}
            >
              重新命名
            </button>
          </div>

          {/* 刪除經文 */}
          <div className="space-y-6">
            <Label className="font-bold" style={{ fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem' }}>❌ 刪除目前經文</Label>
            <button 
              onClick={deleteChant}
              className="w-full"
              style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                padding: '16px 24px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c0392b'
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#e74c3c'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
              }}
            >
              刪除「{selectedChant}」
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChantCounter;
