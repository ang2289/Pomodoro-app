export interface Todo {
  id: string
  title: string
  category: string
  priority: string
  datetime: string
  remind10: boolean
  remind30: boolean
  remind60: boolean
  // ✅ 新增欄位
  status: '未開始' | '進行中' | '已完成'
  progress: number // 0 ~ 100
  completedAt?: string
  // 🔔 提醒相關欄位
  reminderTime?: string // 提醒時間
  reminded?: boolean // 是否已提醒
  // ✏️ 編輯相關欄位
  isEditing?: boolean // 是否正在編輯
}
