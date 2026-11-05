"use client";

import React, { useState, useMemo } from "react";
import { useRackbase } from "@/context/RackbaseContext";
import {
  Server,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Zap,
  Power,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function InterfacesPage() {
  const { routerInterfaces = [], toggleInterfaceStatus, routers = [] } = useRackbase();
  const [selectedRouterId, setSelectedRouterId] = useState(routers[0]?.id || "RTR-001");
  const [selectedPortId, setSelectedPortId] = useState(routerInterfaces[0]?.id || "IF-01");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const currentRouter = routers.find((r) => r.id === selectedRouterId) || routers[0];
  const selectedPort = routerInterfaces.find((p) => p.id === selectedPortId) || routerInterfaces[0];

  const filteredPorts = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return (routerInterfaces || []).filter((p) => {
      if (!p) return false;
      const name = (p.name || "").toLowerCase();
      const comment = (p.comment || "").toLowerCase();
      const type = (p.type || "").toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        comment.includes(q) ||
        type.includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "up" && p.status === "Up") ||
        (statusFilter === "down" && p.status === "Down");
      return matchesSearch && matchesStatus;
    });
  }, [routerInterfaces, searchQuery, statusFilter]);

  const totalPorts = routerInterfaces.length;
  const upPorts = routerInterfaces.filter((p) => p.status === "Up").length;
  const poePorts = routerInterfaces.filter((p) => p.poeOut && p.poeOut !== "Off").length;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Active ports & switch matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical Routerboard front-panel, link speeds, PoE output, and interface telemetry
          </p>
        </div>

        {/* Router Selection Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-500">Device</label>
          <div className="relative inline-block">
            <select
              value={selectedRouterId}
              onChange={(e) => setSelectedRouterId(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-2.5 pr-10 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
            >
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.model})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total interfaces</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalPorts}</span>
            <span className="text-xs text-slate-500">configured</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">8x RJ45 GbE + 2x SFP+ 10G</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Link status up</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{upPorts}</span>
            <span className="text-xs text-slate-500">/ {totalPorts} ports</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {Math.round((upPorts / (totalPorts || 1)) * 100)}% ports active
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">PoE PSE delivery</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{poePorts}</span>
            <span className="text-xs text-amber-600 font-medium">ports active</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">48V Passive & 802.3at PoE</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Switch chip</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">Marvell 98DX</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Hardware offloading active</p>
        </div>
      </div>

      {/* Routerboard Physical Port Matrix (Visual Chassis) */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Physical front-panel matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any port to inspect real-time packet counters, speed negotiation, and duplex
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Link active
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Disconnected
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> PoE active
            </span>
          </div>
        </div>

        {/* Chassis Front Panel Graphic (Light Executive Design) */}
        <div className="mt-6 p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="font-mono text-xs font-semibold text-slate-800 tracking-wider">
                {currentRouter?.name || "RouterOS CCR2004"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500">Voltage: 24.2V</span>
              <span className="text-[11px] font-mono text-slate-500">Temp: 38°C</span>
            </div>
          </div>

          {/* Port Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
            {routerInterfaces.map((port) => {
              const isSelected = port.id === selectedPortId;
              const isUp = port.status === "Up";
              const isSfp = port.type.includes("SFP");
              const hasPoe = port.poeOut && port.poeOut !== "Off";

              return (
                <button
                  key={port.id}
                  onClick={() => setSelectedPortId(port.id)}
                  type="button"
                  className={`relative flex flex-col items-center p-3 rounded-xl transition-all text-left ${
                    isSelected
                      ? "bg-white ring-2 ring-emerald-500 border border-emerald-500 shadow-md scale-105"
                      : "bg-white hover:bg-slate-50/90 border border-slate-200 shadow-xs"
                  }`}
                >
                  {/* LED Indicators */}
                  <div className="w-full flex items-center justify-between mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isUp ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    ></span>
                    {hasPoe && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    )}
                  </div>

                  {/* Port Jack Shape (RJ45 or SFP) */}
                  <div
                    className={`w-10 h-7 rounded border flex items-center justify-center font-mono text-[9px] font-bold ${
                      isSfp
                        ? "border-amber-300 bg-amber-50 text-amber-700"
                        : "border-slate-300 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isSfp ? "SFP+" : "RJ45"}
                  </div>

                  {/* Port Name & Link */}
                  <span className="mt-2 text-[11px] font-semibold text-slate-800 truncate w-full text-center">
                    {port.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {isUp ? port.linkSpeed : "Down"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Port Inspector & Details */}
      {selectedPort && (
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  selectedPort.status === "Up" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                }`}
              >
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-slate-900">{selectedPort.name}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedPort.status === "Up"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {selectedPort.status}
                  </span>
                  {selectedPort.poeOut && selectedPort.poeOut !== "Off" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                      <Zap className="w-3 h-3" /> PoE {selectedPort.poeOut}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{selectedPort.comment || "No comment"}</p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleInterfaceStatus(selectedPort.id)}
                type="button"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedPort.status === "Up"
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {selectedPort.status === "Up" ? "Disable port" : "Enable port"}
              </button>
            </div>
          </div>

          {/* Metric Details Grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Link speed</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block font-mono">{selectedPort.linkSpeed}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">MAC address</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block font-mono text-xs">{selectedPort.mac}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Current download (Rx)</span>
              <span className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <ArrowDownCircle className="w-3.5 h-3.5" /> {selectedPort.rxRate}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Current upload (Tx)</span>
              <span className="text-sm font-bold text-blue-600 mt-1 flex items-center gap-1 font-mono">
                <ArrowUpCircle className="w-3.5 h-3.5" /> {selectedPort.txRate}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">MTU / L2MTU</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block font-mono">
                {selectedPort.mtu} / {selectedPort.l2mtu || 1592}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Cumulative traffic</span>
              <span className="text-xs font-semibold text-slate-700 mt-1 block font-mono">
                Rx: {selectedPort.rxBytes} | Tx: {selectedPort.txBytes}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interfaces Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">All router interfaces</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live interface counters and link configuration</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search interfaces..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-52"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("up")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "up" ? "bg-white text-emerald-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Up ({upPorts})
              </button>
              <button
                onClick={() => setStatusFilter("down")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "down" ? "bg-white text-slate-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Down ({totalPorts - upPorts})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3 px-4">Interface</th>
                <th className="py-3 px-4">Comment / Role</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Link speed</th>
                <th className="py-3 px-4">Rx rate</th>
                <th className="py-3 px-4">Tx rate</th>
                <th className="py-3 px-4">PoE</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredPorts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No interfaces match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredPorts.map((port) => (
                  <tr
                    key={port.id}
                    onClick={() => setSelectedPortId(port.id)}
                    className={`cursor-pointer hover:bg-slate-50/70 transition-colors ${
                      port.id === selectedPortId ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            port.status === "Up" ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        ></span>
                        {port.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{port.comment || "-"}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{port.type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          port.status === "Up"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {port.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{port.linkSpeed}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">{port.rxRate}</td>
                    <td className="py-3 px-4 font-mono text-blue-600">{port.txRate}</td>
                    <td className="py-3 px-4">
                      {port.poeOut && port.poeOut !== "Off" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                          <Zap className="w-3 h-3" /> {port.poeOut}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleInterfaceStatus(port.id)}
                        type="button"
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          port.status === "Up"
                            ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {port.status === "Up" ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

