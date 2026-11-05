"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRackbase } from "@/context/RackbaseContext";
import StatusBadge from "@/components/StatusBadge";
import EditEquipmentModal from "@/components/modals/EditEquipmentModal";
import ReportIncidentModal from "@/components/modals/ReportIncidentModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import {
  Boxes,
  Router,
  Radio,
  AlertOctagon,
  Wrench,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Edit2,
  Trash2,
} from "lucide-react";

function InventoryDetailContent() {
  const searchParams = useSearchParams();
  const { routers, accessPoints, otherEquipment, incidents, maintenance } = useRackbase();

  const equipmentId = searchParams.get("id");

  // Search across all equipment collections
  const item = useMemo(() => {
    if (!equipmentId) return null;

    const foundRouter = routers.find((r) => r.id === equipmentId);
    if (foundRouter) {
      return {
        ...foundRouter,
        itemType: "Main router",
        typeKey: "router",
        managementIp: foundRouter.ipAddress,
        physicalLocation: foundRouter.location,
        manufacturer: "MikroTik",
      };
    }

    const foundAp = accessPoints.find((ap) => ap.id === equipmentId);
    if (foundAp) {
      const parent = routers.find((r) => r.id === foundAp.parentRouterId);
      return {
        ...foundAp,
        itemType: "Access point",
        typeKey: "ap",
        parentRouter: parent,
        manufacturer: foundAp.manufacturer || "MikroTik",
      };
    }

    const foundOther = otherEquipment.find((o) => o.id === equipmentId);
    if (foundOther) {
      return {
        ...foundOther,
        itemType: foundOther.equipmentType || "Supporting hardware",
        typeKey: "other",
        physicalLocation: foundOther.location,
      };
    }

    return null;
  }, [equipmentId, routers, accessPoints, otherEquipment]);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Missing or invalid ID handling
  if (!equipmentId || !item) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
        <h3 className="text-sm font-bold text-slate-800">
          {!equipmentId ? "No equipment ID specified" : "Equipment item not found"}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {!equipmentId
            ? "Please select a valid item from the equipment inventory."
            : `No equipment item found matching identifier '${equipmentId}'.`}
        </p>
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to inventory
        </Link>
      </div>
    );
  }

  // Related data
  const relatedIncidents = incidents.filter(
    (i) =>
      i.affectedRouterId === item.id ||
      i.affectedApId === item.id ||
      i.affectedEquipmentId === item.id
  );

  const relatedMaintenance = maintenance.filter((m) => m.equipmentId === item.id);

  const connectedAps =
    item.typeKey === "router"
      ? accessPoints.filter((ap) => ap.parentRouterId === item.id)
      : [];

  return (
    <div className="space-y-4">
      {/* Breadcrumbs & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <Link href="/dashboard/inventory" className="hover:text-emerald-600 transition-colors">
              Inventory
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-700 font-medium">{item.name}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900">{item.name}</h2>
            <StatusBadge status={item.status} size="sm" />
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {item.itemType}
            </span>
          </div>
        </div>

        {/* Action Buttons - Stack full-width on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {item.typeKey === "router" && (
            <Link
              href={`/dashboard/routers/view?id=${item.id}`}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Router className="w-3.5 h-3.5 text-amber-600" />
              Router console
            </Link>
          )}

          {item.typeKey === "ap" && (
            <Link
              href={`/dashboard/access-points/view?id=${item.id}`}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Radio className="w-3.5 h-3.5 text-purple-600" />
              AP console
            </Link>
          )}

          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            Edit equipment
          </button>

          <button
            onClick={() => setIncidentModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Report fault
          </button>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Parent Router Card if AP */}
      {item.typeKey === "ap" && item.parentRouter && (
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
                  {item.parentRouter.name}
                </span>
                <StatusBadge status={item.parentRouter.status} size="sm" />
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-emerald-700 font-medium">
                  {item.parentRouter.ipAddress}
                </span>
                <span>•</span>
                <span>{item.parentRouter.model}</span>
                <span>•</span>
                <span>{item.parentRouter.location}</span>
              </div>
            </div>
          </div>

          <Link
            href={`/dashboard/routers/view?id=${item.parentRouter.id}`}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors w-full sm:w-auto"
          >
            Router details <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Specifications Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                item.typeKey === "router"
                  ? "bg-amber-50 text-amber-700"
                  : item.typeKey === "ap"
                  ? "bg-purple-50 text-purple-700"
                  : "bg-sky-50 text-sky-700"
              }`}
            >
              {item.typeKey === "router" ? (
                <Router className="w-4 h-4" />
              ) : item.typeKey === "ap" ? (
                <Radio className="w-4 h-4" />
              ) : (
                <Boxes className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Technical specifications</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Asset ID: {item.id} • Manufacturer: {item.manufacturer || "MikroTik"}
              </p>
            </div>
          </div>
          {item.typeKey === "router" && item.managementIp ? (
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {item.managementIp}
            </span>
          ) : item.typeKey === "ap" ? (
            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              {item.frequency || "5GHz 802.11ac"}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3.5 text-xs border-b border-slate-100">
          <div>
            <span className="text-slate-400 block text-[11px]">Hardware model</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{item.model || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Location</span>
            <span className="font-medium text-slate-800 mt-0.5 block">
              {item.physicalLocation || "—"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">MAC address</span>
            <span className="font-mono text-slate-700 mt-0.5 block">
              {item.macAddress || "—"}
            </span>
          </div>
          <div>
            {item.typeKey === "router" ? (
              <>
                <span className="text-slate-400 block text-[11px]">Winbox / API port</span>
                <span className="font-mono text-slate-700 mt-0.5 block">
                  :{item.winboxPort || 8291} / :{item.apiPort || 8728}
                </span>
              </>
            ) : item.typeKey === "ap" ? (
              <>
                <span className="text-slate-400 block text-[11px]">RF frequency</span>
                <span className="text-slate-800 font-medium mt-0.5 block">
                  {item.frequency || "5GHz 802.11ac"}
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-400 block text-[11px]">Equipment category</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{item.itemType}</span>
              </>
            )}
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Equipment category</span>
            <span className="font-medium text-slate-800 mt-0.5 block">{item.itemType}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Installation date</span>
            <span className="text-slate-700 mt-0.5 block">{item.installationDate || "—"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Operating status</span>
            <span className="mt-0.5 block">
              <StatusBadge status={item.status} size="sm" />
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Uptime / Signal</span>
            <span className="text-slate-700 mt-0.5 block">
              {item.uptime || item.signalStrength || "Operational"}
            </span>
          </div>
        </div>

        {/* Description & Technical Notes */}
        <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Equipment description</h4>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {item.description || "Active production hardware supporting ISP access network."}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Configuration and service notes</h4>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {item.notes || "Configured according to standard NOC provisioning templates."}
            </p>
          </div>
        </div>
      </div>

      {/* Downstream APs if this is a Router */}
      {item.typeKey === "router" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-700" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  Connected access points ({connectedAps.length})
                </h3>
                <p className="text-[11px] text-slate-400">Radios managed by this routerboard</p>
              </div>
            </div>

            <Link
              href={`/dashboard/routers/view?id=${item.id}`}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              Manage in router view <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {connectedAps.length === 0 ? (
            <p className="py-4 text-xs text-slate-400 italic text-center">
              No access points registered under this router yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
              {connectedAps.map((ap) => (
                <Link
                  key={ap.id}
                  href={`/dashboard/access-points/view?id=${ap.id}`}
                  className="p-3 rounded-lg border border-slate-200/80 hover:border-emerald-300 transition-colors bg-slate-50/50 hover:bg-emerald-50/30 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{ap.name}</div>
                    <div className="text-[11px] font-medium text-purple-700 mt-0.5">
                      {ap.frequency || "5GHz 802.11ac"}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                      {ap.model} • {ap.physicalLocation}
                    </div>
                  </div>
                  <StatusBadge status={ap.status} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incidents & Maintenance Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Incidents */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4">
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
              <p className="py-3 text-xs text-slate-400 italic">No incidents on record.</p>
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

        {/* Maintenance */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-600" />
              Maintenance history ({relatedMaintenance.length})
            </h3>
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
        equipment={item}
      />
      <ReportIncidentModal
        isOpen={incidentModalOpen}
        onClose={() => setIncidentModalOpen(false)}
        defaultRouterId={item.typeKey === "router" ? item.id : item.parentRouterId}
        defaultApId={item.typeKey === "ap" ? item.id : undefined}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        equipment={item}
      />
    </div>
  );
}

export default function InventoryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-slate-400">
          Loading equipment details...
        </div>
      }
    >
      <InventoryDetailContent />
    </Suspense>
  );
}

