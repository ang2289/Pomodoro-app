// ============================================
// 方案工具函數（非數值定義來源）
// ============================================
// ⚠️ 重要：此檔案僅提供方案相關的工具函數，不包含任何硬編碼數值
// 所有方案數值一律從 src/config.ts 讀取（單一來源）
// 實際方案數值定義請修改 src/config.ts

import { PLANS as CONFIG_PLANS } from '../config'

export type PlanId = 'free' | 'pack99' | 'pack199';

/**
 * 使用方案定義（向後相容結構映射）
 * 此物件僅作為向後相容的結構映射，所有數值直接從 config.ts 的 PLANS 讀取
 * 
 * 映射關係：
 * - free.chars ← CONFIG_PLANS.free.monthlyQuota
 * - pack99.chars ← CONFIG_PLANS.plan99.monthlyQuota
 * - pack199.chars ← CONFIG_PLANS.plan199.monthlyQuota
 * 
 * ⚠️ 注意：實際方案數值定義請修改 src/config.ts，此檔案僅為映射層
 */
export const PLANS = {
  free: {
    id: 'free' as PlanId,
    name: CONFIG_PLANS.free.name,
    nameEn: CONFIG_PLANS.free.nameEn,
    chars: CONFIG_PLANS.free.monthlyQuota, // 從 src/config.ts 讀取（單一來源）
  },
  pack99: {
    id: 'pack99' as PlanId,
    name: CONFIG_PLANS.plan99.name,
    nameEn: CONFIG_PLANS.plan99.nameEn,
    chars: CONFIG_PLANS.plan99.monthlyQuota, // 從 src/config.ts 讀取（單一來源）
    price: CONFIG_PLANS.plan99.price,
  },
  pack199: {
    id: 'pack199' as PlanId,
    name: CONFIG_PLANS.plan199.name,
    nameEn: CONFIG_PLANS.plan199.nameEn,
    chars: CONFIG_PLANS.plan199.monthlyQuota, // 從 src/config.ts 讀取（單一來源）
    price: CONFIG_PLANS.plan199.price,
  },
} as const;

/**
 * 取得方案可處理字數（從 config.ts 讀取）
 * @param planId 方案 ID
 * @returns 該方案可處理字數
 */
export function getPlanChars(planId: PlanId): number {
  return PLANS[planId].chars;
}

/**
 * 取得使用方案顯示名稱（從 config.ts 讀取）
 * @param planId 方案 ID
 * @returns 使用方案顯示名稱（例如：NT$99 方案）
 */
export function getPlanLabel(planId: PlanId): string {
  if (planId === 'free') {
    return PLANS.free.name;
  }

  if (planId === 'pack99') {
    return `${PLANS.pack99.name} NT$${PLANS.pack99.price}`;
  }

  return `${PLANS.pack199.name} NT$${PLANS.pack199.price}`;
}

/**
 * 取得所有使用方案清單（從 config.ts 讀取）
 * @returns 所有使用方案的陣列
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
 * 格式化使用方案顯示名稱（從 config.ts 讀取）
 */
export function formatPlanLabel(planId: PlanId, lang: 'zh-tw' | 'en' = 'zh-tw'): string {
  if (lang === 'en') {
    if (planId === 'free') {
      return PLANS.free.nameEn;
    }
    if (planId === 'pack99') {
      return `${PLANS.pack99.nameEn} - NT$${PLANS.pack99.price}`;
    }
    return `${PLANS.pack199.nameEn} - NT$${PLANS.pack199.price}`;
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

