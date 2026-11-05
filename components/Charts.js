"use client";

import React, { useState } from "react";

export function NetworkAvailabilityLineChart() {
  // 15-day rolling daily availability data
  const data = [
    { day: "Oct 20", label: "Oct 20", shortLabel: "Oct 20", value: 99.45, incidents: 1 },
    { day: "Oct 21", label: "Oct 21", shortLabel: "21", value: 99.62, incidents: 1 },
    { day: "Oct 22", label: "Oct 22", shortLabel: "22", value: 99.85, incidents: 0 },
    { day: "Oct 23", label: "Oct 23", shortLabel: "23", value: 99.91, incidents: 0 },
    { day: "Oct 24", label: "Oct 24", shortLabel: "24", value: 99.78, incidents: 1 },
    { day: "Oct 25", label: "Oct 25", shortLabel: "25", value: 99.89, incidents: 0 },
    { day: "Oct 26", label: "Oct 26", shortLabel: "26", value: 99.96, incidents: 0 },
    { day: "Oct 27", label: "Oct 27", shortLabel: "27", value: 99.72, incidents: 1 },
    { day: "Oct 28", label: "Oct 28", shortLabel: "28", value: 99.86, incidents: 0 },
    { day: "Oct 29", label: "Oct 29", shortLabel: "29", value: 99.93, incidents: 0 },
    { day: "Oct 30", label: "Oct 30", shortLabel: "30", value: 99.91, incidents: 0 },
    { day: "Oct 31", label: "Oct 31", shortLabel: "31", value: 99.82, incidents: 1 },
    { day: "Nov 01", label: "Nov 01", shortLabel: "Nov 1", value: 99.95, incidents: 0 },
    { day: "Nov 02", label: "Nov 02", shortLabel: "2", value: 99.98, incidents: 0 },
    { day: "Nov 03", label: "Today", shortLabel: "Today", value: 99.94, incidents: 0 },
  ];

  const [hoveredPoint, setHoveredPoint] = useState(14); // Default to current day (index 14)

  // SVG dimensions
  const width = 500;
  const height = 150;
  const paddingX = 14;
  const paddingY = 20;

  const minVal = 99.0;
  const maxVal = 100.0;

  const getX = (index) => paddingX + (index * (width - 2 * paddingX)) / (data.length - 1);
  const getY = (value) =>
    height - paddingY - 14 - ((value - minVal) / (maxVal - minVal)) * (height - 2 * paddingY - 20);

  // Generate SVG path points
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }));

  // Smooth cubic bezier spline
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  const activeData = data[hoveredPoint] || data[data.length - 1];
  const activeX = getX(hoveredPoint);
  const activeY = getY(activeData.value);

  // Compute 15-day average uptime
  const avgUptime = (
    data.reduce((acc, curr) => acc + curr.value, 0) / data.length
  ).toFixed(2);

  // Tooltip pill left percentage bounded to prevent clipping
  const tooltipLeftPercent = Math.max(14, Math.min(86, (activeX / width) * 100));

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800">Network availability trend</h3>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Last 15 days
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Daily uptime percentage across all POPs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            15-day average: <strong className="text-slate-800">{avgUptime}%</strong>
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            {activeData.value}% uptime
          </span>
        </div>
      </div>

      <div className="relative pt-4">
        {/* Floating Tooltip Pill */}
        <div
          className="absolute -top-1 pointer-events-none transition-all duration-150 transform -translate-x-1/2 flex flex-col items-center z-10"
          style={{ left: `${tooltipLeftPercent}%` }}
        >
          <div className="bg-slate-900 text-white text-[10px] font-medium px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-bold">{activeData.value}%</span>
            <span className="text-slate-400">•</span>
            <span>{activeData.day}</span>
            <span className="text-slate-400">•</span>
            <span className={activeData.incidents > 0 ? "text-amber-300" : "text-slate-300"}>
              {activeData.incidents === 0
                ? "0 faults"
                : `${activeData.incidents} ${activeData.incidents === 1 ? "fault" : "faults"}`}
            </span>
          </div>
          <div className="w-1.5 h-1.5 bg-slate-900 transform rotate-45 -mt-0.5" />
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible select-none">
          <defs>
            <linearGradient id="availabilityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal grid lines */}
          {[99.0, 99.5, 100.0].map((gridVal) => {
            const y = getY(gridVal);
            return (
              <line
                key={gridVal}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Vertical active indicator guide line */}
          <line
            x1={activeX}
            y1={paddingY}
            x2={activeX}
            y2={height - paddingY - 14}
            stroke="#10B981"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.35"
          />

          {/* Area under curve */}
          <path
            d={`${pathD} L ${points[points.length - 1].x},${height - paddingY - 14} L ${points[0].x},${height - paddingY - 14} Z`}
            fill="url(#availabilityGradient)"
          />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke="#10B981" strokeWidth="2.25" strokeLinecap="round" />

          {/* Interactive Column Hover Zones & Data Dots */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.value);
            const isHovered = hoveredPoint === i;
            const isMajorDate = i === 0 || i === 2 || i === 4 || i === 6 || i === 8 || i === 10 || i === 12 || i === 14;

            return (
              <g
                key={d.day}
                onMouseEnter={() => setHoveredPoint(i)}
                className="cursor-pointer"
              >
                {/* Invisible hover slice for seamless interaction */}
                <rect
                  x={cx - width / (data.length * 2)}
                  y={0}
                  width={width / data.length}
                  height={height}
                  fill="transparent"
                />

                {/* Point dot */}
                {isHovered ? (
                  <>
                    <circle cx={cx} cy={cy} r={7.5} fill="#10B981" fillOpacity="0.25" />
                    <circle cx={cx} cy={cy} r={4} fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                  </>
                ) : (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={2.5}
                    fill={isMajorDate ? "#10B981" : "#A7F3D0"}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                )}

                {/* X-axis Date Labels */}
                {(isMajorDate || isHovered) && (
                  <text
                    x={cx}
                    y={height - 2}
                    textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                    className={`text-[10px] font-sans transition-colors ${
                      isHovered
                        ? "fill-emerald-700 font-bold"
                        : "fill-slate-400 font-medium"
                    }`}
                  >
                    {d.shortLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function EquipmentDistributionBarChart({ routers = [], accessPoints = [] }) {
  const [hoveredBar, setHoveredBar] = useState(0);

  // Group AP count per main router
  const chartData = routers.map((r) => {
    const apCount = accessPoints.filter((ap) => ap.parentRouterId === r.id).length;
    return {
      name: r.name.replace("Main Router ", ""),
      fullName: r.name,
      apCount,
      ip: r.ipAddress,
      status: r.status,
    };
  });

  const maxVal = Math.max(...chartData.map((d) => d.apCount), 5);
  const activeItem = chartData[hoveredBar] || chartData[0];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800">Equipment distribution</h3>
          <p className="text-[11px] text-slate-400">Connected access points by main router</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            {activeItem?.apCount || 0} APs on {activeItem?.name}
          </span>
        </div>
      </div>

      <div className="pt-4">
        <div className="h-36 flex items-end justify-between gap-3 px-2 pb-2">
          {chartData.map((item, idx) => {
            const heightPercent = maxVal > 0 ? (item.apCount / maxVal) * 100 : 10;
            const isSelected = hoveredBar === idx;

            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredBar(idx)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Tooltip value */}
                <div
                  className={`text-[10px] font-bold mb-1 transition-opacity ${
                    isSelected ? "text-emerald-700 opacity-100" : "text-slate-400 opacity-80"
                  }`}
                >
                  {item.apCount}
                </div>

                {/* Vertical Bar */}
                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-md overflow-hidden flex items-end h-[100px]">
                  <div
                    className={`w-full rounded-t-md transition-all duration-200 ${
                      isSelected ? "bg-emerald-600" : "bg-emerald-500/80 group-hover:bg-emerald-600"
                    }`}
                    style={{ height: `${Math.max(heightPercent, 12)}%` }}
                  />
                </div>

                {/* X-axis Label */}
                <span
                  className={`text-[10px] font-medium mt-2 text-center truncate max-w-[70px] ${
                    isSelected ? "text-slate-900 font-bold" : "text-slate-500"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

