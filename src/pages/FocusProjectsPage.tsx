import { useState, useEffect } from 'react'
import { FocusItem, FocusItemWithCount } from '../types/FocusItem'
import { 
  getFocusItemsWithCount,
  addFocusItem,
  updateFocusItem,
  deleteFocusItem
} from '../services/focusItemService'
// import Button from '@/components/ui/Button'

const FocusProjectsPage = () => {
  const [focusItems, setFocusItems] = useState<FocusItemWithCount[]>([])
  const [newFocusItemName, setNewFocusItemName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3b82f6') // 預設藍色
  const [editingFocusItem, setEditingFocusItem] = useState<FocusItem | null>(null)
  const [editingFocusItemName, setEditingFocusItemName] = useState('')

  useEffect(() => {
    setFocusItems(getFocusItemsWithCount())
  }, [])

  const handleAdd = () => {
    if (!newFocusItemName.trim()) return
    addFocusItem(newFocusItemName.trim())
    setFocusItems(getFocusItemsWithCount())
    setNewFocusItemName('')
  }

  const handleUpdate = () => {
    if (!editingFocusItem || !editingFocusItemName.trim()) return
    updateFocusItem(editingFocusItem.id, editingFocusItemName.trim())
    setFocusItems(getFocusItemsWithCount())
    setEditingFocusItem(null)
    setEditingFocusItemName('')
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('確定要刪除這個專注項目嗎？')) return
    deleteFocusItem(id)
    setFocusItems(getFocusItemsWithCount())
  }

  return (
    <div className="page bg-white text-black dark:bg-gray-900 dark:text-gray-100">
      <h1>🎯 專注項目管理</h1>

      {/* 新增專案 */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="輸入專注項目名稱..."
            value={newFocusItemName}
            onChange={(e) => setNewFocusItemName(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white/90 px-3 py-2 text-sm text-gray-900 focus:outline-none"
          />
          <button
            className="rounded px-4 py-2 font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
            onClick={handleAdd}
            disabled={!newFocusItemName.trim()}
          >
            新增
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="flex flex-col gap-3">
        {focusItems.map((item) => (
          <div key={item.id} className="card">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: item.color || '#4caf50',
                    border: '2px solid #ffffff'
                  }}
                />
                {editingFocusItem?.id === item.id ? (
                  <input
                    value={editingFocusItemName}
                    onChange={(e) => setEditingFocusItemName(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white/90 px-3 py-2 text-sm text-gray-900 focus:outline-none"
                  />
                ) : (
                  <div className="font-semibold">
                    {item.name}
                    {item.isDefault && (
                      <span className="ml-2 text-xs text-gray-300">預設</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingFocusItem?.id === item.id ? (
                  <>
                    <button className="rounded px-4 py-2 font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200" onClick={handleUpdate}>儲存</button>
                    <button className="rounded px-4 py-2 font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200" onClick={() => { setEditingFocusItem(null); setEditingFocusItemName('') }}>取消</button>
                  </>
                ) : (
                  <>
                    {!item.isDefault && (
                      <button className="rounded px-4 py-2 font-medium text-white bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800 transition-colors duration-200" onClick={() => { setEditingFocusItem(item); setEditingFocusItemName(item.name) }}>編輯</button>
                    )}
                    {!item.isDefault && (
                      <button className="rounded px-4 py-2 font-medium text-white bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800 transition-colors duration-200" onClick={() => handleDelete(item.id)}>刪除</button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-300">使用 {item.usageCount} 次</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FocusProjectsPage


