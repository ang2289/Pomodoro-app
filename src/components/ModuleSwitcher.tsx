import { useNavigate, useLocation } from 'react-router-dom'

const moduleItems = [
  { path: '/chant', label: '唸經' },
  { path: '/todo', label: '待辦' },
  { path: '/pomodoro', label: '番茄鐘' },
  { path: '/wish', label: '發起集氣' }
]

export default function ModuleSwitcher() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const handleModuleClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="fixed top-1/3 right-2 z-50 flex flex-col space-y-3">
      {moduleItems.map((item) => {
        const isActive = currentPath === item.path || 
                        (item.path === '/pomodoro' && currentPath === '/')
        
        return (
          <button
            key={item.path}
            onClick={() => handleModuleClick(item.path)}
            className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
              isActive 
                ? 'bg-blue-600 text-white scale-110' 
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-105'
            }`}
            title={item.label}
          >
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
