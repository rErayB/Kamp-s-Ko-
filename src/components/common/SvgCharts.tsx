import React from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  unit?: string;
  height?: number;
}

export const SimpleLineChart: React.FC<LineChartProps> = ({
  data,
  color = '#4f46e5',
  unit = 'Net',
  height = 160
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        Veri bulunmuyor
      </div>
    );
  }

  const values = data.map(d => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 10);
  const range = maxVal - minVal || 1;

  const width = 600;
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2);
    const y = height - padding - ((d.value - minVal) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.length === 1
    ? `M ${padding} ${points[0].y} L ${width - padding} ${points[0].y}`
    : points.reduce((acc, curr, idx) => {
        return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
      }, '');

  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible font-sans select-none" style={{ minWidth: 320 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = height - padding - pct * chartHeight;
          const val = (minVal + pct * range).toFixed(1);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={padding - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaD && <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />}

        {/* Stroke line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points & Labels */}
        {points.map((pt, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke={color} strokeWidth="3" className="transition-transform group-hover:scale-125" />
            <text x={pt.x} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748b" className="font-medium">
              {pt.label}
            </text>
            {/* Tooltip value */}
            <g className="opacity-90 group-hover:opacity-100 transition-opacity">
              <rect x={pt.x - 22} y={pt.y - 24} width="44" height="18" rx="4" fill="#0f172a" />
              <text x={pt.x} y={pt.y - 12} textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="600">
                {pt.value} {unit}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
};

interface BarChartProps {
  data: { label: string; value: number; max?: number; color?: string }[];
}

export const HorizontalBarChart: React.FC<BarChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const max = item.max || 40;
        const pct = Math.min(100, Math.max(0, (item.value / max) * 100));
        const barColor = item.color || '#4f46e5';

        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">{item.label}</span>
              <span className="text-slate-500 font-mono">
                <span className="font-bold text-slate-900">{item.value.toFixed(1)}</span> / {max} Net
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
