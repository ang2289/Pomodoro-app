import { supabase } from '@/lib/supabase';

export async function fetchChantWishStats(wishId: string) {
  // 查詢留言數量（chant_comments）
  const { count: commentCount, error: commentError } = await supabase
    .from('chant_comments')
    .select('*', { count: 'exact', head: true })
    .eq('wish_id', wishId);

  if (commentError) {
    console.error('留言查詢失敗:', commentError);
  }

  // 查詢點燈數量（chant_wish_lights）
  const { count: lightCount, error: lightError } = await supabase
    .from('chant_wish_lights')
    .select('*', { count: 'exact', head: true })
    .eq('chant_wish_id', wishId);

  if (lightError) {
    console.error('點燈查詢失敗:', lightError);
  }

  // 查詢愛心支持數量（chant_wish_supports）
  const { count: supportCount, error: supportError } = await supabase
    .from('chant_wish_supports')
    .select('*', { count: 'exact', head: true })
    .eq('chant_wish_id', wishId);

  if (supportError) {
    console.error('支持查詢失敗:', supportError);
  }

  return {
    commentCount: commentCount ?? 0,
    lightCount: lightCount ?? 0,
    supportCount: supportCount ?? 0,
  };
}