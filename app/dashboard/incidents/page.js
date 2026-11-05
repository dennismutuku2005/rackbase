"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRackbase } from "@/context/RackbaseContext";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import ReportIncidentModal from "@/components/modals/ReportIncidentModal";
import UpdateIncidentModal from "@/components/modals/UpdateIncidentModal";
import {
  AlertOctagon,
  Plus,
  Search,
  Router,
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
  Flame,
  UserCheck,
} from "lucide-react";

export default function IncidentsPage() {
  const { incidents, routers, accessPoints } = useRackbase();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [activeIncident, setActiveIncident] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (severityFilter !== "all" && inc.severity?.toLowerCase() !== severityFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== "all" && inc.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (categoryFilter !== "all" && inc.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          inc.title?.toLowerCase().includes(q) ||
          inc.referenceNumber?.toLowerCase().includes(q) ||
          inc.category?.toLowerCase().includes(q) ||
          inc.assignedTechnician?.toLowerCase().includes(q) ||
          inc.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incidents, severityFilter, statusFilter, categoryFilter, searchQuery]);

  const criticalOpenCount = incidents.filter(
    (i) => i.severity === "Critical" && (i.status === "Open" || i.status === "Investigating")
  ).length;

  const inProgressCount = incidents.filter((i) => i.status === "In Progress").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved" || i.status === "Closed").length;

  const handleQuickUpdate = (inc) => {
    setActiveIncident(inc);
    setUpdateModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Incident management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, triage and resolve network equipment outages, hardware faults and configuration anomalies
          </p>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Report incident
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100/90 p-3.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold flex-shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Total logged</div>
            <div className="text-lg font-bold text-slate-800">{incidents.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 p-3.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-rose-600 font-medium">Critical unresolved</div>
            <div className="text-lg font-bold text-rose-700">{criticalOpenCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 p-3.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-amber-600 font-medium">In progress</div>
            <div className="text-lg font-bold text-amber-700">{inProgressCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/90 p-3.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-600 font-medium">Resolved</div>
            <div className="text-lg font-bold text-emerald-700">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-3.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-5 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, ref #, technician, description..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="In Progress">In progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All categories</option>
            <option value="Connectivity Problem">Connectivity</option>
            <option value="Hardware Fault">Hardware fault</option>
            <option value="Router Configuration Error">Config error</option>
            <option value="Power Failure">Power failure</option>
            <option value="Network Instability">Network instability</option>
            <option value="Device Overheating">Overheating</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        {filteredIncidents.length === 0 ? (
          <EmptyState
            title="No incidents found"
            description="All systems nominal or your search filter returned zero records."
            actionLabel="Report incident"
            onAction={() => setReportModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 border-b border-slate-100 font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Title & reference</th>
                  <th className="px-3 py-2.5">Affected equipment</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Severity</th>
                  <th className="px-3 py-2.5">Technician</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.map((inc) => {
                  const affectedRouter = routers.find((r) => r.id === inc.affectedRouterId);
                  const affectedAp = accessPoints.find((ap) => ap.id === inc.affectedApId);

                  return (
                    <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/incidents/view?id=${inc.id}`}
                          className="font-medium text-slate-900 hover:text-emerald-600 transition-colors block"
                        >
                          <div className="truncate max-w-[220px]">{inc.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {inc.referenceNumber}
                          </div>
                        </Link>
                      </td>

                      <td className="px-3 py-3">
                        {affectedAp ? (
                          <div>
                            <Link
                              href={`/dashboard/access-points/view?id=${affectedAp.id}`}
                              className="font-medium text-slate-800 hover:text-emerald-600 inline-flex items-center gap-1"
                            >
                              <Radio className="w-3 h-3 text-purple-600" />
                              {affectedAp.name}
                            </Link>
                            <div className="text-[10px] text-slate-400">
                              via {affectedRouter?.name}
                            </div>
                          </div>
                        ) : affectedRouter ? (
                          <Link
                            href={`/dashboard/routers/view?id=${affectedRouter.id}`}
                            className="font-medium text-slate-800 hover:text-emerald-600 inline-flex items-center gap-1"
                          >
                            <Router className="w-3 h-3 text-amber-600" />
                            {affectedRouter.name}
                          </Link>
                        ) : (
                          <span className="text-slate-400">Core</span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-600 font-medium">
                        <span className="truncate max-w-[130px] block">{inc.category}</span>
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge status={inc.severity} size="sm" />
                      </td>

                      <td className="px-3 py-3 text-slate-700">
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[100px]">{inc.assignedTechnician || "Unassigned"}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {inc.dateReported?.split(" ")[0]}
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickUpdate(inc)}
                            className="px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                          <Link
                            href={`/dashboard/incidents/view?id=${inc.id}`}
                            className="p-1 text-slate-400 hover:text-emerald-600"
                            title="Open incident"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-xs border-t border-slate-200 z-30">
        <button
          onClick={() => setReportModalOpen(true)}
          className="w-full h-10 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Report incident
        </button>
      </div>

      {/* Modals */}
      <ReportIncidentModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      <UpdateIncidentModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        incident={activeIncident}
      />
    </div>
  );
}
