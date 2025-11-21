import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'bordered';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', ...props }, ref) => {
    const baseStyles = 'rounded-xl transition-all duration-300';

    const variants = {
      default: 'bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl',
      glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl',
      gradient: 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl',
      bordered: 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:border-blue-500/50'
    };

    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export default Card;