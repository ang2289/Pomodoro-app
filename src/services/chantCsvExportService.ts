import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'
import { saveAs } from 'file-saver'
import { loadChantHistory } from '../utils/chantHistoryStorage'
import i18n from '../i18n'

// 唸經記錄介面
interface ChantRecord {
  chant: string
  date: string
  count: number
  timestamp?: string
}

// 生成 CSV 內容
const generateChantCsvContent = (records: ChantRecord[]): string => {
  // 根據語言決定日期格式
  const locale = i18n.language === 'zh_TW' ? 'zh-TW' : 'en-US'
  // 如果沒有記錄，生成一個顯示「0筆」的 CSV
  if (records.length === 0) {
    const headers = locale === 'zh-TW' 
      ? ['狀態', '說明', '記錄筆數'] 
      : ['Status', 'Description', 'Record Count']
    const noDataText = locale === 'zh-TW' ? '無資料' : 'No Data'
    const csvContent = [
      `"${headers[0]}","${headers[1]}","${headers[2]}"`,
      `"${noDataText}","${i18n.t('chant_export_no_data')}","0"`
    ].join('\n')
    
    const BOM = '\uFEFF'
    return BOM + csvContent
  }

  // CSV 標題行
  const headers = locale === 'zh-TW'
    ? ['經文名稱', '日期', '次數', '記錄時間']
    : ['Scripture Name', 'Date', 'Count', 'Record Time']
  
  // 轉換資料為 CSV 格式 - 以日期和經文為單位加總
  const csvRows = [headers]
  
  // 建立一個 Map 來加總同一天同一經文的次數
  const aggregatedData = new Map()
  
  records.forEach((record: ChantRecord) => {
    // 記錄所有唸經操作，包括正數和負數的修正
    if (record.count !== 0) {
      const key = `${record.date}_${record.chant}`
      if (aggregatedData.has(key)) {
        const existing = aggregatedData.get(key)
        existing.count += record.count
        // 更新為最新的時間戳
        if (record.timestamp && (!existing.timestamp || record.timestamp > existing.timestamp)) {
          existing.timestamp = record.timestamp
        }
      } else {
        aggregatedData.set(key, {
          date: record.date,
          chant: record.chant,
          count: record.count,
          timestamp: record.timestamp
        })
      }
    }
  })
  
  // 轉換為陣列並排序
  const sortedData = Array.from(aggregatedData.values()).sort((a: any, b: any) => {
    // 依記錄時間排序（最新的在前）
    const timeA = new Date(a.timestamp || a.date).getTime()
    const timeB = new Date(b.timestamp || b.date).getTime()
    return timeB - timeA // 時間降序（最新的在前）
  })
  
  // 如果沒有資料，返回無資料的 CSV
  if (sortedData.length === 0) {
    const headers = locale === 'zh-TW' 
      ? ['狀態', '說明', '記錄筆數'] 
      : ['Status', 'Description', 'Record Count']
    const noDataText = locale === 'zh-TW' ? '無資料' : 'No Data'
    const csvContent = [
      `"${headers[0]}","${headers[1]}","${headers[2]}"`,
      `"${noDataText}","${i18n.t('chant_export_no_data')}","0"`
    ].join('\n')
    
    const BOM = '\uFEFF'
    return BOM + csvContent
  }
  
  sortedData.forEach((record: any) => {
    // 確保 count 不會是負數，如果小於 0 則設為 0
    const displayCount = Math.max(0, record.count)
    
    // 安全地處理日期
    let dateStr = locale === 'zh-TW' ? '無效日期' : 'Invalid Date'
    let timestampStr = locale === 'zh-TW' ? '無效時間' : 'Invalid Time'
    const unknownText = locale === 'zh-TW' ? '未知經文' : 'Unknown Scripture'
    
    try {
      dateStr = new Date(record.date).toLocaleDateString(locale)
    } catch (error) {
      console.warn('日期格式錯誤:', record.date)
    }
    
    try {
      if (record.timestamp) {
        timestampStr = new Date(record.timestamp).toLocaleString(locale)
      } else {
        timestampStr = new Date(record.date).toLocaleString(locale)
      }
    } catch (error) {
      console.warn('時間戳格式錯誤:', record.timestamp)
    }
    
    csvRows.push([
      record.chant || unknownText,
      dateStr,
      displayCount.toString(),
      timestampStr
    ])
  })
  
  // 轉換為 CSV 字串 - 使用 UTF-8 BOM 避免亂碼
  const csvContent = '\uFEFF' + csvRows.map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n')
  
  return csvContent
}

// 生成檔案名
const generateChantFileName = (records: ChantRecord[]): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  
  let fileName = `All_Scripture_Records_${year}-${month}-${day}`
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

