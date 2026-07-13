import React from 'react';

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function SparklineChart({
  data = [10, 40, 20, 50, 30, 80, 45],
  color = "#10B981", // Emerald
  height = 36,
  width = 100
}: SparklineChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height + 2; // small offset to avoid truncation
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex items-center">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}
