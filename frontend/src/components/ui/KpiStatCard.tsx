import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KpiStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const KpiStatCard: React.FC<KpiStatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  trend,
}) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </span>
          )}
          <div className={`p-2 rounded-lg ${iconBgColor} ${iconColor}`}>
            {icon}
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{value}</div>
      {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </Card>
  );
};

