import { create } from 'zustand'

interface UserStore {
  isPremium: boolean
  setPremium: (value: boolean) => void
}

export const useUserStore = create<UserStore>((set) => ({
  isPremium: false,
  setPremium: (value) => set({ isPremium: value }),
}))


