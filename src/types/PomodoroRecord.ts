export interface PomodoroRecord {
  id: string
  completedAt: string
  workMinutes: number
  breakMinutes: number
  title?: string
  description?: string
  focusItemId?: string
  focusItemName?: string
  tagId?: string
  tagName?: string
  tagColor?: string
}
