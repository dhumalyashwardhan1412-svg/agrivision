import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = true, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all duration-200',
        hover && 'hover:shadow-md hover:border-slate-300/80',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx('flex items-center justify-between pb-4 mb-4 border-b border-slate-100', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={clsx('text-base sm:text-lg font-bold text-slate-800 tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
  <p className={clsx('text-xs sm:text-sm text-slate-500 mt-0.5', className)} {...props}>
    {children}
  </p>
);
