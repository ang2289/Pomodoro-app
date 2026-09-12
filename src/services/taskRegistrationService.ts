import { TaskRegistration, RegisterTaskData } from '../types/TaskRegistration'

// 產生 UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 儲存任務報名到 localStorage
export const saveTaskRegistration = (registration: TaskRegistration): void => {
  const registrations = getTaskRegistrations()
  registrations.push(registration)
  localStorage.setItem('pomodoro-task-registrations', JSON.stringify(registrations))
}

// 從 localStorage 取得所有任務報名
export const getTaskRegistrations = (): TaskRegistration[] => {
  const registrations = localStorage.getItem('pomodoro-task-registrations')
  return registrations ? JSON.parse(registrations) : []
}

// 根據任務 ID 取得報名列表
export const getTaskRegistrationsByTaskId = (taskId: string): TaskRegistration[] => {
  const registrations = getTaskRegistrations()
  return registrations.filter(registration => registration.taskId === taskId)
}

// 檢查使用者是否已報名任務
export const isUserRegisteredForTask = (userId: string, taskId: string): boolean => {
  const registrations = getTaskRegistrations()
  return registrations.some(registration => 
    registration.userId === userId && registration.taskId === taskId
  )
}

// 取得使用者在特定任務的報名資料
export const getUserTaskRegistration = (userId: string, taskId: string): TaskRegistration | null => {
  const registrations = getTaskRegistrations()
  return registrations.find(registration => 
    registration.userId === userId && registration.taskId === taskId
  ) || null
}

// 報名任務
export const registerForTask = (data: RegisterTaskData): TaskRegistration => {
  const registration: TaskRegistration = {
    id: generateUUID(),
    taskId: data.taskId,
    userId: data.userId,
    userName: data.userName,
    quantity: data.quantity,
    isCompleted: false,
    registeredAt: new Date().toISOString()
  }
  
  saveTaskRegistration(registration)
  return registration
}

// 更新領貨狀態
export const updateTaskRegistrationStatus = (registrationId: string, isCompleted: boolean): boolean => {
  try {
    const registrations = getTaskRegistrations()
    const registrationIndex = registrations.findIndex(reg => reg.id === registrationId)
    
    if (registrationIndex === -1) {
      return false
    }
    
    registrations[registrationIndex].isCompleted = isCompleted
    localStorage.setItem('pomodoro-task-registrations', JSON.stringify(registrations))
    return true
  } catch (error) {
    console.error('更新報名狀態失敗:', error)
    return false
  }
}

// 取消報名
export const cancelTaskRegistration = (registrationId: string): boolean => {
  try {
    const registrations = getTaskRegistrations()
    const updatedRegistrations = registrations.filter(reg => reg.id !== registrationId)
    localStorage.setItem('pomodoro-task-registrations', JSON.stringify(updatedRegistrations))
    return true
  } catch (error) {
    console.error('取消報名失敗:', error)
    return false
  }
}

// 計算任務統計
export const getTaskStatistics = (taskId: string) => {
  const registrations = getTaskRegistrationsByTaskId(taskId)
  const totalQuantity = registrations.reduce((sum, reg) => sum + reg.quantity, 0)
  const completedQuantity = registrations
    .filter(reg => reg.isCompleted)
    .reduce((sum, reg) => sum + reg.quantity, 0)
  
  return {
    totalRegistrations: registrations.length,
    totalQuantity,
    completedQuantity,
    pendingQuantity: totalQuantity - completedQuantity
  }
}



