import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-md border bg-surface-0 px-3.5 py-2 text-sm text-text-primary',
            'placeholder:text-text-tertiary',
            'border-border',
            'transition-[border-color,box-shadow] duration-base ease-out-quart',
            'focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[--accent] focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-40',
            error && 'border-red-400 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
