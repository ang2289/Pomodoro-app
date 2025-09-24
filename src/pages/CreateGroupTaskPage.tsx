import { useState, useEffect } from 'react'
import { createGroupTask } from '../services/groupTaskService'
import { getGroupsByUserId } from '../services/groupMemberService'
import { Group } from '../types/Group'

const CreateGroupTaskPage = () => {
  const [title, setTitle] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [userGroups, setUserGroups] = useState<Group[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // 載入使用者加入的群組
  useEffect(() => {
    const loadUserGroups = () => {
      try {
        // 模擬使用者 ID（實際應用中應該從用戶認證系統取得）
        const userId = 'user-' + Date.now()
        const groups = getGroupsByUserId(userId)
        setUserGroups(groups)
      } catch (error) {
        console.error('載入群組失敗:', error)
        setErrorMessage('載入群組失敗，請重試')
      }
    }

    loadUserGroups()
  }, [])

  const handleCreateTask = async () => {
    if (!title.trim()) {
      setErrorMessage('請輸入任務標題')
      return
    }

    if (!selectedGroupId) {
      setErrorMessage('請選擇所屬群組')
      return
    }

    if (!deliveryTime.trim()) {
      setErrorMessage('請輸入領貨時間')
      return
    }

    setIsCreating(true)
    setErrorMessage('')

    try {
      // 模擬創建者 ID（實際應用中應該從用戶認證系統取得）
      const createdBy = 'user-' + Date.now()

      createGroupTask({
        title: title.trim(),
        groupId: selectedGroupId,
        deliveryTime: deliveryTime.trim(),
        createdBy
      })

      setShowSuccess(true)
      setTitle('')
      setSelectedGroupId('')
      setDeliveryTime('')
    } catch (error) {
      console.error('建立任務失敗:', error)
      setErrorMessage('建立任務失敗，請重試')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateAnother = () => {
    setShowSuccess(false)
    setTitle('')
    setSelectedGroupId('')
    setDeliveryTime('')
    setErrorMessage('')
  }

  if (showSuccess) {
    return (
      <div className="page">
        <h1>🎉 任務建立成功！</h1>
        
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '16px', 
          padding: '30px', 
          margin: '30px 0',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '24px', 
            marginBottom: '20px' 
          }}>
            ✅
          </div>
          
          <h2 style={{ 
            color: '#4ecdc4', 
            marginBottom: '20px',
            fontSize: '1.8em',
            fontWeight: '600'
          }}>
            任務已成功建立！
          </h2>
          
          <div style={{ 
            color: '#ccc', 
            fontSize: '18px',
            fontWeight: '500',
            lineHeight: '1.6',
            marginBottom: '30px'
          }}>
            群組成員現在可以看到這個任務了
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={handleCreateAnother}
              style={{
                backgroundColor: '#4ecdc4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              建立新任務
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (userGroups.length === 0) {
    return (
      <div className="page">
        <h1>📝 建立群組任務</h1>
        
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '16px', 
          padding: '30px', 
          margin: '30px 0',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px' 
          }}>
            👥
          </div>
          
          <h2 style={{ 
            color: '#4ecdc4', 
            marginBottom: '20px',
            fontSize: '1.8em',
            fontWeight: '600'
          }}>
            尚未加入任何群組
          </h2>
          
          <div style={{ 
            color: '#ccc', 
            fontSize: '18px',
            fontWeight: '500',
            lineHeight: '1.6',
            marginBottom: '30px'
          }}>
            請先加入群組才能建立任務
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <a
              href="/group/join"
              style={{
                backgroundColor: '#4ecdc4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              加入群組
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>📝 建立群組任務</h1>
      <p style={{ fontSize: '1.2em', fontWeight: '500', marginBottom: '40px' }}>
        為群組建立新的任務
      </p>
      
      <div style={{ 
        backgroundColor: '#2a2a2a', 
        borderRadius: '16px', 
        padding: '30px',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            color: '#fff', 
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            任務標題
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：9/12 蛋塔發貨"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #333',
              backgroundColor: '#1a1a1a',
              color: 'white',
              fontSize: '18px',
              fontWeight: '500',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            color: '#fff', 
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            所屬群組
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #333',
              backgroundColor: '#1a1a1a',
              color: 'white',
              fontSize: '18px',
              fontWeight: '500',
              boxSizing: 'border-box'
            }}
          >
            <option value="">請選擇群組</option>
            {userGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.code})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            color: '#fff', 
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            領貨時間
          </label>
          <input
            type="text"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            placeholder="例如：9/13 晚上 7 點～9 點"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #333',
              backgroundColor: '#1a1a1a',
              color: 'white',
              fontSize: '18px',
              fontWeight: '500',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* 錯誤訊息 */}
        {errorMessage && (
          <div style={{ 
            backgroundColor: '#ff6b6b', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}
        
        <button
          onClick={handleCreateTask}
          disabled={isCreating || !title.trim() || !selectedGroupId || !deliveryTime.trim()}
          style={{
            width: '100%',
            backgroundColor: (isCreating || !title.trim() || !selectedGroupId || !deliveryTime.trim()) ? '#95a5a6' : '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '18px',
            cursor: (isCreating || !title.trim() || !selectedGroupId || !deliveryTime.trim()) ? 'not-allowed' : 'pointer',
            fontSize: '18px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          {isCreating ? '建立中...' : '建立任務'}
        </button>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#888',
          lineHeight: '1.5'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>💡 提示：</div>
          <div>• 任務標題要清楚描述任務內容</div>
          <div>• 領貨時間請詳細說明時間範圍</div>
          <div>• 群組成員都可以看到這個任務</div>
        </div>
      </div>
    </div>
  )
}

export default CreateGroupTaskPage
