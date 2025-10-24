import { useState, useEffect } from 'react';
import { useWakeLock } from 'react-screen-wake-lock';
import IconButton from '../components/ui/IconButton';
import HeaderBar from '../components/HeaderBar';
import ModuleDropdown from '../components/ModuleDropdown';
import { FocusItem, FocusItemWithCount } from '../types/FocusItem';
import { PomodoroRecord } from '../types/PomodoroRecord';
import { 
  getFocusItemsWithCount, 
  addFocusItem, 
  updateFocusItem, 
  deleteFocusItem, 
  recordFocusItemUsage,
  initializeDefaultFocusItems 
} from '../services/focusItemService';
import { exportPomodoroRecordsToCSVWithCapacitor } from '../services/capacitorCsvExportService';
import { getNotificationSettings } from '../utils/notificationUtils';

// 導入新創建的組件
import CircularTimer from '../components/Pomodoro/CircularTimer';
import FocusItemSelector from '../components/Pomodoro/FocusItemSelector';
import TimeSettings from '../components/Pomodoro/TimeSettings';
import WeeklyStats from '../components/Pomodoro/WeeklyStats';
import RecordsList from '../components/Pomodoro/RecordsList';
import SearchRecords from '../components/Pomodoro/SearchRecords';
import FocusItemModal from '../components/Pomodoro/FocusItemModal';

