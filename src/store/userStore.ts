import { create } from 'zustand'

interface UserStore {
  isPremium: boolean  // App 訂閱狀態（由 Google Play Billing 管理）
  isWebSubscribed: boolean  // 網站訂閱狀態（由 Supabase 管理）
  setPremium: (value: boolean) => void
  setWebSubscribed: (value: boolean) => void
}

export const useUserStore = create<UserStore>((set) => ({
  isPremium: false,
  isWebSubscribed: false,
  setPremium: (value) => set({ isPremium: value }),
  setWebSubscribed: (value) => set({ isWebSubscribed: value }),
}))


