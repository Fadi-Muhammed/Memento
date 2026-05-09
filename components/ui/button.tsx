'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 text-sm font-medium select-none disabled:pointer-events-none disabled:opacity-40 transition-colors duration-base ease-out-quart',
  {
    variants: {
      variant: {
        default:
          'bg-[--accent] text-white rounded-md shadow-subtle hover:bg-[--accent-hover] active:bg-[--accent]',
        secondary:
          'bg-surface-1 text-text-primary rounded-md border border-border hover:bg-surface-2',
        ghost:
          'text-text-secondary rounded-md hover:bg-surface-1 hover:text-text-primary',
        destructive:
          'bg-red-600 text-white rounded-md hover:bg-red-700',
      },
      size: {
        default: 'h-10 px-4',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-12 px-6 text-base',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

type ButtonProps = Omit<HTMLMotionProps<'button'>, keyof VariantProps<typeof buttonVariants>> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12, ease: [0.25, 1, 0.5, 1] }}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          {children}
        </span>
      ) : children}
    </motion.button>
  )
)
Button.displayName = 'Button'

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export { Button, buttonVariants }
