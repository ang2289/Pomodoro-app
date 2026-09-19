import { getCurrentCreditSummary } from '@/lib/accountApi'

/**
 * Session-authenticated credit read. The user id is derived by /api/main.
 */
export async function getUserBalance(): Promise<number | null> {
  try {
    const credits = await getCurrentCreditSummary()
    return credits.remaining_chars
  } catch {
    return null
  }
}
