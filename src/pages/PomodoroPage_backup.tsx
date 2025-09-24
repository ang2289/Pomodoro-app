import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FocusItem, FocusItemWithCount } from '../types/FocusItem'
import { PomodoroRecord } from '../types/PomodoroRecord'
// import { TaskTag, TaskTagWithCount } from '../types/TaskTag'
import { 
  getFocusItemsWithCount, 
  addFocusItem, 
  updateFocusItem, 
  deleteFocusItem, 
  recordFocusItemUsage,
  initializeDefaultFocusItems 
} from '../services/focusItemService'
import { exportPomodoroRecordsToCSV, hasRecordsToExport } from '../services/csvExportService'
// import { 
//   getTaskTagsWithCount, 
//   addTaskTag, 
//   updateTaskTag, 
//   deleteTaskTag, 
//   recordTaskTagUsage,
//   initializeDefaultTaskTags,
//   getRandomTagColor 
// } from '../services/taskTagService'

const PomodoroPage = () => {
  const [workMinutes, setWorkMinutes] = useState(25) // å·¥ä??‚é?ï¼ˆå??˜ï?
  const [breakMinutes, setBreakMinutes] = useState(5) // ä¼‘æ¯?‚é?ï¼ˆå??˜ï?
  const [timeLeft, setTimeLeft] = useState(25 * 60) // ?¶å??©é??‚é?ï¼ˆç?ï¼?  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [records, setRecords] = useState<PomodoroRecord[]>([]) // å®Œæ?ç´€??  const [searchKeyword, setSearchKeyword] = useState('') // ?œå??œéµå­?  const [startDate, setStartDate] = useState('') // ?‹å??¥æ?
  const [endDate, setEndDate] = useState('') // çµæ??¥æ?
  const [isSearching, setIsSearching] = useState(false) // ?¯å¦æ­?œ¨?œå?
  
  // ·j´MÄæ¦ì³]©w
  const [searchFields, setSearchFields] = useState({
    focusItem: true,    // ±Mª`¥ô°È¦WºÙ
    description: true,  // ¥ô°È¤º®e/´y­z
    time: true         // §¹¦¨®É¶¡
  })
  const [showSuggestions, setShowSuggestions] = useState(false) // ?¯å¦é¡¯ç¤ºå»ºè­°
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false) // ?œå?æ¡†æ˜¯?¦è???  
  // å°ˆæ³¨?…ç›®?¸é??€??  const [focusItems, setFocusItems] = useState<FocusItemWithCount[]>([])
  const [selectedFocusItemId, setSelectedFocusItemId] = useState<string>('')
  const [showFocusItemModal, setShowFocusItemModal] = useState(false)
  const [newFocusItemName, setNewFocusItemName] = useState('')
  const [editingFocusItem, setEditingFocusItem] = useState<FocusItem | null>(null)
  const [editingFocusItemName, setEditingFocusItemName] = useState('')
  
  // è¨˜é?ç·¨è¼¯?¸é??€??  const [editingRecord, setEditingRecord] = useState<PomodoroRecord | null>(null)
  const [editingRecordFocusItemId, setEditingRecordFocusItemId] = useState<string>('')
  const [editingRecordCompletedAt, setEditingRecordCompletedAt] = useState<string>('')
  
  // ???å®Œæ?æ¬¡æ•¸çµ±è?
  const [consecutiveCount, setConsecutiveCount] = useState(0)
  
  // æ¨™ç±¤?¸é??€??- å·²ç§»??  // const [taskTags, setTaskTags] = useState<TaskTagWithCount[]>([])
  // const [selectedTagId, setSelectedTagId] = useState<string>('')
  // const [showTagModal, setShowTagModal] = useState(false)
  // const [newTagName, setNewTagName] = useState('')
  // const [newTagColor, setNewTagColor] = useState('#2196f3')
  // const [editingTag, setEditingTag] = useState<TaskTag | null>(null)
  // const [editingTagName, setEditingTagName] = useState('')
  // const [editingTagColor, setEditingTagColor] = useState('#2196f3')
  
  // ?¯å‡º?€?‹è???  const [exportStatus, setExportStatus] = useState<{
    show: boolean
    type: 'success' | 'warning' | 'error'
    message: string
  }>({
    show: false,
    type: 'success',
    message: ''
  })

  // å¾?localStorage è¼‰å…¥ç´€??  useEffect(() => {
    const savedRecords = localStorage.getItem('pomodoro-records')
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords))
      } catch (error) {
        console.error('è¼‰å…¥?ªè??˜ç??„å¤±??', error)
      }
    }
    
    // è¼‰å…¥???å®Œæ?æ¬¡æ•¸
    const savedConsecutiveCount = localStorage.getItem('pomodoro-consecutive-count')
    if (savedConsecutiveCount) {
      try {
        setConsecutiveCount(parseInt(savedConsecutiveCount))
      } catch (error) {
        console.error('è¼‰å…¥???å®Œæ?æ¬¡æ•¸å¤±æ?:', error)
      }
    }
  }, [])

  // è¼‰å…¥å°ˆæ³¨?…ç›®
  useEffect(() => {
    initializeDefaultFocusItems()
    const items = getFocusItemsWithCount()
    setFocusItems(items)
    // ?è¨­?¸æ?ç¬¬ä??‹é???    if (items.length > 0 && !selectedFocusItemId) {
      setSelectedFocusItemId(items[0].id)
    }
  }, [])

  // è¼‰å…¥æ¨™ç±¤ - å·²ç§»??  // useEffect(() => {
  //   initializeDefaultTaskTags()
  //   const tags = getTaskTagsWithCount()
  //   setTaskTags(tags)
  //   // ?è¨­?¸æ?ç¬¬ä??‹æ?ç±?  //   if (tags.length > 0 && !selectedTagId) {
  //     setSelectedTagId(tags[0].id)
  //   }
  // }, [])

  // è¨­ç½®?œå??¥æ??è¨­?¼ç‚ºä»Šå¤©
  useEffect(() => {
    const today = getTodayDate()
    setStartDate(today)
    setEndDate(today)
  }, [])

  // ?²å?ç´€?„åˆ° localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-records', JSON.stringify(records))
  }, [records])

  // ?²å????å®Œæ?æ¬¡æ•¸??localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-consecutive-count', consecutiveCount.toString())
  }, [consecutiveCount])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // ?‚é??°ä?ï¼Œå??›åˆ°ä¼‘æ¯?–å·¥ä½œæ???      if (isBreak) {
        setTimeLeft(workMinutes * 60) // å·¥ä??‚é?
        setIsBreak(false)
      } else {
        // å·¥ä??‚é?å®Œæ?ï¼Œè??„å??æ???        try {
          const selectedFocusItem = focusItems.find(item => item.id === selectedFocusItemId)
          // const selectedTag = taskTags.find(tag => tag.id === selectedTagId) // å·²ç§»?¤ä»»?™æ?ç±?          const completedAt = new Date()
          const startTime = new Date(completedAt.getTime() - workMinutes * 60 * 1000)
          
          // æª¢æŸ¥å¿…è?æ¬„ä?å®Œæ•´??          const requiredFields = {
            id: Date.now().toString(),
            completedAt: completedAt.toISOString(),
            workMinutes: workMinutes,
            breakMinutes: breakMinutes,
            focusItemId: selectedFocusItemId,
            focusItemName: selectedFocusItem?.name || '?ªé¸??,
            // tagId: selectedTagId, // å·²ç§»?¤ä»»?™æ?ç±?            // tagName: selectedTag?.name || '?ªé¸??, // å·²ç§»?¤ä»»?™æ?ç±?            // tagColor: selectedTag?.color || '#666666' // å·²ç§»?¤ä»»?™æ?ç±?          }
          
          // é©—è?å¿…è?æ¬„ä?
          if (!requiredFields.id || !requiredFields.completedAt || 
              !requiredFields.workMinutes || requiredFields.workMinutes <= 0) {
            throw new Error('å¿…è?æ¬„ä?ç¼ºå¤±?–ç„¡??)
          }
          
          const newRecord: PomodoroRecord = {
            ...requiredFields,
            title: `?ªè???${workMinutes} ?†é?`,
            description: `å®Œæ? ${workMinutes} ?†é?å°ˆæ³¨å·¥ä?ï¼Œä???${breakMinutes} ?†é?`
          }
          
          // è¨˜é?å°ˆæ³¨?…ç›®ä½¿ç”¨æ¬¡æ•¸
          if (selectedFocusItemId) {
            recordFocusItemUsage(selectedFocusItemId)
          }
          
          // è¨˜é?æ¨™ç±¤ä½¿ç”¨æ¬¡æ•¸ - å·²ç§»??          // if (selectedTagId) {
          //   recordTaskTagUsage(selectedTagId)
          // }
          
          // ?´æ–°è¨˜æ†¶é«”ä¸­?„ç???          setRecords(prevRecords => [newRecord, ...prevRecords])
          
          // ?²å???localStorage
          const updatedRecords = [newRecord, ...records]
          localStorage.setItem('pomodoro-records', JSON.stringify(updatedRecords))
          
          // å¢å????å®Œæ?æ¬¡æ•¸
          setConsecutiveCount(prev => prev + 1)
          
          // é¡¯ç¤º?å??ç¤º
          showExportStatus('success', '??ç´€?„å·²?²å?')
          
        } catch (error) {
          console.error('?²å??ªè??˜ç??„å¤±??', error)
          showExportStatus('error', '???¬æ¬¡ç´€?„æœª?å??²å?')
          return // ä¸ç¹¼çºŒåŸ·è¡Œå?çºŒé?è¼?        }
        
        // å¦‚æ?ä¼‘æ¯?‚é???0ï¼Œç›´?¥è·³?ä??¯é?æ®?        if (breakMinutes === 0) {
          setTimeLeft(workMinutes * 60) // ?´æ¥?²å…¥ä¸‹ä?è¼ªå·¥ä½œæ???          setIsBreak(false)
        } else {
          setTimeLeft(breakMinutes * 60) // ä¼‘æ¯?‚é?
          setIsBreak(true)
        }
      }
      setIsRunning(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, isBreak])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // ?²å?ä»Šå¤©?„æ—¥?Ÿï?yyyy-mm-dd ?¼å?ï¼?  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // è¨ˆç??²åº¦?¾å?æ¯?  const getProgressPercentage = () => {
    const totalSeconds = isBreak ? breakMinutes * 60 : workMinutes * 60
    return ((totalSeconds - timeLeft) / totalSeconds) * 100
  }

  // ?“å½¢è¨ˆæ??¨ç?ä»?  const CircularTimer = () => {
    const progress = getProgressPercentage()
    
    // ?¿æ?å¼å°ºå¯?- ?¹æ??¢å?å¯¬åº¦èª¿æ•´
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const radius = isMobile ? 140 : 160
    const strokeWidth = isMobile ? 14 : 16
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = circumference - (progress / 100) * circumference

    // ?²å??¶å??¸æ??„å?æ³¨é??®é??²ï?å¦‚æ?æ²’æ??¸æ??‡ä½¿?¨é?è¨­é???    const selectedFocusItem = focusItems.find(item => item.id === selectedFocusItemId)
    const timerColor = selectedFocusItem?.color || (isBreak ? '#ff6b6b' : '#e74c3c')

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        margin: '40px auto'
      }}>
        <svg
          width={radius * 2}
          height={radius * 2}
          style={{
            transform: 'rotate(-90deg)',
            filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15))',
            maxWidth: '100%',
            height: 'auto'
          }}
        >
          {/* ?Œæ™¯?“ç’° */}
          <circle
            stroke="#f0f0f0"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              strokeLinecap: 'round',
              opacity: 0.3
            }}
          />
          {/* ?²åº¦?“ç’° */}
          <circle
            stroke={timerColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{
              strokeDashoffset,
              strokeLinecap: 'round',
              transition: 'stroke-dashoffset 0.5s ease-in-out',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        
        {/* ä¸­å¤®?‚é?é¡¯ç¤º */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: timerColor,
          width: '100%',
          maxWidth: '200px'
        }}>
          <div style={{
            fontSize: isMobile ? '2.2rem' : '2.8rem',
            fontWeight: 'bold',
            lineHeight: 1,
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{
            fontSize: isMobile ? '0.9rem' : '1.1rem',
            fontWeight: '600',
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            {isBreak ? 'ä¼‘æ¯?‚é?' : 'å·¥ä??‚é?'}
          </div>
        </div>
      </div>
    )
  }

  const formatRecordTime = (isoString: string) => {
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}/${month}/${day} ${hours}:${minutes}`
  }

  const clearRecords = () => {
    if (window.confirm('ç¢ºå?è¦æ??¤æ??‰å??ç??„å?ï¼?)) {
      setRecords([])
    }
  }


  // è§??å¤šé??µå??œå??è¼¯
  const parseSearchKeywords = (keyword: string) => {
    // æª¢æŸ¥?¯å¦?…å« OR æ¢ä»¶ï¼ˆä½¿??| ??orï¼?    if (keyword.includes('|') || keyword.toLowerCase().includes(' or ')) {
      // OR ?è¼¯ï¼šä½¿??| ??or ?†é?
      const orKeywords = keyword.split(/[|]| or /i).map(k => k.trim()).filter(k => k.length > 0)
      return { type: 'or', keywords: orKeywords }
    } else {
      // AND ?è¼¯ï¼šä½¿?¨ç©º?¼å???      const andKeywords = keyword.split(/\s+/).filter(k => k.length > 0)
      return { type: 'and', keywords: andKeywords }
    }
  }

  // æª¢æŸ¥?®ä?æ¬„ä??¯å¦?…å«?€?‰é??µå?ï¼ˆAND ?è¼¯ï¼?  const checkFieldContainsAllKeywords = (fieldValue: string, keywords: string[]) => {
    return keywords.every(keyword => fieldValue.includes(keyword))
  }

  // æª¢æŸ¥?®ä?æ¬„ä??¯å¦?…å«ä»»ä??œéµå­—ï?OR ?è¼¯ï¼?  const checkFieldContainsAnyKeyword = (fieldValue: string, keywords: string[]) => {
    return keywords.some(keyword => fieldValue.includes(keyword))
  }

  // å»ºè­°?œéµå­?  const suggestedKeywords = [
    'å¯«ä?', 'è®€??, '?‹å?', '?¥æƒ³', 'å·¥ä?', '?ƒè­°', 'å­¸ç?', 'å°ˆæ?', 'ç¨‹å?è¨­è?', 'è¨­è?',
    '?‹å?ï½œå†¥??, 'å·¥ä?ï½œæ?è­?, 'è®€?¸ï?å­¸ç?', 'å¯«ä?ï½œè¨­è¨?
  ]

  // è¼‰å…¥?œå?æ­·å²
  useEffect(() => {
    const savedHistory = localStorage.getItem('pomodoro-search-history')
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory)
        setSearchHistory(Array.isArray(history) ? history : [])
      } catch (error) {
        console.error('è¼‰å…¥?œå?æ­·å²å¤±æ?:', error)
        setSearchHistory([])
      }
    }
  }, [])

  // ?²å??œå?æ­·å²
  const saveSearchHistory = (keyword: string) => {
    if (!keyword.trim()) return
    
    const trimmedKeyword = keyword.trim()
    setSearchHistory(prev => {
      const newHistory = [trimmedKeyword, ...prev.filter(k => k !== trimmedKeyword)].slice(0, 5)
      localStorage.setItem('pomodoro-search-history', JSON.stringify(newHistory))
      return newHistory
    })
  }

  // é»æ?å»ºè­°?–æ­·?²é??µå?
  const handleKeywordClick = (keyword: string) => {
    setSearchKeyword(keyword)
    setShowSuggestions(false)
    setIsSearching(true)
    saveSearchHistory(keyword)
  }

  // æ¸…é™¤?œå?æ­·å²
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('pomodoro-search-history')
  }

  // ç¯©é¸ç´€??  const getFilteredRecords = () => {
    let filtered = records

    // ?œéµå­—æ?å°?    if (searchKeyword.trim()) {
      const searchLogic = parseSearchKeywords(searchKeyword.trim())
      
      filtered = filtered.filter(record => {
        let fieldMatches = false
        
        // ?¹æ??¸æ??„æ?ä½é€²è??œå?
        if (searchFields.focusItem) {
          // æ¯”å?å°ˆæ³¨?…ç›®?ç¨±
          const focusItemName = record.focusItemName || ''
          // const tagName = record.tagName || '' // å·²ç§»?¤ä»»?™æ?ç±?          const focusFieldValue = `${focusItemName}`.trim()
          
          if (searchLogic.type === 'and') {
            if (checkFieldContainsAllKeywords(focusFieldValue, searchLogic.keywords)) fieldMatches = true
          } else {
            if (checkFieldContainsAnyKeyword(focusFieldValue, searchLogic.keywords)) fieldMatches = true
          }
        }
        
        if (searchFields.description) {
          // æ¯”å?æ¨™é??Œæ?è¿?          const title = record.title || ''
          const description = record.description || ''
          const descFieldValue = `${title} ${description}`.trim()
          
          if (searchLogic.type === 'and') {
            if (checkFieldContainsAllKeywords(descFieldValue, searchLogic.keywords)) fieldMatches = true
          } else {
            if (checkFieldContainsAnyKeyword(descFieldValue, searchLogic.keywords)) fieldMatches = true
          }
        }
        
        if (searchFields.time) {
          // æ¯”å??‚é?å­—ä¸²ï¼ˆå??¨ç¬¦?ˆï?
          const completedAt = new Date(record.completedAt)
          const timeStr = completedAt.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
          
          if (searchLogic.type === 'and') {
            if (checkFieldContainsAllKeywords(timeStr, searchLogic.keywords)) fieldMatches = true
          } else {
            if (checkFieldContainsAnyKeyword(timeStr, searchLogic.keywords)) fieldMatches = true
          }
        }
        
        return fieldMatches
      })
    }

    // ?¥æ?ç¯„å?ç¯©é¸
    if (startDate || endDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.completedAt)
        const recordDateStr = recordDate.toISOString().split('T')[0] // yyyy-mm-dd

        if (startDate && endDate) {
          return recordDateStr >= startDate && recordDateStr <= endDate
        } else if (startDate) {
          return recordDateStr >= startDate
        } else if (endDate) {
          return recordDateStr <= endDate
        }
        return true
      })
    }

    return filtered
  }

  // å¥—ç”¨?œå?
  const applySearch = () => {
    setIsSearching(true)
  }

  // æ¸…é™¤?œå?
  const clearSearch = () => {
    setSearchKeyword('')
    setStartDate('')
    setEndDate('')
    setIsSearching(false)
  }

  // å°ˆæ³¨?…ç›®ç®¡ç??½æ•¸
  const handleAddFocusItem = () => {
    if (newFocusItemName.trim()) {
      addFocusItem(newFocusItemName.trim())
      const updatedItems = getFocusItemsWithCount()
      setFocusItems(updatedItems)
      setNewFocusItemName('')
      setShowFocusItemModal(false)
    }
  }

  const handleEditFocusItem = (item: FocusItem) => {
    setEditingFocusItem(item)
    setEditingFocusItemName(item.name)
  }

  const handleUpdateFocusItem = () => {
    if (editingFocusItem && editingFocusItemName.trim()) {
      const success = updateFocusItem(editingFocusItem.id, editingFocusItemName.trim())
      if (success) {
        const updatedItems = getFocusItemsWithCount()
        setFocusItems(updatedItems)
        setEditingFocusItem(null)
        setEditingFocusItemName('')
      }
    }
  }

  const handleDeleteFocusItem = (id: string) => {
    if (window.confirm('ç¢ºå?è¦åˆª?¤é€™å€‹å?æ³¨é??®å?ï¼?)) {
      const success = deleteFocusItem(id)
      if (success) {
        const updatedItems = getFocusItemsWithCount()
        setFocusItems(updatedItems)
        // å¦‚æ??ªé™¤?„æ˜¯?¶å??¸ä¸­?„é??®ï??¸æ?ç¬¬ä??‹é???        if (selectedFocusItemId === id && updatedItems.length > 0) {
          setSelectedFocusItemId(updatedItems[0].id)
        }
      }
    }
  }

  // è¨˜é?ç·¨è¼¯?Œåˆª?¤å‡½??  const handleEditRecord = (record: PomodoroRecord) => {
    setEditingRecord(record)
    setEditingRecordFocusItemId(record.focusItemId || '')
    // å°?ISO ?¥æ?è½‰æ???yyyy-mm-dd ?¼å?
    const date = new Date(record.completedAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    setEditingRecordCompletedAt(`${year}-${month}-${day}`)
  }

  const handleUpdateRecord = () => {
    if (editingRecord) {
      const selectedFocusItem = focusItems.find(item => item.id === editingRecordFocusItemId)
      const updatedRecord: PomodoroRecord = {
        ...editingRecord,
        focusItemId: editingRecordFocusItemId,
        focusItemName: selectedFocusItem?.name || '?ªé¸??,
        completedAt: new Date(editingRecordCompletedAt).toISOString()
      }
      
      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === editingRecord.id ? updatedRecord : record
        )
      )
      
      setEditingRecord(null)
      setEditingRecordFocusItemId('')
      setEditingRecordCompletedAt('')
    }
  }

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('ç¢ºå?è¦åˆª?¤é€™ç?è¨˜é??ï?')) {
      setRecords(prevRecords => prevRecords.filter(record => record.id !== recordId))
    }
  }

  // é¡¯ç¤º?¯å‡º?€?‹è???  const showExportStatus = (type: 'success' | 'warning' | 'error', message: string) => {
    setExportStatus({
      show: true,
      type,
      message
    })
    
    // 5ç§’å??ªå??±è?
    setTimeout(() => {
      setExportStatus(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  // ?‹å??œé??€?‹è???  const hideExportStatus = () => {
    setExportStatus(prev => ({ ...prev, show: false }))
  }

  // è¨ˆç?æ¯é€±çµ±è¨ˆè???  const getWeeklyStats = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1) // ?±ä??‹å?
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // ?±æ—¥çµæ?
    endOfWeek.setHours(23, 59, 59, 999)

    const weeklyData = [
      { day: '?±ä?', count: 0, totalMinutes: 0 },
      { day: '?±ä?', count: 0, totalMinutes: 0 },
      { day: '?±ä?', count: 0, totalMinutes: 0 },
      { day: '?±å?', count: 0, totalMinutes: 0 },
      { day: '?±ä?', count: 0, totalMinutes: 0 },
      { day: '?±å…­', count: 0, totalMinutes: 0 },
      { day: '?±æ—¥', count: 0, totalMinutes: 0 }
    ]

    records.forEach(record => {
      const recordDate = new Date(record.completedAt)
      if (recordDate >= startOfWeek && recordDate <= endOfWeek) {
        const dayOfWeek = recordDate.getDay()
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // ?±æ—¥èª¿æ•´?ºæ?å¾Œä???        
        weeklyData[dayIndex].count += 1
        weeklyData[dayIndex].totalMinutes += record.workMinutes
      }
    })

    return weeklyData
  }

  const handleStart = () => {
    // æª¢æŸ¥?¯å¦å·²é¸?‡ä»»?™é???    if (!selectedFocusItemId) {
      showExportStatus('warning', '? ï? è«‹å??¸æ?ä¸€?‹ä»»?™é???)
      return
    }
    
    // å¦‚æ??¶å?æ²’æ??¨è??‚ï??æ–°è¨­å??‚é?
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(isBreak ? breakMinutes * 60 : workMinutes * 60)
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(workMinutes * 60)
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
          backgroundColor: 'transparent',
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
          e.currentTarget.style.backgroundColor = '#f0f0f0'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        >
          ???é???        </button>
      </Link>
      
      <h1>?? ?ªè??˜è??‚å™¨</h1>
      
      {/* ?¯å‡º?€?‹è???*/}
      {exportStatus.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          maxWidth: '400px',
          width: '90%',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'slideDown 0.3s ease-out',
          backgroundColor: exportStatus.type === 'success' ? '#d4edda' : 
                          exportStatus.type === 'warning' ? '#fff3cd' : '#f8d7da',
          border: `1px solid ${exportStatus.type === 'success' ? '#c3e6cb' : 
                              exportStatus.type === 'warning' ? '#ffeaa7' : '#f5c6cb'}`,
          color: exportStatus.type === 'success' ? '#28a745' : 
                 exportStatus.type === 'warning' ? '#856404' : '#721c24'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            flex: 1
          }}>
            {exportStatus.message}
          </div>
          <button
            onClick={hideExportStatus}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'inherit',
              opacity: 0.7,
              marginLeft: '10px',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '0.7'
            }}
          >
            ?
          </button>
        </div>
      )}
      
      {/* ?“å½¢è¨ˆæ???*/}
      <div className="card">
        <CircularTimer />
      </div>

      {/* ???å®Œæ?æ¬¡æ•¸é¡¯ç¤º */}
      {consecutiveCount > 0 && (
        <div style={{
          textAlign: 'center',
          margin: '20px 0',
          padding: '15px',
          backgroundColor: '#e8f5e8',
          borderRadius: '12px',
          border: '2px solid #4caf50'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2e7d32',
            marginBottom: '5px'
          }}>
            ?? ???å®Œæ? {consecutiveCount} è¼ªç•ª?„é?ï¼?          </div>
          <div style={{
            fontSize: '14px',
            color: '#388e3c'
          }}>
            ä¿æ?å°ˆæ³¨ï¼Œç¹¼çºŒå?æ²¹ï?
          </div>
        </div>
      )}

      {/* å°ˆæ³¨?…ç›®?¸æ??€??*/}
      <div className="card">
        <h3 style={{ 
          margin: '0 0 20px 0', 
          color: '#333',
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          ?¯ å°ˆæ³¨?…ç›®
        </h3>
        
        {/* å°ˆæ³¨?…ç›®?¸æ?ä¸‹æ??¸å–®ï¼ˆå?é¡¯ç¤º/?¸æ?ï¼Œä??«ç®¡?†ï?*/}
        <div style={{ marginBottom: '20px' }}>
          <select
            value={selectedFocusItemId}
            onChange={(e) => setSelectedFocusItemId(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: '#333',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4ecdc4'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0'
            }}
          >
            {focusItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} {item.usageCount > 0 && `(${item.usageCount}æ¬?`}
              </option>
            ))}
          </select>
        </div>

        {/* ç®¡ç?å°å??‰é? */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a href="/projects" className="rounded px-4 py-2" style={{
            backgroundColor: '#4ecdc4',
            textDecoration: 'none',
            fontWeight: 600
          }}>ç®¡ç?å°ˆæ?</a>
        </div>
      </div>

      {/* æ¨™ç±¤?¸æ??€??- å·²ç§»??*/}
      {/* <div className="card">
        <h3 style={{ 
          margin: '0 0 20px 0', 
          color: '#333',
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          ?·ï¸?ä»»å?æ¨™ç±¤
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '15px'
          }}>
            {taskTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTagId(tag.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedTagId === tag.id ? tag.color : '#f0f0f0',
                  color: selectedTagId === tag.id ? 'white' : '#333',
                  border: `2px solid ${selectedTagId === tag.id ? tag.color : '#e0e0e0'}`,
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  if (selectedTagId !== tag.id) {
                    e.currentTarget.style.backgroundColor = tag.color
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.borderColor = tag.color
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedTagId !== tag.id) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0'
                    e.currentTarget.style.color = '#333'
                    e.currentTarget.style.borderColor = '#e0e0e0'
                  }
                }}
              >
                <div 
                  className="color-dot"
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: selectedTagId === tag.id ? '#ffffff' : tag.color,
                    border: `2px solid ${selectedTagId === tag.id ? tag.color : '#ffffff'}`,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                  }} 
                />
                {tag.name}
                {tag.usageCount > 0 && (
                  <span style={{
                    fontSize: '12px',
                    opacity: 0.8
                  }}>
                    ({tag.usageCount})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setShowTagModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1976d2'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#2196f3'
            }}
          >
            ??ç®¡ç?æ¨™ç±¤
          </button>
        </div>
      </div> */}

      {/* ?‚é?è¨­å??€??*/}
      <div className="card" style={{
        marginBottom: '30px',
        border: '1px solid #e9ecef',
        maxWidth: '500px',
        margin: '0 auto 30px auto'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          color: '#333',
          fontSize: '1.2rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          ?™ï? ?‚é?è¨­å?
        </h3>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* å·¥ä??‚é?è¨­å? */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              å·¥ä??‚é?ï¼ˆå??˜ï?
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={workMinutes}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 25
                setWorkMinutes(value)
                if (!isRunning && !isBreak) {
                  setTimeLeft(value * 60)
                }
              }}
              style={{
                width: '80px',
                padding: '10px 12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '600',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4ecdc4'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
              }}
            />
          </div>

          {/* ?†é?ç·?*/}
          <div style={{
            width: '1px',
            height: '40px',
            backgroundColor: '#ddd',
            margin: '0 10px'
          }} />

          {/* ä¼‘æ¯?‚é?è¨­å? */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              ä¼‘æ¯?‚é?ï¼ˆå??˜ï?
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={breakMinutes}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0
                setBreakMinutes(value)
              }}
              style={{
                width: '80px',
                padding: '10px 12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '600',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4ecdc4'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        {!isRunning ? (
          <button className="w-full sm:w-auto" onClick={handleStart} style={{ 
            backgroundColor: '#4ecdc4', 
            color: 'white',
            padding: '18px 36px',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            ?‹å?è¨ˆæ?
          </button>
        ) : (
          <button className="w-full sm:w-auto" onClick={handlePause} style={{ 
            backgroundColor: '#ff6b6b', 
            color: 'white',
            padding: '18px 36px',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            ?«å?è¨ˆæ?
          </button>
        )}
        
        <button className="w-full sm:w-auto" onClick={handleReset} style={{ 
          backgroundColor: '#95a5a6', 
          color: 'white',
          padding: '18px 36px',
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          ?æ–°?‹å?
        </button>
      </div>

      {/* æ¯é€±çµ±è¨ˆå?è¡¨å?å¡?*/}
      <div className="card bg-gray-50 p-4 sm:p-6 rounded-xl mx-auto border border-gray-200" style={{
        margin: '30px auto',
        maxWidth: '600px'
      }}>
        <h3 className="text-lg sm:text-xl font-semibold text-center text-gray-800 mb-5">
          ?? ?¬é€±çµ±è¨?        </h3>
        
        {(() => {
          const weeklyData = getWeeklyStats()
          const hasData = weeklyData.some(day => day.count > 0)
          
          if (!hasData) {
            return (
              <div className="text-center py-10 px-5 text-gray-600 text-lg font-medium">
                ?? ?¬é€±å??¡å??ç???              </div>
            )
          }
          
          const maxCount = Math.max(...weeklyData.map(day => day.count))
          
          return (
            <div className="flex flex-col gap-3 px-2 sm:px-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center gap-3 min-h-10">
                  {/* ?¥æ?æ¨™ç±¤ */}
                  <div className="w-12 sm:w-14 text-sm sm:text-base font-semibold text-gray-700 text-center flex-shrink-0">
                    {day.day}
                  </div>
                  
                  {/* ?–è¡¨æ¢?*/}
                  <div className="flex-1 h-8 bg-gray-200 rounded-full relative overflow-hidden min-w-24">
                    <div 
                      className="h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{
                        width: maxCount > 0 ? `${(day.count / maxCount) * 100}%` : '0%',
                        backgroundColor: day.count > 0 ? '#4ecdc4' : '#e9ecef'
                      }}
                    >
                      {day.count > 0 && (
                        <span className="text-xs font-semibold drop-shadow-sm">
                          {day.count} é¡?                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* ?¸å€¼é¡¯ç¤?*/}
                  <div className="w-16 sm:w-20 text-right text-sm sm:text-base font-semibold flex-shrink-0 flex items-center justify-end pr-3">
                    <span className={day.count > 0 ? 'text-teal-500' : 'text-gray-400'}>
                      {day.count > 0 ? `${day.count} é¡†` : '0 é¡?}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* çµ±è??˜è? */}
              <div className="mt-5 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-sm sm:text-base font-semibold text-green-700">
                    ?? ?¬é€±ç¸½è¨ˆï?{weeklyData.reduce((sum, day) => sum + day.count, 0)} é¡†ç•ª??                  </div>
                  <div className="text-sm sm:text-base font-semibold text-green-700">
                    ?±ï? ç¸½æ??·ï?{weeklyData.reduce((sum, day) => sum + day.totalMinutes, 0)} ?†é?
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* å®Œæ?ç´€?„å?å¡?*/}
      <div className="card max-w-md mx-auto" style={{
        marginTop: '50px',
        maxWidth: '600px',
        margin: '50px auto 0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 m-0">
            ?? å®Œæ?ç´€??          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center'
          }}>
            {/* ?¯å‡º?€?‹æ?ç¤?*/}
            {exportStatus.show && exportStatus.type === 'success' && (
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '6px',
                color: '#28a745',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                animation: 'slideDown 0.3s ease-out'
              }}>
                {exportStatus.message}
              </div>
            )}
            
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              {/* ?¯å‡º CSV ?‰é? */}
            <button
              onClick={() => {
                // ?–å??®å??œå?çµæ?
                const filteredRecords = getFilteredRecords()
                
                if (filteredRecords.length === 0) {
                  showExportStatus('warning', '? ï? ?®å??¡å¯?¯å‡º?„ç???)
                  return
                }
                
                // ç«‹å³é¡¯ç¤º?å??ç¤º
                showExportStatus('success', `??å·²æ??ŸåŒ¯??${filteredRecords.length} ç­†ç??„ï?`)
                
                // ?·è??¯å‡º
                exportPomodoroRecordsToCSV(filteredRecords)
              }}
              disabled={getFilteredRecords().length === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: getFilteredRecords().length > 0 ? '#28a745' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: getFilteredRecords().length > 0 ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                if (getFilteredRecords().length > 0) {
                  e.currentTarget.style.backgroundColor = '#218838'
                }
              }}
              onMouseOut={(e) => {
                if (getFilteredRecords().length > 0) {
                  e.currentTarget.style.backgroundColor = '#28a745'
                }
              }}
              title="?…åŒ¯?ºç›®?æ?å°‹ç??œç?ç´€?„è??™ï?ä¸å??«å…¨?¨ï?"
            >
              ?’¾ ?¯å‡º?®å?çµæ?
            </button>
            
            {records.length > 0 && (
            <button
              onClick={clearRecords}
              style={{
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#ff5252'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ff6b6b'
              }}
            >
              æ¸…é™¤ç´€??            </button>
            )}
            </div>
          </div>
        </div>

        {/* ?œå??Ÿèƒ½?€å¡?*/}
        {records.length > 0 && (
          <div className="card" style={{
            marginBottom: '20px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{
              margin: '0 0 15px 0',
              color: '#333',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              ?? ?œå?ç´€??            </h4>
            
            {/* ?œå?è¼¸å…¥?€??*/}
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                {/* ?œå?è¼¸å…¥æ¡?*/}
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="è¼¸å…¥?œéµå­—æ?å°‹ç??„â€?
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value)
                      setShowSuggestions(e.target.value.trim() === '')
                    }}
                    onFocus={() => {
                      setIsSearchInputFocused(true)
                      setShowSuggestions(true)
                    }}
                    onBlur={() => {
                      setIsSearchInputFocused(false)
                      // å»¶é²?±è?å»ºè­°ï¼Œè?é»æ?äº‹ä»¶?½å?è§¸ç™¼
                      setTimeout(() => setShowSuggestions(false), 200)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      color: '#333',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* ?œå??‰é? */}
                <button
                  onClick={() => {
                    if (searchKeyword.trim()) {
                      setIsSearching(true)
                      saveSearchHistory(searchKeyword)
                    }
                  }}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#4ecdc4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#45b7b8'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#4ecdc4'
                  }}
                >
                  ?? ?œå?
                </button>
              </div>

              {/* ?œå?å»ºè­°?Œæ­·??*/}
              {showSuggestions && isSearchInputFocused && (
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                  marginTop: '5px',
                  zIndex: 1000,
                  position: 'relative'
                }}>
                  {/* ?€è¿‘æ?å°?*/}
                  {searchHistory.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '6px',
                        fontWeight: '600'
                      }}>
                        ?? ?€è¿‘æ?å°‹ï?
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        {searchHistory.map((keyword, index) => (
                          <button
                            key={index}
                            onClick={() => handleKeywordClick(keyword)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              border: '1px solid #dee2e6',
                              borderRadius: '4px',
                              fontSize: '12px',
                              color: '#495057',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#e9ecef'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            {keyword}
                          </button>
                        ))}
                        <button
                          onClick={clearSearchHistory}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'transparent',
                            border: '1px solid #dc3545',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#dc3545',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc3545'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = '#dc3545'
                          }}
                        >
                          æ¸…é™¤
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ?±é?å»ºè­° */}
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '6px',
                      fontWeight: '600'
                    }}>
                      ?”¥ ?±é?å»ºè­°ï¼?                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {suggestedKeywords.slice(0, 8).map((keyword, index) => (
                        <button
                          key={index}
                          onClick={() => handleKeywordClick(keyword)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#e3f2fd',
                            border: '1px solid #bbdefb',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#1976d2',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#bbdefb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#e3f2fd'
                          }}
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ?œå?æ¬„ä??¸æ???*/}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#555'
              }}>
                ?”½ ?¸æ?æ¬„ä?ï¼?              </label>
              <div style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <button
                  onClick={() => setSearchFields({
                    focusItem: true,
                    description: true,
                    time: true
                  })}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    color: '#495057',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  ?¨é¸
                </button>
                <button
                  onClick={() => setSearchFields({
                    focusItem: false,
                    description: false,
                    time: false
                  })}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    color: '#495057',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  ?¨ä???                </button>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={searchFields.focusItem}
                    onChange={(e) => setSearchFields(prev => ({
                      ...prev,
                      focusItem: e.target.checked
                    }))}
                    className="accent-blue-500 dark:accent-green-400"
                    style={{
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span>å°ˆæ³¨ä»»å??ç¨±</span>
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={searchFields.description}
                    onChange={(e) => setSearchFields(prev => ({
                      ...prev,
                      description: e.target.checked
                    }))}
                    className="accent-blue-500 dark:accent-green-400"
                    style={{
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span>ä»»å??§å®¹/?è¿°</span>
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={searchFields.time}
                    onChange={(e) => setSearchFields(prev => ({
                      ...prev,
                      time: e.target.checked
                    }))}
                    className="accent-blue-500 dark:accent-green-400"
                    style={{
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span>?‹å?/çµæ??‚é?</span>
                </label>
              </div>
            </div>

            {/* ?¥æ?ç¯„å??œå? */}
            <div style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '15px'
            }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '5px',
                  fontWeight: '500'
                }}>
                  ?‹å??¥æ?
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    color: '#333',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ecdc4'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                  }}
                />
              </div>
              
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '5px',
                  fontWeight: '500'
                }}>
                  çµæ??¥æ?
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    color: '#333',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ecdc4'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                  }}
                />
              </div>
            </div>

            {/* ?œå??‰é? */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={clearSearch}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#7f8c8d'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#95a5a6'
                }}
              >
                æ¸…é™¤?œå?
              </button>
              <button
                onClick={applySearch}
                style={{
                  backgroundColor: '#4ecdc4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#45b7b8'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#4ecdc4'
                }}
              >
                å¥—ç”¨?œå?
              </button>
            </div>
          </div>
        )}

        {records.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '16px',
            padding: '40px 20px',
            backgroundColor: 'transparent',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            ?? ?„æ??‰å??ç???br />
            å®Œæ?ä¸€æ¬¡ç•ª?„é?å¾Œæ?é¡¯ç¤º?¨é€™è£¡
          </div>
        ) : (() => {
          const filteredRecords = getFilteredRecords()
          const displayRecords = isSearching ? filteredRecords : records
          
          return (
            <>
              {isSearching && (
                <div style={{
                  marginBottom: '15px',
                  padding: '10px 15px',
                  backgroundColor: filteredRecords.length > 0 ? '#e3f2fd' : '#fff3cd',
                  borderRadius: '8px',
                  border: `1px solid ${filteredRecords.length > 0 ? '#bbdefb' : '#ffeaa7'}`,
                  fontSize: '14px',
                  color: filteredRecords.length > 0 ? '#1976d2' : '#856404'
                }}>
                  {filteredRecords.length > 0 ? (
                    <>
                      ?? ?œå?çµæ?ï¼šæ‰¾??{filteredRecords.length} ç­†ç???                      {(searchKeyword || startDate || endDate) && (
                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                          ï¼ˆé??µå?ï¼š{searchKeyword || '??} | æ¬„ä?ï¼š{[
                            searchFields.focusItem && 'å°ˆæ³¨ä»»å?',
                            searchFields.description && '?§å®¹?è¿°',
                            searchFields.time && '?‚é?'
                          ].filter(Boolean).join('??)} | ?¥æ?ï¼š{startDate || 'ä¸é?'} ï½?{endDate || 'ä¸é?'}ï¼?                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      ? ï? ?ªæ‰¾?°ç¬¦?ˆã€Œ{searchKeyword}?ç?ç´€??                      {(startDate || endDate) && (
                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                          ï¼ˆæ—¥?Ÿï?{startDate || 'ä¸é?'} ï½?{endDate || 'ä¸é?'}ï¼?                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {displayRecords.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '16px',
                  padding: '40px 20px',
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  {isSearching ? (
                    <>
                      ? ï? ?ªæ‰¾?°ç¬¦?ˆã€Œ{searchKeyword}?ç?ç´€??br />
                      è«‹å?è©¦å…¶ä»–é??µå??–èª¿?´æ?å°‹æ?ä»?                    </>
                  ) : (
                    <>
                      ?? ?„æ??‰å??ç???br />
                      å®Œæ?ä¸€æ¬¡ç•ª?„é?å¾Œæ?é¡¯ç¤º?¨é€™è£¡
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-lg shadow p-4" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {displayRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-lg shadow p-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    fontSize: '20px'
                  }}>
                    ??                  </div>
                  <div style={{
                    flex: 1
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '4px'
                    }}>
                      {record.title || 'å®Œæ?ä¸€è¼?}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '6px'
                    }}>
                      {formatRecordTime(record.completedAt)}
                    </div>
                    {record.focusItemName && (
                      <div style={{
                        fontSize: '13px',
                        color: '#4ecdc4',
                        fontWeight: '600',
                        marginBottom: '4px',
                        backgroundColor: '#f0f8ff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginRight: '8px'
                      }}>
                        ?¯ {record.focusItemName}
                      </div>
                    )}
                    {/* {record.tagName && (
                      <div style={{
                        fontSize: '13px',
                        color: 'white',
                        fontWeight: '600',
                        marginBottom: '4px',
                        backgroundColor: record.tagColor || '#666666',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        ?·ï¸?{record.tagName}
                      </div>
                    )} */}
                    {record.description && (
                      <div style={{
                        fontSize: '13px',
                        color: '#888',
                        marginBottom: '6px',
                        fontStyle: 'italic'
                      }}>
                        {record.description}
                      </div>
                    )}
                    <div style={{
                      fontSize: '12px',
                      color: '#888',
                      display: 'flex',
                      gap: '16px'
                    }}>
                      <span>å·¥ä?ï¼š{record.workMinutes} ?†é?</span>
                      <span>ä¼‘æ¯ï¼š{record.breakMinutes} ?†é?</span>
                    </div>
                  </div>
                  
                  {/* ç·¨è¼¯?Œåˆª?¤æ???*/}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={() => handleEditRecord(record)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ffc107',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#e0a800'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffc107'
                      }}
                    >
                      ?? ç·¨è¼¯
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#c82333'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc3545'
                      }}
                    >
                      ?? ?ªé™¤
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
            </>
          )
        })()}
      </div>

      {/* å°ˆæ³¨?…ç›®ç®¡ç?æ¨¡æ?æ¡?*/}
      {showFocusItemModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#333',
              fontSize: '1.4rem',
              fontWeight: '600'
            }}>
              ?¯ å°ˆæ³¨?…ç›®ç®¡ç?
            </h3>

            {/* ?°å?å°ˆæ³¨?…ç›® */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ 
                margin: '0 0 15px 0', 
                color: '#555',
                fontSize: '1.1rem'
              }}>
                ?°å?å°ˆæ³¨?…ç›®
              </h4>
              <div className="flex flex-col gap-3 sm:flex-row" style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="è¼¸å…¥å°ˆæ³¨?…ç›®?ç¨±..."
                  value={newFocusItemName}
                  onChange={(e) => setNewFocusItemName(e.target.value)}
                  style={{
                    flex: 1,
                    height: '48px',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#ffffff',
                    color: '#333333',
                    fontWeight: '500',
                    minHeight: '48px',
                    width: '100%',
                    boxSizing: 'border-box',
                    zIndex: 1,
                    position: 'relative'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ecdc4'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddFocusItem()
                    }
                  }}
                />
                <button
                  className="w-full sm:w-auto"
                  onClick={handleAddFocusItem}
                  disabled={!newFocusItemName.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: newFocusItemName.trim() ? '#4ecdc4' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: newFocusItemName.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    height: '48px',
                    minWidth: '60px',
                    minHeight: '48px',
                    zIndex: 1,
                    position: 'relative'
                  }}
                >
                  ?°å?
                </button>
              </div>
            </div>

            {/* å°ˆæ³¨?…ç›®?—è¡¨ */}
            <div>
              <h4 style={{ 
                margin: '0 0 15px 0', 
                color: '#555',
                fontSize: '1.1rem'
              }}>
                å°ˆæ³¨?…ç›®?—è¡¨
              </h4>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {focusItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      backgroundColor: 'transparent',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        className="color-dot"
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: item.color || '#4caf50',
                          border: '2px solid #ffffff',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                          flexShrink: 0,
                          filter: 'brightness(1.5) saturate(1.2)',
                          minWidth: '18px',
                          minHeight: '18px',
                          display: 'inline-block',
                          verticalAlign: 'middle'
                        }} 
                      />
                      <div>
                        <div 
                          className="focus-item-name"
                          style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#333',
                            marginBottom: '4px'
                          }}
                        >
                          {item.name}
                          {item.isDefault && (
                            <span 
                              className="default-tag"
                              style={{
                                fontSize: '12px',
                                color: '#666',
                                marginLeft: '8px',
                                backgroundColor: '#e9ecef',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '600'
                              }}
                            >
                              ?è¨­
                            </span>
                          )}
                        </div>
                        <div 
                          className="focus-item-usage"
                          style={{
                            fontSize: '16px',
                            color: '#666',
                            fontWeight: '500'
                          }}
                        >
                          ä½¿ç”¨ {item.usageCount} æ¬?                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!item.isDefault && (
                        <>
                          <button
                            onClick={() => handleEditFocusItem(item)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ffc107',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#e0a800'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffc107'
                            }}
                          >
                            ç·¨è¼¯
                          </button>
                          <button
                            onClick={() => handleDeleteFocusItem(item.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#c82333'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#dc3545'
                            }}
                          >
                            ?ªé™¤
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ?œé??‰é? */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => {
                  setShowFocusItemModal(false)
                  setNewFocusItemName('')
                  setEditingFocusItem(null)
                  setEditingFocusItemName('')
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6268'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d'
                }}
              >
                ?œé?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ç·¨è¼¯å°ˆæ³¨?…ç›®æ¨¡æ?æ¡?*/}
      {editingFocusItem && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#333',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              ç·¨è¼¯å°ˆæ³¨?…ç›®
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                value={editingFocusItemName}
                onChange={(e) => setEditingFocusItemName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ecdc4'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateFocusItem()
                  }
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setEditingFocusItem(null)
                  setEditingFocusItemName('')
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6268'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d'
                }}
              >
                ?–æ?
              </button>
              <button
                onClick={handleUpdateFocusItem}
                disabled={!editingFocusItemName.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: editingFocusItemName.trim() ? '#4ecdc4' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: editingFocusItemName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s'
                }}
              >
                ?²å?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ç·¨è¼¯è¨˜é?æ¨¡æ?æ¡?*/}
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
          zIndex: 1002
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#333',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              ?ï? ç·¨è¼¯è¨˜é?
            </h3>
            
            {/* å°ˆæ³¨?…ç›®?¸æ? */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                å°ˆæ³¨?…ç›®
              </label>
              <select
                value={editingRecordFocusItemId}
                onChange={(e) => setEditingRecordFocusItemId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  color: '#333',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ecdc4'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                }}
              >
                {focusItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* å®Œæ??‚é??¸æ? */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                å®Œæ??‚é?
              </label>
              <input
                type="date"
                value={editingRecordCompletedAt}
                onChange={(e) => setEditingRecordCompletedAt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  color: '#333',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ecdc4'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                }}
              />
            </div>

            {/* ?‰é??€??*/}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setEditingRecord(null)
                  setEditingRecordFocusItemId('')
                  setEditingRecordCompletedAt('')
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6268'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d'
                }}
              >
                ?–æ?
              </button>
              <button
                onClick={handleUpdateRecord}
                disabled={!editingRecordFocusItemId || !editingRecordCompletedAt}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (editingRecordFocusItemId && editingRecordCompletedAt) ? '#4ecdc4' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (editingRecordFocusItemId && editingRecordCompletedAt) ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s'
                }}
              >
                ?²å?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* æ¨™ç±¤ç®¡ç?æ¨¡æ?æ¡?- å·²ç§»??*/}
      {/* {showTagModal && (
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
          zIndex: 1003
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#333',
              fontSize: '1.4rem',
              fontWeight: '600'
            }}>
              ?·ï¸?æ¨™ç±¤ç®¡ç?
            </h3>

            {/* ?°å?æ¨™ç±¤ */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ 
                margin: '0 0 15px 0', 
                color: '#555',
                fontSize: '1.1rem'
              }}>
                ?°å?æ¨™ç±¤
              </h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="è¼¸å…¥æ¨™ç±¤?ç¨±..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196f3'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                  }}
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  style={{
                    width: '50px',
                    height: '50px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
                <button
                  onClick={() => {
                    if (newTagName.trim()) {
                      addTaskTag(newTagName.trim(), newTagColor)
                      const updatedTags = getTaskTagsWithCount()
                      setTaskTags(updatedTags)
                      setNewTagName('')
                      setNewTagColor(getRandomTagColor())
                    }
                  }}
                  disabled={!newTagName.trim()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: newTagName.trim() ? '#2196f3' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: newTagName.trim() ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s'
                  }}
                >
                  ?°å?
                </button>
              </div>
            </div>

            {/* æ¨™ç±¤?—è¡¨ */}
            <div>
              <h4 style={{ 
                margin: '0 0 15px 0', 
                color: '#555',
                fontSize: '1.1rem'
              }}>
                æ¨™ç±¤?—è¡¨
              </h4>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {taskTags.map((tag) => (
                  <div
                    key={tag.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      backgroundColor: 'transparent',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        className="color-dot"
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: tag.color,
                          border: '2px solid #ffffff',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                        }} 
                      />
                      <div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '4px'
                        }}>
                          {tag.name}
                          {tag.isDefault && (
                            <span style={{
                              fontSize: '12px',
                              color: '#666',
                              marginLeft: '8px',
                              backgroundColor: '#e9ecef',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              ?è¨­
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#666'
                        }}>
                          ä½¿ç”¨ {tag.usageCount} æ¬?                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!tag.isDefault && (
                        <>
                          <button
                            onClick={() => {
                              setEditingTag(tag)
                              setEditingTagName(tag.name)
                              setEditingTagColor(tag.color)
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ffc107',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#e0a800'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffc107'
                            }}
                          >
                            ç·¨è¼¯
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('ç¢ºå?è¦åˆª?¤é€™å€‹æ?ç±¤å?ï¼?)) {
                                const success = deleteTaskTag(tag.id)
                                if (success) {
                                  const updatedTags = getTaskTagsWithCount()
                                  setTaskTags(updatedTags)
                                  // å¦‚æ??ªé™¤?„æ˜¯?¶å??¸ä¸­?„æ?ç±¤ï??¸æ?ç¬¬ä??‹æ?ç±?                                  if (selectedTagId === tag.id && updatedTags.length > 0) {
                                    setSelectedTagId(updatedTags[0].id)
                                  }
                                }
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#c82333'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#dc3545'
                            }}
                          >
                            ?ªé™¤
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ?œé??‰é? */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => {
                  setShowTagModal(false)
                  setNewTagName('')
                  setNewTagColor(getRandomTagColor())
                  setEditingTag(null)
                  setEditingTagName('')
                  setEditingTagColor('#2196f3')
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6268'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d'
                }}
              >
                ?œé?
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* ç·¨è¼¯æ¨™ç±¤æ¨¡æ?æ¡?- å·²ç§»??*/}
      {/* {editingTag && (
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
          zIndex: 1004
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#333',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              ç·¨è¼¯æ¨™ç±¤
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={editingTagName}
                  onChange={(e) => setEditingTagName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196f3'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                  }}
                />
                <input
                  type="color"
                  value={editingTagColor}
                  onChange={(e) => setEditingTagColor(e.target.value)}
                  style={{
                    width: '50px',
                    height: '50px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
            </div> */}
          </div> */}
        </div> */}

            {/* <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setEditingTag(null)
                  setEditingTagName('')
                  setEditingTagColor('#2196f3')
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6268'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d'
                }}
              >
                ?–æ?
              </button>
              <button
                onClick={() => {
                  if (editingTag && editingTagName.trim()) {
                    const success = updateTaskTag(editingTag.id, editingTagName.trim(), editingTagColor)
                    if (success) {
                      const updatedTags = getTaskTagsWithCount()
                      setTaskTags(updatedTags)
                      setEditingTag(null)
                      setEditingTagName('')
                      setEditingTagColor('#2196f3')
                    }
                  }
                }}
                disabled={!editingTagName.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: editingTagName.trim() ? '#2196f3' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: editingTagName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s'
                }}
              >
                ?²å?
              </button>
            </div> */}
          </div>
        </div>
      )} */}
    </div>
  )
}

export default PomodoroPage
