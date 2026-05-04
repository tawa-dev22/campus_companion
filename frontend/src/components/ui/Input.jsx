import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-bold text-slate-700 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900',
            Icon && 'pl-11',
            error && 'border-rose-500 ring-rose-500/10 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-rose-500 font-bold ml-1">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
