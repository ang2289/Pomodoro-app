import { GroupTask, CreateGroupTaskData } from '../types/GroupTask'

// 產生 UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 儲存群組任務到 localStorage
export const saveGroupTask = (task: GroupTask): void => {
  const tasks = getGroupTasks()
  tasks.push(task)
  localStorage.setItem('pomodoro-group-tasks', JSON.stringify(tasks))
}

// 從 localStorage 取得所有群組任務
export const getGroupTasks = (): GroupTask[] => {
  const tasks = localStorage.getItem('pomodoro-group-tasks')
  return tasks ? JSON.parse(tasks) : []
}

// 根據群組 ID 取得任務列表
export const getGroupTasksByGroupId = (groupId: string): GroupTask[] => {
  const tasks = getGroupTasks()
  return tasks.filter(task => task.groupId === groupId)
}

// 根據使用者 ID 取得任務列表
export const getGroupTasksByUserId = (userId: string): GroupTask[] => {
  const tasks = getGroupTasks()
  return tasks.filter(task => task.createdBy === userId)
}

// 建立新群組任務
export const createGroupTask = (data: CreateGroupTaskData): GroupTask => {
  const task: GroupTask = {
    id: generateUUID(),
    title: data.title,
    groupId: data.groupId,
    deliveryTime: data.deliveryTime,
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy
  }
  
  saveGroupTask(task)
  return task
}

// 刪除群組任務
export const deleteGroupTask = (taskId: string): boolean => {
  try {
    const tasks = getGroupTasks()
    const updatedTasks = tasks.filter(task => task.id !== taskId)
    localStorage.setItem('pomodoro-group-tasks', JSON.stringify(updatedTasks))
    return true
  } catch (error) {
    console.error('刪除任務失敗:', error)
    return false
  }
}

// 更新群組任務
export const updateGroupTask = (taskId: string, updates: Partial<GroupTask>): boolean => {
  try {
    const tasks = getGroupTasks()
    const taskIndex = tasks.findIndex(task => task.id === taskId)
    
    if (taskIndex === -1) {
      return false
    }
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates }
    localStorage.setItem('pomodoro-group-tasks', JSON.stringify(tasks))
    return true
  } catch (error) {
    console.error('更新任務失敗:', error)
    return false
  }
}
