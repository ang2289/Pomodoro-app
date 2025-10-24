import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface WishLightsListProps {
  chantWishId: string;
}

interface LightRecord {
  id: string;
  user_name: string | null;
  message: string | null;
  created_at: string;
}

const WishLightsList: React.FC<WishLightsListProps> = ({ chantWishId }) => {
  const [records, setRecords] = useState<LightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLightRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('chant_wish_lights')
          .select('id, user_name, message, created_at')
          .eq('chant_wish_id', chantWishId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('讀取點燈紀錄失敗:', error);
          setError('讀取點燈紀錄失敗');
          return;
        }

        setRecords(data || []);
      } catch (err) {
        console.error('讀取點燈紀錄異常:', err);
        setError('讀取點燈紀錄時發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchLightRecords();
  }, [chantWishId]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return '剛剛';
    if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`;
    if (diffInHours < 24) return `${diffInHours} 小時前`;
    if (diffInDays < 7) return `${diffInDays} 天前`;

    return past.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <p>載入中...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (records.length === 0) {
    return <p>目前尚無點燈紀錄</p>;
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record.id} className="flex items-center space-x-2">
          <span>👤 {record.user_name || '匿名'}：</span>
          <span>{record.message || '點了一盞燈'}</span>
          <span className="text-gray-500">🕯️ {formatTimeAgo(record.created_at)}</span>
        </div>
      ))}
    </div>
  );
};

export default WishLightsList;
