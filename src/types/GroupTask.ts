export interface GroupTask {
  id: string
  title: string
  groupId: string
  deliveryTime: string
  createdAt: string
  createdBy: string
}

export interface CreateGroupTaskData {
  title: string
  groupId: string
  deliveryTime: string
  createdBy: string
}

