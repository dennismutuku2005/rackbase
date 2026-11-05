"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useRackbase } from "@/context/RackbaseContext";
import StatusBadge from "@/components/StatusBadge";
import RegisterApModal from "@/components/modals/RegisterApModal";
import EditEquipmentModal from "@/components/modals/EditEquipmentModal";
import ReportIncidentModal from "@/components/modals/ReportIncidentModal";
import AddMaintenanceModal from "@/components/modals/AddMaintenanceModal";
import {
  Router,
  Radio,
  AlertOctagon,
  Wrench,
  ArrowLeft,
  Plus,
  Edit2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

function RouterDetailContent() {
  const searchParams = useSearchParams();
  const routerNav = useRouter();
  const { routers, accessPoints, incidents, maintenance } = useRackbase();

  const routerId = searchParams.get("id");
  const router = routers.find((r) => r.id === routerId);

  // Modals
  const [apModalOpen, setApModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  // Handle missing or invalid ID
  if (!routerId || !router) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
        <h3 className="text-sm font-bold text-slate-800">
          {!routerId ? "No router ID specified" : "Router not found"}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {!routerId
            ? "Please select a valid router from the main routers catalog."
            : `No MikroTik router found matching identifier '${routerId}'.`}
        </p>
        <Link
          href="/dashboard/routers"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to main routers
        </Link>
      </div>
    );
  }

  const connectedAps = accessPoints.filter((ap) => ap.parentRouterId === router.id);
  const relatedIncidents = incidents.filter((i) => i.affectedRouterId === router.id);
  const relatedMaintenance = maintenance.filter((m) => m.equipmentId === router.id);

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <Link href="/dashboard/routers" className="hover:text-emerald-600 transition-colors">
              Main routers
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-700 font-medium">{router.name}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900">{router.name}</h2>
            <StatusBadge status={router.status} size="sm" />
          </div>
        </div>

        {/* Action Buttons - Stack full-width on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            Edit router
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
          <button
            onClick={() => setApModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add AP to router
          </button>
        </div>
      </div>

      {/* Specifications Card */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Router className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Routerboard specifications</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Asset ID: {router.id} • Hostname: {router.routerIdentity}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            {router.ipAddress}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3.5 text-xs border-b border-slate-100">
          <div>
            <span className="text-slate-400 block text-[11px]">Hardware model</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{router.model}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Physical location</span>
            <span className="font-medium text-slate-800 mt-0.5 block">{router.location}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Winbox port</span>
            <span className="font-mono text-slate-700 mt-0.5 block">:{router.winboxPort || 8291}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">RouterOS API port</span>
            <span className="font-mono text-slate-700 mt-0.5 block">:{router.apiPort || 8728}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Management user</span>
            <span className="font-mono text-slate-700 mt-0.5 block">{router.username || "admin"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">MAC address</span>
            <span className="font-mono text-slate-700 mt-0.5 block">{router.macAddress || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">RouterOS</span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {router.routerOsVersion || "RouterOS v7"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Installation date</span>
            <span className="text-slate-700 mt-0.5 block">{router.installationDate || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Uptime</span>
            <span className="text-slate-700 mt-0.5 block">{router.uptime || "Operational"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Connected access points</span>
            <span className="font-semibold text-emerald-700 mt-0.5 block">
              {connectedAps.length} APs
            </span>
          </div>
        </div>

        <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Description</h4>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {router.description || "Core gateway routerboard serving wireless distribution hops."}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Configuration notes</h4>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {router.notes || "Dual WAN BGP peering. VLAN trunking active."}
            </p>
          </div>
        </div>
      </div>

      {/* Connected Access Points (APs attached to this router) */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-700" />
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Connected access points ({connectedAps.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Radios linked under this routerboard
              </p>
            </div>
          </div>

          <button
            onClick={() => setApModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Register AP
          </button>
        </div>

        {connectedAps.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No access points registered under this router yet.
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 border-b border-slate-100 font-semibold text-[11px] sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">AP name</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Tower location</th>
                  <th className="py-2.5 px-3">Signal</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {connectedAps.map((ap) => (
                  <tr key={ap.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <Link
                        href={`/dashboard/access-points/view?id=${ap.id}`}
                        className="hover:text-emerald-600 transition-colors"
                      >
                        {ap.name}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono">{ap.id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{ap.model}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {ap.frequency || "5GHz 802.11ac"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{ap.physicalLocation}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {ap.signalStrength}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={ap.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/dashboard/access-points/view?id=${ap.id}`}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Related Incidents & Maintenance Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Related Incidents */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              Related incidents ({relatedIncidents.length})
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
              <p className="py-3 text-xs text-slate-400 italic">No incidents recorded for this router.</p>
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
      <RegisterApModal
        isOpen={apModalOpen}
        onClose={() => setApModalOpen(false)}
        defaultParentRouterId={router.id}
      />
      <EditEquipmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        equipment={router}
      />
      <ReportIncidentModal
        isOpen={incidentModalOpen}
        onClose={() => setIncidentModalOpen(false)}
        defaultRouterId={router.id}
      />
      <AddMaintenanceModal
        isOpen={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        defaultEquipmentId={router.id}
      />
    </div>
  );
}

export default function RouterDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-slate-400">
          Loading router details...
        </div>
      }
    >
      <RouterDetailContent />
    </Suspense>
  );
}

