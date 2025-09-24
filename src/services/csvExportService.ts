import { PomodoroRecord } from '../types/PomodoroRecord'

// 匯出番茄鐘記錄為 CSV
export const exportPomodoroRecordsToCSV = (records: PomodoroRecord[]): void => {
  if (records.length === 0) {
    return
  }

  // CSV 標題行（添加 padding 讓寬度一致）
  const headers = [
    '專注項目      ', // 10 字寬度
    ' 開始時間 ',      // 左右各 1 格空白
    ' 結束時間 ',      // 左右各 1 格空白
    ' 時長（分鐘） ',   // 左右各 1 格空白
    ' 是否完成 ',      // 左右各 1 格空白
    ' 工作時間（分鐘） ', // 左右各 1 格空白
    ' 休息時間（分鐘） '  // 左右各 1 格空白
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
    const formatFocusItem = (name: string) => {
      const displayName = name || '未選擇'
      return displayName.padEnd(10, ' ')
    }

    // 格式化數字欄位（添加左右空白）
    const formatNumber = (num: number) => ` ${num} `

    return [
      formatFocusItem(record.focusItemName || '未選擇'),
      formatDateTime(startTime),
      formatDateTime(completedAt),
      formatNumber(record.workMinutes),
      ' 是 ',  // 統一兩字寬度
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
  const csvWithBOM = BOM + csvContent

  // 生成檔案名（包含當前日期）
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const fileName = `Pomodoro_Log_${year}-${month}-${day}.csv`

  // 創建 Blob 並下載
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
  } else {
    // 舊版瀏覽器支援
    alert('您的瀏覽器不支援檔案下載功能')
  }
}

// 檢查是否有記錄可匯出
export const hasRecordsToExport = (records: PomodoroRecord[]): boolean => {
  return records.length > 0
}
