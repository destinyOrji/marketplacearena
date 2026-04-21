import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const hoverStyles = hover
    ? 'hover:shadow-lg transition-shadow cursor-pointer'
    : '';
  
  const clickableStyles = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      className={`bg-white rounded-xl shadow-md ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className={`border-b border-gray-200 ${paddingStyles[padding]}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className={paddingStyles[padding]}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-gray-200 bg-gray-50 rounded-b-xl ${paddingStyles[padding]}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
