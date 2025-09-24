import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const navigate = useNavigate()
  
  const menuItems = [
    {
      path: '/pomodoro',
      icon: '🍅',
      title: '番茄鐘',
      description: '專注工作 25 分鐘．休息 5 分鐘',
      color: 'from-red-400 to-pink-500'
    },
    {
      path: '/todo',
      icon: '📋',
      title: '待辦清單',
      description: '管理您的任務和待辦事項',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      path: '/chant',
      icon: '🙏',
      title: '念經計數',
      description: '自訂經文並統計次數',
      color: 'from-green-400 to-emerald-500'
    },
    {
      path: '/settings',
      icon: '⚙️',
      title: '設定中心',
      description: '個人設定和應用程式選項',
      color: 'from-purple-400 to-violet-500'
    }
  ]

  return (
    <div className="page bg-white text-black dark:bg-gray-900 dark:text-gray-100" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
      <h1 style={{ color: '#213547' }} className="dark:text-gray-100">🏠 主頁</h1>

      <div className="stack">
        {menuItems.map((item) => (
          <div key={item.path} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(item.path)}>
            <div 
              className="feature-card bg-white text-gray-900 dark:bg-[#1f2937] dark:text-gray-100"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 className="m-0 mb-2 text-gray-900 dark:text-gray-100 text-xl font-semibold">
                    {item.icon} {item.title}
                  </h2>
                  <p className="m-0 text-gray-700 dark:text-gray-300 text-base font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage