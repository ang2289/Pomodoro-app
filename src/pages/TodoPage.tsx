import { useState, useEffect } from 'react'
import ModuleDropdown from '../components/ModuleDropdown'
import { defaultCategories, Category } from '../lib/defaultCategories'
import TodoExportButton from '../components/TodoExportButton'

interface Todo {
  id: string
  title: string
  description?: string
  category: string
  priority: '低' | '中' | '高'
  date: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  reminder: string
  remindBeforeMinutes?: number
  status: '未開始' | '進行中' | '已完成'
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    title: '',
    description: '',
    category: categories[0]?.id || '',
    priority: '中',
    date: new Date().toISOString().split('T')[0],
    startHour: '09',
    startMinute: '00',
    endHour: '10',
    endMinute: '00',
    reminder: '無',
    remindBeforeMinutes: 15,
    status: '未開始'
  })
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadTodos()
    loadCategories()
  }, [])

  const loadTodos = () => {
    try {
      const saved = localStorage.getItem('todos')
      if (saved) {
        setTodos(JSON.parse(saved))
      }
    } catch (error) {
      console.error('載入待辦事項失敗:', error)
    }
  }

  const loadCategories = () => {
    try {
      const saved = localStorage.getItem('todo-categories')
      if (saved) {
        setCategories(JSON.parse(saved))
      }
    } catch (error) {
      console.error('載入分類失敗:', error)
    }
  }

  const saveTodos = (newTodos: Todo[]) => {
    try {
      localStorage.setItem('todos', JSON.stringify(newTodos))
      setTodos(newTodos)
    } catch (error) {
      console.error('儲存待辦事項失敗:', error)
    }
  }

  const addTodo = () => {
    if (!newTodo.title?.trim()) {
      alert('請輸入待辦事項標題')
      return
    }

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title.trim(),
      description: newTodo.description || '',
      category: newTodo.category || categories[0]?.id || '',
      priority: newTodo.priority || '中',
      date: newTodo.date || new Date().toISOString().split('T')[0],
      startHour: newTodo.startHour || '09',
      startMinute: newTodo.startMinute || '00',
      endHour: newTodo.endHour || '10',
      endMinute: newTodo.endMinute || '00',
      reminder: newTodo.reminder || '無',
      remindBeforeMinutes: newTodo.remindBeforeMinutes || 15,
      status: '未開始'
    }

    saveTodos([...todos, todo])
    setNewTodo({
      title: '',
      description: '',
      category: categories[0]?.id || '',
      priority: '中',
      date: new Date().toISOString().split('T')[0],
      startHour: '09',
      startMinute: '00',
      endHour: '10',
      endMinute: '00',
      reminder: '無',
      remindBeforeMinutes: 15,
      status: '未開始'
    })
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    )
    saveTodos(updatedTodos)
  }

  const deleteTodo = (id: string) => {
    if (window.confirm('確定要刪除此待辦事項嗎？')) {
      const updatedTodos = todos.filter(todo => todo.id !== id)
      saveTodos(updatedTodos)
    }
  }

  const toggleStatus = (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      const newStatus = todo.status === '已完成' ? '未開始' : '已完成'
      updateTodo(id, { status: newStatus })
    }
  }

  const getFilteredTodos = () => {
    let filtered = todos

    if (filter === 'pending') {
      filtered = filtered.filter(todo => todo.status !== '已完成')
    } else if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.status === '已完成')
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(todo => todo.category === selectedCategory)
    }

    return filtered.sort((a, b) => {
      if (a.status === '已完成' && b.status !== '已完成') return 1
      if (a.status !== '已完成' && b.status === '已完成') return -1
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || '未分類'
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.color || '#6b7280'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return 'text-red-600 bg-red-100'
      case '中': return 'text-yellow-600 bg-yellow-100'
      case '低': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成': return 'text-green-600 bg-green-100'
      case '進行中': return 'text-blue-600 bg-blue-100'
      case '未開始': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const clearCompleted = () => {
    if (window.confirm('確定要清除所有已完成的待辦事項嗎？')) {
      const updatedTodos = todos.filter(todo => todo.status !== '已完成')
      saveTodos(updatedTodos)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="responsive-container">
        <ModuleDropdown />
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 待辦事項</h1>

          {/* 新增待辦事項 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">新增待辦事項</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
                <input
                  type="text"
                  value={newTodo.title || ''}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入待辦事項標題"
                  title="請輸入待辦事項"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                <select
                  value={newTodo.category || ''}
                  onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="選擇分類"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">優先級</label>
                <select
                  value={newTodo.priority || '中'}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as '低' | '中' | '高' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="選擇優先級"
                >
                  <option value="低">低</option>
                  <option value="中">中</option>
                  <option value="高">高</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={newTodo.date || ''}
                  onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="請輸入日期"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={`${newTodo.startHour || '09'}:${newTodo.startMinute || '00'}`}
                    onChange={(e) => {
                      const [hour, minute] = e.target.value.split(':')
                      setNewTodo({ ...newTodo, startHour: hour, startMinute: minute })
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="請輸入時間"
                    placeholder="時間"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">結束時間</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={`${newTodo.endHour || '10'}:${newTodo.endMinute || '00'}`}
                    onChange={(e) => {
                      const [hour, minute] = e.target.value.split(':')
                      setNewTodo({ ...newTodo, endHour: hour, endMinute: minute })
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="請輸入時間"
                    placeholder="時間"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={newTodo.description || ''}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="輸入待辦事項描述（選填）"
                title="請輸入描述"
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={addTodo}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                新增待辦事項
              </button>
            </div>
          </div>

          {/* 篩選器 */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                未完成
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                已完成
              </button>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="選擇分類"
            >
              <option value="all">全部分類</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* 待辦事項列表 */}
          <div className="space-y-4">
            {getFilteredTodos().map((todo) => (
              <div
                key={todo.id}
                className={`p-4 rounded-lg transition-all ${
                  todo.status === '已完成' 
                    ? 'bg-gray-50 opacity-75' 
                    : 'bg-white border border-gray-300 hover:shadow-md'
                }`}
              >
                {/* 手機版優化佈局 */}
                <div className="w-full">
                  {/* 標題和操作按鈕行 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={todo.status === '已完成'}
                        onChange={() => toggleStatus(todo.id)}
                        className="w-5 h-5 text-blue-600 border-0 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <h3 className={`text-lg font-semibold break-words flex-1 min-w-0 ${
                        todo.status === '已完成' ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {todo.title}
                      </h3>
                    </div>
                    
                    {/* 操作按鈕 */}
                    <div className="flex gap-2 flex-shrink-0 ml-2">
                      <button
                        onClick={() => setEditingTodo(todo)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                        title="編輯"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                        title="刪除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {/* 描述內容 */}
                  {todo.description && (
                    <div className="mb-3">
                      <p className={`text-sm break-words overflow-wrap-anywhere ${
                        todo.status === '已完成' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {todo.description}
                      </p>
                    </div>
                  )}
                  
                  {/* 標籤區域 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="category-label" style={{ color: getCategoryColor(todo.category) }}>
                      {getCategoryName(todo.category)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                      {todo.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                      {todo.status}
                    </span>
                  </div>
                  
                  {/* 日期和時間 - 垂直排列 */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>📅 {todo.date}</div>
                    <div>⏰ {todo.startHour}:{todo.startMinute} - {todo.endHour}:{todo.endMinute}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {getFilteredTodos().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>沒有找到待辦事項</p>
              </div>
            )}
          </div>

          {/* 匯出待辦記錄 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <TodoExportButton todos={todos} categories={categories} />
          </div>

          {/* 清除已完成 */}
          {todos.some(todo => todo.status === '已完成') && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={clearCompleted}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                清除已完成項目
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}