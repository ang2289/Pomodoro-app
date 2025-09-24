import { TaskTag, TaskTagWithCount, DEFAULT_TAG_COLORS } from '../types/TaskTag'

const TASK_TAGS_KEY = 'task_tags'
const TASK_TAG_USAGE_KEY = 'task_tag_usage'

// 預設標籤
const DEFAULT_TAGS: Omit<TaskTag, 'id' | 'createdAt' | 'createdBy'>[] = [
  { name: '寫作', color: '#2196f3', isDefault: true },
  { name: '運動', color: '#4caf50', isDefault: true },
  { name: '會議', color: '#ff9800', isDefault: true },
  { name: '學習', color: '#9c27b0', isDefault: true },
  { name: '工作', color: '#f44336', isDefault: true }
]

// 生成 UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 初始化預設標籤
export const initializeDefaultTaskTags = (): void => {
  const existingTags = getTaskTags()
  if (existingTags.length === 0) {
    const defaultTags: TaskTag[] = DEFAULT_TAGS.map(tag => ({
      ...tag,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    }))
    localStorage.setItem(TASK_TAGS_KEY, JSON.stringify(defaultTags))
  }
}

// 獲取所有標籤
export const getTaskTags = (): TaskTag[] => {
  try {
    const tags = localStorage.getItem(TASK_TAGS_KEY)
    return tags ? JSON.parse(tags) : []
  } catch (error) {
    console.error('Error loading task tags:', error)
    return []
  }
}

// 獲取標籤（包含使用次數）
export const getTaskTagsWithCount = (): TaskTagWithCount[] => {
  const tags = getTaskTags()
  const usageData = getTaskTagUsage()
  
  return tags.map(tag => ({
    ...tag,
    usageCount: usageData[tag.id] || 0
  }))
}

// 新增標籤
export const addTaskTag = (name: string, color: string, createdBy: string = 'user'): TaskTag => {
  const newTag: TaskTag = {
    id: generateUUID(),
    name: name.trim(),
    color,
    isDefault: false,
    createdAt: new Date().toISOString(),
    createdBy
  }
  
  const existingTags = getTaskTags()
  const updatedTags = [...existingTags, newTag]
  localStorage.setItem(TASK_TAGS_KEY, JSON.stringify(updatedTags))
  
  return newTag
}

// 更新標籤
export const updateTaskTag = (id: string, name: string, color: string): boolean => {
  const tags = getTaskTags()
  const tagIndex = tags.findIndex(tag => tag.id === id)
  
  if (tagIndex === -1) return false
  
  // 不允許編輯預設標籤
  if (tags[tagIndex].isDefault) return false
  
  tags[tagIndex].name = name.trim()
  tags[tagIndex].color = color
  localStorage.setItem(TASK_TAGS_KEY, JSON.stringify(tags))
  
  return true
}

// 刪除標籤
export const deleteTaskTag = (id: string): boolean => {
  const tags = getTaskTags()
  const tagIndex = tags.findIndex(tag => tag.id === id)
  
  if (tagIndex === -1) return false
  
  // 不允許刪除預設標籤
  if (tags[tagIndex].isDefault) return false
  
  const updatedTags = tags.filter(tag => tag.id !== id)
  localStorage.setItem(TASK_TAGS_KEY, JSON.stringify(updatedTags))
  
  return true
}

// 獲取標籤使用次數
const getTaskTagUsage = (): Record<string, number> => {
  try {
    const usage = localStorage.getItem(TASK_TAG_USAGE_KEY)
    return usage ? JSON.parse(usage) : {}
  } catch (error) {
    console.error('Error loading task tag usage:', error)
    return {}
  }
}

// 記錄標籤使用
export const recordTaskTagUsage = (tagId: string): void => {
  const usage = getTaskTagUsage()
  usage[tagId] = (usage[tagId] || 0) + 1
  localStorage.setItem(TASK_TAG_USAGE_KEY, JSON.stringify(usage))
}

// 獲取最常用的標籤
export const getMostUsedTaskTags = (limit: number = 5): TaskTagWithCount[] => {
  const tagsWithCount = getTaskTagsWithCount()
  return tagsWithCount
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit)
}

// 獲取隨機顏色
export const getRandomTagColor = (): string => {
  return DEFAULT_TAG_COLORS[Math.floor(Math.random() * DEFAULT_TAG_COLORS.length)]
}








