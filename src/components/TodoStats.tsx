import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'

interface TodoItem {
  title: string
  datetime: string // 任務日期時間
  status: string // 狀態：未開始 / 進行中 / 已完成
  category?: string // 任務分類
}

interface TodoStatsProps {
  todos: TodoItem[]
}

// removed unused COLORS

// 任務類別顏色配置
// removed unused TYPE_COLORS

const TodoStats: React.FC<TodoStatsProps> = ({ todos }) => {
  const total = todos.length
  const inProgress = todos.filter(t => t.status === '進行中').length
  const completed = todos.filter(t => t.status === '已完成').length
  const _notStarted = total - inProgress - completed
  void _notStarted

  // 📅 今日任務統計
  const today = dayjs()
  const todayTasks = todos.filter(t => dayjs(t.datetime).isSame(today, 'day'))
  
  // 計算完成與未完成
  const completedTasks = todayTasks.filter(task => task.status === '已完成')
  const remainingTasks = todayTasks.length - completedTasks.length
  const _todayProgressRate = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0
  void _todayProgressRate

  // 今日任務完成率圓形圖資料
  const chartData = [
    { name: '已完成', value: completedTasks.length },
    { name: '未完成', value: remainingTasks }
  ]
  
  // 顏色配置
  const COLORS = ['#00C49F', '#D3D3D3'] // 綠＋灰

  // 📆 近 7 天統計
  const weeklyData = useMemo(() => {
    const today = dayjs()
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = today.subtract(6 - i, 'day')
      const label = date.format('MM/DD')
      const dayTodos = todos.filter(t => dayjs(t.datetime).isSame(date, 'day'))
      const total = dayTodos.length
      const completed = dayTodos.filter(t => t.status === '已完成').length
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0
      return { date: label, completed, total, rate }
    })
    return last7Days
  }, [todos])

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 mt-4 font-['Noto Sans TC']">
      <h2 className="text-lg font-bold mb-4 text-gray-800">📊 任務統計</h2>

      {/* 今日統計 */}
      <div className="flex flex-col sm:flex-row justify-around items-center mb-6">
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 className="text-lg font-bold mb-2 text-gray-800">任務完成率</h3>
          {chartData.every(d => d.value === 0) ? (
            <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full">
              <span className="text-gray-500 text-sm">無任務</span>
            </div>
          ) : (
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={false}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} 個任務`, name]} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <p className="mt-2 text-sm text-gray-600" style={{ padding: '8px', lineHeight: '1.6' }}>
            {completedTasks.length}/{todayTasks.length} 任務完成
          </p>
        </div>

        <div className="mt-4 sm:mt-0 space-y-1 text-gray-700 text-sm" style={{ padding: '8px', lineHeight: '1.6' }}>
          <p>總任務：<span className="font-semibold">{total}</span></p>
          <p>進行中：<span className="font-semibold text-yellow-500">{inProgress}</span></p>
          <p>已完成：<span className="font-semibold text-green-600">{completed}</span></p>
        </div>
      </div>

        {/* 每週完成任務長條圖 */}
        <div className="mt-6">
          <h3 className="text-md font-bold mb-2 text-gray-800">📅 最近 7 天完成任務</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="completed" fill="#22c55e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 每日完成率折線圖 */}
      <div className="mt-8">
        <h3 className="text-md font-bold mb-2 text-gray-800">📈 每日任務完成率 (%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyData}>
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    {/* 分類分析圖 */}
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2 text-gray-800">📂 任務分類分析</h3>
      {(() => {
        // 使用今日任務進行分類統計，保持與完成率圖表一致
        const categoryMap = new Map()
        todayTasks.forEach(task => {
          const catId = task.category || '未分類'
          
          // 根據分類 ID 獲取正確的顯示名稱
          const getCategoryName = (id: string) => {
            switch(id) {
              case 'work': return '💼 工作'
              case 'housework': return '🧹 家務'
              case 'reading': return '📚 閱讀'
              case 'study': return '🎓 學習'
              case 'health': return '💪 健康'
              case 'social': return '🎉 聚會'
              case 'misc': return '📝 其他'
              case '未分類': return '📂 未分類'
              default: return id // 如果是自訂分類，保持原名稱
            }
          }
          
          const displayName = getCategoryName(catId)
          
          if (categoryMap.has(displayName)) {
            categoryMap.set(displayName, categoryMap.get(displayName) + 1)
          } else {
            categoryMap.set(displayName, 1)
          }
        })
        
        // 轉為陣列資料格式
        const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name: name || '未分類',
          value
        }))

        // 分類顏色配置
        const CATEGORY_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

        return categoryData.length === 0 || categoryData.every(d => d.value === 0) ? (
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <span className="text-gray-500">今日尚無任務分類資料</span>
          </div>
        ) : (
          <div>
            <ResponsiveContainer width={280} height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={60}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} 個任務`, name]} />
              </PieChart>
            </ResponsiveContainer>
            {/* 自訂圖例 */}
            <div className="flex flex-wrap justify-center gap-2 mt-3 px-1">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-xs text-gray-700 whitespace-nowrap leading-tight">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
    </div>
  )
}

export default TodoStats