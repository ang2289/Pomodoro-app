export interface TaskRegistration {
  id: string
  taskId: string
  userId: string
  userName: string
  quantity: number
  isCompleted: boolean
  registeredAt: string
}

export interface RegisterTaskData {
  taskId: string
  userId: string
  userName: string
  quantity: number
}



