import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

interface Wish {
  id: string;
  wish_no: number;
  content: string;
  user_name: string;
  created_at: string;
  likes: number;
  comments_count: number;
}

const WishesWallPage: React.FC = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightCounts, setLightCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const fetchWishes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('wishes')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (fetchError) {
          console.error('讀取願望失敗:', fetchError);
          setError('讀取願望失敗');
          return;
        }
        
        setWishes(data || []);
        
        // 讀取每個願望的點燈數量
        if (data && data.length > 0) {
          const counts: Record<string, number> = {};
          
          // 使用 Promise.all 同時查詢所有願望的點燈數量
          await Promise.all(
            data.map(async (wish) => {
              const { count, error: countError } = await supabase
                .from('chant_wish_lights')
                .select('*', { count: 'exact', head: true })
                .eq('chant_wish_id', wish.id);
                
              if (!countError && count !== null) {
                counts[wish.id] = count;
              }
            })
          );
          
          setLightCounts(counts);
        }
        
      } catch (err) {
        console.error('讀取願望異常:', err);
        setError('讀取願望時發生錯誤');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishes();
  }, []);
  
  // 格式化時間顯示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // 截斷文字
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">願望牆</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">願望牆</h1>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">願望牆</h1>
        <p className="text-center text-gray-600 mb-8">點燈祈福，願望成真</p>
        
        <div className="flex justify-center mb-8">
          <Link 
            to="/wishes/create" 
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-md"
          >
            許下新願望
          </Link>
        </div>
        
        {wishes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">目前還沒有公開的願望</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishes.map((wish) => (
              <Link 
                key={wish.id} 
                to={`/wish/${wish.wish_no}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">#{wish.wish_no}</span>
                    <span className="text-sm text-gray-500">{formatDate(wish.created_at)}</span>
                  </div>
                  
                  <p className="text-gray-800 mb-4">
                    {truncateText(wish.content, 100)}
                  </p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">
                      {wish.user_name || '匿名'}
                    </span>
                    
                    <div className="flex items-center text-yellow-600">
                      <span className="mr-1">🪔</span>
                      <span>{lightCounts[wish.id] || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishesWallPage;
