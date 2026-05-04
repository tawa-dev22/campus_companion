import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-indigo-50 text-indigo-700',
    success: 'bg-emerald-50 text-emerald-700',
    error: 'bg-rose-50 text-rose-700',
    warning: 'bg-amber-50 text-amber-700',
  };

  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
