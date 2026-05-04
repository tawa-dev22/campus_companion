import React from 'react';
import { cn } from '../utils/cn';
import Card from './ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', className }) => {
  const colorMap = {
    primary: 'text-primary bg-primary/5 group-hover:bg-primary group-hover:text-white',
    accent: 'text-accent bg-accent/5 group-hover:bg-accent group-hover:text-white',
    emerald: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
    indigo: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white',
    rose: 'text-rose-600 bg-rose-50 group-hover:bg-rose-600 group-hover:text-white',
    violet: 'text-violet-600 bg-violet-50 group-hover:bg-violet-600 group-hover:text-white',
  };

  return (
    <Card className={cn(
      'flex items-center gap-5 p-6 group hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border-none shadow-sm', 
      className
    )}>
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-6 shadow-sm",
        colorMap[color] || colorMap.primary
      )}>
        {Icon && <Icon className="w-7 h-7" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-tight">{title}</p>
        <div className="flex items-center justify-between">
          <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg",
              trend > 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
            )}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
