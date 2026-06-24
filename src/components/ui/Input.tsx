import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex w-full rounded-lg border border-border bg-surface2 px-3.5 py-2 text-sm text-textPrimary placeholder:text-textSecondary outline-none transition-all duration-200 focus:border-primary focus:shadow-focus min-h-[44px] font-mono ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
