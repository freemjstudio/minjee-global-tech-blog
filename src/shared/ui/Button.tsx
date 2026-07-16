import { type ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        {
          'bg-accent-400 text-gray-950 hover:-translate-y-0.5 hover:bg-accent-500': variant === 'primary',
          'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white': variant === 'ghost',
          'border border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200': variant === 'outline',
        },
        {
          'text-sm px-3 py-1.5 gap-1.5': size === 'sm',
          'text-sm px-4 py-2 gap-2': size === 'md',
          'px-5 py-2.5 gap-2': size === 'lg',
        },
        className,
      )}
      {...props}
    />
  )
}
