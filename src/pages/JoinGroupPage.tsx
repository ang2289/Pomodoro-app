import { useState, useEffect } from 'react'
import { joinGroup } from '../services/groupMemberService'
import { findGroupByCode } from '../services/groupService'
import { Group } from '../types/Group'

const JoinGroupPage = () => {
  const [groupCode, setGroupCode] = useState('')
  const [userName, setUserName] = useState('')
  const [foundGroup, setFoundGroup] = useState<Group | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // 自動搜尋群組
  useEffect(() => {
    if (groupCode.length === 6) {
      handleSearchGroup()
    } else {
      setFoundGroup(null)
      setErrorMessage('')
    }
  }, [groupCode])

  const handleSearchGroup = async () => {
    if (groupCode.length !== 6) {
      setErrorMessage('請輸入 6 碼群組代碼')
      return
    }

    setIsSearching(true)
    setErrorMessage('')

    try {
      const group = findGroupByCode(groupCode.toUpperCase())
      if (group) {
        setFoundGroup(group)
      } else {
        setFoundGroup(null)
        setErrorMessage('找不到該群組代碼')
      }
    } catch (error) {
      console.error('搜尋群組失敗:', error)
      setErrorMessage('搜尋群組失敗，請重試')
    } finally {
      setIsSearching(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!foundGroup || !userName.trim()) {
      setErrorMessage('請輸入您的姓名')
      return
    }

    setIsJoining(true)
    setErrorMessage('')

    try {
      // 模擬使用者 ID（實際應用中應該從用戶認證系統取得）
      const userId = 'user-' + Date.now()

      const result = joinGroup({
        groupCode: groupCode.toUpperCase(),
        userId,
        userName: userName.trim()
      })

      if (result.success) {
        setShowSuccess(true)
        setGroupCode('')
        setUserName('')
        setFoundGroup(null)
      } else {
        setErrorMessage(result.message)
      }
    } catch (error) {
      console.error('加入群組失敗:', error)
      setErrorMessage('加入群組失敗，請重試')
    } finally {
      setIsJoining(false)
    }
  }

  const handleJoinAnother = () => {
    setShowSuccess(false)
    setGroupCode('')
    setUserName('')
    setFoundGroup(null)
    setErrorMessage('')
  }

  if (showSuccess) {
    return (
      <div className="page">
        <h1>🎉 加入成功！</h1>
        
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
            成功加入群組！
          </h2>
          
          <div style={{ 
            color: '#ccc', 
            fontSize: '18px',
            fontWeight: '500',
            lineHeight: '1.6',
            marginBottom: '30px'
          }}>
            現在您可以與群組成員一起使用番茄鐘了
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={handleJoinAnother}
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
              加入其他群組
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>👥 加入群組</h1>
      <p style={{ fontSize: '1.2em', fontWeight: '500', marginBottom: '40px' }}>
        輸入群組代碼加入朋友的群組
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
            群組代碼
          </label>
          <input
            type="text"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
            placeholder="請輸入 6 碼群組代碼"
            maxLength={6}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #333',
              backgroundColor: '#1a1a1a',
              color: 'white',
              fontSize: '18px',
              fontWeight: '500',
              textAlign: 'center',
              letterSpacing: '0.2em',
              boxSizing: 'border-box'
            }}
          />
          {isSearching && (
            <div style={{ 
              textAlign: 'center', 
              color: '#4ecdc4', 
              marginTop: '10px',
              fontSize: '16px'
            }}>
              搜尋中...
            </div>
          )}
        </div>

        {/* 找到群組時顯示群組資訊 */}
        {foundGroup && (
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            borderRadius: '12px', 
            padding: '20px',
            marginBottom: '20px',
            border: '2px solid #4ecdc4'
          }}>
            <h3 style={{ 
              color: '#4ecdc4', 
              marginBottom: '10px',
              fontSize: '1.4em',
              fontWeight: '600'
            }}>
              {foundGroup.name}
            </h3>
            <p style={{ 
              color: '#ccc', 
              fontSize: '16px',
              marginBottom: '15px'
            }}>
              群組代碼：{foundGroup.code}
            </p>
            <p style={{ 
              color: '#888', 
              fontSize: '14px'
            }}>
              建立時間：{new Date(foundGroup.createdAt).toLocaleDateString('zh-TW')}
            </p>
          </div>
        )}

        {/* 使用者姓名輸入 */}
        {foundGroup && (
          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              color: '#fff', 
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              您的姓名
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="請輸入您的姓名"
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
        )}

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
          onClick={foundGroup ? handleJoinGroup : handleSearchGroup}
          disabled={isSearching || isJoining || (!foundGroup && groupCode.length !== 6)}
          style={{
            width: '100%',
            backgroundColor: (isSearching || isJoining || (!foundGroup && groupCode.length !== 6)) ? '#95a5a6' : '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '18px',
            cursor: (isSearching || isJoining || (!foundGroup && groupCode.length !== 6)) ? 'not-allowed' : 'pointer',
            fontSize: '18px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          {isJoining ? '加入中...' : foundGroup ? '確認加入群組' : '搜尋群組'}
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
          <div>• 輸入完整的 6 碼群組代碼</div>
          <div>• 每個使用者可加入多個群組</div>
          <div>• 不可重複加入同一群組</div>
        </div>
      </div>
    </div>
  )
}

export default JoinGroupPage

