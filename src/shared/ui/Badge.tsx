import { type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'category'
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300': variant === 'default',
          'border border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400': variant === 'outline',
          'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300': variant === 'category',
        },
        className,
      )}
      {...props}
    />
  )
}
