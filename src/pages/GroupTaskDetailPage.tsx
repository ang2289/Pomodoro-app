import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getGroupTasks } from '../services/groupTaskService'
import { 
  getTaskRegistrationsByTaskId, 
  isUserRegisteredForTask, 
  getUserTaskRegistration,
  registerForTask,
  updateTaskRegistrationStatus,
  getTaskStatistics
} from '../services/taskRegistrationService'
import { GroupTask } from '../types/GroupTask'
import { TaskRegistration } from '../types/TaskRegistration'
import CountdownReminder from '../components/CountdownReminder'
import { exportRegistrationList } from '../services/exportService'

const GroupTaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const [task, setTask] = useState<GroupTask | null>(null)
  const [registrations, setRegistrations] = useState<TaskRegistration[]>([])
  const [userRegistration, setUserRegistration] = useState<TaskRegistration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [userName, setUserName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [errorMessage, setErrorMessage] = useState('')
  const [showExportMessage, setShowExportMessage] = useState('')

  // 載入任務資料
  useEffect(() => {
    const loadTaskData = () => {
      if (!taskId) {
        setErrorMessage('任務 ID 不存在')
        setIsLoading(false)
        return
      }

      try {
        // 載入任務資料
        const tasks = getGroupTasks()
        const foundTask = tasks.find(t => t.id === taskId)
        
        if (!foundTask) {
          setErrorMessage('找不到該任務')
          setIsLoading(false)
          return
        }

        setTask(foundTask)

        // 載入報名資料
        const taskRegistrations = getTaskRegistrationsByTaskId(taskId)
        setRegistrations(taskRegistrations)

        // 檢查使用者是否已報名
        const userId = 'user-' + Date.now() // 模擬使用者 ID
        const isRegistered = isUserRegisteredForTask(userId, taskId)
        
        if (isRegistered) {
          const userReg = getUserTaskRegistration(userId, taskId)
          setUserRegistration(userReg)
        } else {
          setShowRegistrationForm(true)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('載入任務資料失敗:', error)
        setErrorMessage('載入任務資料失敗')
        setIsLoading(false)
      }
    }

    loadTaskData()
  }, [taskId])

  const handleRegister = async () => {
    if (!userName.trim()) {
      setErrorMessage('請輸入您的姓名')
      return
    }

    if (quantity < 1) {
      setErrorMessage('購買數量必須大於 0')
      return
    }

    if (!task) return

    setIsRegistering(true)
    setErrorMessage('')

    try {
      const userId = 'user-' + Date.now() // 模擬使用者 ID
      
      const registration = registerForTask({
        taskId: task.id,
        userId,
        userName: userName.trim(),
        quantity
      })

      setUserRegistration(registration)
      setRegistrations(prev => [...prev, registration])
      setShowRegistrationForm(false)
      setUserName('')
      setQuantity(1)
    } catch (error) {
      console.error('報名失敗:', error)
      setErrorMessage('報名失敗，請重試')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleToggleCompletion = async (registrationId: string, isCompleted: boolean) => {
    try {
      const success = updateTaskRegistrationStatus(registrationId, isCompleted)
      if (success) {
        setRegistrations(prev => 
          prev.map(reg => 
            reg.id === registrationId ? { ...reg, isCompleted } : reg
          )
        )
        
        if (userRegistration && userRegistration.id === registrationId) {
          setUserRegistration(prev => prev ? { ...prev, isCompleted } : null)
        }
      }
    } catch (error) {
      console.error('更新狀態失敗:', error)
      setErrorMessage('更新狀態失敗，請重試')
    }
  }

  const handleExportList = () => {
    if (!task) return

    try {
      const result = exportRegistrationList(task, registrations)
      if (result.success) {
        setShowExportMessage('✅ 報名名單匯出成功！')
        setTimeout(() => setShowExportMessage(''), 3000)
      } else {
        setShowExportMessage('❌ 匯出失敗，請重試')
        setTimeout(() => setShowExportMessage(''), 3000)
      }
    } catch (error) {
      console.error('匯出失敗:', error)
      setShowExportMessage('❌ 匯出過程中發生錯誤')
      setTimeout(() => setShowExportMessage(''), 3000)
    }
  }

  const statistics = task ? getTaskStatistics(task.id) : null

  if (isLoading) {
    return (
      <div className="page">
        <h1>載入中...</h1>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '18px', color: '#888' }}>正在載入任務資料...</div>
        </div>
      </div>
    )
  }

  if (!task || errorMessage) {
    return (
      <div className="page">
        <h1>❌ 錯誤</h1>
        <div style={{ 
          backgroundColor: '#ff6b6b', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          margin: '30px 0',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          {errorMessage || '找不到該任務'}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>📋 任務詳情</h1>
      
      {/* 倒數提醒 */}
      {task && (
        <CountdownReminder deliveryTime={task.deliveryTime} />
      )}
      
      {/* 任務基本資訊 */}
      <div style={{ 
        backgroundColor: '#2a2a2a', 
        borderRadius: '16px', 
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h2 style={{ 
          color: '#4ecdc4', 
          marginBottom: '20px',
          fontSize: '1.8em',
          fontWeight: '600'
        }}>
          {task.title}
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ color: '#888', fontSize: '16px', fontWeight: '500' }}>所屬群組：</span>
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>群組代碼 {task.groupId}</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ color: '#888', fontSize: '16px', fontWeight: '500' }}>領貨時間：</span>
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>{task.deliveryTime}</span>
          </div>
        </div>

        {/* 統計資訊 */}
        {statistics && (
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            borderRadius: '12px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#4ecdc4', fontSize: '24px', fontWeight: '700' }}>
                  {statistics.totalRegistrations}
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>報名人數</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#4ecdc4', fontSize: '24px', fontWeight: '700' }}>
                  {statistics.totalQuantity}
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>總數量</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#4ecdc4', fontSize: '24px', fontWeight: '700' }}>
                  {statistics.completedQuantity}
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>已領取</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#ff6b6b', fontSize: '24px', fontWeight: '700' }}>
                  {statistics.pendingQuantity}
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>待領取</div>
              </div>
            </div>

            {/* 匯出按鈕 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleExportList}
                style={{
                  backgroundColor: '#4ecdc4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#45b7aa'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#4ecdc4'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                📊 匯出報名名單
              </button>
            </div>
          </div>
        )}

        {/* 匯出訊息 */}
        {showExportMessage && (
          <div style={{ 
            backgroundColor: showExportMessage.includes('✅') ? '#1a3a1a' : '#3a1a1a',
            color: showExportMessage.includes('✅') ? '#4ecdc4' : '#ff6b6b',
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {showExportMessage}
          </div>
        )}
      </div>

      {/* 使用者報名狀態 */}
      {userRegistration ? (
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '16px', 
          padding: '30px',
          marginBottom: '30px',
          border: '2px solid #4ecdc4'
        }}>
          <h3 style={{ 
            color: '#4ecdc4', 
            marginBottom: '20px',
            fontSize: '1.4em',
            fontWeight: '600'
          }}>
            ✅ 您的報名資訊
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#888', fontSize: '16px' }}>姓名：</span>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
                {userRegistration.userName}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#888', fontSize: '16px' }}>購買數量：</span>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
                {userRegistration.quantity}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#888', fontSize: '16px' }}>領貨狀態：</span>
              <span style={{ 
                color: userRegistration.isCompleted ? '#4ecdc4' : '#ff6b6b', 
                fontSize: '16px', 
                fontWeight: '500'
              }}>
                {userRegistration.isCompleted ? '已領取' : '未領取'}
              </span>
            </div>
          </div>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            <input
              type="checkbox"
              checked={userRegistration.isCompleted}
              onChange={(e) => handleToggleCompletion(userRegistration.id, e.target.checked)}
              className="accent-blue-500 dark:accent-green-400"
              style={{ 
                transform: 'scale(1.5)',
                marginRight: '8px'
              }}
            />
            我已領貨
          </label>
        </div>
      ) : showRegistrationForm && (
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '16px', 
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            color: '#4ecdc4', 
            marginBottom: '20px',
            fontSize: '1.4em',
            fontWeight: '600'
          }}>
            📝 報名表單
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: '#fff', 
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              我的名稱
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="請輸入您的姓名"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #333',
                backgroundColor: '#1a1a1a',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: '#fff', 
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              購買數量
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #333',
                backgroundColor: '#1a1a1a',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {errorMessage && (
            <div style={{ 
              backgroundColor: '#ff6b6b', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={isRegistering || !userName.trim()}
            style={{
              width: '100%',
              backgroundColor: (isRegistering || !userName.trim()) ? '#95a5a6' : '#4ecdc4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              cursor: (isRegistering || !userName.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {isRegistering ? '報名中...' : '提交報名'}
          </button>
        </div>
      )}

      {/* 已報名成員清單 */}
      <div style={{ 
        backgroundColor: '#2a2a2a', 
        borderRadius: '16px', 
        padding: '30px'
      }}>
        <h3 style={{ 
          color: '#4ecdc4', 
          marginBottom: '20px',
          fontSize: '1.4em',
          fontWeight: '600'
        }}>
          👥 已報名成員 ({registrations.length})
        </h3>

        {registrations.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#888', 
            padding: '40px 0',
            fontSize: '16px'
          }}>
            尚無成員報名
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {registrations.map(registration => (
              <div
                key={registration.id}
                style={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '12px',
                  padding: '16px',
                  border: registration.isCompleted ? '2px solid #4ecdc4' : '2px solid #333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ 
                    color: '#fff', 
                    fontSize: '16px', 
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {registration.userName}
                  </div>
                  <div style={{ 
                    color: '#888', 
                    fontSize: '14px'
                  }}>
                    數量：{registration.quantity}
                  </div>
                </div>
                
                <div style={{ 
                  color: registration.isCompleted ? '#4ecdc4' : '#ff6b6b',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {registration.isCompleted ? '✅ 已領取' : '⏳ 待領取'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupTaskDetailPage
