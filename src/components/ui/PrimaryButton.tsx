import React from 'react'

export default function PrimaryButton({
  children,
  onClick,
  disabled,
  fullWidth = true,
  size = 'md',
  className = '',
  type = 'button',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md'
  className?: string
  type?: 'button' | 'submit'
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  }

  const baseClasses =
    'inline-flex items-center justify-center rounded-xl font-semibold transition ' +
    'shadow-sm whitespace-nowrap select-none focus:outline-none focus:ring-2 focus:ring-blue-400'

  const widthClass = fullWidth ? 'w-full' : 'w-auto'
  const sizeClass = sizeClasses[size]

  const stateClasses = disabled
    ? '!bg-gray-300 !text-gray-500 cursor-not-allowed'
    : '!bg-blue-600 hover:!bg-blue-700 active:!bg-blue-800 !text-white'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${widthClass} ${sizeClass} ${stateClasses} ${className}`}
    >
      {children}
    </button>
  )
}
