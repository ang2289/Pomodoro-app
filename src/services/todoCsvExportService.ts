import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'
import { saveAs } from 'file-saver'
import i18n from '../i18n'

// 待辦任務介面
interface Todo {
  id: string
  title: string
  description?: string
  category: string
  priority: string | '低' | '中' | '高'
  date: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  reminder: string
  remindBeforeMinutes?: number
  status: string | '未開始' | '進行中' | '已完成'
}

// 分類介面
interface Category {
  id: string
  name: string
  color: string
  isDefault?: boolean
}

// 根據 categoryId 獲取分類名稱
const getCategoryName = (categoryId: string, categories: Category[]): string => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || i18n.t('todo_category_uncategorized')
}

// 生成 CSV 內容
const generateTodoCsvContent = (todos: Todo[], categories: Category[]): string => {
  // 根據語言決定日期格式
  const locale = i18n.language === 'zh_TW' ? 'zh-TW' : 'en-US'
  
  // 如果沒有待辦事項，生成一個顯示「0筆」的 CSV
  if (todos.length === 0) {
    const headers = locale === 'zh-TW' 
      ? ['狀態', '說明', '記錄筆數'] 
      : ['Status', 'Description', 'Record Count']
    const noDataText = locale === 'zh-TW' ? '無資料' : 'No Data'
    const csvContent = [
      `"${headers[0]}","${headers[1]}","${headers[2]}"`,
      `"${noDataText}","${i18n.t('todo_export_no_data')}","0"`
    ].join('\n')
    
    const BOM = '\uFEFF'
    return BOM + csvContent
  }

  // CSV 標題行
  const headers = locale === 'zh-TW' 
    ? ['標題', '描述', '分類', '優先級', '日期', '開始時間', '結束時間', '提醒', '狀態', '建立時間']
    : ['Title', 'Description', 'Category', 'Priority', 'Date', 'Start Time', 'End Time', 'Reminder', 'Status', 'Created Time']

  // 轉換待辦事項為 CSV 行
  const csvRows = todos.map(todo => {
    const startTime = `${todo.startHour}:${todo.startMinute}`
    const endTime = `${todo.endHour}:${todo.endMinute}`
    const categoryName = getCategoryName(todo.category, categories)
    
    return [
      todo.title || '',
      todo.description || '',
      categoryName,
      todo.priority,
      todo.date,
      startTime,
      endTime,
      todo.reminder,
      todo.status,
      new Date().toLocaleString(locale)
    ]
  })

  // 組合 CSV 內容
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n')

  // 創建 BOM 以確保 UTF-8 編碼正確顯示
  const BOM = '\uFEFF'
  return BOM + csvContent
}

// 生成檔案名
const generateTodoFileName = (todos: Todo[]): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  
  let fileName = `Todo_Records_${year}-${month}-${day}`
  if (todos.length === 0) {
    fileName += '_NoData'
  }
  fileName += '.csv'
  
  return fileName
}

// 檢查是否在 Capacitor 環境中
const isCapacitorEnvironment = (): boolean => {
  return Capacitor.isNativePlatform()
}

// 使用 Capacitor Filesystem 匯出待辦事項 CSV
export const exportTodosToCSVWithCapacitor = async (
  todos: Todo[], 
  categories: Category[]
): Promise<{ success: boolean; message: string; filePath?: string; fileName?: string }> => {
  try {
    // 檢查是否在 Capacitor 環境中
    if (!isCapacitorEnvironment()) {
      // 在 Web 環境中，回退到原本的下載方式
      return await exportTodosToCSVWeb(todos, categories)
    }

    // 生成 CSV 內容和檔案名
    const csvContent = generateTodoCsvContent(todos, categories)
    const fileName = generateTodoFileName(todos)
    
    // 寫入檔案到 Documents 目錄
    const result = await Filesystem.writeFile({
      path: fileName,
      data: csvContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    })

    const filePath = result.uri
    const todoCount = todos.length
    
    let message = ''
    if (todoCount === 0) {
      message = i18n.t('todo_export_no_data')
    } else {
      message = i18n.t('todo_export_success', { count: todoCount })
    }

    return {
      success: true,
      message: `${message}\n\n${i18n.t('todo_export_file_saved', { fileName })}`,
      filePath,
      fileName
    }

  } catch (error) {
    console.error('Capacitor 待辦事項 CSV 匯出失敗:', error)
    return {
      success: false,
      message: i18n.t('todo_export_failed', { 
        error: error instanceof Error ? error.message : i18n.t('todo_export_unknown_error') 
      })
    }
  }
}

