"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRackbase } from "@/context/RackbaseContext";
import StatusBadge from "@/components/StatusBadge";
import EditEquipmentModal from "@/components/modals/EditEquipmentModal";
import ReportIncidentModal from "@/components/modals/ReportIncidentModal";
import AddMaintenanceModal from "@/components/modals/AddMaintenanceModal";
import {
  Radio,
  Router,
  AlertOctagon,
  Wrench,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  MoveHorizontal,
} from "lucide-react";

function AccessPointDetailContent() {
  const searchParams = useSearchParams();
  const { accessPoints, routers, incidents, maintenance } = useRackbase();

  const apId = searchParams.get("id");
  const ap = accessPoints.find((a) => a.id === apId);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  if (!apId || !ap) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-8 text-center">
        <h3 className="text-sm font-bold text-slate-800">
          {!apId ? "No access point ID specified" : "Access point not found"}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {!apId
            ? "Please select a valid access point from the catalog."
            : `No radio found matching identifier '${apId}'.`}
        </p>
        <Link
          href="/dashboard/access-points"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to access points
        </Link>
      </div>
    );
  }

  const parentRouter = routers.find((r) => r.id === ap.parentRouterId);
  const relatedIncidents = incidents.filter((i) => i.affectedApId === ap.id);
  const relatedMaintenance = maintenance.filter((m) => m.equipmentId === ap.id);

  return (
    <div className="space-y-4">
      {/* Breadcrumbs & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <Link
              href="/dashboard/access-points"
              className="hover:text-emerald-600 transition-colors"
            >
              Access points
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-700 font-medium">{ap.name}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900">{ap.name}</h2>
            <StatusBadge status={ap.status} size="sm" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <MoveHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            Edit / Reassign router
          </button>
          <button
            onClick={() => setIncidentModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Report fault
          </button>
          <button
            onClick={() => setMaintenanceModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            Schedule service
          </button>
        </div>
      </div>

      {/* Parent Router Information Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Router className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-800">
              Parent MikroTik router
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {parentRouter ? parentRouter.name : "Unassigned router"}
              </span>
              {parentRouter && <StatusBadge status={parentRouter.status} size="sm" />}
            </div>
            {parentRouter && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-emerald-700 font-medium">{parentRouter.ipAddress}</span>
                <span>•</span>
                <span>{parentRouter.model}</span>
                <span>•</span>
                <span>{parentRouter.location}</span>
              </div>
            )}
          </div>
        </div>

        {parentRouter ? (
          <Link
            href={`/dashboard/routers/view?id=${parentRouter.id}`}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors w-full sm:w-auto"
          >
            Router details <ExternalLink className="w-3 h-3" />
          </Link>
        ) : (
          <button
            onClick={() => setEditModalOpen(true)}
            className="h-8 px-3 text-xs font-medium text-white bg-emerald-600 rounded-md w-full sm:w-auto"
          >
            Assign parent router
          </button>
        )}
      </div>

      {/* AP Specifications */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Radio specifications</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Asset ID: {ap.id} • Manufacturer: {ap.manufacturer || "MikroTik"}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
            {ap.frequency || "5GHz 802.11ac"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3.5 text-xs border-b border-slate-100">
          <div>
            <span className="text-slate-400 block text-[11px]">Model</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{ap.model}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tower location</span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {ap.physicalLocation}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">MAC address</span>
            <span className="font-mono text-slate-700 mt-0.5 block">
              {ap.macAddress || "—"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Frequency</span>
            <span className="text-slate-800 mt-0.5 block">
              {ap.frequency || "5GHz PtMP"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Signal margin</span>
            <span className="text-emerald-700 font-medium mt-0.5 block">
              {ap.signalStrength || "Nominal"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Connected subscribers</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {ap.connectedClients || 0} active CPEs
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Installation date</span>
            <span className="text-slate-700 mt-0.5 block">
              {ap.installationDate || "2024-03-01"}
            </span>
          </div>
        </div>

        {/* Description & Technical Notes */}
        <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Radio sector description</h4>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {ap.description || "Wireless access radio providing connectivity to subscriber stations."}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Power and mast notes</h4>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {ap.notes || "PoE powered from primary routerboard. Surge protection installed on mast."}
            </p>
          </div>
        </div>
      </div>

      {/* Related Incidents & Maintenance Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Related Incidents */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              Incidents on this AP ({relatedIncidents.length})
            </h3>
            <button
              onClick={() => setIncidentModalOpen(true)}
              className="text-xs text-rose-600 font-medium hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <AlertOctagon className="w-3 h-3" />
              Report fault
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {relatedIncidents.length === 0 ? (
              <p className="py-3 text-xs text-slate-400 italic">No incidents recorded for this AP.</p>
            ) : (
              relatedIncidents.map((inc) => (
                <div key={inc.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                  <div>
                    <Link
                      href={`/dashboard/incidents/view?id=${inc.id}`}
                      className="font-medium text-slate-900 hover:text-emerald-600 block"
                    >
                      {inc.title}
                    </Link>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {inc.referenceNumber} • {inc.dateReported}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <StatusBadge status={inc.severity} size="sm" />
                    <StatusBadge status={inc.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance History */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-600" />
              Maintenance history ({relatedMaintenance.length})
            </h3>
            <button
              onClick={() => setMaintenanceModalOpen(true)}
              className="text-xs text-emerald-600 font-medium hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Wrench className="w-3 h-3" />
              Schedule
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {relatedMaintenance.length === 0 ? (
              <p className="py-3 text-xs text-slate-400 italic">No maintenance history recorded.</p>
            ) : (
              relatedMaintenance.map((m) => (
                <div key={m.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                  <div>
                    <div className="font-medium text-slate-900">{m.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {m.technician} • {m.scheduledDate}
                    </div>
                  </div>
                  <StatusBadge status={m.status} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditEquipmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        equipment={ap}
      />
      <ReportIncidentModal
        isOpen={incidentModalOpen}
        onClose={() => setIncidentModalOpen(false)}
        defaultRouterId={ap.parentRouterId}
        defaultApId={ap.id}
      />
      <AddMaintenanceModal
        isOpen={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        defaultEquipmentId={ap.id}
      />
    </div>
  );
}

export default function AccessPointDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[40vh] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AccessPointDetailContent />
    </Suspense>
  );
}

