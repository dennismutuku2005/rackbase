"use client";

import React, { useState, useId } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function MetricCard({
  title,
  value,
  subtext,
  trend = "+4.2%",
  trendType = "up", // "up" | "down" | "neutral"
  color = "emerald", // "emerald" | "amber" | "sky" | "purple" | "rose"
  data = [20, 24, 22, 28, 35, 30, 38],
  labels = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  yTicks = ["40", "30", "20", "10"],
  activePoint = 5,
  activeLabel = "30 Units",
}) {
  const [hoveredIdx, setHoveredIdx] = useState(activePoint);
  const reactId = useId().replace(/:/g, "");

  // Color schemes matching the designer reference
  const colorMap = {
    emerald: {
      primary: "#10B981",
      secondary: "#34D399",
      bgPill: "bg-emerald-50 text-emerald-700 border-emerald-100",
      activeDot: "#10B981",
      gradientStart: "#10B981",
    },
    amber: {
      primary: "#F59E0B",
      secondary: "#FBBF24",
      bgPill: "bg-amber-50 text-amber-700 border-amber-100",
      activeDot: "#F59E0B",
      gradientStart: "#F59E0B",
    },
    sky: {
      primary: "#0EA5E9",
      secondary: "#38BDF8",
      bgPill: "bg-sky-50 text-sky-700 border-sky-100",
      activeDot: "#0EA5E9",
      gradientStart: "#0EA5E9",
    },
    purple: {
      primary: "#8B5CF6",
      secondary: "#A78BFA",
      bgPill: "bg-purple-50 text-purple-700 border-purple-100",
      activeDot: "#8B5CF6",
      gradientStart: "#8B5CF6",
    },
    rose: {
      primary: "#EF4444",
      secondary: "#F87171",
      bgPill: "bg-rose-50 text-rose-700 border-rose-100",
      activeDot: "#EF4444",
      gradientStart: "#EF4444",
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  // Chart coordinate math
  const width = 320;
  const height = 96;
  const padLeft = 24;
  const padRight = 10;
  const padTop = 22;
  const padBottom = 18;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const minVal = Math.min(...data) * 0.85;
  const maxVal = Math.max(...data) * 1.15 || 1;

  const getX = (i) => padLeft + (i / (data.length - 1)) * plotWidth;
  const getY = (v) => padTop + plotHeight - ((v - minVal) / (maxVal - minVal)) * plotHeight;

  const points = data.map((val, i) => ({ x: getX(i), y: getY(val) }));

  // Smooth cubic spline calculation
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

  const areaD = `${pathD} L ${points[points.length - 1].x},${padTop + plotHeight} L ${points[0].x},${padTop + plotHeight} Z`;

  const activeIdxSafe = Math.max(0, Math.min(data.length - 1, hoveredIdx));
  const activeX = getX(activeIdxSafe);
  const activeY = getY(data[activeIdxSafe]);
  const currentActiveVal = activeLabel || `${data[activeIdxSafe]}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100/90 p-4 sm:p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:border-slate-200/90 transition-all duration-200 flex flex-col justify-between min-w-0">
      {/* Card Header: Label & Trend Pill */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-400 truncate tracking-wide">
            {title}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${scheme.bgPill} flex-shrink-0`}
          >
            {trendType === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : trendType === "down" ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {trend}
          </span>
        </div>

        {/* Big Headline Stat */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-none">
            {value}
          </span>
          {subtext && (
            <span className="text-[11px] text-slate-400 truncate">
              {subtext}
            </span>
          )}
        </div>
      </div>

      {/* Embedded Area Sparkline with Grid & Floating Highlight Pill */}
      <div className="mt-2.5 -mx-1 select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 overflow-visible"
        >
          <defs>
            <linearGradient
              id={`gradient-${reactId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={scheme.gradientStart} stopOpacity="0.32" />
              <stop offset="100%" stopColor={scheme.gradientStart} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Left Y-Axis Tick Labels (Muted, fine) */}
          {yTicks.map((tick, idx) => {
            const yPos = padTop + (idx * plotHeight) / (yTicks.length - 1);
            return (
              <text
                key={idx}
                x={padLeft - 6}
                y={yPos + 3}
                textAnchor="end"
                className="text-[8px] font-sans fill-slate-300 font-medium select-none"
              >
                {tick}
              </text>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill={`url(#gradient-${reactId})`} />

          {/* Smooth Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={scheme.primary}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Vertical Active Indicator Line */}
          <line
            x1={activeX}
            y1={padTop + 4}
            x2={activeX}
            y2={padTop + plotHeight}
            stroke={scheme.primary}
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.45"
          />

          {/* Active Highlight Dot on Line */}
          <circle
            cx={activeX}
            cy={activeY}
            r="3.5"
            fill={scheme.primary}
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Floating Pill Tooltip above Active Peak */}
          <g
            transform={`translate(${Math.max(34, Math.min(width - 34, activeX))}, ${Math.max(12, activeY - 14)})`}
            className="transition-transform duration-150"
          >
            <rect
              x="-28"
              y="-10"
              width="56"
              height="15"
              rx="7.5"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="0.85"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
            />
            <circle cx="-18" cy="-2.5" r="2.5" fill={scheme.primary} />
            <text
              x="-12"
              y="0.5"
              fill="#1E293B"
              fontSize="7.5"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              {currentActiveVal}
            </text>
          </g>

          {/* X-Axis Day Labels & Interactive Columns */}
          {labels.map((day, idx) => {
            const xPos = getX(idx);
            const isHover = hoveredIdx === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="cursor-pointer"
              >
                {/* Transparent hit area */}
                <rect
                  x={xPos - plotWidth / (labels.length * 2)}
                  y={padTop}
                  width={plotWidth / labels.length}
                  height={plotHeight + padBottom}
                  fill="transparent"
                />
                <text
                  x={xPos}
                  y={height - 2}
                  textAnchor="middle"
                  className={`text-[8.5px] font-sans transition-colors ${
                    isHover
                      ? "fill-slate-800 font-bold"
                      : "fill-slate-400 font-medium"
                  }`}
                >
                  {day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
