import { useState, useEffect } from 'react'
import { defaultCategories, Category } from '../lib/defaultCategories'

export default function CategoryManagerPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingColor, setEditingColor] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = () => {
    try {
      const saved = localStorage.getItem('todo-categories')
      if (saved) {
        const parsed = JSON.parse(saved)
        setCategories(parsed)
      } else {
        setCategories(defaultCategories)
      }
    } catch (error) {
      console.error('載入分類失敗:', error)
      setCategories(defaultCategories)
    }
  }

  const saveCategories = (newCategories: Category[]) => {
    try {
      localStorage.setItem('todo-categories', JSON.stringify(newCategories))
      setCategories(newCategories)
    } catch (error) {
      console.error('儲存分類失敗:', error)
    }
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      alert('請輸入分類名稱')
      return
    }

    if (categories.some(cat => cat.name === newCategoryName.trim())) {
      alert('分類名稱已存在')
      return
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
      isDefault: false
    }

    const updatedCategories = [...categories, newCategory]
    saveCategories(updatedCategories)
    setNewCategoryName('')
    setNewCategoryColor('#3b82f6')
  }

  const deleteCategory = (categoryId: string) => {
    const isDefaultCategory = defaultCategories.some(cat => cat.id === categoryId)
    if (isDefaultCategory) {
      alert('預設分類無法刪除')
      return
    }

    if (window.confirm('確定要刪除此分類嗎？使用此分類的待辦事項將變為未分類')) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId)
      saveCategories(updatedCategories)
      try {
        alert('儲存成功')
      } catch {}
    }
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category.id)
    setEditingName(category.name)
    setEditingColor(category.color)
  }

  const saveEdit = () => {
    if (!editingCategory || !editingName.trim()) return

    if (categories.some(cat => cat.name === editingName.trim() && cat.id !== editingCategory)) {
      alert('分類名稱已存在')
      return
    }

    const updatedCategories = categories.map(cat =>
      cat.id === editingCategory
        ? { ...cat, name: editingName.trim(), color: editingColor }
        : cat
    )
    saveCategories(updatedCategories)
    setEditingCategory(null)
    setEditingName('')
    setEditingColor('')
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setEditingName('')
    setEditingColor('')
  }

  const resetToDefault = () => {
    if (window.confirm('確定要重置為預設分類嗎？這將刪除所有自訂分類')) {
      saveCategories(defaultCategories)
      alert('已重置為預設分類')
    }
  }

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">📂 分類管理</h1>

          {/* 新增分類 */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">新增分類</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="分類名稱"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">選擇顏色</span>
              </div>
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                新增
              </button>
            </div>
          </div>

          {/* 分類列表 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">現有分類</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {editingCategory === category.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingColor}
                          onChange={(e) => setEditingColor(e.target.value)}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <span className="text-xs text-gray-600">顏色</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          儲存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-800">{category.name}</span>
                        {category.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            預設
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {!category.isDefault && (
                          <>
                            <button
                              onClick={() => startEdit(category)}
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                              title="編輯"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              title="刪除"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              重置為預設分類
            </button>
            <div className="text-sm text-gray-600">
              共 {categories.length} 個分類
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}