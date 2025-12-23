import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Link } from 'react-router-dom';
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

// 導入新創建的組件
import FocusItemSelector from '../components/Pomodoro/FocusItemSelector.tsx';
import TimeSettings from '../components/Pomodoro/TimeSettings.tsx';
import WeeklyStats from '../components/Pomodoro/WeeklyStats';
import RecordsList from '../components/Pomodoro/RecordsList';
import SearchRecords from '../components/Pomodoro/SearchRecords';
import FocusItemModal from '../components/Pomodoro/FocusItemModal';
import TimerPanel from './Pomodoro/components/TimerPanel';
import { usePomodoroTimer } from './Pomodoro/hooks/usePomodoroTimer';
import { trackToolClick } from '../hooks/useGATracker';
import './PomodoroPage.css';

const PomodoroPage = () => {
  const { t } = useTranslation();
  const isEnglish = !i18n.language.startsWith("zh");
  
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

  // 專注完成提示狀態
  const [showCompletionTip, setShowCompletionTip] = useState(false)

  // 15秒後自動關閉完成提示
  useEffect(() => {
    if (showCompletionTip) {
      const timer = setTimeout(() => {
        setShowCompletionTip(false)
      }, 15000) // 15秒
      return () => clearTimeout(timer)
    }
  }, [showCompletionTip])

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
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  // 處理工作階段完成（記錄完成的工作時段）
  const handleWorkSessionComplete = () => {
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
      
      // 顯示專注完成提示（非強制，會自動消失）
      setShowCompletionTip(true);
    }
  };

  // 使用 Pomodoro Timer Hook
  const timer = usePomodoroTimer({
    workMinutes,
    breakMinutes,
    onWorkSessionComplete: handleWorkSessionComplete
  });

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
      alert(t('date_range_error'));
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
      
      // 日期範圍篩選（僅在「完成時間」勾選時啟用）
      if (searchFields.time && (startDate || endDate)) {
        filtered = filtered.filter(record => {
          // 將記錄日期轉換為本地時間的日期字符串（YYYY-MM-DD）
          const recordDate = new Date(record.completedAt);
          const year = recordDate.getFullYear();
          const month = String(recordDate.getMonth() + 1).padStart(2, '0');
          const day = String(recordDate.getDate()).padStart(2, '0');
          const recordDateStr = `${year}-${month}-${day}`;
          
          let matchesDate = true;
          
          if (startDate) {
            // 確保日期字符串格式一致（YYYY-MM-DD）
            matchesDate = matchesDate && recordDateStr >= startDate;
          }
          if (endDate) {
            // 確保日期字符串格式一致（YYYY-MM-DD）
            matchesDate = matchesDate && recordDateStr <= endDate;
          }
          
          return matchesDate;
        });
      }
      
      // 檢查是否有任何有效的搜尋條件
      const hasValidSearchConditions =
        searchKeyword.trim() || (searchFields.time && (startDate || endDate));
      
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
    // 將日期重置為「今天」，避免畫面顯示今天但狀態為空造成過濾失效
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setStartDate(todayStr);
    setEndDate(todayStr);
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
        message: t('export_failed_try_later')
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
    const days = [
      t('weekday_sun'),
      t('weekday_mon'),
      t('weekday_tue'),
      t('weekday_wed'),
      t('weekday_thu'),
      t('weekday_fri'),
      t('weekday_sat')
    ];
    
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

  // 獲取翻譯後的專注項目名稱
  const getFocusItemDisplayName = (name: string) => {
    const defaultFocusItemNames = ['讀書', '寫作', '工作', '運動', '冥想', '抄經'];
    if (defaultFocusItemNames.includes(name)) {
      const translationKey = `focus_items_list.${name}`;
      const translated = t(translationKey);
      // 如果翻譯返回的是對象或與鍵相同，則使用原始名稱
      if (typeof translated === 'string' && translated !== translationKey) {
        return translated;
      }
      return name;
    }
    // 對於自定義專注項目，使用原始名稱
    return name;
  };

  // 保留未來使用的函式，避免 TS6133（不改變任何行為）
  void _handleLoadMore;

  return (
    <div 
      className="bg-gray-50 min-h-screen flex flex-col"
      style={{
        background: `
          radial-gradient(at 30% 20%, rgba(255, 240, 255, 0.6) 0%, transparent 60%),
          radial-gradient(at 80% 80%, rgba(180, 230, 255, 0.5) 0%, transparent 70%),
          linear-gradient(180deg, #D9F3FF 0%, #F7FBFE 100%)
        `,
        minHeight: "100vh",
        paddingBottom: "80px"
      }}
    >
      <main className="flex-1 max-w-screen-md mx-auto px-4 w-full">
        {/* 模組選擇下拉選單 */}
        <ModuleDropdown />
        
        {/* 頁面標題 */}
        <HeaderBar icon="🍅" title="pomodoro" />
        
        {/* 工具導流列 */}
        <div className="mb-4 text-center">
          <p className="text-gray-600 text-sm mb-2">專注中也可以搭配使用：</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/summary"
              className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-full border border-blue-200 transition-all duration-200 text-sm"
              onClick={() => trackToolClick({ tool_name: 'ai_summary', page_name: 'pomodoro', position: 'header_tools' })}
            >
              <span className="mr-1">🤖</span>
              AI 摘要工具
            </Link>
            <Link
              to="/todo"
              className="inline-flex items-center px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-full border border-green-200 transition-all duration-200 text-sm"
              onClick={() => trackToolClick({ tool_name: 'todo_list', page_name: 'pomodoro', position: 'header_tools' })}
            >
              <span className="mr-1">📝</span>
              待辦清單
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-full border border-purple-200 transition-all duration-200 text-sm"
              onClick={() => trackToolClick({ tool_name: 'focus_guide', page_name: 'pomodoro', position: 'header_tools' })}
            >
              <span className="mr-1">🎯</span>
              專注力教學
            </Link>
          </div>
        </div>

        {/* 專注完成提示（非強制，inline 區塊） */}
        {showCompletionTip && (
          <div className="mb-4 p-5 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-200 shadow-sm animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  🎉 專注完成！要不要把剛剛的內容整理一下？
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/summary"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => {
                      trackToolClick({ tool_name: 'ai_summary', page_name: 'pomodoro', position: 'timer_complete' })
                      setShowCompletionTip(false)
                    }}
                  >
                    1️⃣ 用 AI 摘要整理內容
                  </Link>
                  <Link
                    to="/tools/homework-helper"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => setShowCompletionTip(false)}
                  >
                    2️⃣ 我有題目要問
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setShowCompletionTip(false)}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors flex-shrink-0"
                aria-label="關閉提示"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      
      {/* 計時器面板 */}
      <TimerPanel
        timeLeft={timer.timeLeft}
        isRunning={timer.isRunning}
        isBreak={timer.isBreak}
        timerColor={timerColor}
        workMinutes={workMinutes}
        breakMinutes={breakMinutes}
        onStart={timer.startTimer}
        onPause={timer.pauseTimer}
        onReset={timer.resetTimer}
        onSkip={timer.endSession}
        onTimeInput={timer.handleTimeInput}
      />

      {/* 🚀 快速工具入口 */}
      <div className="mt-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="mr-2">🚀</span>
          快速工具入口
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 作業解題神器 */}
          <Link
            to="/tools/homework-helper"
            className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
          >
            <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
              作業解題神器
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              貼上題目，快速產生解題結果與扣點資訊。
            </p>
            <div className="text-blue-600 font-medium text-sm group-hover:underline">
              前往 →
            </div>
          </Link>

          {/* 文章摘要工具 */}
          <Link
            to="/summary"
            className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
          >
            <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
              文章摘要工具
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              貼上文章，一鍵摘要並顯示本次使用字數。
            </p>
            <div className="text-blue-600 font-medium text-sm group-hover:underline">
              前往 →
            </div>
          </Link>

          {/* Shopee 短影音工具 */}
          <div 
            className="block p-4 bg-white rounded-xl border border-gray-200 opacity-60 cursor-not-allowed" 
            style={{ 
              writingMode: 'horizontal-tb', 
              textOrientation: 'mixed',
              direction: 'ltr',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              whiteSpace: 'normal'
            }}
          >
            <h4 className="font-semibold text-gray-800 mb-2">
              Shopee 短影音工具
            </h4>
            <p className="text-sm font-medium text-amber-600 mb-2">
              🚧 即將開放（目前為功能規劃中）
            </p>
            <p className="text-sm text-gray-600 mb-3">
              自動化產生導購短影音，搭配分潤內容更有效。目前此工具尚未開放使用，請期待未來更新。
            </p>
            <div className="text-gray-400 font-medium text-sm">
              即將上線
            </div>
          </div>
        </div>
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
        onStart={timer.startTimer}
        onPause={timer.pauseTimer}
        onSkip={timer.endSession}
        isRunning={timer.isRunning}
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

      {/* 專注後延伸區塊 */}
      <div className="mt-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="mr-2">🌱</span>
          專注後，你還可以做這些事
        </h3>
        <div className="grid gap-3">
          {/* AI 摘要工具 */}
          <Link
            to="/summary"
            className="block p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            onClick={() => trackToolClick({ tool_name: 'ai_summary', page_name: 'pomodoro', position: 'after_focus_section' })}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                  AI 摘要工具
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  把專注內容快速整理成重點
                </p>
              </div>
              <span className="text-gray-300 group-hover:text-blue-400 transition-colors">
                →
              </span>
            </div>
          </Link>

          {/* 待辦清單 */}
          <Link
            to="/todo"
            className="block p-4 bg-white rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
            onClick={() => trackToolClick({ tool_name: 'todo_list', page_name: 'pomodoro', position: 'after_focus_section' })}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                  待辦清單
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  把剛剛想到的事記下來，避免忘記
                </p>
              </div>
              <span className="text-gray-300 group-hover:text-green-400 transition-colors">
                →
              </span>
            </div>
          </Link>

          {/* 專注力教學 */}
          <Link
            to="/blog"
            className="block p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
            onClick={() => trackToolClick({ tool_name: 'focus_guide', page_name: 'pomodoro', position: 'after_focus_section' })}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                  專注力教學
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  學習如何讓下一次專注更有效率
                </p>
              </div>
              <span className="text-gray-300 group-hover:text-purple-400 transition-colors">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* 🚀 快速 AI 工具導引 */}
      <div className="mt-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="mr-2">🚀</span>
          快速 AI 工具導引
        </h3>
        <div className="grid gap-3" style={{ writingMode: 'horizontal-tb', direction: 'ltr' }}>
          {/* 作業解題神器 */}
          <Link
            to="/tools/homework-helper"
            className="block p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                  作業解題神器
                </h4>
                <p className="text-sm text-gray-500">
                  遇到不會的題目，可以直接輸入題目取得解題與解釋。
                </p>
              </div>
              <div className="ml-4 px-4 py-2 bg-blue-600 group-hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200">
                前往
              </div>
            </div>
          </Link>

          {/* 文章摘要工具 */}
          <Link
            to="/summary"
            className="block p-4 bg-white rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors mb-1">
                  文章摘要工具
                </h4>
                <p className="text-sm text-gray-500">
                  貼上長文內容，快速產生摘要與關鍵字。
                </p>
              </div>
              <div className="ml-4 px-4 py-2 bg-green-600 group-hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200">
                前往
              </div>
            </div>
          </Link>
        </div>
      </div>

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
            }}>{t('todo_config.action.edit')} {t('todo_config.title')}</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#555'
              }}>{t('focus_item_colon')}</label>
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
                      {focusItems.find(i => i.id === editingRecordFocusItemId) 
                        ? getFocusItemDisplayName(focusItems.find(i => i.id === editingRecordFocusItemId)!.name)
                        : '—'}
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
                        <span className="text-gray-800">{getFocusItemDisplayName(item.name)}</span>
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
              }}>{t('todo_config.form.description')}:</label>
              <textarea
                value={editingRecordDescription}
                onChange={(e) => setEditingRecordDescription(e.target.value)}
                placeholder={t('todo_config.form.description_placeholder')}
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
                label={t('cancel')}
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
                label={t('save')}
                onClick={handleSaveRecordEdit}
                variant="primary"
                className="px-5 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 專注體驗延伸區塊（未來可擴充為聯盟連結） */}
      <div className="mt-8 mb-6 p-5 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border border-gray-200">
        <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center">
          <span className="mr-2">🔍</span>
          專注體驗延伸
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          以下是一些能幫助專注的工具與方法，依需求選擇即可。
        </p>
        
        <div className="space-y-3">
          {/* AI 摘要工具 - 內部連結 */}
          <Link
            to="/summary"
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group"
            data-affiliate-slot="focus-summary"
            onClick={() => trackToolClick({ tool_name: 'ai_summary', page_name: 'pomodoro', position: 'footer_extension' })}
          >
            <span className="text-xl">🤖</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                AI 摘要工具
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                將專注時間轉為可回顧的筆記
              </p>
            </div>
            <span className="text-gray-300 group-hover:text-blue-400 text-sm transition-colors">→</span>
          </Link>

          {/* 專注輔助工具 - 未來可替換為外部聯盟連結 */}
          <Link
            to="/blog"
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200 group"
            data-affiliate-slot="focus-audio"
            onClick={() => trackToolClick({ tool_name: 'focus_tool', page_name: 'pomodoro', position: 'footer_extension' })}
          >
            <span className="text-xl">🎧</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                專注輔助工具
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                有些人會搭配音樂或工具，讓環境更單純
              </p>
            </div>
            <span className="text-gray-300 group-hover:text-amber-400 text-sm transition-colors">→</span>
          </Link>

          {/* 專注力訓練 - 未來可替換為外部聯盟連結 */}
          <Link
            to="/blog"
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-200 group"
            data-affiliate-slot="focus-training"
            onClick={() => trackToolClick({ tool_name: 'focus_training', page_name: 'pomodoro', position: 'footer_extension' })}
          >
            <span className="text-xl">📚</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors">
                專注力訓練
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                學習提升長時間專注的技巧
              </p>
            </div>
            <span className="text-gray-300 group-hover:text-teal-400 text-sm transition-colors">→</span>
          </Link>
        </div>
      </div>

      {/* 🔧 延伸效率工具推薦（不影響專注） */}
      <div className="mt-8 mb-6 p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
        <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center">
          <span className="mr-2">🔧</span>
          延伸效率工具推薦（不影響專注）
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          若你習慣用番茄鐘專注，以下工具可在休息時間協助你整理內容與任務。
        </p>
        
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* 專注白噪音／背景音樂 */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: 替換為實際聯盟連結
            }}
            className="p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 block"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎧</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">
                  專注白噪音／背景音樂
                </h4>
                <p className="text-sm text-gray-500 mb-1">
                  適合搭配番茄鐘使用，在休息或工作時保持專注。
                </p>
                <p className="text-xs text-gray-400">
                  聯盟推薦，不影響番茄鐘使用
                </p>
              </div>
            </div>
          </a>

          {/* 任務 / 待辦管理工具 */}
          <div className="p-4 bg-white rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">
                  任務 / 待辦管理工具
                </h4>
                <p className="text-sm text-gray-500">
                  管理你的任務與待辦事項
                </p>
              </div>
            </div>
          </div>

          {/* 專注音樂 / 白噪音 */}
          <div className="p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎵</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">
                  專注音樂 / 白噪音
                </h4>
                <p className="text-sm text-gray-500">
                  可之後換聯盟
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 專注輔助工具（番茄鐘補充） */}
      <div className="mt-10 border-t pt-6 text-sm text-gray-600 max-w-screen-md mx-auto px-4">
        <div className="font-semibold text-gray-800 mb-2">
          🎧 {isEnglish ? "Focus Assistance Tools (Optional)" : "專注輔助工具（選用）"}
        </div>

        <p className="mb-3 leading-relaxed text-xs">
          {isEnglish
            ? "Some users use simple environmental assistance tools during Pomodoro focus sessions to reduce noise interference and improve focus stability. Whether to use them is up to personal preference."
            : "有些使用者在進行番茄鐘專注時，會搭配簡單的環境輔助工具，以降低噪音干擾、提升專注穩定度。是否使用可依個人習慣自行決定。"}
        </p>

        <ul className="space-y-2 text-left">
          <li>
            ▸ <span className="font-medium">{isEnglish ? "Silent Focus Earplugs (Informational Reference)" : "靜音專注耳塞（資訊參考）"}</span><br />
            <span className="text-gray-500 text-xs">
              {isEnglish
                ? "Suitable for use during focus, reading, or rest, helping to reduce external sound interference."
                : "適合專注、閱讀或休息時使用，協助減少外在聲音干擾。"}
            </span><br />
            <a
              href="https://s.shopee.tw/4q8h2wvGZe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-block mt-1 text-xs"
            >
              👉 {isEnglish ? "View Tool Information" : "查看工具資訊"}
            </a>
          </li>
        </ul>
      </div>
      </main>
    </div>
  );
};

export default PomodoroPage;