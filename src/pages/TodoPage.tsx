import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { googleCalendarService } from '../services/googleCalendarService'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: string
  startDateTime?: string  // 開始日期時間 (ISO string)
  endDateTime?: string    // 結束日期時間 (ISO string)
  actualStartTime?: string  // 實際開始時間
  actualEndTime?: string    // 實際結束時間
  category?: string   // 分類
  priority: 'high' | 'medium' | 'low'  // 優先級
  status: 'pending' | 'completed' | 'overdue' | 'cancelled'  // 狀態
  reminderTime?: string  // 提醒時間
  estimatedDuration?: number  // 預估時長（分鐘）
  isAllDay?: boolean  // 是否為整天任務
  syncToGoogle?: boolean  // 是否同步到 Google 日曆
  googleEventId?: string  // Google 日曆事件 ID
}

interface Category {
  id: string
  name: string
  color: string
}

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'completed'

const TodoPage = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [newStartDateTime, setNewStartDateTime] = useState<Date | null>(null)
  const [newEndDateTime, setNewEndDateTime] = useState<Date | null>(null)
  const [newIsAllDay, setNewIsAllDay] = useState(false)
  const [newSyncToGoogle, setNewSyncToGoogle] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [newReminderTime, setNewReminderTime] = useState<Date | null>(null)
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false)
  const [googleUserInfo, setGoogleUserInfo] = useState<any>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFiltered, setIsFiltered] = useState(false)
  // 統一搜尋條件管理
  const [filters, setFilters] = useState({
    keyword: '',
    startDate: '',
    endDate: '',
    category: '',
    priority: '',
    status: '',
    dateField: 'startDateTime' as 'startDateTime' | 'endDateTime' | 'reminderTime',
    searchLogic: 'AND' as 'AND' | 'OR'
  })
  const [isSearchTriggered, setIsSearchTriggered] = useState(false) // 是否已觸發搜尋
  const [searchKeyword, setSearchKeyword] = useState('') // 保留用於向後兼容
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#4ecdc4')
  const [showManageCategory, setShowManageCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editingCategoryColor, setEditingCategoryColor] = useState('#4ecdc4')
  const [isMobile, setIsMobile] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [editTodoText, setEditTodoText] = useState('')
  const [editStartDateTime, setEditStartDateTime] = useState<Date | null>(null)
  const [editEndDateTime, setEditEndDateTime] = useState<Date | null>(null)
  const [editIsAllDay, setEditIsAllDay] = useState(false)
  const [editSyncToGoogle, setEditSyncToGoogle] = useState(false)
  const [editCategory, setEditCategory] = useState('')
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [editReminderTime, setEditReminderTime] = useState<Date | null>(null)

  // 時間驗證錯誤狀態
  const [timeValidationErrors, setTimeValidationErrors] = useState({
    endTimeError: '',
    reminderTimeError: '',
    searchDateError: '',
    suggestedEndTime: null as Date | null,
    suggestedReminderTime: null as Date | null,
    showSearchDateFixed: false
  })

  // 獲取今天的日期，格式為 yyyy-mm-dd
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 獲取當前日期時間，格式為 yyyy-mm-ddThh:mm
  const getCurrentDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // 獲取四捨五入到最近整點或半點的時間
  const getRoundedTime = () => {
    const now = new Date()
    const minutes = now.getMinutes()
    const roundedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 60
    const roundedTime = new Date(now)
    if (roundedMinutes === 60) {
      roundedTime.setHours(roundedTime.getHours() + 1)
      roundedTime.setMinutes(0)
    } else {
      roundedTime.setMinutes(roundedMinutes)
    }
    return roundedTime
  }

  // 提醒時間快捷選項（基於開始時間）
  const reminderQuickOptions = [
    { label: '開始前 10 分鐘', value: () => {
      if (!newStartDateTime) return new Date()
      const time = new Date(newStartDateTime)
      time.setMinutes(time.getMinutes() - 10)
      return time
    }},
    { label: '開始前 30 分鐘', value: () => {
      if (!newStartDateTime) return new Date()
      const time = new Date(newStartDateTime)
      time.setMinutes(time.getMinutes() - 30)
      return time
    }},
    { label: '開始前 1 小時', value: () => {
      if (!newStartDateTime) return new Date()
      const time = new Date(newStartDateTime)
      time.setHours(time.getHours() - 1)
      return time
    }}
  ]

  // 時間驗證函數
  const validateTimes = () => {
    const errors = {
      endTimeError: '',
      reminderTimeError: '',
      searchDateError: '',
      suggestedEndTime: null as Date | null,
      suggestedReminderTime: null as Date | null,
      showSearchDateFixed: false
    }

    // 驗證結束時間不能小於開始時間
    if (newStartDateTime && newEndDateTime && !newIsAllDay) {
      // 使用 getTime() 進行精確的時間戳比較
      const endTimeStamp = newEndDateTime.getTime()
      const startTimeStamp = newStartDateTime.getTime()
      
      // 結束時間應該晚於開始時間（結束時間 > 開始時間）
      if (endTimeStamp <= startTimeStamp) {
        errors.endTimeError = '❗結束時間不能早於開始時間'
        // 計算建議結束時間：開始時間 + 30分鐘
        const suggestedEnd = new Date(newStartDateTime)
        suggestedEnd.setMinutes(suggestedEnd.getMinutes() + 30)
        errors.suggestedEndTime = suggestedEnd
      }
    }

    // 驗證提醒時間不能晚於開始時間
    if (newStartDateTime && newReminderTime) {
      // 使用 getTime() 進行精確的時間戳比較
      const reminderTimeStamp = newReminderTime.getTime()
      const startTimeStamp = newStartDateTime.getTime()
      
      // 提醒時間應該早於開始時間（提醒時間 < 開始時間）
      if (reminderTimeStamp >= startTimeStamp) {
        errors.reminderTimeError = '❗提醒時間必須早於任務開始時間'
        // 計算建議提醒時間：開始前 5分鐘
        const suggestedReminder = new Date(newStartDateTime)
        suggestedReminder.setMinutes(suggestedReminder.getMinutes() - 5)
        errors.suggestedReminderTime = suggestedReminder
      }
    }

    // 驗證搜尋日期 - 自動交換起訖日
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        // 顯示修正提示
        errors.showSearchDateFixed = true
        // 使用 setTimeout 延遲執行 setState，避免在渲染期間觸發
        setTimeout(() => {
          // 自動交換起訖日
          const tempStartDate = startDate
          setStartDate(endDate)
          setEndDate(tempStartDate)
          // 3秒後自動隱藏提示
          setTimeout(() => {
            setTimeValidationErrors(prev => ({ ...prev, showSearchDateFixed: false }))
          }, 3000)
        }, 0)
      }
    }

    setTimeValidationErrors(errors)
    
    // 自動滾動到第一個錯誤欄位
    if (errors.endTimeError || errors.reminderTimeError) {
      setTimeout(() => {
        const errorElement = document.querySelector('[data-error-field]')
        if (errorElement) {
          errorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }
      }, 100)
    }
    
    return !errors.endTimeError && !errors.reminderTimeError && !errors.searchDateError
  }

  // 檢查是否可以提交表單（不觸發驗證，只檢查當前狀態）
  const canSubmitForm = () => {
    const hasErrors = timeValidationErrors.endTimeError || 
                     timeValidationErrors.reminderTimeError || 
                     timeValidationErrors.searchDateError
    return !hasErrors && newTodo.trim() !== ''
  }

  // 套用建議時間
  const applySuggestion = (type: 'endTime' | 'reminderTime') => {
    if (type === 'endTime' && timeValidationErrors.suggestedEndTime) {
      setNewEndDateTime(timeValidationErrors.suggestedEndTime)
      // 清除錯誤狀態
      setTimeValidationErrors(prev => ({
        ...prev,
        endTimeError: '',
        suggestedEndTime: null
      }))
    } else if (type === 'reminderTime' && timeValidationErrors.suggestedReminderTime) {
      setNewReminderTime(timeValidationErrors.suggestedReminderTime)
      // 清除錯誤狀態
      setTimeValidationErrors(prev => ({
        ...prev,
        reminderTimeError: '',
        suggestedReminderTime: null
      }))
    }
  }

  // 預設分類（系統內建）
  const defaultCategories: Category[] = [
    { id: 'work', name: '工作', color: '#ff6b6b' },
    { id: 'life', name: '生活', color: '#f4a261' },
    { id: 'study', name: '學習', color: '#4ecdc4' },
    { id: 'health', name: '健康', color: '#2a9d8f' },
    { id: 'family', name: '家庭', color: '#45b7d1' },
    { id: 'other', name: '其他', color: '#a55eea' }
  ]

  // 從 localStorage 載入資料
  useEffect(() => {
    const savedTodos = localStorage.getItem('pomodoro-todos')
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos)
        // 為舊資料添加預設值
        const updatedTodos = parsedTodos.map((todo: any) => ({
          ...todo,
          priority: todo.priority || 'medium',
          status: todo.status || (todo.completed ? 'completed' : 'pending'),
          actualStartTime: todo.actualStartTime || undefined,
          actualEndTime: todo.actualEndTime || undefined,
          category: todo.category || undefined,
          reminderTime: todo.reminderTime || undefined,
          estimatedDuration: todo.estimatedDuration || undefined,
          startDateTime: todo.startDateTime || (todo.startTime ? `${getTodayDate()}T${todo.startTime}` : undefined),
          endDateTime: todo.endDateTime || (todo.endTime ? `${getTodayDate()}T${todo.endTime}` : undefined),
          isAllDay: todo.isAllDay || false,
          syncToGoogle: todo.syncToGoogle || false,
          googleEventId: todo.googleEventId || undefined
        }))
        setTodos(updatedTodos)
      } catch (error) {
        console.error('載入待辦事項失敗:', error)
      }
    }

    // 載入分類
    const savedCategories = localStorage.getItem('todo-categories')
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories))
      } catch (error) {
        console.error('載入分類失敗:', error)
        setCategories(defaultCategories)
      }
    } else {
      setCategories(defaultCategories)
    }
  }, [])

  // 同步分類到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('todo-categories', JSON.stringify(categories))
    } catch (error) {
      console.error('儲存分類失敗:', error)
    }
  }, [categories])

  // 設置預設日期值
  useEffect(() => {
    const today = getTodayDate()
    setStartDate(today)
    setEndDate(today)
    
    // 同時初始化 filters 中的日期值
    setFilters(prev => ({
      ...prev,
      startDate: today,
      endDate: today
    }))
  }, [])

  // 監聽窗口大小變化
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile() // 初始檢查
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // 設置預設日期時間值
  useEffect(() => {
    const roundedTime = getRoundedTime()
    setNewStartDateTime(roundedTime)
    // 預設結束時間為開始時間後30分鐘
    const endTime = new Date(roundedTime)
    endTime.setMinutes(endTime.getMinutes() + 30)
    setNewEndDateTime(endTime)
    // 預設提醒時間為現在時間 + 5 分鐘
    const reminderTime = new Date()
    reminderTime.setMinutes(reminderTime.getMinutes() + 5)
    setNewReminderTime(reminderTime)
  }, [])

  // 檢查 Google 認證狀態
  useEffect(() => {
    checkGoogleAuth()
  }, [])

  // 儲存到 localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('todo-categories', JSON.stringify(categories))
  }, [categories])

  const addTodo = async () => {
    // 在提交時執行驗證
    if (newTodo.trim() && validateTimes()) {
      // 計算預估時長
      let estimatedDuration: number | undefined
      if (newStartDateTime && newEndDateTime && !newIsAllDay) {
        estimatedDuration = Math.round((newEndDateTime.getTime() - newStartDateTime.getTime()) / (1000 * 60))
      }

      const newTodoItem: Todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        startDateTime: newStartDateTime?.toISOString() || undefined,
        endDateTime: newEndDateTime?.toISOString() || undefined,
        actualStartTime: undefined,
        actualEndTime: undefined,
        category: newCategory || undefined,
        priority: newPriority,
        status: 'pending',
        reminderTime: newReminderTime?.toISOString() || undefined,
        estimatedDuration,
        isAllDay: newIsAllDay,
        syncToGoogle: newSyncToGoogle,
        googleEventId: undefined
      }

      // 如果選擇同步到 Google 日曆且已登入
      if (newSyncToGoogle && isGoogleSignedIn && newStartDateTime) {
        try {
          setSyncStatus('syncing')
          const googleEvent = await syncToGoogleCalendar(newTodoItem)
          newTodoItem.googleEventId = googleEvent.id
          setSyncStatus('success')
          setTimeout(() => setSyncStatus('idle'), 3000)
        } catch (error) {
          console.error('同步到 Google 日曆失敗:', error)
          setSyncStatus('error')
          setTimeout(() => setSyncStatus('idle'), 3000)
          // 即使同步失敗，仍然保存任務到本地
        }
      }

      setTodos([newTodoItem, ...todos])
      setNewTodo('')
      // 保留時間欄位和其他設定，不自動重置
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const now = new Date().toISOString()
        return {
          ...todo,
          completed: !todo.completed,
          status: !todo.completed ? 'completed' : 'pending',
          actualEndTime: !todo.completed ? now : undefined
        }
      }
      return todo
    }))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  // 添加分類
  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        color: newCategoryColor
      }
      setCategories([...categories, newCategory])
      setNewCategoryName('')
      setNewCategoryColor('#4ecdc4')
      setShowAddCategory(false)
    }
  }

  // 刪除分類
  const deleteCategory = (id: string) => {
    const usedCount = todos.filter(t => t.category === id).length
    if (usedCount > 0) {
      const keepTasks = confirm(`此分類目前被 ${usedCount} 筆任務使用。\n是否保留任務並移除此分類？`)
      if (!keepTasks) return
    }
    setCategories(categories.filter(cat => cat.id !== id))
    // 將使用該分類的任務改為未分類
    setTodos(todos.map(todo => 
      todo.category === id ? { ...todo, category: undefined } : todo
    ))
  }

  // 編輯分類（名稱、顏色）
  const beginEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id)
    setEditingCategoryName(cat.name)
    setEditingCategoryColor(cat.color)
  }

  const saveEditCategory = () => {
    if (!editingCategoryId) return
    const name = editingCategoryName.trim()
    if (!name) return
    setCategories(categories.map(cat => 
      cat.id === editingCategoryId ? { ...cat, name, color: editingCategoryColor } : cat
    ))
    setEditingCategoryId(null)
    setEditingCategoryName('')
    setEditingCategoryColor('#4ecdc4')
  }

  // 編輯任務相關函數
  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo)
    setEditTodoText(todo.text)
    setEditStartDateTime(todo.startDateTime ? new Date(todo.startDateTime) : null)
    setEditEndDateTime(todo.endDateTime ? new Date(todo.endDateTime) : null)
    setEditIsAllDay(todo.isAllDay || false)
    setEditSyncToGoogle(todo.syncToGoogle || false)
    setEditCategory(todo.category || '')
    setEditPriority(todo.priority)
    setEditReminderTime(todo.reminderTime ? new Date(todo.reminderTime) : null)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingTodo(null)
    setEditTodoText('')
    setEditStartDateTime(null)
    setEditEndDateTime(null)
    setEditIsAllDay(false)
    setEditSyncToGoogle(false)
    setEditCategory('')
    setEditPriority('medium')
    setEditReminderTime(null)
  }

  const saveEditTodo = () => {
    if (!editingTodo || !editTodoText.trim()) return

    const updatedTodo: Todo = {
      ...editingTodo,
      text: editTodoText.trim(),
      startDateTime: editStartDateTime?.toISOString() || undefined,
      endDateTime: editEndDateTime?.toISOString() || undefined,
      isAllDay: editIsAllDay,
      syncToGoogle: editSyncToGoogle,
      category: editCategory || undefined,
      priority: editPriority,
      reminderTime: editReminderTime?.toISOString() || undefined
    }

    setTodos(todos.map(todo => 
      todo.id === editingTodo.id ? updatedTodo : todo
    ))

    // 顯示成功提示
    alert('✅ 任務已更新成功')
    
    closeEditModal()
  }

  // 重設表單欄位
  const resetForm = () => {
    setNewTodo('')
    const roundedTime = getRoundedTime()
    setNewStartDateTime(roundedTime)
    const endTime = new Date(roundedTime)
    endTime.setMinutes(endTime.getMinutes() + 30)
    setNewEndDateTime(endTime)
    setNewIsAllDay(false)
    setNewSyncToGoogle(false)
    setNewCategory('')
    setNewPriority('medium')
    const reminderTime = new Date()
    reminderTime.setMinutes(reminderTime.getMinutes() + 5)
    setNewReminderTime(reminderTime)
  }

  // Google 日曆相關函數
  const checkGoogleAuth = async () => {
    try {
      const isAuthenticated = googleCalendarService.isAuthenticated()
      setIsGoogleSignedIn(isAuthenticated)
      
      if (isAuthenticated) {
        const userInfo = await googleCalendarService.getUserInfo()
        setGoogleUserInfo(userInfo)
      }
    } catch (error) {
      console.error('檢查 Google 認證狀態失敗:', error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setSyncStatus('syncing')
      const success = await googleCalendarService.signIn()
      
      if (success) {
        setIsGoogleSignedIn(true)
        const userInfo = await googleCalendarService.getUserInfo()
        setGoogleUserInfo(userInfo)
        setSyncStatus('success')
        setTimeout(() => setSyncStatus('idle'), 3000)
      } else {
        setSyncStatus('error')
        setTimeout(() => setSyncStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Google 登入失敗:', error)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const handleGoogleSignOut = async () => {
    try {
      await googleCalendarService.signOut()
      setIsGoogleSignedIn(false)
      setGoogleUserInfo(null)
    } catch (error) {
      console.error('Google 登出失敗:', error)
    }
  }

  const syncToGoogleCalendar = async (todo: Todo) => {
    try {
      if (!todo.startDateTime) {
        throw new Error('任務必須有開始時間才能同步到 Google 日曆')
      }

      const eventData = {
        title: todo.text,
        description: `分類: ${todo.category ? categories.find(cat => cat.id === todo.category)?.name || '未分類' : '未分類'}\n優先級: ${todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}\n狀態: ${todo.status === 'completed' ? '已完成' : todo.status === 'overdue' ? '延期' : todo.status === 'cancelled' ? '取消' : '未完成'}`,
        startDateTime: todo.startDateTime,
        endDateTime: todo.endDateTime,
        isAllDay: todo.isAllDay
      }

      const googleEvent = await googleCalendarService.createEvent(eventData)
      
      // 更新任務，添加 Google 事件 ID
      setTodos(prevTodos => 
        prevTodos.map(t => 
          t.id === todo.id 
            ? { ...t, googleEventId: googleEvent.id }
            : t
        )
      )

      return googleEvent
    } catch (error) {
      console.error('同步到 Google 日曆失敗:', error)
      throw error
    }
  }

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed))
  }

  // 篩選功能
  const getFilteredTodos = () => {
    // 如果沒有觸發搜尋，返回所有待辦事項
    if (!isSearchTriggered) {
      return todos
    }

    let filteredTodos = todos

    // 檢查是否有任何篩選條件，加上防呆檢查
    const hasKeyword = filters.keyword && filters.keyword.trim() !== ''
    const hasDateFilter = filters.startDate || filters.endDate
    const hasCategoryFilter = filters.category !== ''
    const hasPriorityFilter = filters.priority !== ''
    const hasStatusFilter = filters.status !== ''

    if (filters.searchLogic === 'OR') {
      // OR 邏輯：任一條件符合即可
      return todos.filter(todo => {
        const matches: boolean[] = []

        // 關鍵字匹配
        if (hasKeyword) {
          const keyword = filters.keyword && filters.keyword.trim() ? filters.keyword.trim().toLowerCase() : ''
          if (keyword) {
            matches.push(todo.text.toLowerCase().includes(keyword))
          }
        }

        // 日期匹配
        if (hasDateFilter) {
          // 根據選擇的搜尋欄位獲取對應的日期
          let searchDate: string | undefined
          switch (filters.dateField) {
            case 'startDateTime':
              searchDate = todo.startDateTime
              break
            case 'endDateTime':
              searchDate = todo.endDateTime
              break
            case 'reminderTime':
              searchDate = todo.reminderTime
              break
          }
          
          let dateMatch = false
          if (searchDate) {
            const todoDate = new Date(searchDate)
            
            if (filters.startDate && filters.endDate) {
              const start = new Date(filters.startDate)
              const end = new Date(filters.endDate)
              // 把結束時間調整為「當天的 23:59:59」，才會包含整天資料
              end.setHours(23, 59, 59, 999)
              dateMatch = todoDate >= start && todoDate <= end
            } else if (filters.startDate) {
              const start = new Date(filters.startDate)
              dateMatch = todoDate >= start
            } else if (filters.endDate) {
              const end = new Date(filters.endDate)
              // 把結束時間調整為「當天的 23:59:59」，才會包含整天資料
              end.setHours(23, 59, 59, 999)
              dateMatch = todoDate <= end
            }
          }
          matches.push(dateMatch)
        }

        // 分類匹配
        if (hasCategoryFilter) {
          matches.push(todo.category === filters.category)
        }

        // 優先級匹配
        if (hasPriorityFilter) {
          matches.push(todo.priority === filters.priority)
        }

        // 狀態匹配
        if (hasStatusFilter) {
          matches.push(todo.status === filters.status)
        }

        // 如果沒有任何篩選條件，返回所有項目
        if (matches.length === 0) {
          return true
        }

        // OR 邏輯：任一條件符合即可
        return matches.some(match => match)
      })
    } else {
      // AND 邏輯：必須符合所有條件
      
      // 日期篩選
      if (hasDateFilter) {
        filteredTodos = filteredTodos.filter(todo => {
          // 根據選擇的搜尋欄位獲取對應的日期
          let searchDate: string | undefined
          switch (filters.dateField) {
            case 'startDateTime':
              searchDate = todo.startDateTime
              break
            case 'endDateTime':
              searchDate = todo.endDateTime
              break
            case 'reminderTime':
              searchDate = todo.reminderTime
              break
          }
          
          if (searchDate) {
            const todoDate = new Date(searchDate)
            
            if (filters.startDate && filters.endDate) {
              const start = new Date(filters.startDate)
              const end = new Date(filters.endDate)
              // 把結束時間調整為「當天的 23:59:59」，才會包含整天資料
              end.setHours(23, 59, 59, 999)
              return todoDate >= start && todoDate <= end
            } else if (filters.startDate) {
              const start = new Date(filters.startDate)
              return todoDate >= start
            } else if (filters.endDate) {
              const end = new Date(filters.endDate)
              // 把結束時間調整為「當天的 23:59:59」，才會包含整天資料
              end.setHours(23, 59, 59, 999)
              return todoDate <= end
            }
          }
          
          return false // 如果沒有對應的日期欄位，則不匹配
        })
      }

      // 關鍵字搜尋
      if (hasKeyword) {
        const keyword = filters.keyword && filters.keyword.trim() ? filters.keyword.trim().toLowerCase() : ''
        if (keyword) {
          filteredTodos = filteredTodos.filter(todo => 
            todo.text.toLowerCase().includes(keyword)
          )
        }
      }

      // 分類篩選
      if (hasCategoryFilter) {
        filteredTodos = filteredTodos.filter(todo => todo.category === filters.category)
      }

      // 優先級篩選
      if (hasPriorityFilter) {
        filteredTodos = filteredTodos.filter(todo => todo.priority === filters.priority)
      }

      // 狀態篩選
      if (hasStatusFilter) {
        filteredTodos = filteredTodos.filter(todo => todo.status === filters.status)
      }

      return filteredTodos
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const filteredTodos = getFilteredTodos()
  const filteredCompletedCount = filteredTodos.filter(todo => todo.completed).length

  // 統計資料
  const getStats = () => {
    const stats = {
      total: todos.length,
      completed: todos.filter(todo => todo.status === 'completed').length,
      pending: todos.filter(todo => todo.status === 'pending').length,
      overdue: todos.filter(todo => todo.status === 'overdue').length,
      cancelled: todos.filter(todo => todo.status === 'cancelled').length,
      byPriority: {
        high: todos.filter(todo => todo.priority === 'high').length,
        medium: todos.filter(todo => todo.priority === 'medium').length,
        low: todos.filter(todo => todo.priority === 'low').length
      }
    }
    return stats
  }

  // 匯出 CSV
  const exportToCSV = () => {
    if (filteredTodos.length === 0) {
      alert('⚠️ 目前無可匯出的資料')
      return
    }

    const headers = ['任務名稱', '分類', '優先級', '狀態', '開始時間', '結束時間', '預估時長', '建立日期', '完成時間', '整天任務']
    const csvRows = filteredTodos.map(todo => {
      const category = todo.category ? categories.find(cat => cat.id === todo.category)?.name || '未分類' : '未分類'
      const priorityText = todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'
      const statusText = todo.status === 'completed' ? '已完成' : todo.status === 'overdue' ? '延期' : todo.status === 'cancelled' ? '取消' : '未完成'
      const completedTime = todo.actualEndTime ? new Date(todo.actualEndTime).toLocaleString('zh-TW') : ''
      const startTime = todo.startDateTime ? new Date(todo.startDateTime).toLocaleString('zh-TW') : ''
      const endTime = todo.endDateTime ? new Date(todo.endDateTime).toLocaleString('zh-TW') : ''
      
      return [
        todo.text,
        category,
        priorityText,
        statusText,
        startTime,
        endTime,
        todo.estimatedDuration ? `${todo.estimatedDuration}分鐘` : '',
        formatDate(todo.createdAt),
        completedTime,
        todo.isAllDay ? '是' : '否'
      ]
    })

    const csvContent = [headers.join(','), ...csvRows.map(row => row.map(field => `"${field}"`).join(','))].join('\n')
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const fileName = `Todo_Export_${year}-${month}-${day}.csv`

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  // 排序功能
  const getSortedTodos = () => {
    const filteredTodos = getFilteredTodos()
    const sortedTodos = [...filteredTodos]
    
    switch (sortBy) {
      case 'newest':
        return sortedTodos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'oldest':
        return sortedTodos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case 'alphabetical':
        return sortedTodos.sort((a, b) => a.text.localeCompare(b.text, 'zh-TW'))
      case 'completed':
        return sortedTodos.sort((a, b) => {
          if (a.completed === b.completed) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          return a.completed ? 1 : -1
        })
      default:
        return sortedTodos
    }
  }

  // 套用篩選
  const applyFilter = () => {
    if (startDate || endDate) {
      setIsFiltered(true)
    } else {
      setIsFiltered(false)
    }
  }

  // 清除篩選
  const clearFilter = () => {
    setStartDate('')
    setEndDate('')
    setIsFiltered(false)
  }

  // 觸發搜尋
  const triggerSearch = () => {
    // 檢查是否有任何搜尋條件，加上防呆檢查
    const hasAnyCondition = (filters.keyword && filters.keyword.trim() !== '') || 
                           filters.startDate || filters.endDate || 
                           filters.category || filters.priority || filters.status

    if (!hasAnyCondition) {
      alert('請輸入至少一個條件再進行搜尋')
      return
    }

    // 觸發搜尋
    setIsSearchTriggered(true)
  }

  // 清除所有篩選
  const clearAllFilters = () => {
    setFilters({
      keyword: '',
      startDate: '',
      endDate: '',
      category: '',
      priority: '',
      status: '',
      dateField: 'startDateTime',
      searchLogic: 'AND'
    })
    setIsSearchTriggered(false)
  }

  // 清除單一條件
  const clearSingleCondition = (conditionType: string) => {
    setFilters(prev => ({
      ...prev,
      [conditionType]: conditionType === 'startDate' || conditionType === 'endDate' ? '' : ''
    }))
  }

  // 更新篩選條件
  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  // 格式化時間顯示
  const formatTime = (startDateTime?: string, endDateTime?: string, isAllDay?: boolean) => {
    if (isAllDay) {
      if (startDateTime) {
        const date = new Date(startDateTime)
        return `整天：${date.toLocaleDateString('zh-TW')}`
      }
      return null
    }
    
    if (startDateTime && endDateTime) {
      const start = new Date(startDateTime)
      const end = new Date(endDateTime)
      const startTime = start.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      const endTime = end.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      return `${startTime} ~ ${endTime}`
    } else if (startDateTime) {
      const start = new Date(startDateTime)
      const startTime = start.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      return `開始：${startTime}`
    } else if (endDateTime) {
      const end = new Date(endDateTime)
      const endTime = end.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      return `結束：${endTime}`
    }
    return null
  }

  return (
    <div className="page bg-white text-black dark:bg-gray-900 dark:text-gray-100">
      <Link 
        to="/" 
        style={{ 
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '20px'
        }}
      >
        <button style={{
          backgroundColor: '#f3f3f3',
          color: '#333',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#e8e8e8'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f3f3'
        }}
        >
          ← 回首頁
        </button>
      </Link>
      
      <h1>📝 待辦事項</h1>
      
      <div className="card dark:bg-[#1f2937]" style={{ marginBottom: '30px' }}>
        {/* 任務名稱輸入框 - 手機版全寬 */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '15px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="新增待辦事項..."
            className="todo-input h-16 text-lg"
            style={{
              flex: 1,
              height: '64px',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #cccccc',
              backgroundColor: '#ffffff',
              color: '#333333',
              fontSize: '18px',
              fontWeight: '500',
              outline: 'none',
              transition: 'border-color 0.2s',
              width: isMobile ? '100%' : 'auto'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4ecdc4'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cccccc'
            }}
          />
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            width: isMobile ? '100%' : 'auto',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <button
              onClick={addTodo}
              disabled={!canSubmitForm()}
              style={{
                backgroundColor: canSubmitForm() ? '#4ecdc4' : '#cccccc',
                color: canSubmitForm() ? 'white' : '#666666',
                padding: '16px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: canSubmitForm() ? 'pointer' : 'not-allowed',
                fontSize: '18px',
                fontWeight: '600',
                width: isMobile ? '100%' : 'auto',
                minWidth: isMobile ? '300px' : 'auto',
                flex: isMobile ? 'none' : 1,
                opacity: canSubmitForm() ? 1 : 0.6
              }}
            >
              新增任務
            </button>
            <button 
              onClick={resetForm}
              style={{
                backgroundColor: '#f2f2f2',
                color: '#333',
                padding: '16px 24px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                width: isMobile ? '100%' : 'auto',
                minWidth: isMobile ? '300px' : 'auto',
                flex: isMobile ? 'none' : 1
              }}
            >
              🔄 重設
            </button>
          </div>
        </div>
        
        {/* 手機版錯誤摘要浮動條 */}
        {isMobile && (timeValidationErrors.endTimeError || timeValidationErrors.reminderTimeError) && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '10px',
            right: '10px',
            backgroundColor: '#fff5f5',
            border: '2px solid #ff4444',
            borderRadius: '8px',
            padding: '12px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              color: '#ff4444',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              ⚠️ 時間設定錯誤
            </div>
            {timeValidationErrors.endTimeError && (
              <div style={{
                color: '#666',
                fontSize: '12px',
                marginBottom: '4px'
              }}>
                • 結束時間不能早於開始時間
              </div>
            )}
            {timeValidationErrors.reminderTimeError && (
              <div style={{
                color: '#666',
                fontSize: '12px',
                marginBottom: '4px'
              }}>
                • 提醒時間必須早於任務開始時間
              </div>
            )}
            <div style={{
              color: '#999',
              fontSize: '10px',
              marginTop: '4px'
            }}>
              請修正上方欄位或使用建議時間
            </div>
          </div>
        )}

        {/* 時間與選項設定區 - 兩行佈局 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '20px', 
          marginBottom: '20px'
        }}>
          {/* 第一行：時間欄位區 */}
          <div style={{ 
            display: 'flex', 
            gap: '15px',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'flex-start'
          }}>
            {/* 開始時間 */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '8px',
              flex: isMobile ? 'none' : '0 0 45%',
              minWidth: '140px',
              maxWidth: isMobile ? '100%' : '45%',
              marginBottom: isMobile ? '8px' : '0'
            }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333'
              }}>
                開始時間:
              </label>
              <DatePicker
                selected={newStartDateTime}
                onChange={(date) => {
                  setNewStartDateTime(date)
                  // 即時驗證
                  setTimeout(() => validateTimes(), 100)
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy/MM/dd HH:mm"
                placeholderText="選擇開始時間"
                className="custom-datepicker"
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  minWidth: '140px',
                  width: '100%'
                }}
              />
              {/* 錯誤提示 */}
              {timeValidationErrors.endTimeError && (
                <div style={{
                  color: '#ff4444',
                  fontSize: '12px',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  {timeValidationErrors.endTimeError}
                </div>
              )}
            </div>
            
            {/* 結束時間 */}
            <div 
              data-error-field={timeValidationErrors.endTimeError ? 'true' : undefined}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px',
                flex: isMobile ? 'none' : '0 0 45%',
                minWidth: '140px',
                maxWidth: isMobile ? '100%' : '45%',
                marginBottom: isMobile ? '8px' : '0'
              }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333'
              }}>
                結束時間:
              </label>
              <DatePicker
                selected={newEndDateTime}
                onChange={(date) => {
                  setNewEndDateTime(date)
                  // 即時驗證
                  setTimeout(() => validateTimes(), 100)
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy/MM/dd HH:mm"
                placeholderText="選擇結束時間"
                className="custom-datepicker"
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: timeValidationErrors.endTimeError ? '2px solid #ff4444' : '1px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  minWidth: '140px',
                  width: '100%'
                }}
              />
              {/* 錯誤提示與建議 */}
              {timeValidationErrors.endTimeError && (
                <div style={{
                  marginTop: '4px',
                  padding: '8px',
                  backgroundColor: '#fff5f5',
                  border: '1px solid #ff4444',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    color: '#ff4444',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {timeValidationErrors.endTimeError}
                  </div>
                  {timeValidationErrors.suggestedEndTime && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        color: '#666',
                        fontSize: '11px'
                      }}>
                        建議結束時間：{timeValidationErrors.suggestedEndTime.toLocaleString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button
                        onClick={() => applySuggestion('endTime')}
                        style={{
                          backgroundColor: '#4ecdc4',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '10px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        [套用建議]
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 分隔線 */}
          <div style={{
            height: '1px',
            backgroundColor: '#e0e0e0',
            margin: isMobile ? '8px 0' : '0'
          }}></div>

          {/* 第二行：選項設定區 */}
          <div style={{ 
            display: 'flex', 
            gap: '15px',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center'
          }}>
            {/* 整天任務 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              flex: isMobile ? 'none' : '0 0 45%',
              minWidth: '140px',
              maxWidth: isMobile ? '100%' : '45%',
              marginBottom: isMobile ? '8px' : '0'
            }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                width: '100%'
              }}>
                <input
                  type="checkbox"
                  checked={newIsAllDay}
                  onChange={(e) => {
                    setNewIsAllDay(e.target.checked)
                    if (e.target.checked) {
                      // 如果選擇整天任務，清空結束時間
                      setNewEndDateTime(null)
                    }
                    // 即時驗證
                    setTimeout(() => validateTimes(), 100)
                  }}
                  className="accent-blue-500 dark:accent-green-400"
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                整天任務
              </label>
            </div>

            {/* 同步到 Google 日曆 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              flex: isMobile ? 'none' : '0 0 45%',
              minWidth: '140px',
              maxWidth: isMobile ? '100%' : '45%',
              marginBottom: isMobile ? '8px' : '0'
            }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                width: '100%'
              }}>
                <input
                  type="checkbox"
                  checked={newSyncToGoogle}
                  onChange={(e) => setNewSyncToGoogle(e.target.checked)}
                  disabled={!isGoogleSignedIn}
                  className="accent-blue-500 dark:accent-green-400"
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: isGoogleSignedIn ? 'pointer' : 'not-allowed',
                    opacity: isGoogleSignedIn ? 1 : 0.5
                  }}
                />
                ✅ 同步到 Google 日曆
              </label>
            </div>
          </div>
        </div>

        {/* Google 日曆同步狀態和登入按鈕 - 手機版上下排列 */}
        <div style={{
          backgroundColor: '#f7f7f7',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              width: isMobile ? '100%' : 'auto'
            }}>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333',
                width: isMobile ? '100%' : 'auto'
              }}>
                Google 日曆同步:
              </span>
              
              {isGoogleSignedIn ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <span style={{ 
                    color: '#4caf50', 
                    fontSize: '14px',
                    fontWeight: '500',
                    width: isMobile ? '100%' : 'auto',
                    textAlign: isMobile ? 'center' : 'left'
                  }}>
                    ✅ 已登入 ({googleUserInfo?.email})
                  </span>
                  <button
                    onClick={handleGoogleSignOut}
                    style={{
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    登出
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={syncStatus === 'syncing'}
                  style={{
                    backgroundColor: syncStatus === 'syncing' ? '#ccc' : '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  {syncStatus === 'syncing' ? '🔄 登入中...' : '🔑 登入 Google'}
                </button>
              )}
            </div>

            {syncStatus === 'success' && (
              <div style={{
                color: '#4caf50',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: isMobile ? 'center' : 'left',
                width: isMobile ? '100%' : 'auto'
              }}>
                ✅ 同步成功！
              </div>
            )}

            {syncStatus === 'error' && (
              <div style={{
                color: '#f44336',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: isMobile ? 'center' : 'left',
                width: isMobile ? '100%' : 'auto'
              }}>
                ❌ 同步失敗，請重試
              </div>
            )}
          </div>

          {!isGoogleSignedIn && (
            <div style={{
              marginTop: '10px',
              fontSize: '12px',
              color: '#666',
              lineHeight: '1.4',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              💡 登入 Google 帳號後，即可將任務同步到您的 Google 日曆中
            </div>
          )}
        </div>

        {/* 分類、優先級和提醒時間輸入欄位 - 手機版上下排列 */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '20px',
          alignItems: 'center',
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* 分類選擇 - 手機版全寬 + 管理分類按鈕 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            width: isMobile ? '100%' : 'auto',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center'
          }}>
            <label style={{ 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#333333',
              minWidth: isMobile ? 'auto' : '60px',
              width: isMobile ? '100%' : 'auto'
            }}>
              分類:
            </label>
            <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  fontSize: '16px',
                  outline: 'none',
                  minWidth: '160px',
                  width: isMobile ? '100%' : 'auto',
                  flex: isMobile ? 1 : 'none'
                }}
              >
                <option value="">選擇分類</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowManageCategory(true)}
                style={{
                  backgroundColor: '#f2f2f2',
                  color: '#333',
                  border: '1px solid #cccccc',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                ⚙ 管理分類
              </button>
            </div>
          </div>

          {/* 優先級選擇 - 手機版全寬 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            width: window.innerWidth <= 768 ? '100%' : 'auto',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center'
          }}>
            <label style={{ 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#333333',
              minWidth: window.innerWidth <= 768 ? 'auto' : '60px',
              width: isMobile ? '100%' : 'auto'
            }}>
              優先級:
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cccccc',
                backgroundColor: '#ffffff',
                color: '#333333',
                fontSize: '16px',
                outline: 'none',
                minWidth: '100px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          {/* 提醒時間 - 手機版全寬 */}
          <div 
            data-error-field={timeValidationErrors.reminderTimeError ? 'true' : undefined}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              width: isMobile ? '100%' : 'auto',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center'
            }}>
            <label style={{ 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#333333',
              minWidth: isMobile ? 'auto' : '60px',
              width: isMobile ? '100%' : 'auto'
            }}>
              提醒時間:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
              <DatePicker
                selected={newReminderTime}
                onChange={(date) => {
                  setNewReminderTime(date)
                  // 即時驗證
                  setTimeout(() => validateTimes(), 100)
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy/MM/dd HH:mm"
                placeholderText="選擇提醒時間"
                className="custom-datepicker"
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: timeValidationErrors.reminderTimeError ? '2px solid #ff4444' : '1px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  width: isMobile ? '100%' : 'auto'
                }}
              />
              {/* 錯誤提示與建議 */}
              {timeValidationErrors.reminderTimeError && (
                <div style={{
                  marginTop: '4px',
                  padding: '8px',
                  backgroundColor: '#fff5f5',
                  border: '1px solid #ff4444',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    color: '#ff4444',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {timeValidationErrors.reminderTimeError}
                  </div>
                  {timeValidationErrors.suggestedReminderTime && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        color: '#666',
                        fontSize: '11px'
                      }}>
                        建議提醒時間：{timeValidationErrors.suggestedReminderTime.toLocaleString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button
                        onClick={() => applySuggestion('reminderTime')}
                        style={{
                          backgroundColor: '#4ecdc4',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '10px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        [套用建議]
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* 快捷選項 */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {reminderQuickOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setNewReminderTime(option.value())
                      // 即時驗證
                      setTimeout(() => validateTimes(), 100)
                    }}
                    style={{
                      backgroundColor: '#f2f2f2',
                      color: '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#e0e0e0'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f2f2f2'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ 
            color: '#888', 
            fontSize: '16px',
            fontWeight: '500'
          }}>
            已完成: {isFiltered || (filters.keyword && filters.keyword.trim()) ? `${filteredCompletedCount} / ${filteredTodos.length}` : `${completedCount} / ${todos.length}`}
            {(isFiltered || (filters.keyword && filters.keyword.trim())) && (
              <span style={{ color: '#4ecdc4', marginLeft: '8px' }}>
                ({(filters.keyword && filters.keyword.trim()) ? '搜尋結果' : '篩選結果'})
              </span>
            )}
          </div>
          
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              style={{
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              清除已完成
            </button>
          )}
        </div>

        {/* 關鍵字搜尋 */}
        <div style={{
          backgroundColor: '#f7f7f7',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            color: '#333333',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 15px 0'
          }}>
            🔍 關鍵字搜尋
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)}
              placeholder="輸入關鍵字搜尋任務…"
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                color: '#333333',
                fontSize: '16px',
                fontWeight: '500',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4ecdc4'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd'
              }}
            />
            
            {/* 搜尋邏輯切換器 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '4px',
              border: '1px solid #e9ecef'
            }}>
              <span style={{
                fontSize: '12px',
                color: '#6c757d',
                fontWeight: '500'
              }}>
                邏輯:
              </span>
              <button
                onClick={() => updateFilter('searchLogic', 'AND')}
                style={{
                  backgroundColor: filters.searchLogic === 'AND' ? '#4ecdc4' : 'transparent',
                  color: filters.searchLogic === 'AND' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="所有條件都必須符合 (AND)"
              >
                AND
              </button>
              <button
                onClick={() => updateFilter('searchLogic', 'OR')}
                style={{
                  backgroundColor: filters.searchLogic === 'OR' ? '#ff6b6b' : 'transparent',
                  color: filters.searchLogic === 'OR' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="任一條件符合即可 (OR)"
              >
                OR
              </button>
            </div>
            
            {filters.keyword && (
              <button
                onClick={() => updateFilter('keyword', '')}
                style={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff5252'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff6b6b'
                }}
              >
                ✕ 清除
              </button>
            )}
          </div>
          
          {(filters.keyword && filters.keyword.trim()) && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#e8f5e8',
              borderRadius: '8px',
              border: '1px solid #4caf50'
            }}>
              <span style={{
                color: '#2e7d32',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                🔍 搜尋關鍵字: "{filters.keyword}" ({filteredTodos.length} 個結果)
              </span>
            </div>
          )}
        </div>

        {/* 日期篩選器 */}
        <div style={{
          backgroundColor: '#f7f7f7',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            color: '#333333',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 15px 0'
          }}>
            📅 日期區間篩選
          </h3>
          
          {/* 搜尋欄位選擇器 */}
          <div style={{
            marginBottom: '15px',
            padding: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#666666',
              marginBottom: '8px'
            }}>
              搜尋依據：
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => updateFilter('dateField', 'startDateTime')}
                style={{
                  backgroundColor: filters.dateField === 'startDateTime' ? '#4ecdc4' : '#f8f9fa',
                  color: filters.dateField === 'startDateTime' ? 'white' : '#666666',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="根據任務開始時間搜尋"
              >
                🕐 開始時間
              </button>
              <button
                onClick={() => updateFilter('dateField', 'endDateTime')}
                style={{
                  backgroundColor: filters.dateField === 'endDateTime' ? '#4ecdc4' : '#f8f9fa',
                  color: filters.dateField === 'endDateTime' ? 'white' : '#666666',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="根據任務結束時間搜尋"
              >
                🕕 結束時間
              </button>
              <button
                onClick={() => updateFilter('dateField', 'reminderTime')}
                style={{
                  backgroundColor: filters.dateField === 'reminderTime' ? '#4ecdc4' : '#f8f9fa',
                  color: filters.dateField === 'reminderTime' ? 'white' : '#666666',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="根據提醒時間搜尋"
              >
                🔔 提醒時間
              </button>
            </div>
          </div>
          
          {/* 搜尋日期自動修正提示 */}
          {timeValidationErrors.showSearchDateFixed && (
            <div style={{
              backgroundColor: '#e8f5e8',
              border: '1px solid #4caf50',
              borderRadius: '6px',
              padding: '8px 12px',
              marginBottom: '15px',
              color: '#2e7d32',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✅</span>
              <span>❗ 搜尋日期已自動修正</span>
            </div>
          )}
          
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '15px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{
                color: '#555555',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                開始日期
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  updateFilter('startDate', e.target.value)
                  // 即時驗證
                  setTimeout(() => validateTimes(), 100)
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  color: '#333333',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{
                color: '#555555',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                結束日期
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  updateFilter('endDate', e.target.value)
                  // 即時驗證
                  setTimeout(() => validateTimes(), 100)
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  color: '#333333',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              />
            </div>
          </div>
          
          {/* 搜尋日期錯誤提示 */}
          {timeValidationErrors.searchDateError && (
            <div style={{
              color: '#ff4444',
              fontSize: '12px',
              fontWeight: '500',
              marginTop: '8px',
              textAlign: 'center',
              width: '100%'
            }}>
              {timeValidationErrors.searchDateError}
            </div>
          )}
          
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                updateFilter('startDate', '')
                updateFilter('endDate', '')
              }}
              style={{
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#ff5252'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ff6b6b'
              }}
            >
              🗑️ 清除篩選
            </button>
          </div>
          
          {isFiltered && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#e8f5e8',
              borderRadius: '8px',
              border: '1px solid #4caf50'
            }}>
              <span style={{
                color: '#2e7d32',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ✅ 已套用日期篩選: {startDate || '不限'} 至 {endDate || '不限'}
              </span>
            </div>
          )}
        </div>

        {/* 分類管理 Modal */}
        {showManageCategory && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000
          }}
          onClick={() => setShowManageCategory(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(520px, 90vw)',
                maxHeight: '80vh',
                overflowY: 'auto',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>📂 管理分類</h3>
                <button onClick={() => setShowManageCategory(false)} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
              </div>

              {/* 新增分類 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="輸入分類名稱..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                />
                <input type="color" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} style={{ width: 48, height: 38, padding: 0, border: '1px solid #ccc', borderRadius: 8 }} />
                <button onClick={addCategory} style={{ background: '#4ecdc4', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontWeight: 700 }}>新增</button>
              </div>

              {/* 分類清單 */}
              <div style={{ display: 'grid', gap: 8 }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 8, padding: '10px 8px', border: '1px solid #eee', borderRadius: 8 }}>
                    <div 
                      title={cat.color} 
                      className="color-dot"
                      style={{ 
                        width: 14, 
                        height: 14, 
                        borderRadius: '50%', 
                        background: cat.color,
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                      }} 
                    />
                    {editingCategoryId === cat.id ? (
                      <input value={editingCategoryName} onChange={(e) => setEditingCategoryName(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', width: '100%' }} />
                    ) : (
                      <div style={{ fontWeight: 600 }}>{cat.name}</div>
                    )}
                    {editingCategoryId === cat.id ? (
                      <input type="color" value={editingCategoryColor} onChange={(e) => setEditingCategoryColor(e.target.value)} style={{ width: 40, height: 28, padding: 0, border: '1px solid #ccc', borderRadius: 6 }} />
                    ) : (
                      <div style={{ color: '#999', fontSize: 12 }}>{cat.color}</div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {editingCategoryId === cat.id ? (
                        <>
                          <button onClick={saveEditCategory} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>儲存</button>
                          <button onClick={() => setEditingCategoryId(null)} style={{ background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>取消</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => beginEditCategory(cat)} style={{ background: '#f2f2f2', border: '1px solid #ccc', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>✏️ 編輯</button>
                          <button onClick={() => deleteCategory(cat.id)} style={{ background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>🗑 刪除</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 編輯任務 Modal */}
        {showEditModal && editingTodo && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000
          }}
          onClick={closeEditModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(600px, 95vw)',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>✏️ 編輯任務</h3>
                <button onClick={closeEditModal} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 任務名稱 */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>任務名稱 *</label>
                  <input
                    type="text"
                    value={editTodoText}
                    onChange={(e) => setEditTodoText(e.target.value)}
                    placeholder="輸入任務名稱..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 時間設定 */}
                <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>開始時間</label>
                    <DatePicker
                      selected={editStartDateTime}
                      onChange={(date) => setEditStartDateTime(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="yyyy/MM/dd HH:mm"
                      placeholderText="選擇開始時間"
                      className="custom-datepicker"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>結束時間</label>
                    <DatePicker
                      selected={editEndDateTime}
                      onChange={(date) => setEditEndDateTime(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="yyyy/MM/dd HH:mm"
                      placeholderText="選擇結束時間"
                      className="custom-datepicker"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* 整天任務 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="editIsAllDay"
                    checked={editIsAllDay}
                    onChange={(e) => setEditIsAllDay(e.target.checked)}
                    className="accent-blue-500 dark:accent-green-400"
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <label htmlFor="editIsAllDay" style={{ fontSize: '16px', color: '#333' }}>整天任務</label>
                </div>

                {/* 分類和優先級 */}
                <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>分類</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: '#fff'
                      }}
                    >
                      <option value="">選擇分類</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>優先級</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as 'high' | 'medium' | 'low')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: '#fff'
                      }}
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </div>
                </div>

                {/* 提醒時間 */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>提醒時間（選填）</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <DatePicker
                      selected={editReminderTime}
                      onChange={(date) => setEditReminderTime(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="yyyy/MM/dd HH:mm"
                      placeholderText="選擇提醒時間"
                      className="custom-datepicker"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                    {/* 快捷選項 */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {reminderQuickOptions.map((option, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setEditReminderTime(option.value())}
                          style={{
                            backgroundColor: '#f2f2f2',
                            color: '#333',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e0e0e0'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f2f2f2'
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Google 日曆同步 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="editSyncToGoogle"
                    checked={editSyncToGoogle}
                    onChange={(e) => setEditSyncToGoogle(e.target.checked)}
                    className="accent-blue-500 dark:accent-green-400"
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <label htmlFor="editSyncToGoogle" style={{ fontSize: '16px', color: '#333' }}>✅ 同步到 Google 日曆</label>
                </div>

                {/* 按鈕區域 */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    onClick={closeEditModal}
                    style={{
                      backgroundColor: '#f2f2f2',
                      color: '#333',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={saveEditTodo}
                    disabled={!editTodoText.trim()}
                    style={{
                      backgroundColor: !editTodoText.trim() ? '#ccc' : '#4ecdc4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      cursor: !editTodoText.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    儲存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 進階篩選器 */}
        <div style={{
          backgroundColor: '#f7f7f7',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            color: '#333333',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px'
          }}>
            🔍 進階篩選
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>
                分類篩選:
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  fontSize: '14px'
                }}
              >
                <option value="">全部分類</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>
                優先級篩選:
              </label>
              <select
                value={filters.priority}
                onChange={(e) => updateFilter('priority', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  fontSize: '14px'
                }}
              >
                <option value="">全部優先級</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>
                狀態篩選:
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  fontSize: '14px'
                }}
              >
                <option value="">全部狀態</option>
                <option value="pending">未完成</option>
                <option value="completed">已完成</option>
                <option value="overdue">延期</option>
                <option value="cancelled">取消</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                updateFilter('category', '')
                updateFilter('priority', '')
                updateFilter('status', '')
              }}
              style={{
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              🗑️ 清除篩選
            </button>
          </div>
        </div>

        {/* 搜尋按鈕區域 */}
        <div style={{
          backgroundColor: '#e8f5e8',
          border: '2px solid #4caf50',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: '#2e7d32',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 15px 0'
          }}>
            🔍 條件設定完成，準備搜尋
          </h3>
          <p style={{
            color: '#4caf50',
            fontSize: '14px',
            margin: '0 0 20px 0'
          }}>
            設定好搜尋條件後，點擊下方按鈕開始搜尋
          </p>
          <button
            onClick={triggerSearch}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
              minWidth: '200px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#45a049'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(76, 175, 80, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#4caf50'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(76, 175, 80, 0.3)'
            }}
          >
            🔍 開始搜尋
          </button>
        </div>

        {/* 統計資料 */}
        <div style={{
          backgroundColor: '#f7f7f7',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            color: '#333333',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px'
          }}>
            📊 統計資料
          </h3>
          
          {(() => {
            const stats = getStats()
            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px'
              }}>
                <div style={{
                  backgroundColor: '#e3f2fd',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                    {stats.total}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>總任務數</div>
                </div>
                
                <div style={{
                  backgroundColor: '#e8f5e8',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                    {stats.completed}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>已完成</div>
                </div>
                
                <div style={{
                  backgroundColor: '#fff3e0',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
                    {stats.pending}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>未完成</div>
                </div>
                
                <div style={{
                  backgroundColor: '#ffebee',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
                    {stats.overdue}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>延期</div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* 排序選項 */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: '#888', fontSize: '16px', marginRight: '8px', fontWeight: '500' }}>排序:</span>
          {[
            { value: 'newest', label: '最新' },
            { value: 'oldest', label: '最舊' },
            { value: 'alphabetical', label: '字母' },
            { value: 'completed', label: '完成狀態' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as SortOption)}
              style={{
                backgroundColor: sortBy === option.value ? '#d1eaff' : '#f2f2f2',
                color: '#333333',
                border: '1px solid #cccccc',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: sortBy === option.value ? '700' : '500',
                transition: 'all 0.2s',
                boxShadow: sortBy === option.value ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onMouseOver={(e) => {
                if (sortBy !== option.value) {
                  e.currentTarget.style.backgroundColor = '#d1eaff'
                }
              }}
              onMouseOut={(e) => {
                if (sortBy !== option.value) {
                  e.currentTarget.style.backgroundColor = '#f2f2f2'
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 匯出按鈕 - 手機版中央顯示 */}
        <div style={{
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'flex-end',
          marginBottom: '20px'
        }}>
          <button
            onClick={exportToCSV}
            disabled={filteredTodos.length === 0}
            style={{
              backgroundColor: filteredTodos.length > 0 ? '#4ecdc4' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: filteredTodos.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: isMobile ? 'min(300px, 90%)' : 'auto'
            }}
            title="匯出目前篩選結果為 CSV 檔案"
          >
            📊 匯出 CSV ({filteredTodos.length} 筆)
          </button>
        </div>
      </div>
      
      <div style={{ textAlign: 'left' }}>
        {/* 搜尋條件摘要 */}
        {isSearchTriggered && (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#495057',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔍 搜尋條件摘要
              <span style={{
                fontSize: '12px',
                backgroundColor: filters.searchLogic === 'AND' ? '#4ecdc4' : '#ff6b6b',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                {filters.searchLogic}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {filters.keyword && (
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🔍 關鍵字：<span style={{ color: '#495057', fontWeight: '500' }}>"{filters.keyword}"</span>
                  <button
                    onClick={() => updateFilter('keyword', '')}
                    style={{
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                    title="清除關鍵字"
                  >
                    ❌
                  </button>
                </div>
              )}
              
              {(filters.startDate || filters.endDate) && (
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📅 日期區間：<span style={{ color: '#495057', fontWeight: '500' }}>
                    {filters.startDate ? new Date(filters.startDate).toLocaleDateString('zh-TW') : '不限'} 至 {filters.endDate ? new Date(filters.endDate).toLocaleDateString('zh-TW') : '不限'}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    backgroundColor: '#e9ecef',
                    color: '#6c757d',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginLeft: '8px'
                  }}>
                    {filters.dateField === 'startDateTime' ? '🕐 開始時間' : 
                     filters.dateField === 'endDateTime' ? '🕕 結束時間' : 
                     '🔔 提醒時間'}
                  </span>
                  <button
                    onClick={() => {
                      updateFilter('startDate', '')
                      updateFilter('endDate', '')
                    }}
                    style={{
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                    title="清除日期篩選"
                  >
                    ❌
                  </button>
                </div>
              )}
              
              {filters.category && (
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🏷️ 分類：<span style={{ color: '#495057', fontWeight: '500' }}>
                    {categories.find(cat => cat.id === filters.category)?.name || filters.category}
                  </span>
                  <button
                    onClick={() => updateFilter('category', '')}
                    style={{
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                    title="清除分類篩選"
                  >
                    ❌
                  </button>
                </div>
              )}
              
              {filters.priority && (
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⭐ 優先級：<span style={{ color: '#495057', fontWeight: '500' }}>
                    {filters.priority === 'high' ? '高' : filters.priority === 'medium' ? '中' : '低'}
                  </span>
                  <button
                    onClick={() => updateFilter('priority', '')}
                    style={{
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                    title="清除優先級篩選"
                  >
                    ❌
                  </button>
                </div>
              )}
              
              {filters.status && (
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📋 狀態：<span style={{ color: '#495057', fontWeight: '500' }}>
                    {filters.status === 'completed' ? '已完成' : filters.status === 'overdue' ? '延期' : filters.status === 'cancelled' ? '取消' : '未完成'}
                  </span>
                  <button
                    onClick={() => updateFilter('status', '')}
                    style={{
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                    title="清除狀態篩選"
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>
            
            <div style={{
              marginTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#6c757d',
                fontWeight: '500'
              }}>
                找到 {filteredTodos.length} 個結果
              </div>
              <button
                onClick={clearAllFilters}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                title="清除所有搜尋條件"
              >
                🧹 清除全部條件
              </button>
            </div>
          </div>
        )}

        {todos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#888', 
            padding: '40px 0',
            fontSize: '18px',
            fontWeight: '500'
          }}>
            還沒有待辦事項，新增一個吧！
          </div>
         ) : getSortedTodos().length === 0 ? (
           <div style={{ 
             textAlign: 'center', 
             color: '#888', 
             padding: '40px 0',
             fontSize: '18px',
             fontWeight: '500'
           }}>
             <div style={{ marginBottom: '20px' }}>
               {isSearchTriggered ? '查無資料，您可以試著放寬搜尋條件' : '⚠️ 沒有符合所有條件的結果。您可以：'}
             </div>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '10px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {(filters.keyword && filters.keyword.trim()) && (
                <button
                  onClick={() => updateFilter('keyword', '')}
                  style={{
                    backgroundColor: '#ffc107',
                    color: '#212529',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
                >
                  [清除關鍵字]
                </button>
              )}
              
              {isFiltered && (
                <button
                  onClick={clearDateFilter}
                  style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                >
                  [清除日期篩選]
                </button>
              )}
              
              <button
                onClick={clearAllFilters}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
              >
                [查看所有資料]
              </button>
            </div>
          </div>
        ) : (
          getSortedTodos().map(todo => (
            <div
              key={todo.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: isMobile ? '12px' : '16px',
                marginBottom: '12px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: todo.completed ? '1px solid #4ecdc4' : '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                flexDirection: isMobile ? 'column' : 'row'
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="accent-blue-500 dark:accent-green-400"
                style={{ 
                  marginRight: '12px', 
                  transform: 'scale(1.2)',
                  marginTop: '2px'
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div
                    style={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? '#888' : '#333333',
                      fontSize: '18px',
                      wordBreak: 'break-word',
                      fontWeight: '500',
                      flex: 1
                    }}
                  >
                    {todo.text}
                  </div>
                  
                  {/* 優先級標示 */}
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: todo.priority === 'high' ? '#ff6b6b' : todo.priority === 'medium' ? '#ffa726' : '#4caf50',
                    flexShrink: 0
                  }} />
                </div>
                
                <div style={{
                  color: '#666666',
                  fontSize: '12px',
                  fontWeight: '400',
                  marginTop: '4px'
                }}>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <span>建立日期：{formatDate(todo.createdAt)}</span>
                    {todo.category && (
                      <span style={{ 
                        color: categories.find(cat => cat.id === todo.category)?.color || '#666',
                        fontWeight: '500'
                      }}>
                        分類：{categories.find(cat => cat.id === todo.category)?.name}
                      </span>
                    )}
                    <span style={{ 
                      color: todo.priority === 'high' ? '#ff6b6b' : todo.priority === 'medium' ? '#ffa726' : '#4caf50',
                      fontWeight: '500'
                    }}>
                      優先級：{todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                    </span>
                    <span style={{ 
                      color: todo.status === 'completed' ? '#4caf50' : todo.status === 'overdue' ? '#ff6b6b' : todo.status === 'cancelled' ? '#999' : '#ffa726',
                      fontWeight: '500'
                    }}>
                      狀態：{todo.status === 'completed' ? '已完成' : todo.status === 'overdue' ? '延期' : todo.status === 'cancelled' ? '取消' : '未完成'}
                    </span>
                  </div>
                  
                  {formatTime(todo.startDateTime, todo.endDateTime, todo.isAllDay) && (
                    <div style={{ marginTop: '2px' }}>
                      時間：{formatTime(todo.startDateTime, todo.endDateTime, todo.isAllDay)}
                      {todo.estimatedDuration && !todo.isAllDay && (
                        <span style={{ marginLeft: '8px' }}>
                          （預估 {todo.estimatedDuration} 分鐘）
                        </span>
                      )}
                    </div>
                  )}
                  
                  {todo.actualEndTime && (
                    <div style={{ marginTop: '2px', color: '#4caf50' }}>
                      實際完成時間：{new Date(todo.actualEndTime).toLocaleString('zh-TW')}
                    </div>
                  )}

                  {todo.syncToGoogle && (
                    <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: '#4285f4', fontSize: '12px' }}>
                        📅 Google 日曆
                      </span>
                      {todo.googleEventId && (
                        <span style={{ color: '#4caf50', fontSize: '12px' }}>
                          ✅ 已同步
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginLeft: isMobile ? '0' : '8px',
                marginTop: isMobile ? '8px' : '0',
                flexDirection: isMobile ? 'column' : 'row',
                width: isMobile ? '100%' : 'auto'
              }}>
                <button
                  onClick={() => openEditModal(todo)}
                  style={{
                    backgroundColor: '#4ecdc4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                    width: isMobile ? '100%' : 'auto',
                    alignSelf: isMobile ? 'stretch' : 'auto'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#45b7aa'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#4ecdc4'
                  }}
                >
                  ✏️ 編輯
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                    width: isMobile ? '100%' : 'auto',
                    alignSelf: isMobile ? 'stretch' : 'auto'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#ff5252'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ff6b6b'
                  }}
                >
                  🗑 刪除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TodoPage
