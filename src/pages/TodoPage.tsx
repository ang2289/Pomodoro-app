import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ModuleDropdown from '../components/ModuleDropdown'
import { defaultCategories, Category } from '../lib/defaultCategories'
import TodoExportButton from '../components/TodoExportButton'

interface Todo {
  id: string
  title: string
  description?: string
  category: string
  priority: string | '低' | '中' | '高'
  date: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  reminder: string
  remindBeforeMinutes?: number
  status: string | '未開始' | '進行中' | '已完成'
}

export default function TodoPage() {
  const { t } = useTranslation()
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    title: '',
    description: '',
    category: categories[0]?.id || '',
    priority: t('todo_config.priority.medium'),
    date: new Date().toISOString().split('T')[0],
    startHour: '09',
    startMinute: '00',
    endHour: '10',
    endMinute: '00',
    reminder: t('todo_config.reminder.none'),
    remindBeforeMinutes: 15,
    status: t('todo_config.status.not_started')
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
      console.error(t('todo_config.error.load_failed'), error)
    }
  }

  const loadCategories = () => {
    try {
      const saved = localStorage.getItem('todo-categories')
      if (saved) {
        setCategories(JSON.parse(saved))
      }
    } catch (error) {
      console.error(t('todo_config.error.load_categories_failed'), error)
    }
  }

  const saveTodos = (newTodos: Todo[]) => {
    try {
      localStorage.setItem('todos', JSON.stringify(newTodos))
      setTodos(newTodos)
    } catch (error) {
      console.error(t('todo_config.error.save_failed'), error)
    }
  }

  const addTodo = () => {
    if (!newTodo.title?.trim()) {
      alert(t('todo_config.alert.enter_title'))
      return
    }

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title.trim(),
      description: newTodo.description || '',
      category: newTodo.category || categories[0]?.id || '',
      priority: newTodo.priority || t('todo_config.priority.medium'),
      date: newTodo.date || new Date().toISOString().split('T')[0],
      startHour: newTodo.startHour || '09',
      startMinute: newTodo.startMinute || '00',
      endHour: newTodo.endHour || '10',
      endMinute: newTodo.endMinute || '00',
      reminder: newTodo.reminder || t('todo_config.reminder.none'),
      remindBeforeMinutes: newTodo.remindBeforeMinutes || 15,
      status: t('todo_config.status.not_started')
    }

    saveTodos([...todos, todo])
    setNewTodo({
      title: '',
      description: '',
      category: categories[0]?.id || '',
      priority: t('todo_config.priority.medium'),
      date: new Date().toISOString().split('T')[0],
      startHour: '09',
      startMinute: '00',
      endHour: '10',
      endMinute: '00',
      reminder: t('todo_config.reminder.none'),
      remindBeforeMinutes: 15,
      status: t('todo_config.status.not_started')
    })
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    )
    saveTodos(updatedTodos)
  }

  const deleteTodo = (id: string) => {
    if (window.confirm(t('todo_config.confirm.delete'))) {
      const updatedTodos = todos.filter(todo => todo.id !== id)
      saveTodos(updatedTodos)
    }
  }

  const toggleStatus = (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      const newStatus = todo.status === t('todo_config.status.completed') ? t('todo_config.status.not_started') : t('todo_config.status.completed')
      updateTodo(id, { status: newStatus })
    }
  }

  const getFilteredTodos = () => {
    let filtered = todos

    if (filter === 'pending') {
      filtered = filtered.filter(todo => todo.status !== t('todo_config.status.completed'))
    } else if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.status === t('todo_config.status.completed'))
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(todo => todo.category === selectedCategory)
    }

    return filtered.sort((a, b) => {
      if (a.status === t('todo_config.status.completed') && b.status !== t('todo_config.status.completed')) return 1
      if (a.status !== t('todo_config.status.completed') && b.status === t('todo_config.status.completed')) return -1
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (!category) {
      return t('todo_config.category.uncategorized')
    }
    // 檢查是否為預設分類（通過 id 判斷）
    const defaultCategoryIds = ['work', 'housework', 'reading', 'study', 'health', 'social', 'misc']
    if (defaultCategoryIds.includes(category.id)) {
      return t(`todo_config.category.${category.id}`)
    }
    // 對於自定義分類，使用原始名稱（可能包含 emoji 或自定義文字）
    return category.name
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.color || '#6b7280'
  }

  const getPriorityColor = (priority: string) => {
    if (priority === t('todo_config.priority.high')) return 'text-red-600 bg-red-100'
    if (priority === t('todo_config.priority.medium')) return 'text-yellow-600 bg-yellow-100'
    if (priority === t('todo_config.priority.low')) return 'text-green-600 bg-green-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getStatusColor = (status: string) => {
    if (status === t('todo_config.status.completed')) return 'text-green-600 bg-green-100'
    if (status === t('todo_config.status.in_progress')) return 'text-blue-600 bg-blue-100'
    if (status === t('todo_config.status.not_started')) return 'text-gray-600 bg-gray-100'
    return 'text-gray-600 bg-gray-100'
  }

  const clearCompleted = () => {
    if (window.confirm(t('todo_config.confirm.clear_completed'))) {
      const updatedTodos = todos.filter(todo => todo.status !== t('todo_config.status.completed'))
      saveTodos(updatedTodos)
    }
  }

  return (
    <div className="gradient-bg min-h-screen p-4">
      <div className="max-w-screen-md mx-auto px-4 w-full">
        <ModuleDropdown />
        
        <div className="card mb-6">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 overflow-wrap break-word">📋 {t('todo_config.title')}</h1>

          {/* 新增待辦事項 */}
          <div className="mb-6 card">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 overflow-wrap break-word">{t('todo_config.add_new')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('todo_config.form.title')} *</label>
                <input
                  type="text"
                  value={newTodo.title || ''}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base overflow-wrap break-word"
                  placeholder={t('todo_config.form.title_placeholder')}
                  title={t('todo_config.form.title')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('todo_config.form.category')}</label>
                <select
                  value={newTodo.category || ''}
                  onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  style={{ color: newTodo.category ? getCategoryColor(newTodo.category) : undefined }}
                  title={t('todo_config.form.select_category')}
                >
                  {categories.map(category => {
                    const defaultCategoryIds = ['work', 'housework', 'reading', 'study', 'health', 'social', 'misc']
                    const displayName = defaultCategoryIds.includes(category.id) 
                      ? t(`todo_config.category.${category.id}`)
                      : category.name
                    return <option key={category.id} value={category.id} style={{ color: category.color }}>{displayName}</option>
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('todo_config.form.priority')}</label>
                <select
                  value={newTodo.priority || t('todo_config.priority.medium')}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title={t('todo_config.form.select_priority')}
                >
                  <option value={t('todo_config.priority.low')}>{t('todo_config.priority.low')}</option>
                  <option value={t('todo_config.priority.medium')}>{t('todo_config.priority.medium')}</option>
                  <option value={t('todo_config.priority.high')}>{t('todo_config.priority.high')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('todo_config.form.date')}</label>
                <input
                  type="date"
                  value={newTodo.date || ''}
                  onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title={t('todo_config.form.enter_date')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('todo_config.form.start_time')}</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={`${newTodo.startHour || '09'}:${newTodo.startMinute || '00'}`}
                    onChange={(e) => {
                      const [hour, minute] = e.target.value.split(':')
                      setNewTodo({ ...newTodo, startHour: hour, startMinute: minute })
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={t('todo_config.form.enter_time')}
                    placeholder={t('todo_config.form.time')}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('todo_config.form.end_time')}</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={`${newTodo.endHour || '10'}:${newTodo.endMinute || '00'}`}
                    onChange={(e) => {
                      const [hour, minute] = e.target.value.split(':')
                      setNewTodo({ ...newTodo, endHour: hour, endMinute: minute })
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={t('todo_config.form.enter_time')}
                    placeholder={t('todo_config.form.time')}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('todo_config.form.description')}</label>
              <textarea
                value={newTodo.description || ''}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={t('todo_config.form.description_placeholder')}
                title={t('todo_config.form.enter_description')}
              />
            </div>
            
            <div className="mt-4">
              <button
                onClick={addTodo}
                className="w-full max-w-xs lg:w-40 mx-auto block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {t('todo_config.button.add')}
              </button>
            </div>
          </div>

          {/* 篩選器 */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 sm:flex-initial sm:px-4 py-2 rounded-md transition-colors ${
                  filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('todo_config.filter.all')}
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`flex-1 sm:flex-initial sm:px-4 py-2 rounded-md transition-colors ${
                  filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('todo_config.filter.pending')}
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`flex-1 sm:flex-initial sm:px-4 py-2 rounded-md transition-colors ${
                  filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('todo_config.filter.completed')}
              </button>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={t('todo_config.form.select_category')}
            >
              <option value="all">{t('todo_config.filter.all_categories')}</option>
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
                  className={`card transition-all ${
                  todo.status === t('todo_config.status.completed') 
                    ? 'opacity-75' 
                    : ''
                }`}
              >
                {/* 手機版優化佈局 */}
                <div className="w-full">
                  {/* 標題和操作按鈕行 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={todo.status === t('todo_config.status.completed')}
                        onChange={() => toggleStatus(todo.id)}
                        className="w-5 h-5 text-blue-600 border-0 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <h3 className={`text-lg font-semibold break-words flex-1 min-w-0 ${
                        todo.status === t('todo_config.status.completed') ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {todo.title}
                      </h3>
                    </div>
                    
                    {/* 操作按鈕 */}
                    <div className="flex gap-2 flex-shrink-0 ml-2">
                      <button
                        onClick={() => setEditingTodo(todo)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                        title={t('todo_config.action.edit')}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                        title={t('todo_config.action.delete')}
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
                <p>{t('todo_config.empty.no_todos')}</p>
              </div>
            )}
          </div>

          {/* 匯出待辦記錄 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <TodoExportButton todos={todos} categories={categories} />
          </div>

          {/* 清除已完成 */}
          {todos.some(todo => todo.status === t('todo_config.status.completed')) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={clearCompleted}
                className="w-full max-w-xs lg:w-40 mx-auto block px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                {t('todo_config.button.clear_completed')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}