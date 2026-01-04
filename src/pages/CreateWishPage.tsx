import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { containsSensitiveWords } from '../utils/sensitiveWords';

const CreateWishPage: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [userName, setUserName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('請輸入願望內容');
      return;
    }
    
    if (isSubmitting) return;
    
    // 檢查敏感詞
    if (containsSensitiveWords(content)) {
      setError('願望內容包含不當詞彙（如色情、暴力），請重新編輯。');
      return;
    }
    
    if (containsSensitiveWords(userName)) {
      setError('名字包含不當詞彙（如色情、暴力），請重新編輯。');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 準備願望資料
      const wishData = {
        content: content.trim(),
        user_name: userName.trim() || '我',
        is_public: isPublic,
      };
      
      // 寫入願望記錄
      const { data, error: insertError } = await supabase
        .from('wishes')
        .insert(wishData)
        .select();
      
      if (insertError) {
        console.error('新增願望失敗:', insertError);
        setError(`新增願望失敗: ${insertError.message}`);
        return;
      }
      
      if (data && data[0]) {
        // 導向願望詳情頁
        navigate(`/wish/${data[0].wish_no}`);
      } else {
        setError('新增願望後無法獲取願望資訊');
      }
      
    } catch (err) {
      console.error('新增願望過程發生錯誤:', err);
      setError('新增願望時發生錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="responsive-container">
        <div className="mb-6">
          <Link 
            to="/wishes" 
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            返回願望牆
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">許下新願望</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                願望內容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="寫下你的願望..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[120px]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                您的名字（可留空）
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="我"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                公開此願望（顯示在願望牆上）
              </label>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 text-white bg-pink-500 rounded-md hover:bg-pink-600 transition-colors ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? '處理中...' : '許願'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWishPage;
