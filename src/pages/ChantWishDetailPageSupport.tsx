import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChantWishDetailPageSupport({ id }) {
  const [supportCount, setSupportCount] = useState(0);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const loadSupports = async () => {
      if (!id) return;
      const key = `supported-${id}`;
      setSupported(localStorage.getItem(key) === '1');

      try {
        const { count, error: countError } = await supabase
          .from('chant_wish_supports')
          .select('*', { count: 'exact', head: true })
          .eq('chant_wish_id', id);

        console.log('查詢支持數量:', { id, count, countError });

        if (countError) {
          console.error('查詢支持數量失敗:', countError);
          setSupportCount(0);
        } else {
          setSupportCount(count || 0);
        }
      } catch (e) {
        console.error('查詢支持數量異常:', e);
        setSupportCount(0);
      }
    };
    loadSupports();
  }, [id]);

  return (
    <div>
      <h3>愛心支持數量: {supportCount}</h3>
    </div>
  );
}