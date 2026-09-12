import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type SortBy = 'start_desc' | 'start_asc' | 'created_desc' | 'created_asc'

export interface SearchFilters {
  keyword?: string
  dateFrom?: string
  dateTo?: string
  scripture?: string
  sortBy?: SortBy
}

interface SearchFormProps {
  scriptureOptions?: string[]
  onSearch: (filters: SearchFilters) => void
  onReset?: () => void
}

export default function SearchForm({ scriptureOptions = [], onSearch, onReset }: SearchFormProps) {
  const { t } = useTranslation()
  // checkbox enable states
  const [useKeyword, setUseKeyword] = useState(true) // 預設只勾選關鍵字
  const [useDate, setUseDate] = useState(false)
  const [useScripture, setUseScripture] = useState(false)
  const [useSort, setUseSort] = useState(false)

  // field values
  const [keyword, setKeyword] = useState('')
  // 預設日期為今天
  const todayStr = new Date().toISOString().split('T')[0]
  const [dateFrom, setDateFrom] = useState<string>(todayStr)
  const [dateTo, setDateTo] = useState<string>(todayStr)
  const [scripture, setScripture] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('start_desc') // 預設開始日（新→舊）

  const canSearch = useMemo(() => useKeyword || useDate || useScripture || useSort, [useKeyword, useDate, useScripture, useSort])

  const handleSearch = () => {
    const payload: SearchFilters = {}
    if (useKeyword && keyword.trim()) payload.keyword = keyword.trim()
    if (useDate) {
      if (dateFrom) payload.dateFrom = dateFrom
      if (dateTo) payload.dateTo = dateTo
    }
    if (useScripture && scripture) payload.scripture = scripture
    if (useSort) payload.sortBy = sortBy
    onSearch(payload)
  }

  const handleReset = () => {
    setUseKeyword(true)
    setUseDate(false)
    setUseScripture(false)
    setUseSort(false)
    setKeyword('')
    // 日期保持使用者當下日期（不變動）
    setScripture('')
    setSortBy('start_desc')
    onReset?.()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
      <div className="flex flex-col gap-3">
        {/* 啟用搜尋 */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">{t('enable_search')}</label>
          <input type="checkbox" checked={useKeyword || useDate || useScripture || useSort}
                 onChange={(e) => { const v = e.target.checked; setUseKeyword(v); setUseDate(v && useDate); setUseScripture(v && useScripture); setUseSort(v && useSort); }} />
          <span className="text-xs text-gray-500">{t('individual_toggle_conditions')}</span>
        </div>

        {/* 關鍵字 */}
        <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
            <input type="checkbox" checked={useKeyword} onChange={(e) => setUseKeyword(e.target.checked)} />
          <label className="text-sm text-gray-700 whitespace-nowrap">{t('keyword_label')}</label>
          </div>
          <input
            type="text"
            placeholder={`🔍 ${t('search_title_object_or_creator')}`}
            className="w-full border rounded-lg px-4 py-3 text-base h-12"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            disabled={false}
          />
        </div>

        {/* 日期範圍 */}
        <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
            <input type="checkbox" checked={useDate} onChange={(e) => setUseDate(e.target.checked)} />
          <label className="text-sm text-gray-700 whitespace-nowrap">{t('date_range')}</label>
          </div>
        <div className="flex flex-col gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('start_date')}</label>
              <input
                type="date"
                className="w-full border rounded-lg px-4 py-3 text-base h-12"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={false}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('end_date_label')}</label>
              <input
                type="date"
                className="w-full border rounded-lg px-4 py-3 text-base h-12"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={false}
              />
            </div>
          </div>
        </div>

        {/* 經文 */}
        <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
            <input type="checkbox" checked={useScripture} onChange={(e) => setUseScripture(e.target.checked)} />
          <label className="text-sm text-gray-700 whitespace-nowrap">{t('scripture_label')}</label>
          </div>
          <select
            className="w-full px-3 py-2 text-base rounded border border-gray-300 leading-normal"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            disabled={false}
          >
            <option value="">{t('all')}</option>
            {scriptureOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* 排序 */}
        <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
            <input type="checkbox" checked={useSort} onChange={(e) => setUseSort(e.target.checked)} />
          <label className="text-sm text-gray-700 whitespace-nowrap">{t('sort_label')}</label>
          </div>
          <select
            className="w-full px-3 py-2 text-base rounded border border-gray-300 leading-normal"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            disabled={false}
          >
            <option value="start_desc">{t('sort_start_desc')}</option>
            <option value="start_asc">{t('sort_start_asc')}</option>
            <option value="created_desc">{t('sort_created_desc')}</option>
            <option value="created_asc">{t('sort_created_asc')}</option>
          </select>
        </div>

        {/* 動作按鈕 */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="w-full sm:w-auto px-5 py-3 rounded-lg font-semibold !text-white shadow-sm transition-all duration-200 disabled:opacity-60"
            style={{ background: '#4f46e5', color: '#ffffff' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4338ca' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4f46e5' }}
          >
            {t('search')}
          </button>
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-3 rounded-lg font-semibold !text-white shadow-sm transition-all duration-200"
            style={{ background: '#6b7280', color: '#ffffff' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4b5563' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#6b7280' }}
          >
            {t('reset')}
          </button>
        </div>
      </div>
    </div>
  )
}


