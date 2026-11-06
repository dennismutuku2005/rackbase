"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRackbase } from "@/context/RackbaseContext";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import MetricCard from "@/components/MetricCard";
import RegisterRouterModal from "@/components/modals/RegisterRouterModal";
import RegisterApModal from "@/components/modals/RegisterApModal";
import EditEquipmentModal from "@/components/modals/EditEquipmentModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import {
  Router,
  Plus,
  Search,
  Radio,
  ArrowRight,
  Edit2,
  Trash2,
  AlertOctagon,
} from "lucide-react";

export default function RoutersPage() {
  const { routers, accessPoints, incidents } = useRackbase();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerApModalOpen, setRegisterApModalOpen] = useState(false);
  const [selectedRouterForAp, setSelectedRouterForAp] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeRouter, setActiveRouter] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRouters = useMemo(() => {
    return routers.filter((router) => {
      if (statusFilter !== "all" && router.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          router.name?.toLowerCase().includes(q) ||
          router.ipAddress?.toLowerCase().includes(q) ||
          router.model?.toLowerCase().includes(q) ||
          router.routerIdentity?.toLowerCase().includes(q) ||
          router.location?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [routers, statusFilter, searchQuery]);

  const handleEdit = (router) => {
    setActiveRouter(router);
    setEditModalOpen(true);
  };

  const handleDelete = (router) => {
    setActiveRouter(router);
    setDeleteModalOpen(true);
  };

  const handleAddAp = (routerId) => {
    setSelectedRouterForAp(routerId);
    setRegisterApModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Main MikroTik routers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Core routerboards managing client subnets, routing protocols, and access points
          </p>
        </div>

        <button
          onClick={() => setRegisterModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Register router
        </button>
      </div>

      {/* Headline Metric Cards (Dashboard Executive Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          title="Core routers"
          value={`${routers.length}`}
          subtext="RouterOS v7 hardware"
          trend="+2.5%"
          trendType="up"
          color="amber"
          data={[3, 4, 3, 4, 4, 4, routers.length]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["8", "6", "4", "2"]}
          activePoint={6}
          activeLabel={`${routers.length} RTRs`}
        />
        <MetricCard
          title="Online status"
          value={`${routers.filter((r) => r.status === "Online").length}`}
          subtext="100% gateway SLA"
          trend="+100%"
          trendType="up"
          color="emerald"
          data={[3, 3, 4, 4, 4, 4, routers.filter((r) => r.status === "Online").length]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["6", "4", "2", "0"]}
          activePoint={6}
          activeLabel={`${routers.filter((r) => r.status === "Online").length} Active`}
        />
        <MetricCard
          title="Linked access points"
          value={`${accessPoints.length}`}
          subtext="downstream wireless radios"
          trend="+8.4%"
          trendType="up"
          color="sky"
          data={[12, 14, 13, 15, 14, 16, accessPoints.length]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["24", "18", "12", "6"]}
          activePoint={6}
          activeLabel={`${accessPoints.length} APs`}
        />
        <MetricCard
          title="Active incidents"
          value={`${incidents.filter((i) => i.status === "Open" || i.status === "In Progress").length}`}
          subtext="hardware ticket status"
          trend={incidents.filter((i) => i.status === "Open").length === 0 ? "0 Alerts" : "-1"}
          trendType={incidents.filter((i) => i.status === "Open").length === 0 ? "up" : "down"}
          color={incidents.filter((i) => i.status === "Open").length === 0 ? "emerald" : "rose"}
          data={[1, 0, 1, 0, 1, 0, incidents.filter((i) => i.status === "Open" || i.status === "In Progress").length]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["3", "2", "1", "0"]}
          activePoint={6}
          activeLabel="0 Faults"
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
            placeholder="Search by name, identity, IP, or POP location..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All statuses ({routers.length})</option>
            <option value="Online">Online</option>
            <option value="Warning">Warning</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Routers Grid */}
      {filteredRouters.length === 0 ? (
        <EmptyState
          title="No routers found"
          description="Register your first MikroTik routerboard to begin linking access points."
          actionLabel="Register router"
          onAction={() => setRegisterModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRouters.map((router) => {
            const connectedAps = accessPoints.filter((ap) => ap.parentRouterId === router.id);
            const routerIncidents = incidents.filter(
              (i) => i.affectedRouterId === router.id && (i.status === "Open" || i.status === "In Progress")
            );

            return (
              <div
                key={router.id}
                className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] hover:border-slate-200/90 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                        <Router className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/dashboard/routers/view?id=${router.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate"
                          >
                            {router.name}
                          </Link>
                          <StatusBadge status={router.status} size="sm" />
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-emerald-700 font-semibold">
                            {router.ipAddress}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-400">ID: {router.routerIdentity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(router)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Edit router"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(router)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Delete router"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-2.5 py-3 text-xs text-slate-600 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Model</span>
                      <span className="font-medium text-slate-800 truncate block">{router.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location</span>
                      <span className="font-medium text-slate-800 truncate block">
                        {router.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">MAC</span>
                      <span className="font-mono text-slate-700 text-[11px]">{router.macAddress || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Winbox / API</span>
                      <span className="font-mono text-slate-700 text-[11px]">
                        :{router.winboxPort || 8291} / :{router.apiPort || 8728}
                      </span>
                    </div>
                  </div>

                  {/* Connected APs Section */}
                  <div className="py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5 text-purple-600" />
                        Managed access points ({connectedAps.length})
                      </span>
                      <button
                        onClick={() => handleAddAp(router.id)}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Add AP
                      </button>
                    </div>

                    {connectedAps.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        No APs registered under this router yet.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {connectedAps.map((ap) => (
                          <Link
                            key={ap.id}
                            href={`/dashboard/access-points/view?id=${ap.id}`}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 rounded text-[11px] transition-colors"
                          >
                            <span className="font-medium">{ap.name}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {ap.model}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    {routerIncidents.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        <AlertOctagon className="w-3 h-3" />
                        {routerIncidents.length} active incident
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Uptime: {router.uptime || "Operational"}</span>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/routers/view?id=${router.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    View details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Action Bar for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-xs border-t border-slate-200 z-30">
        <button
          onClick={() => setRegisterModalOpen(true)}
          className="w-full h-10 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register main router
        </button>
      </div>

      {/* Modals */}
      <RegisterRouterModal isOpen={registerModalOpen} onClose={() => setRegisterModalOpen(false)} />
      <RegisterApModal
        isOpen={registerApModalOpen}
        onClose={() => setRegisterApModalOpen(false)}
        defaultParentRouterId={selectedRouterForAp}
      />
      <EditEquipmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        equipment={activeRouter}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        equipment={activeRouter}
      />
    </div>
  );
}
