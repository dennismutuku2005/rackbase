"use client";

import React, { useState, useMemo } from "react";
import { useRackbase } from "@/context/RackbaseContext";
import {
  Wifi,
  Radio,
  Search,
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
  Signal,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sliders,
  ChevronDown,
} from "lucide-react";

export default function WirelessPage() {
  const { wirelessClients = [], accessPoints = [], addToast } = useRackbase();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApFilter, setSelectedApFilter] = useState("all");
  const [signalFilter, setSignalFilter] = useState("all");

  const totalClients = wirelessClients.length;
  const excellentClients = wirelessClients.filter((c) => c.signalDbm >= -65).length;
  const goodClients = wirelessClients.filter((c) => c.signalDbm < -65 && c.signalDbm >= -75).length;
  const fairClients = wirelessClients.filter((c) => c.signalDbm < -75).length;

  const filteredClients = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return (wirelessClients || []).filter((client) => {
      if (!client) return false;

      const mac = (client.macAddress || client.mac || "").toLowerCase();
      const ip = (client.ipAddress || "").toLowerCase();
      const ap = (client.apName || "").toLowerCase();
      const name = (client.clientName || client.hostname || "").toLowerCase();

      const matchesSearch =
        !q ||
        mac.includes(q) ||
        ip.includes(q) ||
        ap.includes(q) ||
        name.includes(q);

      const matchesAp = selectedApFilter === "all" || client.apName === selectedApFilter;

      let matchesSignal = true;
      const sig = typeof client.signalDbm === "number" ? client.signalDbm : -70;
      if (signalFilter === "excellent") matchesSignal = sig >= -65;
      else if (signalFilter === "good") matchesSignal = sig < -65 && sig >= -75;
      else if (signalFilter === "fair") matchesSignal = sig < -75;

      return matchesSearch && matchesAp && matchesSignal;
    });
  }, [wirelessClients, searchQuery, selectedApFilter, signalFilter]);

  const handleDeauth = (mac, name) => {
    addToast(`Deauthenticated station ${name || mac} - reconnecting...`, "info");
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Wireless clients & registration table
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active CPE stations, RSSI signal levels, CCQ connection quality, and negotiated radio MCS rates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => addToast("Wireless registration table refreshed")}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" /> Refresh clients
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Connected stations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalClients}</span>
            <span className="text-xs text-emerald-600 font-medium">Active CPEs</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Registered on {accessPoints.length} AP Sectors</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Excellent signal (&gt; -65 dBm)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{excellentClients}</span>
            <span className="text-xs text-slate-500">stations</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">High MCS modulation indices</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Good signal (-65 to -75)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Signal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{goodClients}</span>
            <span className="text-xs text-amber-600 font-medium">stations</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Stable throughput links</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sub-optimal (&lt; -75 dBm)</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{fairClients}</span>
            <span className="text-xs text-red-600 font-medium">attention required</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Check antenna alignment</p>
        </div>
      </div>

      {/* Signal Quality Distribution Bar */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
          <h2 className="text-sm font-semibold text-slate-900">RF signal distribution spectrum</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Excellent ({-65}dBm or better)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Good ({-65} to {-75}dBm)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Low (&lt; {-75}dBm)
            </span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full"
            style={{ width: `${(excellentClients / (totalClients || 1)) * 100}%` }}
          ></div>
          <div
            className="bg-amber-400 h-full"
            style={{ width: `${(goodClients / (totalClients || 1)) * 100}%` }}
          ></div>
          <div
            className="bg-rose-400 h-full"
            style={{ width: `${(fairClients / (totalClients || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Registered Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Registered CPE stations</h3>
            <p className="text-xs text-slate-500 mt-0.5">RouterOS wireless registration telemetry</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MAC, IP, AP..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-52"
              />
            </div>

            {/* AP Filter */}
            <div className="relative inline-block">
              <select
                value={selectedApFilter}
                onChange={(e) => setSelectedApFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="all">All APs</option>
                {accessPoints.map((ap) => (
                  <option key={ap.id} value={ap.name}>
                    {ap.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Signal Quality Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setSignalFilter("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  signalFilter === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSignalFilter("excellent")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  signalFilter === "excellent" ? "bg-white text-emerald-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                &gt; -65 dBm
              </button>
              <button
                onClick={() => setSignalFilter("fair")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  signalFilter === "fair" ? "bg-white text-rose-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                &lt; -75 dBm
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3 px-4">Station / MAC</th>
                <th className="py-3 px-4">Connected AP</th>
                <th className="py-3 px-4">IP address</th>
                <th className="py-3 px-4">Signal (dBm)</th>
                <th className="py-3 px-4">SNR</th>
                <th className="py-3 px-4">CCQ</th>
                <th className="py-3 px-4">Tx rate</th>
                <th className="py-3 px-4">Rx rate</th>
                <th className="py-3 px-4">Uptime</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No wireless stations found matching your search.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isExcellent = client.signalDbm >= -65;
                  const isGood = client.signalDbm < -65 && client.signalDbm >= -75;

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 font-mono text-xs">
                            {client.macAddress || client.mac || "—"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {client.clientName || client.hostname || "CPE station"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Radio className="w-3.5 h-3.5 text-slate-400" />
                          <span>{client.apName || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{client.ipAddress || "—"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                            isExcellent
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : isGood
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {client.signalDbm ?? -70} dBm
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{client.snr ?? 30} dB</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 font-mono">{client.ccq ?? 95}%</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-600">{client.txRate || "—"}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600">{client.rxRate || "—"}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{client.uptime || "—"}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() =>
                            handleDeauth(
                              client.macAddress || client.mac,
                              client.clientName || client.hostname
                            )
                          }
                          type="button"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                          Deauth
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

