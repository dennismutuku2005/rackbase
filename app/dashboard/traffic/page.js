"use client";

import React, { useState, useEffect } from "react";
import { useRackbase } from "@/context/RackbaseContext";
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Cpu,
  HardDrive,
  Clock,
  Zap,
  RefreshCw,
  Sliders,
  ChevronDown,
  Gauge,
  Thermometer,
} from "lucide-react";

export default function TrafficPage() {
  const { routers = [], routerInterfaces = [] } = useRackbase();
  const [selectedRouterId, setSelectedRouterId] = useState(routers[0]?.id || "RTR-001");
  const [refreshInterval, setRefreshInterval] = useState(2); // seconds
  const [isLive, setIsLive] = useState(true);

  // Dynamic live traffic points for smooth SVG graph
  const [trafficSeries, setTrafficSeries] = useState([
    { time: "18:50", rx: 420, tx: 110 },
    { time: "18:51", rx: 460, tx: 125 },
    { time: "18:52", rx: 390, tx: 98 },
    { time: "18:53", rx: 510, tx: 140 },
    { time: "18:54", rx: 580, tx: 165 },
    { time: "18:55", rx: 540, tx: 150 },
    { time: "18:56", rx: 620, tx: 180 },
    { time: "18:57", rx: 690, tx: 210 },
    { time: "18:58", rx: 640, tx: 195 },
    { time: "18:59", rx: 710, tx: 220 },
    { time: "19:00", rx: 680, tx: 205 },
    { time: "19:01", rx: 745, tx: 235 },
  ]);

  const [currentRx, setCurrentRx] = useState(745.4);
  const [currentTx, setCurrentTx] = useState(235.8);
  const [cpuLoad, setCpuLoad] = useState(24);

  // Live simulation tick
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const deltaRx = (Math.random() - 0.48) * 40;
      const deltaTx = (Math.random() - 0.48) * 20;
      const newRx = Math.max(300, Math.min(920, currentRx + deltaRx));
      const newTx = Math.max(80, Math.min(350, currentTx + deltaTx));
      const newCpu = Math.max(15, Math.min(48, Math.round(cpuLoad + (Math.random() - 0.5) * 4)));

      setCurrentRx(parseFloat(newRx.toFixed(1)));
      setCurrentTx(parseFloat(newTx.toFixed(1)));
      setCpuLoad(newCpu);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds()
      ).padStart(2, "0")}`;

      setTrafficSeries((prev) => {
        const next = [...prev.slice(1), { time: timeStr, rx: Math.round(newRx), tx: Math.round(newTx) }];
        return next;
      });
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isLive, refreshInterval, currentRx, currentTx, cpuLoad]);

  const currentRouter = routers.find((r) => r.id === selectedRouterId) || routers[0];

  // SVG dimensions for the main bandwidth graph
  const width = 800;
  const height = 240;
  const maxVal = 1000; // 1000 Mbps scale

  const getPoints = (key) =>
    trafficSeries
      .map((item, idx) => {
        const x = (idx / (trafficSeries.length - 1)) * width;
        const y = height - (item[key] / maxVal) * (height - 20);
        return `${x},${y}`;
      })
      .join(" ");

  const rxPoints = getPoints("rx");
  const txPoints = getPoints("tx");
  const rxArea = `0,${height} ${rxPoints} ${width},${height}`;
  const txArea = `0,${height} ${txPoints} ${width},${height}`;

  // Peak index for the designer floating pill
  const peakIdx = trafficSeries.reduce((maxI, cur, i, arr) => (cur.rx > arr[maxI].rx ? i : maxI), 0);
  const peakX = (peakIdx / (trafficSeries.length - 1)) * width;
  const peakY = height - (trafficSeries[peakIdx].rx / maxVal) * (height - 20);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live traffic & bandwidth monitor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time RouterOS throughput stream, processor telemetry, and active interface bandwidth
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Router Selection Dropdown */}
          <div className="relative inline-block">
            <select
              value={selectedRouterId}
              onChange={(e) => setSelectedRouterId(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-2 pr-10 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
            >
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.model})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Live Stream Switch */}
          <button
            onClick={() => setIsLive(!isLive)}
            type="button"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isLive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500" : "bg-slate-400"}`}></span>
            {isLive ? "Live stream active" : "Paused"}
          </button>
        </div>
      </div>

      {/* Telemetry Headline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Aggregate Download */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Aggregate download (Rx)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ArrowDownCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{currentRx}</span>
            <span className="text-xs font-medium text-slate-500">Mbps</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Peak: 890.2 Mbps today</p>
        </div>

        {/* Aggregate Upload */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Aggregate upload (Tx)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ArrowUpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{currentTx}</span>
            <span className="text-xs font-medium text-slate-500">Mbps</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Peak: 310.5 Mbps today</p>
        </div>

        {/* CPU Processor Load */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">CPU core load</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{cpuLoad}%</span>
            <span className="text-xs text-emerald-600 font-medium">Optimal</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${cpuLoad}%` }}
            ></div>
          </div>
        </div>

        {/* System Uptime */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">RouterOS uptime</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">142d 18h</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Kernel {currentRouter?.routerOsVersion || "v7.14.2"}</p>
        </div>
      </div>

      {/* Main Bandwidth Graph Card (Executive Designer Reference Style) */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-slate-900">Total gateway throughput</h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dual-stream real-time RouterOS traffic (Green: Rx Ingress | Amber: Tx Egress)
            </p>
          </div>

          {/* Legend and Interval */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Download (Rx)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span> Upload (Tx)
              </span>
            </div>

            <div className="border-l border-slate-200 pl-4">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value={1}>1s tick</option>
                <option value={2}>2s tick</option>
                <option value={5}>5s tick</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live SVG Graph Canvas */}
        <div className="relative mt-6 h-64 w-full">
          {/* Subtle Y-Axis Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
            <div className="border-b border-dashed border-slate-100 pb-1 flex justify-between">
              <span>1000 Mbps (1 Gbps)</span>
            </div>
            <div className="border-b border-dashed border-slate-100 pb-1 flex justify-between">
              <span>750 Mbps</span>
            </div>
            <div className="border-b border-dashed border-slate-100 pb-1 flex justify-between">
              <span>500 Mbps</span>
            </div>
            <div className="border-b border-dashed border-slate-100 pb-1 flex justify-between">
              <span>250 Mbps</span>
            </div>
            <div className="flex justify-between">
              <span>0 Mbps</span>
            </div>
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              {/* Emerald Gradient */}
              <linearGradient id="liveTrafficRxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
              </linearGradient>

              {/* Amber Gradient */}
              <linearGradient id="liveTrafficTxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Ingress / Download Area */}
            <polygon points={rxArea} fill="url(#liveTrafficRxGrad)" />
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={rxPoints}
            />

            {/* Egress / Upload Area */}
            <polygon points={txArea} fill="url(#liveTrafficTxGrad)" />
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={txPoints}
            />

            {/* Peak Floating Tooltip Pill (Designer Style) */}
            <line
              x1={peakX}
              y1={peakY}
              x2={peakX}
              y2={height}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
            <circle cx={peakX} cy={peakY} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          </svg>

          {/* Peak Tooltip Pill element (Executive Designer Reference Style) */}
          <div
            className="absolute -top-3 transform -translate-x-1/2 pointer-events-none transition-all duration-300"
            style={{ left: `${(peakIdx / (trafficSeries.length - 1)) * 100}%` }}
          >
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Peak: {trafficSeries[peakIdx]?.rx} Mbps</span>
            </div>
          </div>
        </div>

        {/* X-Axis Timeline */}
        <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono mt-4 pt-2 border-t border-slate-100">
          {trafficSeries.map((t, idx) => (
            <span key={idx} className={idx % 2 === 0 ? "block" : "hidden sm:block"}>
              {t.time}
            </span>
          ))}
        </div>
      </div>

      {/* RouterOS Health Telemetry & Hardware Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memory & Storage Gauges */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-slate-500" /> Memory & storage allocation
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium">RAM (DDR4 4GB)</span>
                <span className="text-slate-800 font-semibold font-mono">724 MB / 4096 MB (17.6%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "17.6%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium">Flash storage (NAND)</span>
                <span className="text-slate-800 font-semibold font-mono">18.4 MB / 128 MB (14.3%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "14.3%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium">FastPath packet engine</span>
                <span className="text-emerald-600 font-semibold font-mono">Active (HW Offloaded)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Thermometer className="w-4 h-4 text-amber-500" />
              <span>Temp: 38.4°C</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>Voltage: 24.1V</span>
            </div>
          </div>
        </div>

        {/* Per-Interface Live Stream Rates */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" /> Per-interface live throughput stream
            </h3>
            <span className="text-xs text-slate-400 font-mono">Updated in real-time</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {routerInterfaces.slice(0, 5).map((iface) => (
              <div key={iface.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${iface.status === "Up" ? "bg-emerald-500" : "bg-slate-300"}`}
                  ></span>
                  <div>
                    <span className="text-xs font-semibold text-slate-800">{iface.name}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">{iface.comment}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono">
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <ArrowDownCircle className="w-3 h-3" /> {iface.rxRate}
                  </span>
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <ArrowUpCircle className="w-3 h-3" /> {iface.txRate}
                  </span>
                  <span className="text-slate-400 text-[11px] w-16 text-right">{iface.linkSpeed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

