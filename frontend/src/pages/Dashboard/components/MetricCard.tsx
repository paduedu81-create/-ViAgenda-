import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  color?: string;
}

export function MetricCard({
  icon: Icon,
  value,
  label,
  color = '#1D5BD8',
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-sm flex items-center gap-4 flex-1">
      <div
        style={{ color }}
        className="w-14 h-14 rounded-2xl bg-current/10 flex items-center justify-center shrink-0"
      >
        <Icon size={24} className="text-current" />
      </div>

      <div>
        <h3 className="text-2xl font-bold font-plus text-slate-900 leading-tight">
          {value}
        </h3>
        <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

export default MetricCard;
