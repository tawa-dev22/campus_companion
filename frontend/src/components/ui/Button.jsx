import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground shadow-lg hover:opacity-95 hover:-translate-y-0.5',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      outline: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
      danger: 'bg-rose-600 text-white shadow-lg hover:bg-rose-700 hover:-translate-y-0.5',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-sm',
      md: 'h-11 px-5 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60',
          variants[variant] ?? variants.primary,
          sizes[size] ?? sizes.md,
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            <span>Working...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
