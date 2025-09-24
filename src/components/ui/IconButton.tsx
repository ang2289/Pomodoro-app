import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface IconButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
}

const variantToClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
};

export default function IconButton({
  icon,
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: IconButtonProps) {
  const inlineStyle: React.CSSProperties =
    variant === 'primary'
      ? { backgroundColor: '#2563eb', color: '#fff' }
      : variant === 'danger'
      ? { backgroundColor: '#dc2626', color: '#fff' }
      : { backgroundColor: '#e5e7eb', color: '#111827' };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded px-4 py-2 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variantToClasses[variant]} ${className}`}
      style={inlineStyle}
    >
      <span className="inline-flex items-center" aria-hidden>
        {icon}
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}


