import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  bordered = true
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div
      className={`bg-white rounded-xl ${bordered ? 'border border-slate-200 shadow-xs' : ''} ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
