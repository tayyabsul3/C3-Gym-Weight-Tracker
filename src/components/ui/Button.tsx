import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-display rounded-lg font-semibold tracking-wide transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none';
  
  const variants = {
    primary: 'bg-primary text-black hover:opacity-90 hover:shadow-glow',
    secondary: 'bg-secondary text-black hover:opacity-90 hover:shadow-successGlow',
    outline: 'bg-transparent border border-border text-textSecondary hover:border-primary hover:text-primary',
    danger: 'bg-danger text-black hover:opacity-90',
    ghost: 'bg-transparent text-textSecondary hover:text-textPrimary hover:bg-surface2'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-2.5 min-h-[44px]', // Sweat-friendly size target
    lg: 'text-base px-6 py-3 min-h-[48px]'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
