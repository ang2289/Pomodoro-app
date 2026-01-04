// ⚠️ 已停用：此服務已不再使用
// 原因：移除 remaining_chars 欄位，改用 user_credits.balance
// 請使用 src/lib/userCredits.ts 取代

import { supabase } from "@/lib/supabase";

const TRIAL_CREDITS = 10000;

/**
 * @deprecated 已停用，請使用 src/lib/userCredits.ts 的 getUserBalance()
 */
export async function getUserCredits(userId: string) {
  if (!userId) return null;

  // 使用新的 balance 欄位
  const { data, error } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error && error.code === "PGRST116") {
    // 記錄不存在，返回 null（不自動建立）
    return null;
  }

  if (error) {
    console.error("[creditService] getUserCredits error", error);
    return null;
  }

  return data?.balance ?? null;
}
