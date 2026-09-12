import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

export interface NotificationOptions {
  title: string
  body: string
  id?: number
  schedule?: {
    at: Date
  }
}

class NotificationService {
  private hasPermission = false

  // 初始化通知服務
  async initialize() {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await LocalNotifications.requestPermissions()
        this.hasPermission = result.display === 'granted'
        console.log('原生通知權限狀態:', this.hasPermission)
        return this.hasPermission
      } catch (error) {
        console.error('請求原生通知權限失敗:', error)
        return false
      }
    } else {
      // 瀏覽器環境
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        this.hasPermission = permission === 'granted'
        console.log('瀏覽器通知權限狀態:', this.hasPermission)
        return this.hasPermission
      } else {
        console.warn('瀏覽器不支援通知')
        return false
      }
    }
  }

  // 檢查是否有通知權限
  hasNotificationPermission(): boolean {
    return this.hasPermission
  }

  // 顯示即時通知
  async showNotification(options: NotificationOptions) {
    if (!this.hasPermission) {
      console.warn('沒有通知權限')
      return false
    }

    if (Capacitor.isNativePlatform()) {
      // 原生通知
      try {
        await LocalNotifications.schedule({
          notifications: [{
            title: options.title,
            body: options.body,
            id: options.id || Date.now(),
            schedule: options.schedule
          }]
        })
        console.log('原生通知已安排')
        return true
      } catch (error) {
        console.error('安排原生通知失敗:', error)
        return false
      }
    } else {
      // 瀏覽器通知
      try {
        new Notification(options.title, {
          body: options.body,
          icon: '/favicon.ico'
        })
        console.log('瀏覽器通知已顯示')
        return true
      } catch (error) {
        console.error('顯示瀏覽器通知失敗:', error)
        return false
      }
    }
  }

  // 安排延遲通知
  async scheduleNotification(options: NotificationOptions) {
    if (!this.hasPermission) {
      console.warn('沒有通知權限')
      return false
    }

    if (Capacitor.isNativePlatform()) {
      // 原生延遲通知
      try {
        await LocalNotifications.schedule({
          notifications: [{
            title: options.title,
            body: options.body,
            id: options.id || Date.now(),
            schedule: options.schedule
          }]
        })
        console.log('原生延遲通知已安排:', options.schedule?.at)
        return true
      } catch (error) {
        console.error('安排原生延遲通知失敗:', error)
        return false
      }
    } else {
      // 瀏覽器環境不支援延遲通知，使用 setTimeout
      const delay = options.schedule ? options.schedule.at.getTime() - Date.now() : 0
      if (delay > 0) {
        setTimeout(() => {
          this.showNotification(options)
        }, delay)
        console.log('瀏覽器延遲通知已安排:', options.schedule?.at)
        return true
      } else {
        return this.showNotification(options)
      }
    }
  }

  // 取消通知
  async cancelNotification(notificationId: number) {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] })
        console.log('原生通知已取消:', notificationId)
        return true
      } catch (error) {
        console.error('取消原生通知失敗:', error)
        return false
      }
    } else {
      // 瀏覽器環境無法取消已安排的通知
      console.warn('瀏覽器環境無法取消已安排的通知')
      return false
    }
  }

  // 檢查是否為原生平台
  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform()
  }

  // 檢查是否支援通知
  isNotificationSupported(): boolean {
    if (Capacitor.isNativePlatform()) {
      return true // 原生平台總是支援通知
    } else {
      return 'Notification' in window
    }
  }
}

// 導出單例實例
export const notificationService = new NotificationService()
export default notificationService