const PomodoroPage = () => {
  // 防止螢幕休眠
  const { isSupported, released, request, release } = useWakeLock({
    onError: (err) => console.error('防止螢幕休眠失敗:', err),
    onRequest: () => console.log('螢幕已鎖定，防止休眠'),
    onRelease: () => console.log('螢幕休眠已恢復'),
  });

  // 計時器狀態 - 從 localStorage 讀取預設值
  const getInitialWorkMinutes = () => {
    const saved = localStorage.getItem('pomodoroWorkMinutes');
    return saved ? parseInt(saved, 10) : 25;
  };
  
  const getInitialBreakMinutes = () => {
    const saved = localStorage.getItem('pomodoroBreakMinutes');
    return saved ? parseInt(saved, 10) : 5;
  };

  const [workMinutes, setWorkMinutes] = useState(getInitialWorkMinutes);
  const [breakMinutes, setBreakMinutes] = useState(getInitialBreakMinutes);
  const [timeLeft, setTimeLeft] = useState(getInitialWorkMinutes() * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // 專注項目狀態
  const [focusItems, setFocusItems] = useState<FocusItemWithCount[]>([]);
  const [selectedFocusItemId, setSelectedFocusItemId] = useState<string>('');
  const [showFocusItemModal, setShowFocusItemModal] = useState(false);
  const [newFocusItemName, setNewFocusItemName] = useState('');
  const [editingFocusItem, setEditingFocusItem] = useState<FocusItem | null>(null);
  const [editingFocusItemName, setEditingFocusItemName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  // 記錄狀態
  const [records, setRecords] = useState<PomodoroRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PomodoroRecord[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PomodoroRecord | null>(null);
  const [editingRecordFocusItemId, setEditingRecordFocusItemId] = useState<string>('');
  const [editFocusDropdownOpen, setEditFocusDropdownOpen] = useState(false);
  const [editingRecordDescription, setEditingRecordDescription] = useState('');

  // 搜尋狀態
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFields, setSearchFields] = useState({
    focusItem: true,
    description: true,
    time: true
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
  
  // 新增日期搜尋狀態
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 匯出狀態
  const [exportStatus, setExportStatus] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    message: ''
  });

  // 響應式狀態
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 記錄顯示控制狀態
  const [displayCount, setDisplayCount] = useState(5); // 預設顯示5筆

  // 初始化
  useEffect(() => {
    initializeDefaultFocusItems();
    loadFocusItems();
    loadRecords();
    loadSearchHistory();
    
    // 設定預設日期為今天
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 組件卸載時釋放防止螢幕休眠
    return () => {
      window.removeEventListener('resize', handleResize);
      if (isSupported && !released) {
        release().catch(error => console.error('組件卸載時無法釋放防止螢幕休眠:', error));
      }
    };
  }, []);

  // 當工作時間設定改變時，更新計時器（僅在非運行狀態且非休息狀態）
  useEffect(() => {
    if (!isRunning && !isBreak) {
      setTimeLeft(workMinutes * 60);
      // 儲存到 localStorage
      localStorage.setItem('pomodoroWorkMinutes', workMinutes.toString());
    }
  }, [workMinutes]);

  // 當休息時間設定改變時，儲存到 localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroBreakMinutes', breakMinutes.toString());
  }, [breakMinutes]);

  // 載入更多記錄
  const _handleLoadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  // 載入專注項目
  const loadFocusItems = async () => {
    try {
      const items = await getFocusItemsWithCount();
      setFocusItems(items);
      if (items.length > 0 && !selectedFocusItemId) {
        setSelectedFocusItemId(items[0].id);
      }
    } catch (error) {
      console.error('載入專注項目失敗:', error);
    }
  };

  // 載入記錄
  const loadRecords = () => {
    try {
      const savedRecords = localStorage.getItem('pomodoroRecords');
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords);
        setRecords(parsedRecords);
        setFilteredRecords(parsedRecords);
      }
    } catch (error) {
      console.error('載入記錄失敗:', error);
    }
  };

  // 載入搜尋歷史
  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem('pomodoroSearchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('載入搜尋歷史失敗:', error);
    }
  };

  // 防止螢幕休眠控制函數
  const releaseWakeLock = async () => {
    if (isSupported && !released) {
      try {
        await release();
      } catch (error) {
        console.error('無法關閉防止螢幕休眠:', error);
      }
    }
  };

  // 播放音效和發送通知
  const playNotificationSound = (type: 'work' | 'break') => {
    const settings = getNotificationSettings();
    
    // 檢查是否啟用通知
    if (!settings.enabled) return;
    
    // 檢查特定類型的通知設定
    if (type === 'work' && !settings.workNotification) return;
    if (type === 'break' && !settings.breakNotification) return;
    
    // 播放音效
    try {
      const audio = new Audio(`/sounds/${settings.sound}`);
      audio.volume = 0.8; // 設定音量
      audio.play().catch(err => {
        console.error('播放音效失敗:', err);
      });
    } catch (error) {
      console.error('音效播放錯誤:', error);
    }
    
    // 發送瀏覽器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = type === 'work' ? '番茄鐘工作時間結束！' : '休息時間結束！';
      const body = type === 'work' ? '恭喜完成一個番茄鐘！可以開始休息了。' : '休息時間結束，準備開始下一個工作時段。';
      
      try {
        new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } catch (error) {
        console.error('發送通知失敗:', error);
      }
    }
  };

  // 計時器邏輯
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // 時間到，切換到休息或工作時間
      if (isBreak) {
        // 休息結束，回到工作時間
        setIsBreak(false);
        setTimeLeft(workMinutes * 60);
        setIsRunning(false);
        // 播放休息結束通知
        playNotificationSound('break');
        // 關閉防止螢幕休眠
        releaseWakeLock();
      } else {
        // 工作結束，開始休息
        // 播放工作結束通知
        playNotificationSound('work');
        
        if (breakMinutes <= 0) {
          // 無休息：直接重置到下一輪工作並停下等待使用者開始
          setIsBreak(false);
          setTimeLeft(workMinutes * 60);
          setIsRunning(false);
          // 關閉防止螢幕休眠
          releaseWakeLock();
        } else {
          setIsBreak(true);
          setTimeLeft(breakMinutes * 60);
          // 自動開始休息計時
          setIsRunning(true);
          // 繼續保持防止螢幕休眠狀態
        }
        
        // 記錄完成的工作時段
        if (selectedFocusItemId) {
          const newRecord: PomodoroRecord = {
            id: Date.now().toString(),
            completedAt: new Date().toISOString(),
            workMinutes: workMinutes,
            breakMinutes: breakMinutes,
            focusItemId: selectedFocusItemId,
            description: ''
          };
          
          const updatedRecords = [newRecord, ...records];
          setRecords(updatedRecords);
          localStorage.setItem('pomodoroRecords', JSON.stringify(updatedRecords));
          
          // 如果搜尋處於活動狀態，重新執行搜尋
          if (isSearchActive) {
            // 暫時清除搜尋狀態，然後重新執行搜尋
            const currentKeyword = searchKeyword;
            const currentSearchFields = searchFields;
            
            // 更新記錄後重新搜尋
            setTimeout(() => {
              setSearchKeyword(currentKeyword);
              setSearchFields(currentSearchFields);
              handleSearch();
            }, 100);
          } else {
            setFilteredRecords(updatedRecords);
          }
          
          // 記錄使用次數
          recordFocusItemUsage(selectedFocusItemId);
          loadFocusItems(); // 重新載入以更新使用次數
        }
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, workMinutes, breakMinutes, selectedFocusItemId, focusItems, records]);

  // 計時器控制函數
  const startTimer = async () => {
    setIsRunning(true);
    // 啟用防止螢幕休眠
    if (isSupported) {
      try {
        await request();
      } catch (error) {
        console.error('無法啟用防止螢幕休眠:', error);
      }
    }
  };

  const pauseTimer = async () => {
    setIsRunning(false);
    // 關閉防止螢幕休眠
    await releaseWakeLock();
  };

  const _resetTimer = async () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    // 關閉防止螢幕休眠
    await releaseWakeLock();
  };

  // 提早結束當前階段
  const skipCurrentPhase = async () => {
    // 顯示確認彈窗
    if (!confirm("確定要提前結束這一輪嗎？")) {
      return; // 使用者取消，不執行任何操作
    }
    
    // 1. 停止當前計時器（setInterval 會透過 useEffect 的清理函數自動清除）
    setIsRunning(false);
    
    // 2. 切換工作/休息階段
    setIsBreak(!isBreak);
    
    // 3. 根據當前狀態設定下個階段的預設時間
    if (isBreak) {
      // 如果現在是休息，切換到工作時間
      setTimeLeft(workMinutes * 60);
    } else {
      // 如果現在是工作，切換到休息時間
      setTimeLeft(breakMinutes * 60);
    }
    
    // 4. 確保不會自動繼續倒數
    setIsRunning(false);
    
    // 5. 關閉防止螢幕休眠
    await releaseWakeLock();
  };

  // 專注項目管理
  const handleAddFocusItem = async () => {
    if (!newFocusItemName.trim()) return;
    
    try {
      addFocusItem(newFocusItemName.trim());
      setNewFocusItemName('');
      setSelectedColor('#3b82f6');
      await loadFocusItems();
    } catch (error) {
      console.error('新增專注項目失敗:', error);
    }
  };

  const handleUpdateFocusItem = async () => {
    if (!editingFocusItem || !editingFocusItemName.trim()) return;
    
    try {
      updateFocusItem(editingFocusItem.id, editingFocusItemName.trim());
      setEditingFocusItem(null);
      setEditingFocusItemName('');
      await loadFocusItems();
    } catch (error) {
      console.error('更新專注項目失敗:', error);
    }
  };

  const handleDeleteFocusItem = async (id: string) => {
    try {
      deleteFocusItem(id);
      await loadFocusItems();
      
      // 如果刪除的是當前選中的項目，選擇第一個項目
      if (selectedFocusItemId === id && focusItems.length > 1) {
        const remainingItems = focusItems.filter(item => item.id !== id);
        if (remainingItems.length > 0) {
          setSelectedFocusItemId(remainingItems[0].id);
        }
      }
    } catch (error) {
      console.error('刪除專注項目失敗:', error);
    }
  };

  // 記錄管理
  const handleEditRecord = (record: PomodoroRecord) => {
    setEditingRecord(record);
    setEditingRecordFocusItemId(record.focusItemId || '');
    setEditingRecordDescription(record.description || '');
  };

  const handleSaveRecordEdit = () => {
    if (!editingRecord) return;
    
    const updatedRecords = records.map(record => 
      record.id === editingRecord.id 
        ? {
            ...record,
            focusItemId: editingRecordFocusItemId,
            description: editingRecordDescription
          }
        : record
    );
    
    setRecords(updatedRecords);
    localStorage.setItem('pomodoroRecords', JSON.stringify(updatedRecords));
    
    // 如果搜尋處於活動狀態，重新執行搜尋
    if (isSearchActive) {
      const currentKeyword = searchKeyword;
      const currentSearchFields = searchFields;
      setTimeout(() => {
        setSearchKeyword(currentKeyword);
        setSearchFields(currentSearchFields);
        handleSearch();
      }, 100);
    } else {
      setFilteredRecords(updatedRecords);
    }
    
    setEditingRecord(null);
    setEditingRecordFocusItemId('');
    setEditingRecordDescription('');
  };

  const handleDeleteRecord = (recordId: string) => {
    const updatedRecords = records.filter(record => record.id !== recordId);
    setRecords(updatedRecords);
    localStorage.setItem('pomodoroRecords', JSON.stringify(updatedRecords));
    
    // 如果搜尋處於活動狀態，重新執行搜尋
    if (isSearchActive) {
      const currentKeyword = searchKeyword;
      const currentSearchFields = searchFields;
      setTimeout(() => {
        setSearchKeyword(currentKeyword);
        setSearchFields(currentSearchFields);
        handleSearch();
      }, 100);
    } else {
      setFilteredRecords(updatedRecords);
    }
  };

  // 搜尋功能
  const handleSearch = () => {
    // 檢查日期條件
    if (startDate && endDate && endDate < startDate) {
      alert('結束日期不能早於開始日期！請檢查日期設定。');
      return;
    }
    
    setIsSearching(true);
    // 使用搜尋時重置顯示數量，顯示所有搜尋結果
    setDisplayCount(records.length);
    
    try {
      let filtered = [...records];
      
      // 關鍵字搜尋 - 只有當有關鍵字時才執行
      if (searchKeyword.trim()) {
        const keyword = searchKeyword.trim().toLowerCase();
        filtered = filtered.filter(record => {
          const matches: boolean[] = [];
          
          // 搜尋專注項目名稱 - 只有當專注項目搜尋欄位被勾選時才執行
          if (searchFields.focusItem) {
            const focusItem = focusItems.find(item => item.id === record.focusItemId);
            if (focusItem && focusItem.name.toLowerCase().includes(keyword)) {
              matches.push(true);
            }
          }
          
          // 搜尋描述內容 - 只有當描述搜尋欄位被勾選時才執行
          if (searchFields.description && record.description) {
            if (record.description.toLowerCase().includes(keyword)) {
              matches.push(true);
            }
          }
          
          // 搜尋時間 - 只有當時間搜尋欄位被勾選時才執行
          if (searchFields.time) {
            const dateTime = new Date(record.completedAt).toLocaleString('zh-TW');
            if (dateTime.toLowerCase().includes(keyword)) {
              matches.push(true);
            }
          }
          
          // 如果至少有一個勾選的欄位匹配，則返回 true
          return matches.length > 0;
        });
      }
      
      // 日期範圍篩選
      if (startDate || endDate) {
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.completedAt);
          const recordDateStr = recordDate.toISOString().split('T')[0];
          let matchesDate = true;
          
          if (startDate) {
            matchesDate = matchesDate && recordDateStr >= startDate;
          }
          if (endDate) {
            matchesDate = matchesDate && recordDateStr <= endDate;
          }
          
          return matchesDate;
        });
      }
      
      // 檢查是否有任何有效的搜尋條件
      const hasValidSearchConditions = searchKeyword.trim() || startDate || endDate;
      
      // 如果沒有任何搜尋條件，顯示所有記錄
      if (!hasValidSearchConditions) {
        filtered = [...records];
      }
      
      setFilteredRecords(filtered);
      setIsSearchActive(true);
      
      // 保存搜尋歷史
      if (searchKeyword.trim() && !searchHistory.includes(searchKeyword.trim())) {
        const newHistory = [searchKeyword.trim(), ...searchHistory].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('pomodoroSearchHistory', JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error('搜尋失敗:', error);
    } finally {
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  const handleClearSearch = () => {
    // 清除搜尋條件
    setSearchKeyword('');
    setStartDate('');
    setEndDate('');
    setFilteredRecords(records);
    setIsSearchActive(false);
    setShowSuggestions(false);
    // 重置為預設顯示5筆
    setDisplayCount(5);
  };

  // 匯出功能
  const handleExportRecords = async () => {
    try {
      // 決定要匯出的記錄：如果搜尋處於活動狀態，匯出搜尋結果；否則匯出當前顯示的記錄
      let recordsToExport: PomodoroRecord[];
      if (isSearchActive) {
        // 搜尋狀態：匯出所有搜尋結果
        recordsToExport = filteredRecords;
      } else {
        // 預設狀態：匯出當前顯示的記錄（預設5筆或更多）
        recordsToExport = records.slice(0, displayCount);
      }
      
      const result = await exportPomodoroRecordsToCSVWithCapacitor(
        recordsToExport, 
        focusItems, 
        isSearchActive, 
        searchKeyword
      );
      
      if (result.success) {
        setExportStatus({
          show: true,
          type: 'success',
          message: result.message
        });
        
        // 顯示 alert 提示使用者檔案已儲存
        alert(result.message);
        
        setTimeout(() => {
          setExportStatus(prev => ({ ...prev, show: false }));
        }, 5000); // 延長顯示時間，因為訊息較長
      } else {
        setExportStatus({
          show: true,
          type: 'error',
          message: result.message
        });
        setTimeout(() => {
          setExportStatus(prev => ({ ...prev, show: false }));
        }, 3000);
      }
    } catch (error) {
      console.error('匯出失敗:', error);
      setExportStatus({
        show: true,
        type: 'error',
        message: '匯出失敗，請稍後再試'
      });
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // 計算每週統計
  const getWeeklyStats = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyData = [];
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayRecords = records.filter(record => {
        const recordDate = new Date(record.completedAt);
        return recordDate.toDateString() === date.toDateString();
      });
      
      weeklyData.push({
        day: days[i],
        count: dayRecords.length
      });
    }
    
    const totalCount = weeklyData.reduce((sum, day) => sum + day.count, 0);
    
    return { weeklyData, totalCount };
  };

  const { weeklyData, totalCount } = getWeeklyStats();
  const selectedFocusItem = focusItems.find(item => item.id === selectedFocusItemId);
  const timerColor = selectedFocusItem?.color || '#4ecdc4';

  // 保留未來使用的函式，避免 TS6133（不改變任何行為）
  void _handleLoadMore;
  void _resetTimer;

  return (
    <div className="responsive-container bg-gray-50 min-h-screen flex flex-col">
      <main className="flex-1">
        {/* 模組選擇下拉選單 */}
        <ModuleDropdown />
        
        {/* 頁面標題 */}
        <HeaderBar icon="🍅" title="番茄鐘" />
      
      {/* 圓形計時器 */}
      <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
        <CircularTimer
          timeLeft={timeLeft}
          totalSeconds={isBreak ? breakMinutes * 60 : workMinutes * 60}
          timerColor={timerColor}
          isRunning={isRunning}
          isBreak={isBreak}
        />
      </div>

      {/* 專注項目選擇器 */}
      <FocusItemSelector
        focusItems={focusItems}
        selectedFocusItemId={selectedFocusItemId}
        onFocusItemChange={setSelectedFocusItemId}
      />

      {/* 時間設定與控制 */}
      <TimeSettings
        workMinutes={workMinutes}
        breakMinutes={breakMinutes}
        onWorkMinutesChange={setWorkMinutes}
        onBreakMinutesChange={setBreakMinutes}
        onStart={startTimer}
        onPause={pauseTimer}
        onSkip={skipCurrentPhase}
        isRunning={isRunning}
      />

      {/* 每週統計 */}
      <WeeklyStats
        weeklyData={weeklyData}
        totalCount={totalCount}
      />

      {/* 搜尋記錄 */}
      <SearchRecords
        searchKeyword={searchKeyword}
        onSearchKeywordChange={setSearchKeyword}
        searchFields={searchFields}
        onSearchFieldsChange={setSearchFields}
        searchHistory={searchHistory}
        showSuggestions={showSuggestions}
        onShowSuggestionsChange={setShowSuggestions}
        isSearchInputFocused={isSearchInputFocused}
        onIsSearchInputFocusedChange={setIsSearchInputFocused}
        focusItems={focusItems}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        isSearching={isSearching}
        isMobile={isMobile}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      {/* 記錄列表 */}
      <RecordsList
        records={isSearchActive ? filteredRecords : records.slice(0, displayCount)}
        focusItems={focusItems}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
        onExportRecords={handleExportRecords}
        exportStatus={exportStatus}
        isSearchActive={isSearchActive}
        searchKeyword={searchKeyword}
        totalRecords={records.length}
        showAllRecords={displayCount >= records.length}
      />

      {/* 專注項目管理彈窗 */}
      <FocusItemModal
        show={showFocusItemModal}
        onClose={() => setShowFocusItemModal(false)}
        focusItems={focusItems}
        newFocusItemName={newFocusItemName}
        onNewFocusItemNameChange={setNewFocusItemName}
        onAddFocusItem={handleAddFocusItem}
        editingFocusItem={editingFocusItem}
        editingFocusItemName={editingFocusItemName}
        onEditingFocusItemNameChange={setEditingFocusItemName}
        onSaveEdit={handleUpdateFocusItem}
        onCancelEdit={() => {
          setEditingFocusItem(null);
          setEditingFocusItemName('');
        }}
        onDeleteFocusItem={handleDeleteFocusItem}
        selectedColor={selectedColor}
        onSelectedColorChange={setSelectedColor}
      />

      {/* 編輯記錄彈窗 */}
      {editingRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333'
            }}>編輯記錄</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#555'
              }}>專注項目：</label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setEditFocusDropdownOpen(v => !v)}
                  className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                >
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full border border-black/5" 
                      style={{ backgroundColor: (focusItems.find(i => i.id === editingRecordFocusItemId)?.color) || '#3b82f6' }}
                    />
                    <span className="text-gray-800">
                      {focusItems.find(i => i.id === editingRecordFocusItemId)?.name || '—'}
                    </span>
                  </span>
                  <svg 
                    className={`h-4 w-4 text-gray-500 transition-transform ${editFocusDropdownOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
                
                {editFocusDropdownOpen && (
                  <div 
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
                    style={{ position: 'absolute', zIndex: 10 }}
                  >
                    {focusItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setEditingRecordFocusItemId(item.id);
                          setEditFocusDropdownOpen(false);
                        }}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-black/5" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-800">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#555'
              }}>描述：</label>
              <textarea
                value={editingRecordDescription}
                onChange={(e) => setEditingRecordDescription(e.target.value)}
                placeholder="輸入描述..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  outline: 'none',
                  minHeight: '80px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <IconButton
                icon="❌"
                label="取消"
                onClick={() => {
                  setEditingRecord(null);
                  setEditingRecordFocusItemId('');
                  setEditingRecordDescription('');
                }}
                variant="secondary"
                className="px-5 py-2 text-sm"
              />
              <IconButton
                icon="💾"
                label="儲存"
                onClick={handleSaveRecordEdit}
                variant="primary"
                className="px-5 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default PomodoroPage;