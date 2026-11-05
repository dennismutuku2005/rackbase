"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRackbase } from "@/context/RackbaseContext";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import { NetworkAvailabilityLineChart, EquipmentDistributionBarChart } from "@/components/Charts";
import RegisterRouterModal from "@/components/modals/RegisterRouterModal";
import RegisterApModal from "@/components/modals/RegisterApModal";
import ReportIncidentModal from "@/components/modals/ReportIncidentModal";
import {
  Boxes,
  Router,
  Radio,
  AlertOctagon,
  Plus,
  ArrowUpRight,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function DashboardHomePage() {
  const { routers, accessPoints, otherEquipment, incidents, activityLogs } = useRackbase();

  // Modals
  const [routerModalOpen, setRouterModalOpen] = useState(false);
  const [apModalOpen, setApModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [selectedRouterForAp, setSelectedRouterForAp] = useState("");

  // Hierarchy toggle states
  const [expandedRouters, setExpandedRouters] = useState({
    "RTR-001": true,
    "RTR-002": true,
    "RTR-003": true,
    "RTR-004": true,
  });

  const toggleRouterExpand = (routerId) => {
    setExpandedRouters((prev) => ({
      ...prev,
      [routerId]: !prev[routerId],
    }));
  };

  // Metrics calculations
  const totalEquipment = routers.length + accessPoints.length + otherEquipment.length;
  const openIncidents = incidents.filter(
    (i) => i.status === "Open" || i.status === "Investigating" || i.status === "In Progress"
  );
  const onlineEquipmentCount = [
    ...routers,
    ...accessPoints,
    ...otherEquipment,
  ].filter((e) => (e.status || "").toLowerCase() === "online").length;

  const offlineEquipmentCount = [
    ...routers,
    ...accessPoints,
    ...otherEquipment,
  ].filter((e) => (e.status || "").toLowerCase() === "offline").length;

  const warningEquipmentCount = totalEquipment - (onlineEquipmentCount + offlineEquipmentCount);
  const onlinePercent = totalEquipment > 0 ? Math.round((onlineEquipmentCount / totalEquipment) * 100) : 100;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-base font-bold text-slate-900">Dashboard overview</h2>
          <p className="text-xs text-slate-500">
            Registered MikroTik routers, connected access points and active incident response
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setRouterModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Router className="w-3.5 h-3.5 text-slate-500" />
            New router
          </button>
          <button
            onClick={() => {
              setSelectedRouterForAp("");
              setApModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Radio className="w-3.5 h-3.5 text-slate-500" />
            New access point
          </button>
          <button
            onClick={() => setIncidentModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Report fault
          </button>
        </div>
      </div>

      {/* Metric Cards - strictly 2-column grid on mobile phones! */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Total equipment"
          value={totalEquipment}
          subtext={`${onlinePercent}% operational`}
          icon={Boxes}
          variant="sky"
        />
        <MetricCard
          title="Main routers"
          value={routers.length}
          subtext={`${routers.filter((r) => r.status === "Online").length} online`}
          icon={Router}
          variant="amber"
        />
        <MetricCard
          title="Access points"
          value={accessPoints.length}
          subtext={`Across ${routers.length} routers`}
          icon={Radio}
          variant="purple"
        />
        <MetricCard
          title="Open incidents"
          value={openIncidents.length}
          subtext={
            openIncidents.some((i) => i.severity === "Critical")
              ? "1 critical pending"
              : "0 critical faults"
          }
          icon={AlertOctagon}
          variant={openIncidents.length > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Network Availability & Equipment Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetworkAvailabilityLineChart />
        <EquipmentDistributionBarChart routers={routers} accessPoints={accessPoints} />
      </div>

      {/* Network Infrastructure Overview - Hierarchical Relationship */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Network infrastructure hierarchy
              </h3>
              <p className="text-[11px] text-slate-400">
                Main MikroTik routers and their registered downstream access points
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/routers"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            View all routers <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Hierarchical Router List */}
        <div className="divide-y divide-slate-100">
          {routers.map((router) => {
            const connectedAps = accessPoints.filter((ap) => ap.parentRouterId === router.id);
            const isExpanded = expandedRouters[router.id] !== false;

            return (
              <div key={router.id} className="transition-colors">
                {/* Parent Router Row */}
                <div
                  onClick={() => toggleRouterExpand(router.id)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Router className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/dashboard/routers/view?id=${router.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-bold text-slate-900 hover:text-emerald-600 truncate transition-colors"
                        >
                          {router.name}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                          ({router.routerIdentity})
                        </span>
                        <StatusBadge status={router.status} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="font-mono text-emerald-700 font-medium">
                          {router.ipAddress}
                        </span>
                        <span>•</span>
                        <span className="truncate">{router.model}</span>
                        <span>•</span>
                        <span className="truncate hidden md:inline">{router.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block text-[11px]">
                      <span className="font-semibold text-slate-700">
                        {connectedAps.length}
                      </span>
                      <span className="text-slate-400 ml-1">
                        {connectedAps.length === 1 ? "AP" : "APs"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRouterForAp(router.id);
                        setApModalOpen(true);
                      }}
                      className="px-2 py-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Add AP
                    </button>
                  </div>
                </div>

                {/* Connected APs (Sub-tree) */}
                {isExpanded && (
                  <div className="bg-[#FAFBFD] px-4 py-2.5 pb-3 sm:pl-11 border-t border-slate-100">
                    {connectedAps.length === 0 ? (
                      <div className="py-1 text-xs text-slate-400 italic">
                        No access points registered under this router yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {connectedAps.map((ap) => (
                          <Link
                            key={ap.id}
                            href={`/dashboard/access-points/view?id=${ap.id}`}
                            className="p-2.5 bg-white rounded-lg border border-slate-200/80 hover:border-emerald-300 transition-all flex items-start gap-2 group min-w-0"
                          >
                            <div className="w-5 h-5 rounded bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Radio className="w-3 h-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                                  {ap.name}
                                </span>
                                <StatusBadge status={ap.status} size="sm" />
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {ap.model}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {ap.physicalLocation} • {ap.frequency || "5GHz"}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Incidents & Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Incidents (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">Recent reported incidents</h3>
                <p className="text-[11px] text-slate-400">
                  Equipment faults and connectivity issues
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/incidents"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 border-b border-slate-100 text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Title</th>
                  <th className="px-3 py-2.5">Equipment</th>
                  <th className="px-3 py-2.5">Severity</th>
                  <th className="px-3 py-2.5">Reported</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.slice(0, 4).map((inc) => {
                  const affectedRouter = routers.find((r) => r.id === inc.affectedRouterId);
                  const affectedAp = accessPoints.find((ap) => ap.id === inc.affectedApId);

                  return (
                    <tr
                      key={inc.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => (window.location.href = `/dashboard/incidents/view?id=${inc.id}`)}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900">
                        <div className="truncate max-w-[200px]">{inc.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {inc.referenceNumber}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        <div className="font-medium text-slate-800 truncate max-w-[130px]">
                          {affectedAp ? affectedAp.name : affectedRouter?.name || "Core"}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={inc.severity} size="sm" />
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px] whitespace-nowrap font-mono">
                        {inc.dateReported?.split(" ")[0]}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipment Status Distribution (1 Column) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800">Operational status</h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {onlinePercent}% nominal
              </span>
            </div>

            <div className="space-y-3 mt-3.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Online / Operational
                  </span>
                  <span className="font-semibold text-slate-800">{onlineEquipmentCount} units</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${totalEquipment > 0 ? (onlineEquipmentCount / totalEquipment) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Warning / Degraded
                  </span>
                  <span className="font-semibold text-slate-800">{warningEquipmentCount} units</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${totalEquipment > 0 ? (warningEquipmentCount / totalEquipment) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Offline / Outage
                  </span>
                  <span className="font-semibold text-slate-800">{offlineEquipmentCount} units</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${totalEquipment > 0 ? (offlineEquipmentCount / totalEquipment) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-500 leading-relaxed mt-4">
            <span className="font-semibold text-slate-700 block mb-0.5">RouterOS topology</span>
            Every access point is managed by its parent routerboard. Configuration changes and incidents inherit this relationship.
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <h3 className="text-xs font-bold text-slate-800">Recent activity</h3>
              <p className="text-[11px] text-slate-400">
                Audit log of equipment changes and incident resolution
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/activity"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            Full activity log <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {activityLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-slate-800 font-medium">{log.description}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {log.action} • {log.user}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <RegisterRouterModal isOpen={routerModalOpen} onClose={() => setRouterModalOpen(false)} />
      <RegisterApModal
        isOpen={apModalOpen}
        onClose={() => setApModalOpen(false)}
        defaultParentRouterId={selectedRouterForAp}
      />
      <ReportIncidentModal isOpen={incidentModalOpen} onClose={() => setIncidentModalOpen(false)} />
    </div>
  );
}
