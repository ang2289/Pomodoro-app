import { useState } from 'react'
import { createGroup } from '../services/groupService'
import { Group } from '../types/Group'

const GroupCreatePage = () => {
  const [groupName, setGroupName] = useState('')
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('請輸入群組名稱')
      return
    }

    setIsCreating(true)
    
    try {
      // 模擬創建者 ID（實際應用中應該從用戶認證系統取得）
      const createdBy = 'user-' + Date.now()
      
      const newGroup = createGroup({
        name: groupName.trim(),
        createdBy
      })
      
      setCreatedGroup(newGroup)
      setShowSuccess(true)
      setGroupName('')
    } catch (error) {
      console.error('建立群組失敗:', error)
      alert('建立群組失敗，請重試')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyCode = async () => {
    if (createdGroup) {
      try {
        await navigator.clipboard.writeText(createdGroup.code)
        alert('群組代碼已複製到剪貼簿！')
      } catch (error) {
        // 備用方案：使用舊的複製方法
        const textArea = document.createElement('textarea')
        textArea.value = createdGroup.code
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('群組代碼已複製到剪貼簿！')
      }
    }
  }

  const handleCreateAnother = () => {
    setCreatedGroup(null)
    setShowSuccess(false)
  }

  if (showSuccess && createdGroup) {
    return (
      <div className="page">
        <h1>🎉 群組建立成功！</h1>
        
        <div className="bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-md mx-auto mt-10 text-center">
          <h2 className="text-indigo-600 mb-5 text-3xl font-semibold">
            {createdGroup.name}
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-5 my-5">
            <div className="text-gray-600 text-base mb-2 font-medium">
              群組代碼
            </div>
            <div className="text-4xl font-bold text-indigo-600 tracking-wider mb-5">
              {createdGroup.code}
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-indigo-500 text-white border-none rounded-lg py-3 px-6 cursor-pointer text-base font-semibold mb-5 hover:bg-indigo-600"
            >
              📋 複製代碼
            </button>
          </div>
          
          <div className="text-gray-600 text-lg font-medium leading-relaxed mb-8">
            請邀請團友輸入代碼加入群組
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleCreateAnother}
              className="bg-gray-500 text-white border-none rounded-lg py-3 px-6 cursor-pointer text-base font-semibold hover:bg-gray-600"
            >
              建立新群組
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>👥 建立群組</h1>
      <p style={{ fontSize: '1.2em', fontWeight: '500', marginBottom: '40px' }}>
        建立一個新的群組，與朋友一起使用番茄鐘
      </p>
      
      <div className="bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-md mx-auto mt-10">
        <div style={{ marginBottom: '30px' }}>
          <label className="block text-gray-700 text-lg font-semibold mb-3">
            群組名稱
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="請輸入群組名稱..."
            className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
          />
        </div>
        
        <button
          onClick={handleCreateGroup}
          disabled={isCreating || !groupName.trim()}
          className={`w-full py-2 px-4 rounded mt-4 ${
            isCreating || !groupName.trim() 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
        >
          {isCreating ? '建立中...' : '建立群組'}
        </button>
        
        <div className="mt-5 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed">
          <div className="font-semibold mb-2">💡 提示：</div>
          <div>• 群組建立後會自動產生 6 碼代碼</div>
          <div>• 分享代碼給朋友即可邀請加入</div>
          <div>• 群組資料會儲存在本地裝置</div>
        </div>
      </div>
    </div>
  )
}

export default GroupCreatePage

