// Dexie 本地資料庫封裝
// 若專案尚未安裝 dexie，請先安裝：
// npm i dexie

import Dexie, { Table } from 'dexie'

export interface TaskRecord {
  id: string // 與現有 Todo 使用的 id 對齊（Date.now().toString()）
  title: string
  description?: string
  category: string
  priority: '低' | '中' | '高'
  date: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  reminder: string
  remindBeforeMinutes?: number
  status: '未開始' | '進行中' | '已完成'
  createdAt: string
}

class AppDB extends Dexie {
  tasks!: Table<TaskRecord, string>

  constructor() {
    super('pomodoro_app_db')

    // 版本 2：加入提醒與重複任務欄位
    this.version(3).stores({
      // 使用 id 作為主鍵（字串），其餘欄位建立索引需求可再擴充
      tasks: 'id, title, date, reminder, remindBeforeMinutes, createdAt'
    })
  }
}

export const db = new AppDB()

// CRUD 封裝（避免頁面直接依賴 Dexie 細節）
export async function addTaskRecord(task: TaskRecord): Promise<void> {
  await db.tasks.put(task)
}

export async function updateTaskRecord(id: string, patch: Partial<TaskRecord>): Promise<void> {
  await db.tasks.update(id, patch)
}

export async function deleteTaskRecord(id: string): Promise<void> {
  await db.tasks.delete(id)
}

export async function getAllTaskRecords(): Promise<TaskRecord[]> {
  return await db.tasks.toArray()
}


