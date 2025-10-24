import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { containsSensitiveWords } from '../utils/sensitiveWords';

interface LightWishFormProps {
  wishId: string;
  onSuccess?: () => void;
}

const LightWishForm: React.FC<LightWishFormProps> = ({ wishId, onSuccess }) => {
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLighted, setHasLighted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // 檢查使用者是否已經點過燈（使用 localStorage）
  useEffect(() => {
    const lightedKey = `lighted_wish_${wishId}`;
    const hasLightedBefore = localStorage.getItem(lightedKey) === 'true';
    setHasLighted(hasLightedBefore);
  }, [wishId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // 檢查敏感詞
    if (containsSensitiveWords(userName)) {
      alert('名字包含不當詞彙（如色情、暴力），請重新編輯。');
      return;
    }
    
    if (containsSensitiveWords(message)) {
      alert('留言內容包含不當詞彙（如色情、暴力），請重新編輯。');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 準備點燈資料
      const lightData = {
        chant_wish_id: wishId,
        user_name: userName.trim() || '匿名善信',
        ...(message.trim() && { message: message.trim() })
      };
      
      // 寫入點燈記錄
      const { error } = await supabase
        .from('chant_wish_lights')
        .insert(lightData);
      
      if (error) {
        console.error('點燈失敗:', error);
        alert(`點燈失敗: ${error.message}`);
        return;
      }
      
      // 更新本地狀態
      localStorage.setItem(`lighted_wish_${wishId}`, 'true');
      setHasLighted(true);
      setShowForm(false);
      
      // 清空表單
      setUserName('');
      setMessage('');
      
      // 呼叫成功回調
      if (onSuccess) {
        onSuccess();
      }
      
      alert('🪔 點燈成功！願您心想事成');
      
    } catch (err) {
      console.error('點燈過程發生錯誤:', err);
      alert('點燈失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLightButtonClick = () => {
    if (hasLighted) {
      alert('您已經為這個願望點過燈了');
      return;
    }
    
    setShowForm(true);
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-5 rounded-lg">
      {!showForm ? (
        <div className="text-center">
          <button
            onClick={handleLightButtonClick}
            disabled={hasLighted}
            className={`flex items-center justify-center mx-auto p-4 rounded-full transition-all ${
              hasLighted 
                ? 'opacity-60 cursor-not-allowed' 
                : 'hover:scale-110 cursor-pointer'
            } focus:outline-none focus:ring-0 focus:border-0`}
            style={{ outline: 'none', border: 'none' }}
          >
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-md ${
                hasLighted ? 'bg-pink-200' : 'bg-pink-300 animate-pulse'
              }`}></div>
              <div className="relative z-10 text-5xl">🪔</div>
            </div>
          </button>
          
          <p className="mt-3 text-gray-700">
            {hasLighted 
              ? '感謝您的祈福，功德無量' 
              : '點擊蓮燈為此願望祈福'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-center text-lg font-medium text-gray-700">點燈祈福</h3>
          
          <div>
            <label htmlFor="userName" className="block text-sm text-gray-600 mb-1">
              您的名字（可留空）
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="匿名善信"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm text-gray-600 mb-1">
              祈福留言（可留空）
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="願一切眾生平安喜樂"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm text-white bg-pink-500 rounded-md hover:bg-pink-600 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '處理中...' : '點燈祈福'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LightWishForm;
