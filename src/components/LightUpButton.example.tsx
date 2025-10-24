// 使用範例：如何在集氣活動詳情頁中使用 LightUpButton

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import LightUpButton from './LightUpButton'

interface ExampleUsageProps {
  chantWishId: string
}

export default function LightUpButtonExample({ chantWishId }: ExampleUsageProps) {
  const [lightCount, setLightCount] = useState(0)
  const [isLighted, setIsLighted] = useState(false)

  // 載入點燈狀態和數量
  useEffect(() => {
    loadLightStatus()
    loadLightCount()
  }, [chantWishId])

  // 檢查用戶是否已點燈
  const loadLightStatus = () => {
    const key = `lighted-${chantWishId}`
    const hasLighted = localStorage.getItem(key) === '1'
    setIsLighted(hasLighted)
  }

  // 載入點燈總數
  const loadLightCount = async () => {
    try {
      const { count, error } = await supabase
        .from('chant_wish_lights')
        .select('*', { count: 'exact', head: true })
        .eq('chant_wish_id', chantWishId)

      if (!error && count !== null) {
        setLightCount(count)
      }
    } catch (err) {
      console.error('載入點燈數量失敗:', err)
    }
  }

  // 處理點燈
  const handleLight = async () => {
    try {
      const { error } = await supabase
        .from('chant_wish_lights')
        .insert({ chant_wish_id: chantWishId })

      if (error) {
        console.error('點燈失敗:', error)
        alert('點燈失敗，請稍後再試')
        return
      }

      // 更新狀態
      setIsLighted(true)
      setLightCount(prev => prev + 1)
      localStorage.setItem(`lighted-${chantWishId}`, '1')
      alert('🪔 點燈成功！')
    } catch (err) {
      console.error('點燈異常:', err)
      alert('點燈失敗，請稍後再試')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
      <h3 className="text-lg font-bold text-gray-800">🙏 為此願望點燈祈福</h3>
      
      <LightUpButton
        onLight={handleLight}
        disabled={isLighted}
        lightCount={lightCount}
      />
      
      {!isLighted && (
        <p className="text-sm text-gray-600 text-center">
          點擊蓮花燈為此願望祈福
        </p>
      )}
    </div>
  )
}

/* 
使用說明：

1. 在集氣活動詳情頁中引入：
   import LightUpButtonExample from '@/components/LightUpButton.example'

2. 在頁面中使用：
   <LightUpButtonExample chantWishId={wishId} />

3. 確保 Supabase 中有 chant_wish_lights 表：
   - id (uuid, primary key)
   - chant_wish_id (uuid, foreign key)
   - created_at (timestamp)

4. 設定 RLS 政策：
   CREATE POLICY "Allow anonymous insert" ON chant_wish_lights
   FOR INSERT TO anon WITH CHECK (true);
   
   CREATE POLICY "Allow public read" ON chant_wish_lights
   FOR SELECT TO public USING (true);
*/





