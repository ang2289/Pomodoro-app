import { Group } from '../types/Group'
import { GroupMember } from '../types/GroupMember'
import { GroupTask } from '../types/GroupTask'
import { TaskRegistration } from '../types/TaskRegistration'

// 測試群組資料
export const testGroup: Group = {
  id: 'test-group-1',
  name: '蛋塔小組',
  code: 'A1B2C3',
  createdAt: new Date('2024-09-10T10:00:00Z').toISOString(),
  createdBy: 'test-user-1'
}

// 測試群組成員資料
export const testGroupMembers: GroupMember[] = [
  {
    id: 'member-1',
    groupId: 'test-group-1',
    userId: 'test-user-1',
    userName: '張小明',
    joinedAt: new Date('2024-09-10T10:00:00Z').toISOString(),
    role: 'admin'
  },
  {
    id: 'member-2',
    groupId: 'test-group-1',
    userId: 'test-user-2',
    userName: '李美華',
    joinedAt: new Date('2024-09-10T11:30:00Z').toISOString(),
    role: 'member'
  },
  {
    id: 'member-3',
    groupId: 'test-group-1',
    userId: 'test-user-3',
    userName: '王大雄',
    joinedAt: new Date('2024-09-10T14:15:00Z').toISOString(),
    role: 'member'
  }
]

// 測試任務資料
export const testTask: GroupTask = {
  id: 'test-task-1',
  title: '9/12 雞蛋糕取貨',
  groupId: 'test-group-1',
  deliveryTime: '9/12 晚上 7 點～9 點',
  createdAt: new Date('2024-09-11T09:00:00Z').toISOString(),
  createdBy: 'test-user-1'
}

// 測試任務報名資料
export const testTaskRegistrations: TaskRegistration[] = [
  {
    id: 'registration-1',
    taskId: 'test-task-1',
    userId: 'test-user-1',
    userName: '張小明',
    quantity: 2,
    isCompleted: true,
    registeredAt: new Date('2024-09-11T09:30:00Z').toISOString()
  },
  {
    id: 'registration-2',
    taskId: 'test-task-1',
    userId: 'test-user-2',
    userName: '李美華',
    quantity: 1,
    isCompleted: false,
    registeredAt: new Date('2024-09-11T10:15:00Z').toISOString()
  },
  {
    id: 'registration-3',
    taskId: 'test-task-1',
    userId: 'test-user-3',
    userName: '王大雄',
    quantity: 3,
    isCompleted: true,
    registeredAt: new Date('2024-09-11T11:00:00Z').toISOString()
  }
]

// 初始化測試資料到 localStorage
export const initializeTestData = () => {
  try {
    // 儲存測試群組
    localStorage.setItem('pomodoro-groups', JSON.stringify([testGroup]))
    
    // 儲存測試群組成員
    localStorage.setItem('pomodoro-group-members', JSON.stringify(testGroupMembers))
    
    // 儲存測試任務
    localStorage.setItem('pomodoro-group-tasks', JSON.stringify([testTask]))
    
    // 儲存測試任務報名
    localStorage.setItem('pomodoro-task-registrations', JSON.stringify(testTaskRegistrations))
    
    console.log('✅ 測試資料初始化完成')
    console.log('📊 測試資料統計:')
    console.log(`- 群組: ${testGroup.name} (${testGroup.code})`)
    console.log(`- 成員: ${testGroupMembers.length} 人`)
    console.log(`- 任務: ${testTask.title}`)
    console.log(`- 報名: ${testTaskRegistrations.length} 人`)
    console.log(`- 已領取: ${testTaskRegistrations.filter(r => r.isCompleted).length} 人`)
    
    return true
  } catch (error) {
    console.error('❌ 測試資料初始化失敗:', error)
    return false
  }
}

// 清除所有測試資料
export const clearTestData = () => {
  try {
    localStorage.removeItem('pomodoro-groups')
    localStorage.removeItem('pomodoro-group-members')
    localStorage.removeItem('pomodoro-group-tasks')
    localStorage.removeItem('pomodoro-task-registrations')
    console.log('🗑️ 測試資料已清除')
    return true
  } catch (error) {
    console.error('❌ 清除測試資料失敗:', error)
    return false
  }
}

// 檢查是否有測試資料
export const hasTestData = (): boolean => {
  const groups = localStorage.getItem('pomodoro-groups')
  const members = localStorage.getItem('pomodoro-group-members')
  const tasks = localStorage.getItem('pomodoro-group-tasks')
  const registrations = localStorage.getItem('pomodoro-task-registrations')
  
  return !!(groups && members && tasks && registrations)
}










