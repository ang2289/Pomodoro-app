import { Group, CreateGroupData } from '../types/Group'

// 產生 6 碼群組代碼
export const generateGroupCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 產生 UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 儲存群組到 localStorage
export const saveGroup = (group: Group): void => {
  const groups = getGroups()
  groups.push(group)
  localStorage.setItem('pomodoro-groups', JSON.stringify(groups))
}

// 從 localStorage 取得所有群組
export const getGroups = (): Group[] => {
  const groups = localStorage.getItem('pomodoro-groups')
  return groups ? JSON.parse(groups) : []
}

// 根據代碼尋找群組
export const findGroupByCode = (code: string): Group | null => {
  const groups = getGroups()
  return groups.find(group => group.code === code) || null
}

// 建立新群組
export const createGroup = (data: CreateGroupData): Group => {
  const group: Group = {
    id: generateUUID(),
    name: data.name,
    code: generateGroupCode(),
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy
  }
  
  saveGroup(group)
  return group
}

