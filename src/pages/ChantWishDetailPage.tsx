import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import ChantLogInput from '../components/ChantLogInput'
import ChantSummary from '../components/ChantSummary'
import CommentForm from '../components/CommentForm'
import LightUpButton from '../components/LightUpButton'
import SupportSection from '../components/SupportSection'
import SupportButton from '../components/SupportButton'
import LightRecordsModule from '../components/LightRecordsModule'
import { config } from '../config'

interface ChantWish {
  id: string
  wish_no: number
  title: string
  chant_text: string
  chant_target_count: number
  chant_unit: string
  for_person_name?: string
  start_date: string
  end_date: string
  description?: string
  created_by: string
  created_at: string
  image_url?: string | null
}

interface Comment {
  id: string
  wish_id: string
  user_name: string
  comment: string
  created_at: string
}

export default function ChantWishDetailPage() {
  const { wishNo, id } = useParams()
  const paramValue = wishNo || id // 使用 wishNo 或 id，兼容兩種路由格式
  const navigate = useNavigate()
  const [wish, setWish] = useState<ChantWish | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [chantLogs, setChantLogs] = useState<any[]>([])
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0)
  const [supportCount, setSupportCount] = useState<number>(0)
  const [supported, setSupported] = useState<boolean>(false)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [lightCount, setLightCount] = useState<number>(0)
  const [isLighted, setIsLighted] = useState<boolean>(false)
  const [showLightMessageForm, setShowLightMessageForm] = useState<boolean>(false)
  const [lightMessage, setLightMessage] = useState<string>('')
  const [lightUserName, setLightUserName] = useState<string>('')
  const [insertedLightId, setInsertedLightId] = useState<string | null>(null)

  // 添加調試日誌到 fetchComments 函數
  const fetchComments = async () => {
    if (!wish) return;

    try {
      const { data, error } = await supabase
        .from('chant_comments')
        .select('*')
        .eq('wish_id', wish.id)
        .order('created_at', { ascending: false });

      console.log('fetchComments 結果:', { data, error });

      if (error) {
        console.error('讀取留言失敗:', error);
        return;
      }

      setComments(data || []);
    } catch (err) {
      console.error('讀取留言失敗:', err);
    }
  }

  const loadComments = async () => {
    if (!wish) return
    const { data } = await supabase
      .from('chant_comments')
      .select('*')
      .eq('wish_id', wish.id)
      .order('created_at', { ascending: false })
    setComments(data || [])
  }

  const fetchChantLogs = async () => {
    if (!wish) return
    
    try {
      const { data, error } = await supabase
        .from('chant_logs')
        .select('*')
        .eq('wish_id', wish.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('讀取念誦記錄失敗:', error)
        return
      }

      setChantLogs(data || [])
    } catch (err) {
      console.error('讀取念誦記錄失敗:', err)
    }
  }

  useEffect(() => {
    const fetchWish = async () => {
      if (!paramValue) {
        setError('無效的活動編號')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        let query = supabase.from('chant_wishes').select('*')
        
        // 嘗試先通過 wish_no 查詢（如果參數是數字）
        if (!isNaN(Number(paramValue))) {
          query = query.eq('wish_no', paramValue)
        } else {
          // 否則嘗試通過 id 查詢
          query = query.eq('id', paramValue)
        }
        
        const { data, error } = await query.single()

        if (error) {
          console.error('讀取錯誤', error)
          
          // 如果第一次查詢失敗，嘗試另一種方式
          if (!isNaN(Number(paramValue))) {
            // 如果第一次是通過 wish_no 查詢，現在嘗試通過 id 查詢
            const secondTry = await supabase
              .from('chant_wishes')
              .select('*')
              .eq('id', paramValue)
              .single()
              
            if (secondTry.error) {
              setError('讀取活動失敗：' + error.message)
              return
            } else {
              setWish(secondTry.data)
              return
            }
          } else {
            // 如果第一次是通過 id 查詢，現在嘗試通過 wish_no 查詢
            const secondTry = await supabase
              .from('chant_wishes')
              .select('*')
              .eq('wish_no', paramValue)
              .single()
              
            if (secondTry.error) {
              setError('讀取活動失敗：' + error.message)
              return
            } else {
              setWish(secondTry.data)
              return
            }
          }
        }

        setWish(data)
      } catch (err) {
        console.error('讀取失敗:', err)
        setError('讀取活動失敗，請重試')
      } finally {
        setLoading(false)
      }
    }

    fetchWish()
  }, [paramValue])

  // 當 wish 狀態更新時，載入相關資料
  useEffect(() => {
    if (wish) {
      Promise.all([fetchComments(), fetchChantLogs()])
    }
  }, [wish])

  useEffect(() => {
    const loadSupports = async () => {
      if (!wish) return;
      const key = `supported-${wish.id}`;
      setSupported(localStorage.getItem(key) === '1');

      try {
        const { count, error: countError } = await supabase
          .from('chant_wish_supports')
          .select('*', { count: 'exact', head: true })
          .eq('chant_wish_id', wish.id); // 確保正確查詢 chant_wish_id

        if (countError) {
          console.error('查詢支持數量失敗:', countError);
          setSupportCount(0); // 設置默認值為 0
        } else {
          setSupportCount(count || 0); // 確保顯示正確的支持數量
        }
      } catch (e) {
        console.error('查詢支持數量異常:', e);
        setSupportCount(0); // 設置默認值為 0
      }
    };
    loadSupports();
  }, [wish])

  useEffect(() => {
    const loadLights = async () => {
      if (!wish) return;
      const key = `lighted-${wish.id}`;
      setIsLighted(localStorage.getItem(key) === '1');

      try {
        // 載入 chant_wish_lights 表的數量
        const { data, error } = await supabase
          .from('chant_wish_lights')
          .select('*')
          .eq('chant_wish_id', wish.id);

        console.log('載入點燈數量:', { data: data?.length, error, wishId: wish.id });

        if (error) {
          console.error('查詢點燈數量失敗:', error);
          // 設置默認值為 0，避免顯示錯誤的數量
          setLightCount(0);
        } else {
          // 如果查詢成功但沒有數據，顯示 0 盞燈
          setLightCount(data?.length || 0);
        }
      } catch (e) {
        console.error('查詢點燈數量異常:', e);
        // 設置默認值為 0，避免顯示錯誤的數量
        setLightCount(0);
      }
    };
    loadLights();
  }, [wish])

  const handleSupport = async () => {
    if (!wish || supported) return
    try {
      setIsAnimating(true)
      console.log('準備插入支持記錄:', { chant_wish_id: wish.id })
      const { error } = await supabase
        .from('chant_wish_supports')
        .insert({ 
          chant_wish_id: wish.id
        })
      
      console.log('插入支持記錄結果:', { error })
      if (error) {
        console.error('支持失敗:', error)
        const msg = String(error.message || '')
        if (msg.toLowerCase().includes('row level security')) {
          alert('支持失敗：資料庫 RLS 拒絕寫入，請在 Supabase 啟用 insert policy（含 WITH CHECK (true)）。')
        } else {
          alert('支持失敗：' + msg)
        }
        setIsAnimating(false)
        return
      }
      
      const { count, error: reloadError } = await supabase
        .from('chant_wish_supports')
        .select('*', { count: 'exact', head: true })
        .eq('chant_wish_id', wish.id)
      
      console.log('重新載入支持數量:', { count, reloadError })
      
      if (reloadError) {
        console.log('進入 reloadError 分支')
        const { data: reloadData, error: reloadDataError } = await supabase
          .from('chant_wish_supports')
          .select('*')
          .eq('chant_wish_id', wish.id)
        
        console.log('直接查詢結果:', { reloadData, reloadDataError })
        const manualCount = reloadData?.length || 0
        console.log('手動計算數量:', manualCount)
        setSupportCount(manualCount)
      } else {
        console.log('進入 else 分支，count =', count)
        console.log('設置支持數量為:', count)
        setSupportCount(count || 0)
      }
      setSupported(true)
      localStorage.setItem(`supported-${wish.id}`,'1')
      setTimeout(() => setIsAnimating(false), 400)
    } catch (e) {
      console.error('支持失敗:', e)
      setIsAnimating(false)
    }
  }

  // 調整 handleLight 函數，點蓮花時立即寫入 chant_wish_lights 資料表
  const handleLight = async () => {
    if (!wish) return;

    try {
      const lightData = {
        chant_wish_id: wish.id,
        user_name: '匿名善信',
        message: null,
      };

      const { data, error } = await supabase.from('chant_wish_lights').insert(lightData).select('id').single();      if (error) {
        console.error('點燈失敗:', error);
        alert(`點燈失敗：${error.message || '未知錯誤'}`);
        return;
      }

      const insertedId = data?.id;
      if (!insertedId) {
        console.error('未獲得插入的 ID');
        return;
      }

      setIsLighted(true);
      localStorage.setItem(`lighted-${wish.id}`, '1');

      // 更新點燈次數
      try {
        const { data, error: queryError } = await supabase
          .from('chant_wish_lights')
          .select('*')
          .eq('chant_wish_id', wish.id);

        if (!queryError && data) {
          setLightCount(data.length);
        } else {
          console.error('重新載入點燈數量失敗:', queryError);
        }
      } catch (e) {
        console.error('重新載入點燈數量異常:', e);
      }

      alert('🪔 點燈成功！');
    } catch (e) {
      console.error('點燈失敗:', e);
      alert('點燈失敗，請稍後再試');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const handleShare = () => {
    if (!wish) return
    
    // 使用配置中的基礎 URL
    const path = `/chant-wish-detail/${wish.wish_no}`
    const shareUrl = `${config.baseUrl}${path}`
    const shareText = `🙏 一起幫忙集氣：${wish.title}\n念誦：${wish.chant_text} ${wish.chant_target_count}${wish.chant_unit}\n${shareUrl}`
    navigator.clipboard.writeText(shareText)
    alert('✅ 分享文字已複製，可貼到 TikTok / LINE 分享')
  }

  const handleChantLogSuccess = async () => {
    await fetchChantLogs()
    setSummaryRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 p-4 w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-gray-600">載入活動詳情中...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !wish) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 p-4 w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">❌</div>
              <p className="text-red-600 mb-4">{error || '找不到此活動'}</p>
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/chant-wish-wall')}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  返回集氣牆
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  重新載入
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 p-4 w-full">
        <div className="mb-4">
          <button
            onClick={() => navigate('/chant')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回唸經頁
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🙏 集氣活動詳情</h1>
          <p className="text-gray-600">一起為願望集氣助念</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{wish.title}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">📅</span>
              <span>發起時間：{formatDate(wish.created_at)}</span>
            </div>
          </div>

          {wish.image_url && (
            <div className="mb-6">
              <div className="rounded-md border border-gray-200 shadow overflow-hidden">
                <img src={wish.image_url} alt="活動圖片" className="w-full max-h-72 object-cover bg-white" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <span className="mr-3 text-2xl">🙏</span>
              <div>
                <span className="font-medium">念誦內容：</span>
                <span className="ml-2 text-lg font-bold text-pink-600">
                  {wish.chant_text} {wish.chant_target_count}{wish.chant_unit}
                </span>
              </div>
            </div>

            {wish.for_person_name && (
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-2xl">🎯</span>
                <div>
                  <span className="font-medium">迴向對象：</span>
                  <span className="ml-2 text-lg font-bold text-blue-600">{wish.for_person_name}</span>
                </div>
              </div>
            )}

            <div className="flex items-center text-gray-700">
              <span className="mr-3 text-2xl">📅</span>
              <div>
                <span className="font-medium">活動期間：</span>
                <span className="ml-2">{formatDate(wish.start_date)} ~ {formatDate(wish.end_date)}</span>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <span className="mr-3 text-2xl">✍️</span>
              <div>
                <span className="font-medium">發起人：</span>
                <span className="ml-2">{wish.created_by || '匿名'}</span>
              </div>
            </div>

            <SupportSection
              supportCount={supportCount}
              supported={supported}
              onSupport={async () => {
                if (supported) return
                await handleSupport()
              }}
              commentCount={comments.length}
            />

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start text-gray-700">
                <span className="mr-3 text-2xl mt-1">📝</span>
                <div>
                  <span className="font-medium block mb-2">願望說明：</span>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {wish.description || '（尚未填寫願望內容）'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 rounded-xl border border-pink-200 shadow-lg">
                <h3 className="text-lg font-bold text-center text-gray-800 mb-2">🙏 為此願望點燈祈福</h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  {isLighted ? '感謝您的祈福，功德無量' : '點擊蓮花為此願望點燈祈福'}
                </p>
                
                <div className="flex justify-center">
                  <LightUpButton
                    onLight={handleLight}
                    disabled={isLighted}
                    lightCount={lightCount}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔗 分享給朋友</h3>
          <p className="text-gray-600 mb-4">邀請朋友一起為這個願望集氣助念</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (!wish) return;
                // 使用配置中的基礎 URL
                const path = `/chant-wish-detail/${wish.wish_no}`;
                const shareUrl = `${config.baseUrl}${path}`;
                const shareText = `🙏 一起幫忙集氣：${wish.title}\n念誦：${wish.chant_text} ${wish.chant_target_count}${wish.chant_unit}`;
                const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                window.open(lineUrl, '_blank');
              }}
              className="w-full sm:w-1/2 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              style={{ background: '#22c55e', color: '#ffffff', border: 'none' }}
            >
              📱 LINE 分享
            </button>
            <button
              onClick={handleShare}
              className="w-full sm:w-1/2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 !text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              style={{ color: '#ffffff' }}
            >
              🔁 複製訊息
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🙏 參與集氣</h3>
          <p className="text-gray-600 mb-4">一起念誦為願望集氣</p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/chant')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 !text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              style={{ color: '#ffffff' }}
            >
              🧘 開始念誦
            </button>
            
            {wish && (
              <ChantLogInput 
                wishId={wish.id} 
                onLogSuccess={handleChantLogSuccess}
              />
            )}
          </div>
        </div>

        {chantLogs.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 念誦記錄</h3>
            <p className="text-gray-600 mb-4">大家的集氣記錄</p>
            
            <div className="space-y-3">
              {chantLogs.map((log) => (
                <div key={log.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-200">
                  <div className="space-y-2">
                    {/* 用戶名 */}
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🙋</span>
                      <span className="font-semibold text-gray-800">{log.user_name}</span>
                    </div>
                    
                    {/* 念了108遍 - 移到用戶名下面 */}
                    <div className="ml-11">
                      <span className="text-green-600 font-bold">
                        念了 {log.chanted_count} 遍
                      </span>
                    </div>
                    
                    {/* 日期 */}
                    <div className="ml-11 text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-green-600">
                    💪 總共已念誦 {chantLogs.reduce((total, log) => total + log.chanted_count, 0)} 遍
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {wish && (
          <ChantSummary wishId={wish.id} refreshKey={summaryRefreshKey} />
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 mt-6">💬 留言區</h3>
          
          <div className="space-y-3 mb-6">
            {comments.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">💭</div>
                <p className="text-gray-500">還沒有留言，來當第一個留言的人吧！</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} p-4 rounded-lg border-l-4 border-pink-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-800">{comment.user_name}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            <CommentForm wishId={wish?.id as string} onCommented={loadComments} />
          </div>
        </div>

      </main>
    </div>
  )
}