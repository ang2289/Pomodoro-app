import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import LightWishForm from './LightWishForm';
import WishLightsList from './WishLightsList';
import { config } from '../config';
import { useUserStore } from '../store/userStore';
import GoogleAdBanner from './GoogleAdBanner';
import { getWebSubscriptionStatus } from '../services/subscriptionService';

interface Wish {
  id: string;
  wish_no: number;
  content: string;
  user_name: string;
  is_public: boolean;
  created_at: string;
  likes: number;
  comments_count: number;
}

interface WishDetailProps {
  wishId?: string;
  wishNo?: number;
}

const WishDetail: React.FC<WishDetailProps> = ({ wishId, wishNo }) => {
  const navigate = useNavigate();
  const { isWebSubscribed, setWebSubscribed } = useUserStore();
  const [wish, setWish] = useState<Wish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightCount, setLightCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const [hasLightedToday, setHasLightedToday] = useState(false);

  // 初始化網站訂閱狀態
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      const status = await getWebSubscriptionStatus();
      setWebSubscribed(status);
    };
    loadSubscriptionStatus();
  }, [setWebSubscribed]);

  useEffect(() => {
    const fetchWish = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase.from('wishes').select('*');
        
        if (wishId) {
          query = query.eq('id', wishId);
        } else if (wishNo) {
          query = query.eq('wish_no', wishNo);
        } else {
          throw new Error('必須提供 wishId 或 wishNo');
        }
        
        const { data, error: fetchError } = await query.single();
        
        if (fetchError) {
          console.error('讀取願望失敗:', fetchError);
          setError('無法讀取願望內容');
          return;
        }
        
        if (!data) {
          setError('找不到此願望');
          return;
        }
        
        setWish(data);
        
        // 讀取點燈數量
        const { count, error: countError } = await supabase
          .from('chant_comments')
          .select('*', { count: 'exact', head: true })
          .eq('chant_wish_id', data.id);
          
        if (!countError && count !== null) {
          setLightCount(count);
        }
        
      } catch (err) {
        console.error('讀取願望異常:', err);
        setError('讀取願望時發生錯誤');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWish();
  }, [wishId, wishNo]);
  
  // 更新點燈數量
  const updateLightCount = async () => {
    if (!wish) return;
    
    try {
      const { count, error } = await supabase
        .from('chant_comments')
        .select('*', { count: 'exact', head: true })
        .eq('chant_wish_id', wish.id);
        
      if (!error && count !== null) {
        setLightCount(count);
      }
    } catch (err) {
      console.error('更新點燈數量失敗:', err);
    }
  };

  const handleLight = async () => {
    if (!wish) return;

    try {
      const lightData = {
        chant_wish_id: wish.id,
        user_name: userName.trim() || '匿名善信',
        message: message.trim() || null,
      };

      const { error } = await supabase.from('chant_comments').insert(lightData);

      if (error) {
        console.error('點燈失敗:', error);
        alert(`點燈失敗: ${error.message}`);
        return;
      }

      // 更新狀態與清空輸入欄位
      setHasLightedToday(true);
      setUserName('');
      setMessage('');

      // 更新點燈數量
      const { count, error: countError } = await supabase
        .from('chant_comments')
        .select('*', { count: 'exact', head: true })
        .eq('chant_wish_id', wish.id);

      if (!countError && count !== null) {
        setLightCount(count);
      }

      // 確保留言數量正確顯示
      const { count: commentCount, error: commentError } = await supabase
        .from('chant_comments')
        .select('*', { count: 'exact', head: true })
        .eq('chant_wish_id', wish.id);

      if (!commentError && commentCount !== null) {
        setMessage(`留言 ${commentCount} 則`);
      }

      alert('🪔 點燈成功！願您心想事成');
    } catch (err) {
      console.error('點燈過程發生錯誤:', err);
      alert('點燈失敗，請稍後再試');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !wish) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-center">
        <p className="text-red-500">{error || '無法顯示願望'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Google AdSense 橫幅廣告 - 僅網頁版顯示 */}
      {!isWebSubscribed && (
        <div className="hidden md:block mb-4">
          <GoogleAdBanner />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 max-w-screen-md mx-auto overflow-wrap break-word">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 overflow-wrap break-word">願望 #{wish.wish_no}</h1>
            <span className="text-sm text-gray-500">
              {new Date(wish.created_at).toLocaleDateString('zh-TW')}
            </span>
          </div>
          
          <div className="mt-4 p-4 sm:p-6 bg-pink-50 rounded-xl">
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap overflow-wrap break-word">{wish.content}</p>
          </div>
          
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <span>來自：{wish.user_name || '匿名'}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 overflow-wrap break-word">點燈祈福</h2>
            <div className="flex items-center text-yellow-600">
              <span className="text-2xl mr-1">🪔</span>
              <span>{lightCount} 盞燈</span>
            </div>
          </div>
          
          {/* 點燈表單 */}
          <LightWishForm wishId={wish.id} onSuccess={updateLightCount} />
          
          {/* 點燈列表 */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-700 mb-3">祈福紀錄</h3>
            <WishLightsList chantWishId={wish.id} />
          </div>

          <div className="mt-6">
            {!hasLightedToday && (
              <div className="mb-4">
                <label htmlFor="userName" className="block text-sm text-gray-600 mb-1">
                  您的名字（可留空）
                </label>
                <input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="匿名善信"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                />

                <label htmlFor="message" className="block text-sm text-gray-600 mb-1 mt-4">
                  祈福留言（可留空）
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="願一切眾生平安喜樂"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  rows={3}
                />
              </div>
            )}

            <button
              onClick={handleLight}
              className="w-full sm:w-auto px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-sm sm:text-base"
            >
              點燈祈福
            </button>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button 
              className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm sm:text-base"
              onClick={() => {
                // 使用配置中的基礎 URL
                const path = `/wish/${wish.wish_no}`;
                const shareUrl = `${config.baseUrl}${path}`;
                const shareText = `🙏 一起幫忙集氣：${wish.content.substring(0, 30)}${wish.content.length > 30 ? '...' : ''}`;
                const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                window.open(lineUrl, '_blank');
              }}
            >
              LINE 分享
            </button>
            <button 
              className="w-full sm:w-auto px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-sm sm:text-base"
              onClick={() => {
                // 使用配置中的基礎 URL
                const path = `/wish/${wish.wish_no}`;
                const shareUrl = `${config.baseUrl}${path}`;
                navigator.clipboard.writeText(shareUrl);
                alert('分享連結已複製到剪貼簿');
              }}
            >
              複製連結
            </button>
          </div>
        </div>
      </div>

      {/* 訂閱方案提示 - 僅網頁版且未訂閱時顯示 */}
      {!isWebSubscribed && (
        <div className="hidden md:block mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center max-w-screen-md mx-auto">
          <p className="text-gray-700 mb-4">
            🎯 升級為訂閱方案即可移除網站廣告
          </p>
          <button
            onClick={() => navigate('/subscribe')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            了解訂閱方案
          </button>
        </div>
      )}
    </>
  );
};

export default WishDetail;
