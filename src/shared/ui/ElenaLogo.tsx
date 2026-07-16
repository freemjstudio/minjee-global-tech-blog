import { cn } from '@/shared/lib/cn'

interface ElenaLogoProps {
  variant?: 'horizontal' | 'square' | 'mark'
  className?: string
}

export function ElenaMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo-minjee-icon.png"
      alt=""
      aria-hidden="true"
      className={cn('h-8 w-8 rounded-xl object-cover', className)}
    />
  )
}

export function ElenaLogo({ variant = 'horizontal', className }: ElenaLogoProps) {
  if (variant === 'mark') {
    return <ElenaMark className={className} />
  }

  if (variant === 'square') {
    return (
      <ElenaMark
        className={cn(
          'h-10 w-10 rounded-xl border border-gray-200 bg-white shadow-[0_1px_8px_rgba(31,41,55,0.04)] dark:border-gray-800',
          className,
        )}
      />
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-3 text-gray-900 dark:text-white', className)}>
      <ElenaLogo variant="square" />
      <span className="text-[15px] font-semibold tracking-normal">Minjee Woo</span>
    </div>
  )
}
