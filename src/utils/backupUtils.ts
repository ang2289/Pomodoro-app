// src/utils/backupUtils.ts
import { saveAs } from 'file-saver';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import i18n from '../i18n';

export async function backupDataToFile() {
  const allData: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      allData[key] = localStorage.getItem(key) || ''
    }
  }

  const content = JSON.stringify(allData, null, 2)
  const fileName = `backup_${new Date().toISOString().slice(0, 10)}.json`

  try {
    // 原生環境：寫入檔案並以附件分享，解決行動裝置下載無反應
    if (Capacitor.isNativePlatform()) {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: content,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      })

      const filePath = result.uri
      try {
        await Share.share({
          title: i18n.t('backup_share_title'),
          text: i18n.t('backup_share_text', { fileName }),
          files: filePath ? [filePath] : undefined,
          url: filePath,
          dialogTitle: i18n.t('backup_share_dialog')
        })
      } catch {
        // 即使分享失敗，仍然算備份成功（已寫入 Documents）
      }
      
      // 顯示檔案路徑訊息
      alert(i18n.t('backup_success_native', { fileName }))
      return
    }
  } catch (e) {
    // 原生流程失敗則回退到網頁下載
    console.warn('原生備份流程失敗，改用 web 下載:', e)
  }

  // Web：使用 file-saver 下載
  const blob = new Blob([content], { type: 'application/json' })
  saveAs(blob, fileName)
  
  // 顯示檔案下載訊息
  alert(i18n.t('backup_success_web', { fileName }))
}

export function restoreDataFromFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        localStorage.clear()
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(key, value as string)
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}