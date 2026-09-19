export type NotificationDeliveryStatus =
  | 'notification_pending'
  | 'notification_sent'
  | 'notification_failed'

export type GroupBuyNotificationMessage = {
  eventType: string
  to: string
  subject: string
  html: string
  idempotencyKey: string
}

export type NotificationDeliveryResult = {
  status: NotificationDeliveryStatus
  provider: string | null
  providerMessageId: string | null
  error: string | null
}

export interface GroupBuyNotificationService {
  send(message: GroupBuyNotificationMessage): Promise<NotificationDeliveryResult>
}

class PendingNotificationService implements GroupBuyNotificationService {
  async send(): Promise<NotificationDeliveryResult> {
    return {
      status: 'notification_pending',
      provider: null,
      providerMessageId: null,
      error: 'EMAIL_PROVIDER_NOT_CONFIGURED',
    }
  }
}

// Replace this implementation when an email provider is configured. Until then,
// callers must keep the notification pending and must never claim it was sent.
export function getGroupBuyNotificationService(): GroupBuyNotificationService {
  return new PendingNotificationService()
}
