"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRackbase } from "@/context/RackbaseContext";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import RegisterApModal from "@/components/modals/RegisterApModal";
import EditEquipmentModal from "@/components/modals/EditEquipmentModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import {
  Radio,
  Plus,
  Search,
  Router,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";

export default function AccessPointsPage() {
  const { accessPoints, routers } = useRackbase();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeAp, setActiveAp] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [parentRouterFilter, setParentRouterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAps = useMemo(() => {
    return accessPoints.filter((ap) => {
      if (parentRouterFilter !== "all" && ap.parentRouterId !== parentRouterFilter) {
        return false;
      }
      if (statusFilter !== "all" && ap.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ap.name?.toLowerCase().includes(q) ||
          ap.model?.toLowerCase().includes(q) ||
          ap.physicalLocation?.toLowerCase().includes(q) ||
          ap.macAddress?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [accessPoints, parentRouterFilter, statusFilter, searchQuery]);

  const handleEdit = (ap) => {
    setActiveAp(ap);
    setEditModalOpen(true);
  };

  const handleDelete = (ap) => {
    setActiveAp(ap);
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-base font-bold text-slate-900">Access points</h2>
          <p className="text-xs text-slate-500">
            Wireless sector radios and distribution APs linked to parent MikroTik routerboards
          </p>
        </div>

        <button
          onClick={() => setRegisterModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Register access point
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-3.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-6 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by AP name, model, MAC address, or tower location..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={parentRouterFilter}
            onChange={(e) => setParentRouterFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All parent routers</option>
            {routers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.ipAddress})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="Online">Online</option>
            <option value="Warning">Warning</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Access Points Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        {filteredAps.length === 0 ? (
          <EmptyState
            title="No access points found"
            description="Register a new AP to connect it to one of your MikroTik routers."
            actionLabel="Register access point"
            onAction={() => setRegisterModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 border-b border-slate-100 font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">AP name & model</th>
                  <th className="px-3 py-2.5">Parent main router</th>
                  <th className="px-3 py-2.5">Frequency</th>
                  <th className="px-3 py-2.5">MAC address</th>
                  <th className="px-3 py-2.5">Physical location</th>
                  <th className="px-3 py-2.5">Signal</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAps.map((ap) => {
                  const parentRouter = routers.find((r) => r.id === ap.parentRouterId);

                  return (
                    <tr key={ap.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                            <Radio className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/access-points/view?id=${ap.id}`}
                              className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors block"
                            >
                              {ap.name}
                            </Link>
                            <span className="text-[10px] text-slate-400">
                              {ap.model} • {ap.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        {parentRouter ? (
                          <Link
                            href={`/dashboard/routers/view?id=${parentRouter.id}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded text-xs font-medium transition-colors"
                          >
                            <Router className="w-3 h-3 text-amber-700" />
                            <span className="truncate max-w-[120px]">{parentRouter.name}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-700 text-xs font-medium">
                        {ap.frequency || "5GHz 802.11ac"}
                      </td>

                      <td className="px-3 py-3 font-mono text-[11px] text-slate-500">
                        {ap.macAddress || "—"}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        <div className="truncate max-w-[160px]">{ap.physicalLocation}</div>
                      </td>

                      <td className="px-3 py-3 text-slate-700 font-medium">
                        <div>{ap.signalStrength}</div>
                        <div className="text-[10px] text-slate-400">
                          {ap.connectedClients || 0} clients
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge status={ap.status} size="sm" />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/dashboard/access-points/view?id=${ap.id}`}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
                            title="View AP"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleEdit(ap)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Edit / Move AP"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ap)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Delete AP"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
          onClick={() => setRegisterModalOpen(true)}
          className="w-full h-10 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register access point
        </button>
      </div>

      {/* Modals */}
      <RegisterApModal isOpen={registerModalOpen} onClose={() => setRegisterModalOpen(false)} />
      <EditEquipmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        equipment={activeAp}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        equipment={activeAp}
      />
    </div>
  );
}
