export interface FocusItem {
  id: string
  name: string
  isDefault: boolean
  createdAt: string
  createdBy: string
  color: string
}

export interface FocusItemWithCount extends FocusItem {
  usageCount: number
}








