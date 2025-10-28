import React from 'react'
import clsx from 'clsx'

interface IconButtonProps {
  icon?: React.ReactNode
  label: React.ReactNode
  onClick?: () => void
  onTouchEnd?: (e: React.TouchEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  fullWidth?: boolean
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  onTouchEnd,
  onTouchStart,
  className = '',
  variant = 'primary',
  disabled = false,
  fullWidth = false
}) => {
  const baseStyle = 'flex items-center justify-center gap-1 font-bold rounded-xl px-3 sm:px-4 py-2 shadow transition active:scale-95 text-sm sm:text-base'

  const variants = {
    primary: '!bg-blue-700 !text-white hover:!bg-blue-800',
    secondary: '!bg-gray-200 !text-gray-800 hover:!bg-gray-300',
    danger: '!bg-red-600 !text-white hover:!bg-red-700'
  }

  const combined = clsx(
    'icon-button', 
    baseStyle, 
    variants[variant], 
    className, 
    disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
    fullWidth && 'w-full'
  )

  return (
    <button 
      onClick={onClick} 
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
      className={combined} 
      disabled={disabled} 
      style={{ backgroundColor: variant === 'primary' ? '#1d4ed8' : variant === 'danger' ? '#dc2626' : '#e5e7eb', color: variant === 'primary' || variant === 'danger' ? 'white' : '#1f2937' }}
    >
      {icon && <span style={{ color: 'white !important', textShadow: 'none' }}>{icon}</span>}
      <span style={{ color: 'inherit' }}>{label}</span>
    </button>
  )
}

export default IconButton