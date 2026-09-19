import { getCurrentCreditSummary } from '@/lib/accountApi'

/** @deprecated Use getCurrentCreditSummary from accountApi. */
export async function getUserCredits(): Promise<number | null> {
  try {
    const credits = await getCurrentCreditSummary()
    return credits.remaining_chars
  } catch {
    return null
  }
}
