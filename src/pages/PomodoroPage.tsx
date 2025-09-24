import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { exportPomodoroRecordsToCSV, hasRecordsToExport } from '../services/csvExportService';

// 導入新創建的組件
import CircularTimer from '../components/Pomodoro/CircularTimer';
import FocusItemSelector from '../components/Pomodoro/FocusItemSelector';
import TimeSettings from '../components/Pomodoro/TimeSettings';
import WeeklyStats from '../components/Pomodoro/WeeklyStats';
import RecordsList from '../components/Pomodoro/RecordsList';
import SearchRecords from '../components/Pomodoro/SearchRecords';
import FocusItemModal from '../components/Pomodoro/FocusItemModal';

const PomodoroPage = () => {
  // 計時器狀態
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
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
  const [editingRecord, setEditingRecord] = useState<PomodoroRecord | null>(null);
  const [editingRecordFocusItemId, setEditingRecordFocusItemId] = useState<string>('');
  const [editingRecordDescription, setEditingRecordDescription] = useState('');

  // 搜尋狀態
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFields, setSearchFields] = useState({
    focusItem: true,
    description: true,
    time: true
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);

  // 匯出狀態
  const [exportStatus, setExportStatus] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    message: ''
  });

  // 響應式狀態
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 初始化
  useEffect(() => {
    initializeDefaultFocusItems();
    loadFocusItems();
    loadRecords();
    loadSearchHistory();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        setRecords(JSON.parse(savedRecords));
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
      } else {
        // 工作結束，開始休息
        if (breakMinutes <= 0) {
          // 無休息：直接重置到下一輪工作並停下等待使用者開始
          setIsBreak(false);
          setTimeLeft(workMinutes * 60);
          setIsRunning(false);
        } else {
          setIsBreak(true);
          setTimeLeft(breakMinutes * 60);
          // 自動開始休息計時
          setIsRunning(true);
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
          
          // 記錄使用次數
          recordFocusItemUsage(selectedFocusItemId);
          loadFocusItems(); // 重新載入以更新使用次數
        }
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, workMinutes, breakMinutes, selectedFocusItemId, focusItems, records]);

  // 計時器控制函數
  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
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
    setEditingRecord(null);
    setEditingRecordFocusItemId('');
    setEditingRecordDescription('');
  };

  const handleDeleteRecord = (recordId: string) => {
    const updatedRecords = records.filter(record => record.id !== recordId);
    setRecords(updatedRecords);
    localStorage.setItem('pomodoroRecords', JSON.stringify(updatedRecords));
  };

  // 搜尋功能
  const handleSearch = () => {
    setIsSearching(true);
    // 這裡可以實現搜尋邏輯
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleClearSearch = () => {
    // 僅清除關鍵字與建議，不改動使用者已選日期
    setSearchKeyword('');
  };

  // 匯出功能
  const handleExportRecords = async () => {
    try {
      if (!hasRecordsToExport(records)) {
        setExportStatus({
          show: true,
          type: 'error',
          message: '沒有記錄可以匯出'
        });
        return;
      }

      await exportPomodoroRecordsToCSV(records);
      setExportStatus({
        show: true,
        type: 'success',
        message: '記錄已成功匯出'
      });
      
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, show: false }));
      }, 3000);
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

  return (
    <div className="page bg-white text-black dark:bg-gray-900 dark:text-gray-100" style={{ paddingTop: '8px', backgroundColor: '#ffffff', color: '#213547' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <h1 style={{ color: '#213547', margin: 0 }} className="dark:text-gray-100">🍅 番茄鐘計時器</h1>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            color: '#213547',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          🏠 回首頁
        </Link>
      </div>
      
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

      {/* 時間設定 */}
      <TimeSettings
        workMinutes={workMinutes}
        breakMinutes={breakMinutes}
        onWorkMinutesChange={setWorkMinutes}
        onBreakMinutesChange={setBreakMinutes}
        onStart={startTimer}
        onPause={pauseTimer}
        onReset={resetTimer}
        isRunning={isRunning}
        isMobile={isMobile}
      />

      {/* 每週統計 */}
      <WeeklyStats
        weeklyData={weeklyData}
        totalCount={totalCount}
      />

      {/* 搜尋功能 */}
      <SearchRecords
        searchKeyword={searchKeyword}
        onSearchKeywordChange={setSearchKeyword}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
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
      />

      {/* 完成記錄列表 */}
      <RecordsList
        records={records}
        focusItems={focusItems}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
        onExportRecords={handleExportRecords}
        exportStatus={exportStatus}
      />

      {/* 專注項目管理模態框 */}
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

      {/* 記錄編輯模態框 */}
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
            }}>
              編輯記錄
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#555'
              }}>
                專注項目：
              </label>
              <select
                value={editingRecordFocusItemId}
                onChange={(e) => setEditingRecordFocusItemId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {focusItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#555'
              }}>
                描述：
              </label>
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
              <button
                onClick={() => {
                  setEditingRecord(null);
                  setEditingRecordFocusItemId('');
                  setEditingRecordDescription('');
                }}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '2px solid #6c757d',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: '#6c757d'
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveRecordEdit}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: '#4ecdc4',
                  color: 'white'
                }}
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 固定按鈕已移至標題列右側 */}
          </div>
  );
};

export default PomodoroPage;
