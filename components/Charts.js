"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Router,
  Radio,
  ExternalLink,
  ChevronDown,
  Layers,
  Activity,
  Server,
  Wifi,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  1. DUAL-WAVE NETWORK PERFORMANCE CHART (Reference: Product Sell / Return) */
/* -------------------------------------------------------------------------- */
export function NetworkAvailabilityLineChart() {
  const [hoveredIdx, setHoveredIdx] = useState(14);
  const [timeRange, setTimeRange] = useState("15d");

  // 15-day rolling timeline matching the reference chart
  const timelineData = [
    { day: "01", date: "Oct 20", uptime: 99.4, traffic: 72 },
    { day: "02", date: "Oct 21", uptime: 99.6, traffic: 76 },
    { day: "03", date: "Oct 22", uptime: 99.8, traffic: 81 },
    { day: "04", date: "Oct 23", uptime: 99.9, traffic: 84 },
    { day: "05", date: "Oct 24", uptime: 99.7, traffic: 78 },
    { day: "06", date: "Oct 25", uptime: 99.9, traffic: 86 },
    { day: "07", date: "Oct 26", uptime: 100.0, traffic: 91 },
    { day: "08", date: "Oct 27", uptime: 99.7, traffic: 75 },
    { day: "09", date: "Oct 28", uptime: 99.8, traffic: 82 },
    { day: "10", date: "Oct 29", uptime: 99.9, traffic: 88 },
    { day: "11", date: "Oct 30", uptime: 99.9, traffic: 85 },
    { day: "12", date: "Oct 31", uptime: 99.8, traffic: 79 },
    { day: "13", date: "Nov 01", uptime: 99.9, traffic: 89 },
    { day: "14", date: "Nov 02", uptime: 100.0, traffic: 94 },
    { day: "15", date: "Today", uptime: 99.94, traffic: 92 },
  ];

  const width = 640;
  const height = 190;
  const padLeft = 32;
  const padRight = 12;
  const padTop = 26;
  const padBottom = 24;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Coordinate scales
  const getX = (i) => padLeft + (i / (timelineData.length - 1)) * plotWidth;
  // Uptime: 99.0% -> 100.2%
  const getUptimeY = (v) =>
    padTop + plotHeight - ((v - 99.0) / (100.2 - 99.0)) * plotHeight;
  // Traffic: 50% -> 100%
  const getTrafficY = (v) =>
    padTop + plotHeight - ((v - 50) / (105 - 50)) * plotHeight;

  // Spline generator
  const createSpline = (getYFn, key) => {
    const pts = timelineData.map((d, i) => ({ x: getX(i), y: getYFn(d[key]) }));
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return { path, pts };
  };

  const uptimeSpline = createSpline(getUptimeY, "uptime");
  const trafficSpline = createSpline(getTrafficY, "traffic");

  const uptimeArea = `${uptimeSpline.path} L ${uptimeSpline.pts[uptimeSpline.pts.length - 1].x},${padTop + plotHeight} L ${uptimeSpline.pts[0].x},${padTop + plotHeight} Z`;
  const trafficArea = `${trafficSpline.path} L ${trafficSpline.pts[trafficSpline.pts.length - 1].x},${padTop + plotHeight} L ${trafficSpline.pts[0].x},${padTop + plotHeight} Z`;

  const active = timelineData[hoveredIdx] || timelineData[timelineData.length - 1];
  const activeX = getX(hoveredIdx);
  const activeY = getUptimeY(active.uptime);

  return (
    <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all">
      {/* Top Header Row with Title, Main Big Stat & Dropdown Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              Network availability & traffic return
            </h3>
          </div>
          <div className="flex items-baseline gap-2.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              99.82%
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrendingUp className="w-3 h-3" />
              +2.7%
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              overall POP uptime
            </span>
          </div>
        </div>

        {/* Legend Dots & Time Selector */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Radio traffic
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Core availability
            </span>
          </div>

          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="15d">This month</option>
              <option value="7d">This week</option>
              <option value="today">Last 24h</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* SVG Dual Wave Graph */}
      <div className="pt-3 relative select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-48 overflow-visible"
        >
          <defs>
            <linearGradient id="availWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.36" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="trafficWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[99.0, 99.4, 99.8, 100.0].map((val) => {
            const y = getUptimeY(val);
            return (
              <line
                key={val}
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Left Y-axis ticks */}
          {["100%", "99.8%", "99.5%", "99.0%"].map((label, idx) => {
            const y = padTop + (idx * plotHeight) / 3;
            return (
              <text
                key={label}
                x={padLeft - 6}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-slate-300 font-medium font-sans"
              >
                {label}
              </text>
            );
          })}

          {/* Wave 2: Traffic Area (Amber) */}
          <path d={trafficArea} fill="url(#trafficWaveGrad)" />
          <path
            d={trafficSpline.path}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Wave 1: Uptime Area (Emerald) */}
          <path d={uptimeArea} fill="url(#availWaveGrad)" />
          <path
            d={uptimeSpline.path}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Vertical Hover Indicator Line */}
          <line
            x1={activeX}
            y1={padTop}
            x2={activeX}
            y2={padTop + plotHeight}
            stroke="#10B981"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.5"
          />

          {/* Floating Pill on Peak (Reference: 09,412 Return with colored dot) */}
          <g
            transform={`translate(${Math.max(48, Math.min(width - 48, activeX))}, ${Math.max(16, activeY - 14)})`}
            className="transition-transform duration-100"
          >
            <rect
              x="-42"
              y="-11"
              width="84"
              height="18"
              rx="9"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1"
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.08))"
            />
            <circle cx="-30" cy="-2" r="3" fill="#10B981" />
            <text
              x="-22"
              y="1.5"
              fill="#0F172A"
              fontSize="8.5"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              {active.uptime}% Uptime
            </text>
          </g>

          {/* Active Highlight Dot on Line */}
          <circle
            cx={activeX}
            cy={activeY}
            r="4.5"
            fill="#10B981"
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* X-axis tick marks / dates */}
          {timelineData.map((d, i) => {
            const x = getX(i);
            const isHover = hoveredIdx === i;
            return (
              <g
                key={d.day}
                onMouseEnter={() => setHoveredIdx(i)}
                className="cursor-pointer"
              >
                <rect
                  x={x - plotWidth / (timelineData.length * 2)}
                  y={padTop}
                  width={plotWidth / timelineData.length}
                  height={plotHeight + padBottom}
                  fill="transparent"
                />
                <text
                  x={x}
                  y={height - 2}
                  textAnchor="middle"
                  className={`text-[9px] font-sans transition-colors ${
                    isHover
                      ? "fill-slate-900 font-bold"
                      : "fill-slate-400 font-medium"
                  }`}
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  2. TOP ROUTERS CARD (Reference: Top Customer Table)                       */
/* -------------------------------------------------------------------------- */
export function TopRoutersCard({ routers = [], accessPoints = [] }) {
  const topRouters = routers.slice(0, 6).map((r) => {
    const apCount = accessPoints.filter((ap) => ap.parentRouterId === r.id).length;
    return {
      id: r.id,
      name: r.name,
      model: r.model,
      ip: r.ipAddress,
      location: r.location,
      status: r.status,
      apCount,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Core router gateways</h3>
          <p className="text-[11px] text-slate-400">Primary distribution nodes</p>
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            This week
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto pt-2 flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] font-semibold text-slate-400 border-b border-slate-100">
              <th className="pb-2 font-medium">Router ID</th>
              <th className="pb-2 font-medium">Gateway name</th>
              <th className="pb-2 font-medium">Radios</th>
              <th className="pb-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {topRouters.map((router) => (
              <tr key={router.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 font-mono text-[11px] text-slate-500 font-semibold">
                  #{router.id}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                      <Router className="w-3 h-3" />
                    </div>
                    <div className="truncate max-w-[120px]">
                      <span className="font-semibold text-slate-800 block truncate">
                        {router.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {router.model}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Radio className="w-2.5 h-2.5" />
                    {router.apCount} APs
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <Link
                    href={`/dashboard/routers/view?id=${router.id}`}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors inline-block"
                    title="Open router view"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  3. POP INFRASTRUCTURE & PREFERENCES (Reference: User Base by Preferences) */
/* -------------------------------------------------------------------------- */
export function PopInfrastructureCard() {
  const popData = [
    {
      name: "Nairobi Central Core POP",
      hardware: "12 Assets",
      clients: "80.5K",
      progress: 88,
      trend: "+1.2%",
      color: "bg-emerald-500",
    },
    {
      name: "Embakasi East Tower Mast",
      hardware: "8 Assets",
      clients: "42.0K",
      progress: 68,
      trend: "+1.7%",
      color: "bg-amber-500",
    },
    {
      name: "Mombasa Marine Terminal",
      hardware: "5 Assets",
      clients: "24.4K",
      progress: 52,
      trend: "+0.7%",
      color: "bg-sky-500",
    },
    {
      name: "Kisumu Hill Station",
      hardware: "3 Assets",
      clients: "18.2K",
      progress: 38,
      trend: "+0.4%",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            POP infrastructure by traffic & load
          </h3>
          <p className="text-[11px] text-slate-400">Distribution across major POP hubs</p>
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            This month
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </span>
        </div>
      </div>

      {/* Table & Progress Rows */}
      <div className="pt-2 divide-y divide-slate-50">
        {popData.map((pop) => (
          <div key={pop.name} className="py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800 truncate">
                  {pop.name}
                </span>
                <span className="text-[11px] font-mono text-slate-500 ml-2">
                  {pop.clients} clients
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pop.color}`}
                  style={{ width: `${pop.progress}%` }}
                />
              </div>
            </div>

            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">
              <TrendingUp className="w-2.5 h-2.5" />
              {pop.trend}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  4. RADIO SPECTRUM DONUT GAUGE (Reference: Buyers Profile Donut Chart)     */
/* -------------------------------------------------------------------------- */
export function RadioSpectrumDonutCard({ accessPoints = [] }) {
  // Compute spectrum proportions
  const fiveGhz = accessPoints.filter(
    (ap) => !ap.frequency || ap.frequency.includes("5GHz")
  ).length;
  const twoFourGhz = accessPoints.filter(
    (ap) => ap.frequency && ap.frequency.includes("2.4GHz")
  ).length;
  const sixtyGhz = accessPoints.filter(
    (ap) => ap.frequency && ap.frequency.includes("60GHz")
  ).length;

  const total = Math.max(1, fiveGhz + twoFourGhz + sixtyGhz);

  const pct5G = Math.round((fiveGhz / total) * 100);
  const pct24G = Math.round((twoFourGhz / total) * 100);
  const pct60G = 100 - pct5G - pct24G;

  // SVG Donut metrics
  const size = 130;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDash5G = (pct5G / 100) * circumference;
  const strokeDash24G = (pct24G / 100) * circumference;
  const strokeDash60G = (pct60G / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Radio frequency profile</h3>
          <p className="text-[11px] text-slate-400">Spectrum allocation breakdown</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      </div>

      {/* Donut and Legend Row */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Donut SVG with Center Value */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* 5GHz Segment (Emerald) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#10B981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDash5G} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              fill="transparent"
            />
            {/* 2.4GHz Segment (Amber) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F59E0B"
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDash24G} ${circumference}`}
              strokeDashoffset={-strokeDash5G}
              strokeLinecap="round"
              fill="transparent"
            />
            {/* 60GHz Segment (Sky) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#0EA5E9"
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDash60G} ${circumference}`}
              strokeDashoffset={-(strokeDash5G + strokeDash24G)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Text Pill matching reference image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-slate-900 leading-none">
              {total} APs
            </span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">
              100% active
            </span>
          </div>
        </div>

        {/* Legend List matching reference with percentage pills */}
        <div className="space-y-2.5 text-xs w-full sm:w-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700">5GHz ac/ax</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {pct5G}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-medium text-slate-700">2.4GHz b/g/n</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
              {pct24G}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="font-medium text-slate-700">60GHz Wireless</span>
            </div>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
              {pct60G}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  5. EQUIPMENT DISTRIBUTION BAR CHART (Retained for flexible view)          */
/* -------------------------------------------------------------------------- */
export function EquipmentDistributionBarChart({ routers = [], accessPoints = [] }) {
  const [hoveredBar, setHoveredBar] = useState(0);

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
    <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Equipment distribution</h3>
          <p className="text-[11px] text-slate-400">Connected access points per core router</p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
          {activeItem?.apCount || 0} APs on {activeItem?.name}
        </span>
      </div>

      <div className="pt-4">
        <div className="h-40 flex items-end justify-between gap-3 px-2 pb-2">
          {chartData.map((item, idx) => {
            const heightPercent = maxVal > 0 ? (item.apCount / maxVal) * 100 : 10;
            const isSelected = hoveredBar === idx;

            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredBar(idx)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div
                  className={`text-[10px] font-bold mb-1 transition-opacity ${
                    isSelected ? "text-emerald-700 opacity-100" : "text-slate-400 opacity-80"
                  }`}
                >
                  {item.apCount}
                </div>

                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-[110px]">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-emerald-600 shadow-sm"
                        : "bg-emerald-500/80 group-hover:bg-emerald-600"
                    }`}
                    style={{ height: `${Math.max(heightPercent, 14)}%` }}
                  />
                </div>

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
