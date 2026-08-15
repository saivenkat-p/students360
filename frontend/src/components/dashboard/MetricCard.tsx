import React from 'react';

interface MetricCardProps {
  title: string;
  count: string | number;
  total?: number;
  statusLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string; // e.g. 'bg-purple-100/70'
  iconBgColor: string; // e.g. 'bg-purple-500'
  textColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  count,
  total,
  statusLabel,
  icon: Icon,
  bgColor,
  iconBgColor,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`${bgColor} p-4 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.98]`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${iconBgColor} text-white flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-600 mb-1">{title}</h3>
        <div className="flex items-baseline space-x-1">
          <span className="text-xl font-bold text-slate-900 leading-none">
            {count}
          </span>
          {total !== undefined && (
            <span className="text-xs font-semibold text-slate-500">
              / {total}
            </span>
          )}
        </div>

        {statusLabel && (
          <span className="inline-block mt-2 text-[11px] font-medium text-slate-500">
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
};