// 使用 Capacitor Filesystem 匯出唸經記錄 CSV
export const exportChantRecordsToCSVWithCapacitor = async (): Promise<{ 
  success: boolean; 
  message: string; 
  filePath?: string; 
  fileName?: string 
}> => {
  try {
    // 取得所有歷史紀錄
    const allRecords = loadChantHistory()
    
    // 檢查是否在 Capacitor 環境中
    if (!isCapacitorEnvironment()) {
      // 在 Web 環境中，回退到原本的下載方式
      return await exportChantRecordsToCSVWeb(allRecords)
    }

    // 生成 CSV 內容和檔案名
    const csvContent = generateChantCsvContent(allRecords)
    const fileName = generateChantFileName(allRecords)
    
    // 寫入檔案到 Documents 目錄
    console.log('開始寫入念經記錄CSV到 Documents 目錄');
    const result = await Filesystem.writeFile({
      path: fileName,
      data: csvContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    })
    console.log('Filesystem.writeFile 結果:', result);

    const filePath = result.uri
    console.log('檔案路徑:', filePath);
    
    // 取得檔案完整路徑
    let fullPath = '';
    try {
      // 嘗試獲取實際檔案路徑
      const fileInfo = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Documents
      });
      fullPath = fileInfo.uri;
      console.log('完整檔案路徑:', fullPath);
    } catch (pathError) {
      console.warn('無法獲取完整檔案路徑:', pathError);
      fullPath = filePath || fileName;
    }
    
    const recordCount = allRecords.length
    
    let message = ''
    if (recordCount === 0) {
      message = i18n.t('chant_export_no_data')
    } else {
      message = i18n.t('chant_export_success', { count: recordCount })
    }

    // 格式化訊息，讓它更清楚地顯示檔案位置
    const formattedPath = fullPath.replace('file://', '');
    
    const locationText = formattedPath || (i18n.language === 'zh_TW' ? 'Documents 資料夾' : 'Documents folder')
    
    return {
      success: true,
      message: `${message}\n\n${i18n.t('chant_export_file_saved', { 
        fileName, 
        location: locationText 
      })}`,
      filePath,
      fileName
    }

  } catch (error) {
    console.error('Capacitor 唸經記錄 CSV 匯出失敗:', error)
    return {
      success: false,
      message: i18n.t('chant_export_failed', { 
        error: error instanceof Error ? error.message : i18n.t('chant_export_unknown_error') 
      })
    }
  }
}

// Web 環境的匯出功能（回退方案）
const exportChantRecordsToCSVWeb = async (records: ChantRecord[]): Promise<{ 
  success: boolean; 
  message: string; 
  filePath?: string; 
  fileName?: string 
}> => {
  try {
    const csvContent = generateChantCsvContent(records)
    const fileName = generateChantFileName(records)
    
    // 創建 Blob 並使用 file-saver 下載檔案
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    })
    
    // 手機版相容性處理
    try {
      console.log('嘗試使用 file-saver 下載念經記錄 CSV');
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
      message = i18n.t('chant_export_no_data')
    } else {
      message = i18n.t('chant_export_success', { count: recordCount })
    }

    return {
      success: true,
      message: `${message}\n\n${i18n.t('chant_export_file_downloaded', { fileName })}`,
      fileName
    }

  } catch (error) {
    console.error('Web 唸經記錄 CSV 匯出失敗:', error)
    return {
      success: false,
      message: i18n.t('chant_export_failed', { 
        error: error instanceof Error ? error.message : i18n.t('chant_export_unknown_error') 
      })
    }
  }
}

// 分享唸經記錄檔案功能
export const shareChantCsvFile = async (filePath: string, fileName: string): Promise<{ 
  success: boolean; 
  message: string 
}> => {
  try {
    if (!isCapacitorEnvironment()) {
      return {
        success: false,
        message: i18n.t('chant_share_only_mobile')
      }
    }

    // 優先以附件方式分享，避免在 LINE 顯示不可點擊的本機路徑連結
    const shareOptions: any = {
      title: i18n.t('chant_share_title'),
      text: i18n.t('chant_share_text', { fileName }),
      dialogTitle: i18n.t('chant_share_dialog')
    }

    // Capacitor Share v5 在部分平台支援 files 附件分享
    // 若可用，使用附件分享；否則回退到 url 分享
    if (filePath && (filePath.startsWith('content://') || filePath.startsWith('file://'))) {
      shareOptions.files = [filePath]
    } else {
      // 確保檔案的 MIME 類型為 application/vnd.ms-excel
      const formattedFilePath = filePath.startsWith('file://') ? filePath : `file://${filePath}`
      shareOptions.url = formattedFilePath
    }

    const shareResult = await Share.share(shareOptions)
    console.log('分享結果:', shareResult)

    // 檢查分享結果
    if (shareResult) {
      return {
        success: true,
        message: i18n.t('chant_share_success')
      }
    } else {
      // 如果沒有明確的結果，視為成功（分享選單已開啟）
      return {
        success: true,
        message: i18n.t('chant_share_menu_opened')
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
        message: i18n.t('chant_share_cancelled')
      }
    }
    
    // 其他錯誤才視為真正的分享失敗
    return {
      success: false,
      message: i18n.t('chant_share_failed', { error: errorMessage.replace(/分享失敗：/g, '') })
    }
  }
}

// 檢查是否有唸經記錄可匯出
export const hasChantRecordsToExport = (): boolean => {
  const records = loadChantHistory()
  return records.length > 0
}

// 匯出唸經記錄 CSV 功能（舊版，保持相容性）
export const exportChantRecordsToCSV = async (records: ChantRecord[]): Promise<void> => {
  if (records.length === 0) {
    const csvContent = [
      '"Status","Description","Record Count"',
      `"No Data","${i18n.t('chant_export_no_data')}","0"`
    ].join('\n');

    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const fileName = `Chant_Log_${year}-${month}-${day}_NoData.csv`;

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName);
    return;
  }

  const headers = ['Scripture Name', 'Date', 'Count', 'Record Time'];
  const csvRows = [headers];

  records.forEach((record) => {
    csvRows.push([
      record.chant,
      new Date(record.date).toLocaleDateString('en-US'),
      record.count.toString(),
      record.timestamp
        ? new Date(record.timestamp).toLocaleString('en-US')
        : new Date(record.date).toLocaleString('en-US')
    ]);
  });

  const csvContent = '\uFEFF' + csvRows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const fileName = `Chant_Log_${year}-${month}-${day}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, fileName);
};

