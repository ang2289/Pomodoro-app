export const orderStatusText: Record<string, string> = {
  registered: '已完成預登記',
  waiting_group: '等待成團',
  threshold_reached: '已達登記門檻',
  payment_open: '請完成付款',
  payment_reported: '付款核對中',
  payment_verified: '已確認付款',
  confirmed: '正式成團',
  supplier_ordered: '供應商備貨中',
  preparing: '供應商備貨中',
  shipped: '已出貨',
  ready_for_pickup: '可到店取貨',
  completed: '已完成',
  cancelled: '已取消',
  refund_pending: '退款處理中',
  refunded: '已退款',
}

export const paymentStatusText: Record<string, string> = {
  not_open: '目前不需匯款',
  pending: '待付款',
  reported: '付款核對中',
  verified: '已確認付款',
  rejected: '付款資料需修正',
  payment_overdue: '已逾付款期限',
  refunded: '已退款',
}

export const notificationStatusText: Record<string, string> = {
  notification_pending: '通知待處理',
  notification_sent: '通知已送出',
  notification_failed: '通知失敗',
}

export const registrationPhaseText: Record<string, string> = {
  not_started: '尚未開始登記',
  registration_open: '登記中，尚未達門檻',
  registration_threshold_reached: '登記中，已達門檻',
  registration_deadline_soon: '預計結團前 24 小時內，仍可登記',
  deadline_reached_threshold: '預計結團時間已到且達門檻，等待主辦方正式結團',
  deadline_reached_can_extend: '已到結團時間但未達門檻，可延長一次',
  deadline_reached_unreached_final: '延長後仍未達成團門檻',
  payment_open: '已開放付款',
  confirmed: '正式成團',
  supplier_ordered: '已向供應商下單',
  fulfilling: '供應商備貨中',
  completed: '已完成',
  cancelled: '未成團取消',
}
