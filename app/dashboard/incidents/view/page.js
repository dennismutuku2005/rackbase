"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRackbase } from "@/context/RackbaseContext";
import StatusBadge from "@/components/StatusBadge";
import UpdateIncidentModal from "@/components/modals/UpdateIncidentModal";
import {
  AlertOctagon,
  Clock,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Send,
  ShieldAlert,
  ExternalLink,
  Edit2,
  Router,
  Radio,
} from "lucide-react";

function IncidentDetailContent() {
  const searchParams = useSearchParams();
  const { incidents, routers, accessPoints, updateIncidentStatus } = useRackbase();

  const incidentId = searchParams.get("id");
  const incident = incidents.find(
    (i) => i.id === incidentId || i.referenceNumber === incidentId
  );

  const [timelineNote, setTimelineNote] = useState("");
  const [quickStatus, setQuickStatus] = useState("");
  const [resolutionInput, setResolutionInput] = useState("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // Missing or invalid ID handling
  if (!incidentId || !incident) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-8 text-center">
        <h3 className="text-sm font-bold text-slate-800">
          {!incidentId ? "No incident ID specified" : "Incident not found"}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {!incidentId
            ? "Please select a valid incident from the incident register."
            : `No incident record found matching identifier '${incidentId}'.`}
        </p>
        <Link
          href="/dashboard/incidents"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to incidents
        </Link>
      </div>
    );
  }

  const affectedRouter = routers.find((r) => r.id === incident.affectedRouterId);
  const affectedAp = accessPoints.find((ap) => ap.id === incident.affectedApId);

  const handlePostTimelineUpdate = (e) => {
    e.preventDefault();
    if (!timelineNote.trim() && !quickStatus) return;

    const newStatus = quickStatus || incident.status;
    updateIncidentStatus(
      incident.id,
      newStatus,
      timelineNote.trim() || `Status updated to ${newStatus}.`,
      resolutionInput.trim()
    );

    setTimelineNote("");
    setQuickStatus("");
    setResolutionInput("");
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <Link href="/dashboard/incidents" className="hover:text-emerald-600 transition-colors">
              Incidents
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-700 font-mono">{incident.referenceNumber}</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-bold text-slate-900">{incident.title}</h2>
            <StatusBadge status={incident.severity} size="sm" />
            <StatusBadge status={incident.status} size="sm" />
          </div>
        </div>

        {/* Action Button - Full width on mobile */}
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setUpdateModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            Update status and assignment
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Affected Hardware Card */}
          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
            <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Affected infrastructure
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Main Router */}
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80">
                <div className="text-[11px] font-semibold text-amber-800 mb-1 flex items-center gap-1">
                  <Router className="w-3.5 h-3.5" />
                  Parent MikroTik router
                </div>
                {affectedRouter ? (
                  <div>
                    <Link
                      href={`/dashboard/routers/view?id=${affectedRouter.id}`}
                      className="text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{affectedRouter.name}</span>
                      <ExternalLink className="w-3 h-3 text-amber-700 ml-1 flex-shrink-0" />
                    </Link>
                    <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                      {affectedRouter.ipAddress}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                      {affectedRouter.model} • {affectedRouter.location}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No router attached</span>
                )}
              </div>

              {/* Access Point */}
              <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200/80">
                <div className="text-[11px] font-semibold text-purple-800 mb-1 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" />
                  Affected access point
                </div>
                {affectedAp ? (
                  <div>
                    <Link
                      href={`/dashboard/access-points/view?id=${affectedAp.id}`}
                      className="text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{affectedAp.name}</span>
                      <ExternalLink className="w-3 h-3 text-purple-700 ml-1 flex-shrink-0" />
                    </Link>
                    <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                      {affectedAp.managementIp}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                      {affectedAp.model} • {affectedAp.physicalLocation}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic mt-0.5">
                    None (Router core level fault)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fault Overview */}
          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
              Fault overview and symptoms
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{incident.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reported date</span>
                <span className="font-mono text-slate-700 mt-0.5 block">{incident.dateReported}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reported by</span>
                <span className="text-slate-800 mt-0.5 block">
                  {incident.reportedBy || "NOC Automated"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned engineer</span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {incident.assignedTechnician || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reference</span>
                <span className="font-mono text-emerald-700 mt-0.5 block">
                  {incident.referenceNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status</span>
                <span className="mt-0.5 block">
                  <StatusBadge status={incident.status} size="sm" />
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1">Description</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {incident.description}
              </p>
            </div>

            {incident.resolutionDetails && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg">
                <h4 className="text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Resolution details and root cause
                </h4>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  {incident.resolutionDetails}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
            <h3 className="text-xs font-bold text-slate-800 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Incident timeline ({incident.timeline?.length || 0})
            </h3>

            {/* Events List */}
            <div className="space-y-3 my-3 max-h-[340px] overflow-y-auto pr-1">
              {incident.timeline?.map((item, idx) => (
                <div
                  key={idx}
                  className="relative pl-5 pb-2 border-l-2 border-emerald-500/30 last:border-l-transparent last:pb-0"
                >
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-50" />
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-slate-800">{item.author}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  {item.status && (
                    <div className="mb-0.5">
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Update Form */}
            <form onSubmit={handlePostTimelineUpdate} className="pt-3 border-t border-slate-100 space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700">
                Post investigation note
              </label>

              <textarea
                rows={2}
                value={timelineNote}
                onChange={(e) => setTimelineNote(e.target.value)}
                placeholder="Log diagnostic findings, cable swap, signal level..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={quickStatus}
                  onChange={(e) => setQuickStatus(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700 w-full sm:w-auto"
                >
                  <option value="">Keep status ({incident.status})</option>
                  <option value="Open">Set to Open</option>
                  <option value="Investigating">Set to Investigating</option>
                  <option value="In Progress">Set to In progress</option>
                  <option value="Resolved">Set to Resolved</option>
                  <option value="Closed">Set to Closed</option>
                </select>

                <button
                  type="submit"
                  disabled={!timelineNote.trim() && !quickStatus}
                  className="h-9 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer w-full sm:flex-1"
                >
                  <Send className="w-3 h-3" />
                  Post note
                </button>
              </div>

              {quickStatus === "Resolved" && (
                <input
                  type="text"
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  placeholder="Summarize resolution for records..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-emerald-300 bg-emerald-50 focus:bg-white focus:outline-none"
                />
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Modal */}
      <UpdateIncidentModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        incident={incident}
      />
    </div>
  );
}

export default function IncidentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[40vh] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <IncidentDetailContent />
    </Suspense>
  );
}

