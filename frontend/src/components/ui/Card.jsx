import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, ...props }) => {
  return (
    <div className={cn('premium-card', className)} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ title, subtitle, className }) => (
  <div className={cn('flex flex-col gap-1 mb-6', className)}>
    {title && <h3 className="text-xl font-bold">{title}</h3>}
    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
  </div>
);

const CardContent = ({ children, className }) => (
  <div className={cn('', className)}>
    {children}
  </div>
);

const CardFooter = ({ children, className }) => (
  <div className={cn('mt-6 pt-6 border-t border-slate-100', className)}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
