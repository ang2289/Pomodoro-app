import { useState } from 'react'

interface SearchInputProps {
  onSearch: (keyword: string) => void
}

export default function SearchInput({ onSearch }: SearchInputProps) {
  const [keyword, setKeyword] = useState('')

  const handleSearch = () => {
    onSearch(keyword.trim())
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4 mb-4 w-full">
      <input
        type="text"
        placeholder="🔍 搜尋標題、對象或發起人"
        className="flex-1 p-2 border rounded text-sm sm:text-base"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm sm:text-base"
      >
        搜尋
      </button>
    </div>
  )
}






