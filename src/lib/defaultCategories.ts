export interface Category {
  id: string
  name: string
  color: string
  isDefault?: boolean
}

export const defaultCategories: Category[] = [
  { id: 'work', name: '💼 工作', color: '#3b82f6', isDefault: true },
  { id: 'housework', name: '🧹 家務', color: '#10b981', isDefault: true },
  { id: 'reading', name: '📚 閱讀', color: '#f59e0b', isDefault: true },
  { id: 'study', name: '🎓 學習', color: '#8b5cf6', isDefault: true },
  { id: 'health', name: '💪 健康', color: '#ef4444', isDefault: true },
  { id: 'social', name: '🎉 聚會', color: '#ec4899', isDefault: true },
  { id: 'misc', name: '📝 其他', color: '#6b7280', isDefault: true }
]
