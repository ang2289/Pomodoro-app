// 重新導出統一的 Supabase 客戶端
export { supabase } from '../utils/supabaseClient'

// 願望相關的型別定義
export interface Wish {
  id: string
  user_name: string
  content: string
  created_at: string
  likes: number
}

export interface Comment {
  id: string
  wish_id: string
  user_name: string
  comment: string
  created_at: string
}

