import { PomodoroRecord } from '../types/PomodoroRecord'
import { FocusItem } from '../types/FocusItem'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'
import { saveAs } from 'file-saver'
import i18n from '../i18n'

// 根據 focusItemId 獲取專注項目名稱
const getFocusItemName = (focusItemId: string | undefined, focusItems: FocusItem[]): string => {
  if (!focusItemId) {
    return i18n.t('pomodoro_focus_item_unselected')
  }
  
  const focusItem = focusItems.find(item => item.id === focusItemId)
  return focusItem ? focusItem.name : i18n.t('pomodoro_focus_item_unknown')
}

// 生成 CSV 內容
const generateCsvContent = (records: PomodoroRecord[], focusItems: FocusItem[], isSearchActive: boolean = false, searchKeyword: string = ''): string => {
  // 根據語言決定日期格式
  const locale = i18n.language === 'zh_TW' ? 'zh-TW' : 'en-US'
  
  // 如果沒有記錄，生成一個顯示「0筆」的 CSV
  if (records.length === 0) {
    const noDataMessage = isSearchActive && searchKeyword 
      ? i18n.t('pomodoro_export_no_search_data', { keyword: searchKeyword })
      : i18n.t('pomodoro_export_no_data')
    
    const headers = locale === 'zh-TW'
      ? ['狀態', '說明', '記錄筆數']
      : ['Status', 'Description', 'Record Count']
    const noDataText = locale === 'zh-TW' ? '無資料' : 'No Data'
    
    const csvContent = [
      `"${headers[0]}","${headers[1]}","${headers[2]}"`,
      `"${noDataText}","${noDataMessage}","0"`
    ].join('\n')
    
    const BOM = '\uFEFF'
    return BOM + csvContent
  }

  // CSV 標題行（添加 padding 讓寬度一致）
  const headers = locale === 'zh-TW'
    ? [
        '專注項目      ', // 10 字寬度
        ' 開始時間 ',      // 左右各 1 格空白
        ' 結束時間 ',      // 左右各 1 格空白
        ' 時長（分鐘） ',   // 左右各 1 格空白
        ' 是否完成 ',      // 左右各 1 格空白
        ' 工作時間（分鐘） ', // 左右各 1 格空白
        ' 休息時間（分鐘） '  // 左右各 1 格空白
      ]
    : [
        'Focus Item     ',
        ' Start Time  ',
        ' End Time    ',
        ' Duration (min)  ',
        ' Completed?  ',
        ' Work Time (min)  ',
        ' Break Time (min)  '
      ]

  // 轉換記錄為 CSV 行
  const csvRows = records.map(record => {
    const completedAt = new Date(record.completedAt)
    
    // 計算開始時間（結束時間 - 工作時間）
    const startTime = new Date(completedAt.getTime() - (record.workMinutes * 60 * 1000))
    
    // 格式化時間為 yyyy-mm-dd hh:mm:ss（添加左右空白）
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return ` ${year}-${month}-${day} ${hours}:${minutes}:${seconds} `
    }

    // 格式化專注項目名稱（補足到 10 字寬度）
    const formatFocusItem = (focusItemId: string | undefined) => {
      const displayName = getFocusItemName(focusItemId, focusItems)
      return displayName.padEnd(10, ' ')
    }

    // 格式化數字欄位（添加左右空白）
    const formatNumber = (num: number) => ` ${num} `

    const completedText = locale === 'zh-TW' ? ' 是 ' : ' Yes  '
    
    return [
      formatFocusItem(record.focusItemId),
      formatDateTime(startTime),
      formatDateTime(completedAt),
      formatNumber(record.workMinutes),
      completedText,
      formatNumber(record.workMinutes),
      formatNumber(record.breakMinutes)
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
const generateFileName = (records: PomodoroRecord[], isSearchActive: boolean = false, searchKeyword: string = ''): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  
  let fileName = `Pomodoro_Log_${year}-${month}-${day}`
  if (isSearchActive && searchKeyword) {
    // 清理搜尋關鍵字，移除特殊字符以適合檔案名
    const cleanKeyword = searchKeyword.replace(/[<>:"/\\|?*]/g, '_').substring(0, 20)
    fileName += `_Search_${cleanKeyword}`
  }
  if (records.length === 0) {
    fileName += '_NoData'
  }
  fileName += '.csv'
  
  return fileName
}

// 檢查是否在 Capacitor 環境中
const isCapacitorEnvironment = (): boolean => {
  return Capacitor.isNativePlatform()
}

// 使用 Capacitor Filesystem 匯出 CSV
export const exportPomodoroRecordsToCSVWithCapacitor = async (
  records: PomodoroRecord[], 
  focusItems: FocusItem[], 
  isSearchActive: boolean = false, 
  searchKeyword: string = ''
): Promise<{ success: boolean; message: string; filePath?: string; fileName?: string }> => {
  try {
    // 檢查是否在 Capacitor 環境中
    if (!isCapacitorEnvironment()) {
      // 在 Web 環境中，回退到原本的下載方式
      return await exportPomodoroRecordsToCSVWeb(records, focusItems, isSearchActive, searchKeyword)
    }

    // 生成 CSV 內容和檔案名
    const csvContent = generateCsvContent(records, focusItems, isSearchActive, searchKeyword)
    const fileName = generateFileName(records, isSearchActive, searchKeyword)
    
    // 寫入檔案到 Documents 目錄
    const result = await Filesystem.writeFile({
      path: fileName,
      data: csvContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    })

    const filePath = result.uri
    const recordCount = records.length
    
    let message = ''
    if (recordCount === 0) {
      message = isSearchActive && searchKeyword 
        ? i18n.t('pomodoro_export_no_search_data', { keyword: searchKeyword })
        : i18n.t('pomodoro_export_no_data')
    } else if (isSearchActive) {
      let baseMessage = i18n.t('pomodoro_export_search_success', { count: recordCount })
      if (searchKeyword) {
        const keywordLabel = i18n.language === 'zh_TW' ? '關鍵字' : 'keyword'
        baseMessage += ` (${keywordLabel}: "${searchKeyword}")`
      }
      message = baseMessage
    } else {
      message = i18n.t('pomodoro_export_success', { count: recordCount })
    }

    return {
      success: true,
      message: `${message}\n\n${i18n.t('pomodoro_export_file_saved', { fileName })}`,
      filePath,
      fileName
    }

  } catch (error) {
    console.error('Capacitor CSV 匯出失敗:', error)
    return {
      success: false,
      message: i18n.t('pomodoro_export_failed', { 
        error: error instanceof Error ? error.message : i18n.t('pomodoro_export_unknown_error') 
      })
    }
  }
}

// Web 環境的匯出功能（回退方案）
const exportPomodoroRecordsToCSVWeb = async (
  records: PomodoroRecord[], 
  focusItems: FocusItem[], 
  isSearchActive: boolean = false, 
  searchKeyword: string = ''
): Promise<{ success: boolean; message: string; filePath?: string; fileName?: string }> => {
  try {
    const csvContent = generateCsvContent(records, focusItems, isSearchActive, searchKeyword)
    const fileName = generateFileName(records, isSearchActive, searchKeyword)
    
    // 使用 file-saver 下載檔案，提升手機支援度
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // 手機版相容性處理
    try {
      console.log('嘗試使用 file-saver 下載番茄鐘記錄 CSV');
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
    
    const recordCount = records.length
    let message = ''
    if (recordCount === 0) {
      message = isSearchActive && searchKeyword 
        ? i18n.t('pomodoro_export_no_search_data', { keyword: searchKeyword })
        : i18n.t('pomodoro_export_no_data')
    } else if (isSearchActive) {
      let baseMessage = i18n.t('pomodoro_export_search_success', { count: recordCount })
      if (searchKeyword) {
        const keywordLabel = i18n.language === 'zh_TW' ? '關鍵字' : 'keyword'
        baseMessage += ` (${keywordLabel}: "${searchKeyword}")`
      }
      message = baseMessage
    } else {
      message = i18n.t('pomodoro_export_success', { count: recordCount })
    }

    return {
      success: true,
      message: `${message}\n\n${i18n.t('pomodoro_export_file_downloaded', { fileName })}`,
      fileName
    }

  } catch (error) {
    console.error('Web CSV 匯出失敗:', error)
    return {
      success: false,
      message: i18n.t('pomodoro_export_failed', { 
        error: error instanceof Error ? error.message : i18n.t('pomodoro_export_unknown_error') 
      })
    }
  }
}

// 分享檔案功能
export const shareCsvFile = async (filePath: string, fileName: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!isCapacitorEnvironment()) {
      return {
        success: false,
        message: i18n.t('pomodoro_share_only_mobile')
      }
    }

    // 優先以附件方式分享，避免在 LINE 顯示不可點擊的本機路徑連結
    const shareOptions: any = {
      title: i18n.t('pomodoro_share_title'),
      text: i18n.t('pomodoro_share_text', { fileName }),
      dialogTitle: i18n.t('pomodoro_share_dialog')
    }

    // Capacitor Share v5 在部分平台支援 files 附件分享
    // 若可用，使用附件分享；否則回退到 url 分享
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
        message: i18n.t('pomodoro_share_success')
      }
    } else {
      // 如果沒有明確的結果，視為成功（分享選單已開啟）
      return {
        success: true,
        message: i18n.t('pomodoro_share_menu_opened')
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
        message: i18n.t('pomodoro_share_cancelled')
      }
    }
    
    // 其他錯誤才視為真正的分享失敗
    return {
      success: false,
      message: i18n.t('pomodoro_share_failed', { error: errorMessage.replace(/分享失敗：/g, '') })
    }
  }
}

// 檢查是否有記錄可匯出
export const hasRecordsToExport = (records: PomodoroRecord[]): boolean => {
  return records.length > 0
}
