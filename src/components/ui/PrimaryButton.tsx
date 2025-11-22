import React from 'react'

export default function PrimaryButton({
  children,
  onClick,
  disabled,
  fullWidth = true,
  size = 'md',
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md'
  className?: string
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
  }

  const baseClasses = 'text-center rounded-xl font-bold transition shadow-sm whitespace-nowrap cursor-pointer'
  const widthClass = fullWidth ? 'w-full' : ''
  const sizeClass = sizeClasses[size]
  const stateClasses = disabled
    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${widthClass} ${sizeClass} ${stateClasses} ${className}`.trim()}
    >
      {children}
    </button>
  )
}

