import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const GroupHomePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [groupCode] = useState('ABC123') // 模擬群組代碼，實際應該從 API 或 context 取得

  const handleCreatePurchase = () => {
    navigate(`/group/${id}/purchase/create`)
  }

  const handleCreateEvent = () => {
    navigate(`/group/${id}/event`)
  }

  const handleInviteFriends = () => {
    setShowInviteModal(true)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(groupCode)
      alert('群組代碼已複製到剪貼簿！')
    } catch (error) {
      // 備用方案：使用舊的複製方法
      const textArea = document.createElement('textarea')
      textArea.value = groupCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('群組代碼已複製到剪貼簿！')
    }
  }

  const closeModal = () => {
    setShowInviteModal(false)
  }

  return (
    <div className="page">
      <h1>👥 我的群組</h1>
      
      <div className="bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-md mx-auto mt-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">群組功能</h2>
          <p className="text-gray-600">選擇您想要使用的群組功能</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6">
          <button 
            onClick={handleCreatePurchase}
            className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 font-semibold text-lg"
          >
            ➕ 建立團購
          </button>
          
          <button 
            onClick={handleCreateEvent}
            className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold text-lg"
          >
            📅 發起活動
          </button>
          
          <button 
            onClick={handleInviteFriends}
            className="bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-semibold text-lg"
          >
            👥 邀請好友
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <div className="font-semibold mb-2">💡 提示：</div>
          <div>• 建立團購：與群組成員一起購買商品</div>
          <div>• 發起活動：組織群組聚會或活動</div>
          <div>• 邀請好友：分享群組代碼邀請新成員</div>
        </div>
      </div>

      {/* 邀請好友 Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">邀請好友加入群組</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-gray-600 text-sm mb-2">群組代碼</div>
                <div className="text-3xl font-bold text-indigo-600 tracking-wider mb-4">
                  {groupCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 font-semibold"
                >
                  📋 複製代碼
                </button>
              </div>
              
              <div className="text-gray-600 text-sm mb-6">
                分享此代碼給朋友，他們就可以加入您的群組
              </div>
              
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupHomePage
