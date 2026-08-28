import Dexie, { type Table } from 'dexie'

export interface AIContentWorkflowRecord {
  id: string
  topic: string
  category: string
  platforms: string[]
  sceneCount: number
  videoSeconds: number
  aspectRatio: string
  styleNote: string
  promptText: string
  resultJson: unknown | null
  createdAt: string
  updatedAt: string
}

class AIContentWorkflowDatabase extends Dexie {
  workflows!: Table<AIContentWorkflowRecord, string>

  constructor() {
    super('rxv-ai-content-workflow')
    this.version(1).stores({
      workflows: 'id, topic, category, createdAt, updatedAt',
    })
  }
}

export const aiContentWorkflowDb = new AIContentWorkflowDatabase()
