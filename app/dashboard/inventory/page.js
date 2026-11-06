"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRackbase } from "@/context/RackbaseContext";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import MetricCard from "@/components/MetricCard";
import EditEquipmentModal from "@/components/modals/EditEquipmentModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import {
  Boxes,
  Search,
  Plus,
  Router,
  Radio,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
} from "lucide-react";

export default function InventoryPage() {
  const { routers, accessPoints, otherEquipment, globalSearch } = useRackbase();

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeEquipment, setActiveEquipment] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState(globalSearch || "");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Consolidate all equipment
  const consolidatedList = useMemo(() => {
    const list = [];

    routers.forEach((r) => {
      list.push({
        ...r,
        type: "Main router",
        typeKey: "router",
        managementIp: r.ipAddress,
        physicalLocation: r.location,
        manufacturer: "MikroTik",
      });
    });

    accessPoints.forEach((ap) => {
      const parent = routers.find((r) => r.id === ap.parentRouterId);
      list.push({
        ...ap,
        type: "Access point",
        typeKey: "ap",
        parentRouterName: parent ? parent.name : ap.parentRouterId,
      });
    });

    otherEquipment.forEach((eq) => {
      list.push({
        ...eq,
        type: eq.equipmentType || "Other hardware",
        typeKey: "other",
        physicalLocation: eq.location,
      });
    });

    return list;
  }, [routers, accessPoints, otherEquipment]);

  // Extract distinct locations
  const distinctLocations = useMemo(() => {
    const locs = new Set();
    consolidatedList.forEach((item) => {
      if (item.physicalLocation) {
        const main = item.physicalLocation.split(",")[0].trim();
        locs.add(main);
      }
    });
    return Array.from(locs);
  }, [consolidatedList]);

  // Filter & sort
  const filteredList = useMemo(() => {
    return consolidatedList
      .filter((item) => {
        if (typeFilter !== "all" && item.typeKey !== typeFilter) return false;
        if (statusFilter !== "all" && item.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
        if (locationFilter !== "all" && !item.physicalLocation?.includes(locationFilter)) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.name?.toLowerCase().includes(q) ||
            item.managementIp?.toLowerCase().includes(q) ||
            item.macAddress?.toLowerCase().includes(q) ||
            item.serialNumber?.toLowerCase().includes(q) ||
            item.model?.toLowerCase().includes(q) ||
            item.physicalLocation?.toLowerCase().includes(q) ||
            item.id?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "date") return (b.installationDate || "").localeCompare(a.installationDate || "");
        if (sortBy === "ip") return (a.managementIp || "").localeCompare(b.managementIp || "");
        return 0;
      });
  }, [consolidatedList, typeFilter, statusFilter, locationFilter, searchQuery, sortBy]);

  const handleEdit = (eq) => {
    setActiveEquipment(eq);
    setEditModalOpen(true);
  };

  const handleDelete = (eq) => {
    setActiveEquipment(eq);
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Equipment inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified catalog of all registered MikroTik routers, access points and supporting hardware
          </p>
        </div>
      </div>

      {/* Headline Metric Cards (Dashboard Executive Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          title="Total equipment"
          value={`${consolidatedList.length}`}
          subtext="units in service catalog"
          trend="+5.2%"
          trendType="up"
          color="emerald"
          data={[30, 32, 31, 34, 33, 35, consolidatedList.length]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["40", "30", "20", "10"]}
          activePoint={6}
          activeLabel={`${consolidatedList.length} Units`}
        />
        <MetricCard
          title="Core routers"
          value={`${routers.length}`}
          subtext="RouterOS boards"
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
          title="Access points"
          value={`${accessPoints.length}`}
          subtext="wireless radios"
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
          title="Operational rate"
          value="96.4%"
          subtext="active network uptime"
          trend="+0.4%"
          trendType="up"
          color="purple"
          data={[95.8, 96.0, 96.1, 96.2, 96.2, 96.3, 96.4]}
          labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          yTicks={["100%", "98%", "96%", "94%"]}
          activePoint={6}
          activeLabel="96.4% Health"
        />
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] space-y-3">
        {/* Type Filter Pills in Normal Sentence Case */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                typeFilter === "all"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All equipment ({consolidatedList.length})
            </button>
            <button
              onClick={() => setTypeFilter("router")}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                typeFilter === "router"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Main routers ({routers.length})
            </button>
            <button
              onClick={() => setTypeFilter("ap")}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                typeFilter === "ap"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Access points ({accessPoints.length})
            </button>
            <button
              onClick={() => setTypeFilter("other")}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                typeFilter === "other"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Other hardware ({otherEquipment.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="name">Name</option>
              <option value="date">Installation date</option>
              <option value="ip">Management IP</option>
            </select>
          </div>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, IP, MAC, serial, or model..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All locations</option>
              {distinctLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="Online">Online</option>
              <option value="Warning">Warning</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        {filteredList.length === 0 ? (
          <EmptyState
            title="No equipment found"
            description="No items match your filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFD] text-slate-500 border-b border-slate-100 font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Device name & ID</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Model</th>
                  <th className="px-3 py-2.5">Management IP</th>
                  <th className="px-3 py-2.5">MAC address</th>
                  <th className="px-3 py-2.5">Location</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const isRouter = item.typeKey === "router";
                  const isAp = item.typeKey === "ap";
                  const detailHref = `/dashboard/inventory/view?id=${item.id}`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                              isRouter
                                ? "bg-amber-50 text-amber-700"
                                : isAp
                                ? "bg-purple-50 text-purple-700"
                                : "bg-sky-50 text-sky-700"
                            }`}
                          >
                            {isRouter ? (
                              <Router className="w-3.5 h-3.5" />
                            ) : isAp ? (
                              <Radio className="w-3.5 h-3.5" />
                            ) : (
                              <Boxes className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            {detailHref ? (
                              <Link
                                href={detailHref}
                                className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors block"
                              >
                                {item.name}
                              </Link>
                            ) : (
                              <span className="font-semibold text-slate-900">{item.name}</span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-slate-600 font-medium">
                        <div className="text-slate-800">{item.type}</div>
                        {isAp && item.parentRouterName && (
                          <div className="text-[10px] text-emerald-700 truncate max-w-[120px]">
                            via {item.parentRouterName}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        <div className="font-medium text-slate-800">{item.model}</div>
                        <div className="text-[10px] text-slate-400">{item.manufacturer}</div>
                      </td>

                      <td className="px-3 py-3 font-mono font-medium text-slate-700">
                        {isRouter ? (
                          item.managementIp
                        ) : isAp ? (
                          <span className="text-slate-400 font-sans text-xs">Linked to router</span>
                        ) : (
                          item.managementIp || "—"
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-500 font-mono text-[11px]">
                        <div>{item.macAddress || "—"}</div>
                        {isRouter && item.winboxPort && (
                          <div className="text-[10px] text-slate-400 font-sans">
                            Winbox :{item.winboxPort}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        <div className="truncate max-w-[150px]">{item.physicalLocation}</div>
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {detailHref && (
                            <Link
                              href={detailHref}
                              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Delete"
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

      {/* Modals */}
      <EditEquipmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        equipment={activeEquipment}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        equipment={activeEquipment}
      />
    </div>
  );
}
