import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = "text-emerald-500",
  trackColor = "text-slate-100",
  label
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          className={trackColor}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={`${color} transition-all duration-500 ease-out`}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Central Label */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-lg font-black text-slate-800 leading-none">
          {Math.round(percentage)}%
        </span>
        {label && (
          <span className="text-[9px] font-black uppercase text-slate-400 mt-1 leading-none tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
