"use client";

import React, { useState, useMemo } from "react";
import { useRackbase } from "@/context/RackbaseContext";
import {
  Route,
  Network,
  Search,
  Plus,
  Trash2,
  Terminal,
  Play,
  CheckCircle2,
  Globe,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function RoutingPage() {
  const { routingTable = [], dhcpLeases = [], addDhcpLease, removeDhcpLease, addToast } = useRackbase();
  const [activeTab, setActiveTab] = useState("routes"); // "routes" | "dhcp" | "diagnostics"
  const [searchQuery, setSearchQuery] = useState("");
  const [routeTypeFilter, setRouteTypeFilter] = useState("all");

  // Diagnostics state
  const [pingTarget, setPingTarget] = useState("8.8.8.8");
  const [pingRunning, setPingRunning] = useState(false);
  const [pingResults, setPingResults] = useState(null);

  // New Lease Modal state
  const [newLeaseModal, setNewLeaseModal] = useState(false);
  const [leaseForm, setLeaseForm] = useState({
    ipAddress: "",
    macAddress: "",
    hostName: "",
    server: "dhcp-lan",
    comment: "",
  });

  const filteredRoutes = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return (routingTable || []).filter((r) => {
      if (!r) return false;
      const dst = (r.dstAddress || "").toLowerCase();
      const gw = (r.gateway || "").toLowerCase();
      const iface = (r.interface || "").toLowerCase();
      const type = (r.type || "").toLowerCase();

      const matchesSearch =
        !q ||
        dst.includes(q) ||
        gw.includes(q) ||
        iface.includes(q) ||
        type.includes(q);

      const matchesType =
        routeTypeFilter === "all" ||
        (routeTypeFilter === "static" && r.type?.includes("Static")) ||
        (routeTypeFilter === "connected" && r.type?.includes("Connected")) ||
        (routeTypeFilter === "dynamic" && (r.type?.includes("OSPF") || r.type?.includes("BGP")));

      return matchesSearch && matchesType;
    });
  }, [routingTable, searchQuery, routeTypeFilter]);

  const filteredLeases = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return (dhcpLeases || []).filter((l) => {
      if (!l) return false;
      const ip = (l.ipAddress || "").toLowerCase();
      const mac = (l.macAddress || "").toLowerCase();
      const host = (l.hostName || l.hostname || "").toLowerCase();
      const comment = (l.comment || "").toLowerCase();

      return (
        !q ||
        ip.includes(q) ||
        mac.includes(q) ||
        host.includes(q) ||
        comment.includes(q)
      );
    });
  }, [dhcpLeases, searchQuery]);

  const runPingTest = () => {
    if (!pingTarget) return;
    setPingRunning(true);
    setPingResults(null);

    setTimeout(() => {
      const avg = Math.floor(Math.random() * 12) + 4;
      const min = Math.max(2, avg - 2);
      const max = avg + 4;
      setPingResults({
        target: pingTarget,
        transmitted: 4,
        received: 4,
        loss: "0%",
        times: [min, avg - 1, avg + 1, max],
        min: `${min}ms`,
        avg: `${avg}ms`,
        max: `${max}ms`,
      });
      setPingRunning(false);
    }, 1200);
  };

  const handleCreateLease = (e) => {
    e.preventDefault();
    if (!leaseForm.ipAddress || !leaseForm.macAddress) {
      addToast("IP and MAC address are required", "error");
      return;
    }
    addDhcpLease({
      ...leaseForm,
      type: "Static",
    });
    setNewLeaseModal(false);
    setLeaseForm({ ipAddress: "", macAddress: "", hostName: "", server: "dhcp-lan", comment: "" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IP routing & DHCP server</h1>
          <p className="text-sm text-slate-500 mt-1">
            RouterOS routing table, static DHCP reservations, and ICMP diagnostic probe
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => {
              setActiveTab("routes");
              setSearchQuery("");
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "routes"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Routing table ({routingTable.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("dhcp");
              setSearchQuery("");
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "dhcp"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            DHCP leases ({dhcpLeases.length})
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "diagnostics"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ping diagnostics
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active routes</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Route className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{routingTable.length}</span>
            <span className="text-xs text-emerald-600 font-medium">FIB active</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">1 Default WAN + Connected</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">DHCP leased IPs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{dhcpLeases.length}</span>
            <span className="text-xs text-slate-500">bindings</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Pool: 192.168.10.100-200</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Default gateway</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 font-mono">197.232.88.1</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1 font-mono">via sfp-plus1 (Fiber)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Routing protocols</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">OSPFv3 & BGP</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">AS65001 • Peering Up</p>
        </div>
      </div>

      {/* TAB 1: Routing Table */}
      {activeTab === "routes" && (
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Forwarding information base (FIB)</h3>
              <p className="text-xs text-slate-500 mt-0.5">RouterOS active IP routing table</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prefix, gateway..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-52"
                />
              </div>

              {/* Route Type Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setRouteTypeFilter("all")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    routeTypeFilter === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRouteTypeFilter("static")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    routeTypeFilter === "static" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Static
                </button>
                <button
                  onClick={() => setRouteTypeFilter("connected")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    routeTypeFilter === "connected" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Connected
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Dst. address (Prefix)</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Outgoing interface</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Type / Protocol</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredRoutes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 font-mono text-xs">{r.dstAddress}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{r.gateway}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {r.interface}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{r.distance}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          r.type.includes("Connected")
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : r.type.includes("Static")
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{r.comment || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DHCP Leases */}
      {activeTab === "dhcp" && (
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">DHCP server client leases</h3>
              <p className="text-xs text-slate-500 mt-0.5">Active IP address assignments and static bindings</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search IP, MAC, Host..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-52"
                />
              </div>

              {/* Add Static Lease Button */}
              <button
                onClick={() => setNewLeaseModal(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Static reservation
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">IP address</th>
                  <th className="py-3 px-4">MAC address</th>
                  <th className="py-3 px-4">Client hostname</th>
                  <th className="py-3 px-4">Server pool</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expires after</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredLeases.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 font-mono text-xs">{l.ipAddress}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{l.macAddress}</td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">{l.hostName || "-"}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{l.server}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          l.type === "Static"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {l.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{l.expiresAfter}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => removeDhcpLease(l.id)}
                        type="button"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Remove lease"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Diagnostics Tool (Ping & ICMP) */}
      {activeTab === "diagnostics" && (
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-6">
          <div className="pb-5 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" /> MikroTik ICMP ping probe & traceroute
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Execute live ICMP reachability and round-trip delay time tests from the router
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={pingTarget}
                onChange={(e) => setPingTarget(e.target.value)}
                placeholder="Target IP or hostname (e.g. 8.8.8.8)"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <button
              onClick={runPingTest}
              disabled={pingRunning}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
            >
              <Play className="w-3.5 h-3.5" /> {pingRunning ? "Sending ICMP packets..." : "Start ping"}
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span>Quick targets:</span>
            {["8.8.8.8 (Google DNS)", "1.1.1.1 (Cloudflare)", "197.232.88.1 (WAN GW)"].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPingTarget(preset.split(" ")[0])}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-mono text-[11px] text-slate-700 transition-all"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Ping Console Output */}
          <div className="mt-6 bg-slate-950 rounded-2xl p-5 border border-slate-800 text-slate-200 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-[11px]">
              <span>RouterOS terminal simulator</span>
              <span>ICMP 64 bytes</span>
            </div>

            <div className="mt-4 space-y-1.5 text-slate-300">
              {pingRunning ? (
                <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                  <span>Sending 4 ICMP echo requests to {pingTarget}...</span>
                </div>
              ) : pingResults ? (
                <>
                  <p className="text-slate-400">Ping {pingResults.target}: 56 data bytes</p>
                  {pingResults.times.map((ms, idx) => (
                    <p key={idx} className="text-emerald-400">
                      64 bytes from {pingResults.target}: icmp_seq={idx + 1} ttl=58 time={ms}ms
                    </p>
                  ))}
                  <div className="mt-3 pt-3 border-t border-slate-800 text-slate-400">
                    <p>
                      Ping statistics for {pingResults.target}:
                      <br />
                      {pingResults.transmitted} packets transmitted, {pingResults.received} received,{" "}
                      <span className="text-emerald-400">{pingResults.loss} packet loss</span>
                      <br />
                      Round-trip min/avg/max = {pingResults.min}/{pingResults.avg}/{pingResults.max}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-slate-500">Click &apos;Start ping&apos; to measure ICMP response times.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Static Lease Modal */}
      {newLeaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Create static DHCP reservation</h3>
            <p className="text-xs text-slate-500 mt-1">Bind a static IP to a client hardware MAC address</p>

            <form onSubmit={handleCreateLease} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IP address</label>
                <input
                  type="text"
                  required
                  placeholder="192.168.10.150"
                  value={leaseForm.ipAddress}
                  onChange={(e) => setLeaseForm({ ...leaseForm, ipAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">MAC address</label>
                <input
                  type="text"
                  required
                  placeholder="DC:2C:6E:71:22:90"
                  value={leaseForm.macAddress}
                  onChange={(e) => setLeaseForm({ ...leaseForm, macAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Host name / Comment</label>
                <input
                  type="text"
                  placeholder="POP-01-Server"
                  value={leaseForm.hostName}
                  onChange={(e) => setLeaseForm({ ...leaseForm, hostName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewLeaseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                >
                  Save reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

