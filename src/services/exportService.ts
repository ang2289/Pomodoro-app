import { saveAs } from 'file-saver';
import { TaskRegistration } from '../types/TaskRegistration'
import { GroupTask } from '../types/GroupTask'

// 匯出資料格式
export interface ExportData {
  taskTitle: string
  deliveryTime: string
  exportDate: string
  totalRegistrations: number
  totalQuantity: number
  completedQuantity: number
  pendingQuantity: number
  registrations: {
    name: string
    quantity: number
    isCompleted: boolean
    registeredAt: string
  }[]
}

// 準備匯出資料
export const prepareExportData = (task: GroupTask, registrations: TaskRegistration[]): ExportData => {
  const totalQuantity = registrations.reduce((sum, reg) => sum + reg.quantity, 0)
  const completedQuantity = registrations
    .filter(reg => reg.isCompleted)
    .reduce((sum, reg) => sum + reg.quantity, 0)
  
  return {
    taskTitle: task.title,
    deliveryTime: task.deliveryTime,
    exportDate: new Date().toLocaleString('zh-TW'),
    totalRegistrations: registrations.length,
    totalQuantity,
    completedQuantity,
    pendingQuantity: totalQuantity - completedQuantity,
    registrations: registrations.map(reg => ({
      name: reg.userName,
      quantity: reg.quantity,
      isCompleted: reg.isCompleted,
      registeredAt: new Date(reg.registeredAt).toLocaleString('zh-TW')
    }))
  }
}

// 匯出為 CSV 格式
export const exportToCSV = (data: ExportData): string => {
  const headers = ['姓名', '數量', '是否取貨', '報名時間']
  const rows = data.registrations.map(reg => [
    reg.name,
    reg.quantity.toString(),
    reg.isCompleted ? '是' : '否',
    reg.registeredAt
  ])
  
  const csvContent = [
    `任務標題,${data.taskTitle}`,
    `領貨時間,${data.deliveryTime}`,
    `匯出時間,${data.exportDate}`,
    `總報名人數,${data.totalRegistrations}`,
    `總數量,${data.totalQuantity}`,
    `已領取數量,${data.completedQuantity}`,
    `待領取數量,${data.pendingQuantity}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  return csvContent
}

// 匯出為 JSON 格式
export const exportToJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2)
}

// 下載檔案
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  
  // 使用 file-saver 下載檔案，提升手機支援度
  saveAs(blob, filename)
}

// 匯出報名名單（CSV）
export const exportRegistrationList = (task: GroupTask, registrations: TaskRegistration[]) => {
  try {
    const data = prepareExportData(task, registrations)
    const csvContent = exportToCSV(data)
    const filename = `${task.title.replace(/[^\w\s]/gi, '')}_報名名單_${new Date().toISOString().split('T')[0]}.csv`
    
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8')
    return { success: true, message: '報名名單匯出成功！' }
  } catch (error) {
    console.error('匯出失敗:', error)
    return { success: false, message: '匯出失敗，請重試' }
  }
}

// 匯出報名名單（JSON）
export const exportRegistrationListJSON = (task: GroupTask, registrations: TaskRegistration[]) => {
  try {
    const data = prepareExportData(task, registrations)
    const jsonContent = exportToJSON(data)
    const filename = `${task.title.replace(/[^\w\s]/gi, '')}_報名名單_${new Date().toISOString().split('T')[0]}.json`
    
    downloadFile(jsonContent, filename, 'application/json;charset=utf-8')
    return { success: true, message: '報名名單匯出成功！' }
  } catch (error) {
    console.error('匯出失敗:', error)
    return { success: false, message: '匯出失敗，請重試' }
  }
}










