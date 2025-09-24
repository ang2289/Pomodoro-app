import { useState, useEffect } from 'react'
import { initializeTestData, clearTestData, hasTestData } from '../utils/testData'

const TestDataPage = () => {
  const [hasData, setHasData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setHasData(hasTestData())
  }, [])

  const handleInitializeData = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const success = initializeTestData()
      if (success) {
        setMessage('✅ 測試資料初始化成功！')
        setHasData(true)
      } else {
        setMessage('❌ 測試資料初始化失敗')
      }
    } catch (error) {
      setMessage('❌ 初始化過程中發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearData = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const success = clearTestData()
      if (success) {
        setMessage('🗑️ 測試資料已清除')
        setHasData(false)
      } else {
        setMessage('❌ 清除測試資料失敗')
      }
    } catch (error) {
      setMessage('❌ 清除過程中發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setHasData(hasTestData())
    setMessage('')
  }

  return (
    <div className="page">
      <h1>🧪 測試資料管理</h1>
      <p style={{ fontSize: '1.2em', fontWeight: '500', marginBottom: '40px' }}>
        管理測試群組和任務資料
      </p>
      
      <div style={{ 
        backgroundColor: '#2a2a2a', 
        borderRadius: '16px', 
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h2 style={{ 
          color: '#4ecdc4', 
          marginBottom: '20px',
          fontSize: '1.4em',
          fontWeight: '600'
        }}>
          📊 測試資料狀態
        </h2>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: hasData ? '#1a3a1a' : '#3a1a1a',
          borderRadius: '8px',
          border: hasData ? '2px solid #4ecdc4' : '2px solid #ff6b6b'
        }}>
          <span style={{ fontSize: '24px' }}>
            {hasData ? '✅' : '❌'}
          </span>
          <span style={{ 
            color: hasData ? '#4ecdc4' : '#ff6b6b',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            {hasData ? '測試資料已載入' : '尚未載入測試資料'}
          </span>
        </div>

        {message && (
          <div style={{ 
            backgroundColor: message.includes('✅') ? '#1a3a1a' : message.includes('🗑️') ? '#1a1a3a' : '#3a1a1a',
            color: message.includes('✅') ? '#4ecdc4' : message.includes('🗑️') ? '#4ecdc4' : '#ff6b6b',
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={handleInitializeData}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#95a5a6' : '#4ecdc4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              flex: '1',
              minWidth: '150px'
            }}
          >
            {isLoading ? '處理中...' : '初始化測試資料'}
          </button>

          <button
            onClick={handleClearData}
            disabled={isLoading || !hasData}
            style={{
              backgroundColor: (isLoading || !hasData) ? '#95a5a6' : '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: (isLoading || !hasData) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              flex: '1',
              minWidth: '150px'
            }}
          >
            {isLoading ? '處理中...' : '清除測試資料'}
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#95a5a6' : '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              flex: '1',
              minWidth: '150px'
            }}
          >
            重新整理
          </button>
        </div>
      </div>

      {/* 測試資料說明 */}
      <div style={{ 
        backgroundColor: '#2a2a2a', 
        borderRadius: '16px', 
        padding: '30px'
      }}>
        <h2 style={{ 
          color: '#4ecdc4', 
          marginBottom: '20px',
          fontSize: '1.4em',
          fontWeight: '600'
        }}>
          📋 測試資料內容
        </h2>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            borderRadius: '12px', 
            padding: '20px'
          }}>
            <h3 style={{ 
              color: '#fff', 
              marginBottom: '10px',
              fontSize: '1.2em',
              fontWeight: '600'
            }}>
              👥 測試群組
            </h3>
            <div style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.6' }}>
              <div><strong>群組名稱：</strong>蛋塔小組</div>
              <div><strong>群組代碼：</strong>A1B2C3</div>
              <div><strong>成員數量：</strong>3 人</div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#1a1a1a', 
            borderRadius: '12px', 
            padding: '20px'
          }}>
            <h3 style={{ 
              color: '#fff', 
              marginBottom: '10px',
              fontSize: '1.2em',
              fontWeight: '600'
            }}>
              📋 測試任務
            </h3>
            <div style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.6' }}>
              <div><strong>任務標題：</strong>9/12 雞蛋糕取貨</div>
              <div><strong>領貨時間：</strong>9/12 晚上 7 點～9 點</div>
              <div><strong>報名人數：</strong>3 人</div>
              <div><strong>已領取：</strong>2 人</div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#1a1a1a', 
            borderRadius: '12px', 
            padding: '20px'
          }}>
            <h3 style={{ 
              color: '#fff', 
              marginBottom: '10px',
              fontSize: '1.2em',
              fontWeight: '600'
            }}>
              👤 測試團友
            </h3>
            <div style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.6' }}>
              <div><strong>張小明：</strong>2 個，已領取 ✅</div>
              <div><strong>李美華：</strong>1 個，未領取 ⏳</div>
              <div><strong>王大雄：</strong>3 個，已領取 ✅</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestDataPage
