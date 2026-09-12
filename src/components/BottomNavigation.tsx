import { Link } from 'react-router-dom'

interface BottomNavigationProps {
  currentPath: string
  isVisible: boolean
  isMobile: boolean
}

const BottomNavigation = ({ currentPath, isVisible, isMobile }: BottomNavigationProps) => {
  const navItems = [
    { path: '/', label: '首頁' },
    { path: '/pomodoro', label: '番茄鐘' },
    { path: '/todo', label: '待辦' },
    { path: '/settings', label: '設定' }
  ]

  return (
    <nav 
      className={`bottom-navbar ${!isVisible && isMobile ? 'hidden' : ''}`}
    >
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-button ${currentPath === item.path ? 'active' : ''}`}
          style={{ fontSize: '16px', fontWeight: '500' }}
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default BottomNavigation
