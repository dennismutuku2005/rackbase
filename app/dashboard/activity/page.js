"use client";

import React, { useState, useMemo } from "react";
import { useRackbase } from "@/context/RackbaseContext";
import EmptyState from "@/components/EmptyState";
import {
  History,
  Search,
  User,
  Router,
  Radio,
  AlertOctagon,
  Wrench,
} from "lucide-react";

export default function ActivityLogsPage() {
  const { activityLogs } = useRackbase();

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      if (actionFilter !== "all" && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.description?.toLowerCase().includes(q) ||
          log.user?.toLowerCase().includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          log.targetId?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activityLogs, actionFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-base font-bold text-slate-900">Activity logs</h2>
          <p className="text-xs text-slate-500">
            Audit trail of equipment registrations, status updates, and incident resolutions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, operator, or device ID..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Filter action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="all">All actions ({activityLogs.length})</option>
            <option value="Router">Router actions</option>
            <option value="AP">Access point actions</option>
            <option value="Incident">Incident actions</option>
            <option value="Maintenance">Maintenance actions</option>
            <option value="Equipment">Equipment updates</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No activity records found"
            description="No actions matched your current search filters."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              let iconBg = "bg-slate-100 text-slate-600";
              let Icon = History;

              if (log.action.includes("Router")) {
                iconBg = "bg-amber-50 text-amber-700";
                Icon = Router;
              } else if (log.action.includes("AP")) {
                iconBg = "bg-purple-50 text-purple-700";
                Icon = Radio;
              } else if (log.action.includes("Incident")) {
                iconBg = "bg-rose-50 text-rose-600";
                Icon = AlertOctagon;
              } else if (log.action.includes("Maintenance")) {
                iconBg = "bg-sky-50 text-sky-600";
                Icon = Wrench;
              }

              return (
                <div
                  key={log.id}
                  className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-800">{log.action}</span>
                        {log.targetId && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {log.targetId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-slate-600">
                          <User className="w-3 h-3 text-slate-400" />
                          {log.user}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{log.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
