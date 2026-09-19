import React from 'react';
import { Link } from 'react-router-dom';

interface IconButtonProps {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  to?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick, className, to }) => {
  console.log('🟢 IconButton 載入中！');
  console.log('🔵 props:', { label, to, onClick });

  const commonClasses = `flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-150 ${className}`;

  const content = (
    <>
      {icon && (
        <span className="w-5 h-5 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className="!text-white font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{label}</span>
    </>
  );

  return to ? (
    <Link to={to} className={commonClasses}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className={commonClasses}>
      {content}
    </button>
  );
};

export default IconButton;
