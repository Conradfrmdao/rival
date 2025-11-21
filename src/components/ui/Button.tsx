import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, fullWidth = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden';

    const variants = {
      primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white focus:ring-purple-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
      secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white focus:ring-gray-500 shadow-lg shadow-gray-500/25',
      outline: 'border-2 border-purple-500/50 hover:border-purple-500 text-purple-300 focus:ring-purple-500 hover:bg-purple-500/10',
      ghost: 'hover:bg-purple-500/10 text-purple-300 focus:ring-purple-500',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500 shadow-lg shadow-red-500/25',
      gradient: 'bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:from-purple-700 hover:via-pink-600 hover:to-red-600 text-white focus:ring-purple-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
      glass: 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white focus:ring-purple-500 shadow-lg hover:shadow-xl'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {(variant === 'gradient' || variant === 'primary') && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full animate-shimmer" />
        )}
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;