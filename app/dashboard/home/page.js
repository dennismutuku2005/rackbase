"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRackbase } from "@/context/RackbaseContext";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import {
  NetworkAvailabilityLineChart,
  TopRoutersCard,
  PopInfrastructureCard,
  RadioSpectrumDonutCard,
} from "@/components/Charts";
import RegisterRouterModal from "@/components/modals/RegisterRouterModal";
import RegisterApModal from "@/components/modals/RegisterApModal";
import ReportIncidentModal from "@/components/modals/ReportIncidentModal";
import {
  Boxes,
  Router,
  Radio,
  AlertOctagon,
  ArrowUpRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

export default function DashboardHomePage() {
  const { routers, accessPoints, otherEquipment, incidents, activityLogs, user } =
    useRackbase();

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

  const onlinePercent =
    totalEquipment > 0 ? Math.round((onlineEquipmentCount / totalEquipment) * 100) : 100;

  // Real-world simulated sparkline profiles for metric cards
  const equipmentSparkline = [22, 24, 25, 27, 28, 28, totalEquipment];
  const routersSparkline = [4, 4, 5, 5, 6, 6, routers.length];
  const apsSparkline = [14, 15, 16, 17, 18, 18, accessPoints.length];
  const uptimeSparkline = [99.6, 99.7, 99.8, 99.9, 99.7, 99.9, 99.94];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Operational dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time MikroTik routerboards, wireless radio sectors, and active incident response
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setRouterModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <Router className="w-3.5 h-3.5 text-slate-500" />
            New router
          </button>
          <button
            onClick={() => {
              setSelectedRouterForAp("");
              setApModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <Radio className="w-3.5 h-3.5 text-slate-500" />
            New access point
          </button>
          <button
            onClick={() => setIncidentModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Report fault
          </button>
        </div>
      </div>

      {/* Row 1: Executive Metric Cards with Embedded Area Graphs (Designer Reference) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          title="Total equipment"
          value={`${totalEquipment}`}
          subtext="units in service"
          trend="+5.2%"
          trendType="up"
          color="emerald"
          data={equipmentSparkline}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["35", "25", "15", "5"]}
          activePoint={6}
          activeLabel={`${totalEquipment} Units`}
        />
        <MetricCard
          title="Core routers"
          value={`${routers.length}`}
          subtext="RouterOS boards"
          trend="+2.5%"
          trendType="up"
          color="amber"
          data={routersSparkline}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["8", "6", "4", "2"]}
          activePoint={6}
          activeLabel={`${routers.length} RTRs`}
        />
        <MetricCard
          title="Access points"
          value={`${accessPoints.length}`}
          subtext="wireless radios"
          trend="+8.4%"
          trendType="up"
          color="sky"
          data={apsSparkline}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["24", "18", "12", "6"]}
          activePoint={6}
          activeLabel={`${accessPoints.length} APs`}
        />
        <MetricCard
          title="System uptime"
          value={`${onlinePercent}%`}
          subtext={
            openIncidents.length === 0
              ? "0 active outages"
              : `${openIncidents.length} open tickets`
          }
          trend={openIncidents.length === 0 ? "100%" : "-1.5%"}
          trendType={openIncidents.length === 0 ? "up" : "down"}
          color={openIncidents.length === 0 ? "emerald" : "rose"}
          data={uptimeSparkline}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["100%", "99.8%", "99.6%", "99.4%"]}
          activePoint={6}
          activeLabel={`${onlinePercent}% Uptime`}
        />
      </div>

      {/* Row 2: Dual Wave Line Chart & Top Routers Card (Designer Reference Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <NetworkAvailabilityLineChart />
        </div>
        <div className="lg:col-span-1">
          <TopRoutersCard routers={routers} accessPoints={accessPoints} />
        </div>
      </div>

      {/* Row 3: POP Infrastructure Load & Radio Spectrum Donut (Designer Reference Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PopInfrastructureCard />
        <RadioSpectrumDonutCard accessPoints={accessPoints} />
      </div>

      {/* Row 4: Network Infrastructure Overview - Hierarchical Relationship */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Network infrastructure hierarchy
              </h3>
              <p className="text-[11px] text-slate-400">
                Core MikroTik routers and their registered downstream wireless access points
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/routers"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            View all routers <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Hierarchical Router List */}
        <div className="divide-y divide-slate-100/80">
          {routers.map((router) => {
            const connectedAps = accessPoints.filter((ap) => ap.parentRouterId === router.id);
            const isExpanded = expandedRouters[router.id] !== false;

            return (
              <div key={router.id} className="transition-colors">
                {/* Parent Router Row */}
                <div
                  onClick={() => toggleRouterExpand(router.id)}
                  className="px-5 py-3 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Router className="w-4 h-4" />
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
                        <span className="font-mono text-emerald-700 font-semibold">
                          {router.ipAddress}
                        </span>
                        <span>•</span>
                        <span className="truncate">{router.model}</span>
                        <span>•</span>
                        <span className="text-slate-400 truncate">{router.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-800">
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
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      Add AP
                    </button>
                  </div>
                </div>

                {/* Connected APs (Sub-tree) */}
                {isExpanded && (
                  <div className="bg-[#FAFBFD] px-5 py-3 sm:pl-14 border-t border-slate-100">
                    {connectedAps.length === 0 ? (
                      <div className="py-2 text-xs text-slate-400 italic">
                        No access points registered under this router yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {connectedAps.map((ap) => (
                          <Link
                            key={ap.id}
                            href={`/dashboard/access-points/view?id=${ap.id}`}
                            className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all flex items-start gap-2.5 group min-w-0"
                          >
                            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Radio className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                                  {ap.name}
                                </span>
                                <StatusBadge status={ap.status} size="sm" />
                              </div>
                              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                {ap.model}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
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

      {/* Row 5: Recent Outage Incidents & Operator Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Incidents (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent reported incidents</h3>
                <p className="text-[11px] text-slate-400">
                  Equipment faults and connectivity issues
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/incidents"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 font-medium">Title</th>
                  <th className="py-2.5 font-medium">Severity</th>
                  <th className="py-2.5 font-medium">Reported</th>
                  <th className="py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {incidents.slice(0, 4).map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/dashboard/incidents/view?id=${inc.id}`)}
                  >
                    <td className="py-2.5 font-medium text-slate-900">
                      <div className="truncate max-w-[220px] font-semibold">{inc.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {inc.referenceNumber}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={inc.severity} size="sm" />
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap font-mono">
                      {inc.dateReported?.split(" ")[0]}
                    </td>
                    <td className="py-2.5 text-right">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Audit (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Operator activity</h3>
                  <p className="text-[11px] text-slate-400">Real-time audit log</p>
                </div>
              </div>
              <Link
                href="/dashboard/activity"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-50 mt-1">
              {activityLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-slate-800 font-medium block truncate">
                      {log.description}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {log.user} • {log.timestamp?.split(" ")[1] || "Just now"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
