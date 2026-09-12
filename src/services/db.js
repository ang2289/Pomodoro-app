// Dexie 本地資料庫封裝
// 若專案尚未安裝 dexie，請先安裝：
// npm i dexie
import Dexie from 'dexie';
class AppDB extends Dexie {
    constructor() {
        super('pomodoro_app_db');
        Object.defineProperty(this, "tasks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 版本 2：加入提醒與重複任務欄位
        this.version(3).stores({
            // 使用 id 作為主鍵（字串），其餘欄位建立索引需求可再擴充
            tasks: 'id, title, date, reminder, remindBeforeMinutes, createdAt'
        });
    }
}
export const db = new AppDB();
// CRUD 封裝（避免頁面直接依賴 Dexie 細節）
export async function addTaskRecord(task) {
    await db.tasks.put(task);
}
export async function updateTaskRecord(id, patch) {
    await db.tasks.update(id, patch);
}
export async function deleteTaskRecord(id) {
    await db.tasks.delete(id);
}
export async function getAllTaskRecords() {
    return await db.tasks.toArray();
}
