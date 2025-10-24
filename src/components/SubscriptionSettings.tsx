
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';

export default function SubscriptionSettings() {
  const [subscribed, setSubscribed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageColor, setMessageColor] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const hasInitialized = useRef(false);
  
  // 音效控制 refs
  const dingAudioRef = useRef<HTMLAudioElement>(null);
  const woodAudioRef = useRef<HTMLAudioElement>(null);

  // 第一次載入 localStorage
  useEffect(() => {
    const saved = localStorage.getItem('subscribedToNotification');
    if (saved) setSubscribed(saved === 'true');
    hasInitialized.current = true;
  }, []);

  const setPremium = useUserStore((state) => state.setPremium)

  // 處理訂閱切換
  const handleSubscribeToggle = (checked: boolean) => {
    setPremium(checked)
  }

  // 使用者變更後才儲存並顯示對應提示
  useEffect(() => {
    if (!hasInitialized.current) return;
    localStorage.setItem('subscribedToNotification', subscribed.toString());
    
    // 只有在使用者互動後才播放音效和顯示提示訊息
    if (!hasInteracted) return;
    
    // 根據訂閱狀態顯示不同訊息並播放音效
    if (subscribed) {
      setMessageText('✅ 已訂閱通知');
      setMessageColor('text-green-600 bg-green-100');
      // 播放勾選音效
      if (dingAudioRef.current) {
        dingAudioRef.current.currentTime = 0;
        dingAudioRef.current.play().catch(err => console.log('音效播放失敗:', err));
      }
    } else {
      setMessageText('📭 已取消訂閱');
      setMessageColor('text-gray-600 bg-gray-100');
      // 播放取消音效
      if (woodAudioRef.current) {
        woodAudioRef.current.currentTime = 0;
        woodAudioRef.current.play().catch(err => console.log('音效播放失敗:', err));
      }
    }
    
    setShowMessage(true);
    const timeout = setTimeout(() => setShowMessage(false), 2000);
    return () => clearTimeout(timeout);
  }, [subscribed, hasInteracted]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full mb-6 relative">
      <h2 className="text-base font-medium text-gray-700 mb-2">📬 訂閱設定</h2>

      <div className="flex justify-between items-center mb-4">
        <label htmlFor="subscribeCheckbox" className="text-base font-medium text-gray-700">是否訂閱</label>
        <input
          id="subscribeCheckbox"
          type="checkbox"
          checked={subscribed}
          onChange={(e) => {
            setHasInteracted(true);
            const checked = e.target.checked;
            setSubscribed(checked);
            handleSubscribeToggle(checked);
          }}
          className="w-6 h-6"
        />
      </div>

      {/* Framer Motion 動畫顯示提示訊息 */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-2 right-2 text-sm font-medium px-2 py-1 rounded shadow ${messageColor}`}
          >
            {messageText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 音效元素 */}
      <audio ref={dingAudioRef} src="/sounds/ding.mp3" preload="auto" />
      <audio ref={woodAudioRef} src="/sounds/wood.mp3" preload="auto" />
    </div>
  );
}
