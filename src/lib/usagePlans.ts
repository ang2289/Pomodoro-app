// 方案與額度規則（單一來源）
// 定義所有字數點數方案的統一規則
// ⚠️ 重要：此檔案為單一來源，修改方案規則請只改此檔案

export type PlanId = 'free' | 'pack99' | 'pack199';

// 方案定義
export const PLANS = {
  free: {
    id: 'free' as PlanId,
    name: '免費方案',
    nameEn: 'Free Plan',
    chars: 10000, // 贈送 10,000 字
  },
  pack99: {
    id: 'pack99' as PlanId,
    name: '點數方案',
    nameEn: 'Point Plan',
    chars: 100000, // 購買後增加 100,000 字
    price: 99,
  },
  pack199: {
    id: 'pack199' as PlanId,
    name: '點數方案',
    nameEn: 'Point Plan',
    chars: 300000, // 購買後增加 300,000 字
    price: 199,
  },
} as const;

/**
 * 取得方案可用字數
 * @param planId 方案 ID
 * @returns 該方案可用字數
 */
export function getPlanChars(planId: PlanId): number {
  return PLANS[planId].chars;
}

/**
 * 取得方案顯示名稱
 * @param planId 方案 ID
 * @returns 方案顯示名稱（例如：NT$99 方案）
 */
export function getPlanLabel(planId: PlanId): string {
  const plan = PLANS[planId];
  
  if (planId === 'free') {
    return plan.name;
  }
  
  return `${plan.name} NT$${plan.price}`;
}

/**
 * 取得所有方案清單（給 pricing 頁用）
 * @returns 所有方案的陣列
 */
export function getAllPlans() {
  return [
    PLANS.free,
    PLANS.pack99,
    PLANS.pack199,
  ];
}

// ===== 以下為向後相容的函式（保留舊名稱） =====

/**
 * @deprecated 請使用 getPlanChars 取代
 */
export function getPlanLimit(planId: PlanId): number {
  return getPlanChars(planId);
}

/**
 * @deprecated 請使用 getPlanLabel 取代
 */
export function formatPlanLabel(planId: PlanId, lang: 'zh-tw' | 'en' = 'zh-tw'): string {
  const plan = PLANS[planId];
  
  if (lang === 'en') {
    if (planId === 'free') {
      return plan.nameEn;
    }
    return `${plan.nameEn} - NT$${plan.price}`;
  }
  
  return getPlanLabel(planId);
}

/**
 * 計算剩餘字數
 * @param used 已使用字數
 * @param limit 總額度限制
 * @returns 剩餘字數（不小於 0）
 */
export function calcRemaining(used: number, limit: number): number {
  return Math.max(0, limit - used);
}

