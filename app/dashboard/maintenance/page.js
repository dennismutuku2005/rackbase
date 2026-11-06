"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRackbase } from "@/context/RackbaseContext";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import MetricCard from "@/components/MetricCard";
import AddMaintenanceModal from "@/components/modals/AddMaintenanceModal";
import {
  Wrench,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  Check,
} from "lucide-react";

export default function MaintenancePage() {
  const { maintenance, updateMaintenance } = useRackbase();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMaintenance = useMemo(() => {
    return maintenance.filter((m) => {
      if (statusFilter !== "all" && m.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.title?.toLowerCase().includes(q) ||
          m.equipmentName?.toLowerCase().includes(q) ||
          m.technician?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.id?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [maintenance, statusFilter, searchQuery]);

  const scheduledCount = maintenance.filter((m) => m.status === "Scheduled").length;
  const inProgressCount = maintenance.filter((m) => m.status === "In Progress").length;
  const completedCount = maintenance.filter((m) => m.status === "Completed").length;

  const handleMarkCompleted = (id) => {
    updateMaintenance(id, {
      status: "Completed",
    });
  };

  const handleSetInProgress = (id) => {
    updateMaintenance(id, {
      status: "In Progress",
    });
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Maintenance management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule preventive equipment servicing, track firmware upgrades, and maintain service logs
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule maintenance
        </button>
      </div>

      {/* KPI Stats Strip (Dashboard Executive Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          title="Total scheduled windows"
          value={`${maintenance.length}`}
          subtext="firmware, towers & links"
          trend="+5.0%"
          trendType="up"
          color="sky"
          data={[2, 3, 3, 4, 3, 4, maintenance.length]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["6", "4", "2", "0"]}
          activePoint={6}
          activeLabel={`${maintenance.length} Events`}
        />
        <MetricCard
          title="Upcoming scheduled"
          value={`${scheduledCount}`}
          subtext="queued maintenance tasks"
          trend="Planned"
          trendType="up"
          color="amber"
          data={[1, 2, 2, 3, 2, 2, scheduledCount]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["4", "3", "2", "1"]}
          activePoint={6}
          activeLabel={`${scheduledCount} Queued`}
        />
        <MetricCard
          title="In progress windows"
          value={`${inProgressCount}`}
          subtext="live operations underway"
          trend={inProgressCount === 0 ? "Clear" : "Active"}
          trendType="neutral"
          color={inProgressCount === 0 ? "emerald" : "amber"}
          data={[0, 1, 0, 1, 0, 1, inProgressCount]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["2", "1", "1", "0"]}
          activePoint={6}
          activeLabel={`${inProgressCount} Active`}
        />
        <MetricCard
          title="Completed records"
          value={`${completedCount}`}
          subtext="verified sign-offs"
          trend="+100%"
          trendType="up"
          color="emerald"
          data={[1, 2, 2, 3, 3, 4, completedCount]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["5", "3", "2", "0"]}
          activePoint={6}
          activeLabel={`${completedCount} Done`}
        />
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-3.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, equipment, technician or notes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="all">All maintenance ({maintenance.length})</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        {filteredMaintenance.length === 0 ? (
          <EmptyState
            title="No maintenance records found"
            description="Schedule routine servicing, RouterOS upgrades, or mast alignment."
            actionLabel="Schedule maintenance"
            onAction={() => setAddModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 border-b border-slate-100 font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Procedure & title</th>
                  <th className="px-3 py-2.5">Target equipment</th>
                  <th className="px-3 py-2.5">Technician</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Quick action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{m.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.id}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 max-w-sm truncate">
                        {m.description}
                      </div>
                    </td>

                    <td className="px-3 py-3 text-slate-700">
                      <div className="font-medium text-slate-900">{m.equipmentName}</div>
                      <div className="text-[10px] text-slate-400">
                        {m.equipmentType} • {m.equipmentId}
                      </div>
                    </td>

                    <td className="px-3 py-3 text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        {m.technician}
                      </div>
                    </td>

                    <td className="px-3 py-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      <div>{m.scheduledDate}</div>
                      {m.completedDate && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Done: {m.completedDate}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge status={m.status} size="sm" />
                    </td>

                    <td className="px-4 py-3 text-right">
                      {m.status !== "Completed" ? (
                        <div className="inline-flex items-center gap-1.5">
                          {m.status === "Scheduled" && (
                            <button
                              onClick={() => handleSetInProgress(m.id)}
                              className="px-2 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded transition-colors cursor-pointer"
                            >
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => handleMarkCompleted(m.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            Complete
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Filed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddMaintenanceModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
