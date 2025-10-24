import { useRef } from 'react'
import { backupDataToFile, restoreDataFromFile } from '../utils/backupUtils'

export default function BackupSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await restoreDataFromFile(file)
      alert('✅ 資料還原成功！')
      window.location.reload()
    } catch (err) {
      alert('❌ 匯入失敗，請確認檔案格式正確')
    }
  }

  return (
    <div className="border-t pt-4 mt-6">
      <h2 className="text-xl font-semibold mb-3">📦 資料備份與還原</h2>

      <div className="space-x-4">
        <button
          onClick={backupDataToFile}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          匯出備份（.json）
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          匯入還原（.json）
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleRestore}
          className="hidden"
        />
      </div>
    </div>
  )
}
