import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { backupDataToFile, restoreDataFromFile } from '../utils/backupUtils'

export default function BackupSettings() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await restoreDataFromFile(file)
      alert('✅ ' + t('data_restore_success'))
      window.location.reload()
    } catch (err) {
      alert('❌ ' + t('import_failed'))
    }
  }

  return (
    <div className="border-t pt-4 mt-6">
      <h2 className="text-xl font-semibold mb-3">📦 {t('data_backup_restore')}</h2>

      <div className="flex flex-col space-y-3">
        <div className="flex justify-center">
          <div className="w-1/3">
            <button
              onClick={backupDataToFile}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded"
            >
              {t('export_backup')}
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-3">
          <div className="w-1/3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-white bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded"
            >
              {t('import_restore')}
            </button>
          </div>
        </div>

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