// Web 環境的匯出功能（回退方案）
const exportTodosToCSVWeb = async (
  todos: Todo[], 
  categories: Category[]
): Promise<{ success: boolean; message: string; filePath?: string; fileName?: string }> => {
  try {
    const csvContent = generateTodoCsvContent(todos, categories)
    const fileName = generateTodoFileName(todos)
    
    // 使用 file-saver 下載檔案，提升手機支援度
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // 手機版相容性處理
    try {
      console.log('嘗試使用 file-saver 下載待辦事項 CSV');
      saveAs(blob, fileName)
    } catch (saveError) {
      console.warn('file-saver 失敗，嘗試備用方法:', saveError)
      
      // 備用方法：創建下載連結
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      
      // 觸發下載
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 清理 URL
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    
    const todoCount = todos.length
    let message = ''
    if (todoCount === 0) {
      message = i18n.t('todo_export_no_data')
    } else {
      message = i18n.t('todo_export_success', { count: todoCount })
    }

    return {
      success: true,
      message: `${message}\n\n${i18n.t('todo_export_file_downloaded', { fileName })}`,
      fileName
    }

  } catch (error) {
    console.error('Web 待辦事項 CSV 匯出失敗:', error)
    return {
      success: false,
      message: i18n.t('todo_export_failed', { 
        error: error instanceof Error ? error.message : i18n.t('todo_export_unknown_error') 
      })
    }
  }
}

// 分享待辦事項檔案功能
export const shareTodoCsvFile = async (filePath: string, fileName: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!isCapacitorEnvironment()) {
      return {
        success: false,
        message: i18n.t('todo_share_only_mobile')
      }
    }

    // 優先以附件方式分享，避免在 LINE 顯示不可點擊的本機路徑連結
    const shareOptions: any = {
      title: i18n.t('todo_share_title'),
      text: i18n.t('todo_share_text', { fileName }),
      dialogTitle: i18n.t('todo_share_dialog')
    }

    if (filePath && (filePath.startsWith('content://') || filePath.startsWith('file://'))) {
      shareOptions.files = [filePath]
    } else {
      shareOptions.url = filePath
    }

    const shareResult = await Share.share(shareOptions)
    console.log('分享結果:', shareResult)

    // 檢查分享結果
    if (shareResult) {
      return {
        success: true,
        message: i18n.t('todo_share_success')
      }
    } else {
      // 如果沒有明確的結果，視為成功（分享選單已開啟）
      return {
        success: true,
        message: i18n.t('todo_share_menu_opened')
      }
    }

  } catch (error) {
    console.error('分享錯誤:', error)
    
    // 檢查是否為用戶取消分享的錯誤
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('cancelled') || errorMessage.includes('canceled') || 
        errorMessage.includes('Share canceled') || errorMessage.includes('User cancelled')) {
      return {
        success: true,
        message: i18n.t('todo_share_cancelled')
      }
    }
    
    // 其他錯誤才視為真正的分享失敗
    return {
      success: false,
      message: i18n.t('todo_share_failed', { error: errorMessage.replace(/分享失敗：/g, '') })
    }
  }
}

// 檢查是否有待辦事項可匯出
export const hasTodosToExport = (todos: Todo[]): boolean => {
  return todos.length > 0
}

