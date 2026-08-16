import React from 'react';

interface HeatmapData {
  date: string;
  count: number;
}

interface HeatmapProps {
  data: HeatmapData[];
  months?: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data, months = 3 }) => {
  // Simple implementation of a heatmap grid
  // Generating a grid for the last `months` * 30 days
  const days = Array.from({ length: months * 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (months * 30 - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const item = data.find(x => x.date === dateStr);
    return {
      date: dateStr,
      count: item ? item.count : 0
    };
  });

  const getColor = (count: number) => {
    if (count === 0) return 'bg-[var(--color-bg-elevated)]';
    if (count < 10) return 'bg-[var(--color-accent)]/30';
    if (count < 25) return 'bg-[var(--color-accent)]/60';
    if (count < 50) return 'bg-[var(--color-accent)]/80';
    return 'bg-[var(--color-accent)]';
  };

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-1 min-w-max">
        {days.map((day) => (
          <div
            key={day.date}
            className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors hover:ring-1 ring-[var(--color-text-primary)] cursor-pointer group relative`}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[var(--color-bg-surface)] border border-[var(--color-bg-elevated)] text-[var(--color-text-primary)] text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
              {day.date}: {day.count} reviews
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
