"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRackbase } from "@/context/RackbaseContext";
import BrandLogo from "./BrandLogo";
import LogoutConfirmModal from "./LogoutConfirmModal";
import {
  LayoutDashboard,
  Boxes,
  Router,
  Radio,
  AlertOctagon,
  Wrench,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Activity,
  Server,
  Wifi,
  Route,
} from "lucide-react";

export default function Sidebar({ mobileOpen = false, onMobileClose = () => {} }) {
  const pathname = usePathname();
  const {
    logout,
    sidebarCollapsed,
    setSidebarCollapsed,
    incidents,
    routers,
    accessPoints,
    routerInterfaces = [],
    wirelessClients = [],
  } = useRackbase();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const openIncidentsCount = incidents.filter(
    (i) => i.status === "Open" || i.status === "Investigating" || i.status === "In Progress"
  ).length;

  const activePortsCount = routerInterfaces.filter((i) => i.status === "Up").length;

  const navSections = [
    {
      label: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard/home",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          name: "Live traffic",
          href: "/dashboard/traffic",
          icon: Activity,
          badge: "Live",
          badgeAlert: false,
        },
      ],
    },
    {
      label: "Network & Hardware",
      items: [
        {
          name: "Inventory",
          href: "/dashboard/inventory",
          icon: Boxes,
          badge: routers.length + accessPoints.length,
        },
        {
          name: "Main routers",
          href: "/dashboard/routers",
          icon: Router,
          badge: routers.length,
        },
        {
          name: "Access points",
          href: "/dashboard/access-points",
          icon: Radio,
          badge: accessPoints.length,
        },
        {
          name: "Active ports",
          href: "/dashboard/interfaces",
          icon: Server,
          badge: activePortsCount ? `${activePortsCount} Up` : null,
        },
        {
          name: "Wireless clients",
          href: "/dashboard/wireless",
          icon: Wifi,
          badge: wirelessClients.length ? `${wirelessClients.length}` : null,
        },
        {
          name: "IP & routing",
          href: "/dashboard/routing",
          icon: Route,
          badge: null,
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          name: "Incidents",
          href: "/dashboard/incidents",
          icon: AlertOctagon,
          badge: openIncidentsCount > 0 ? openIncidentsCount : null,
          badgeAlert: openIncidentsCount > 0,
        },
        {
          name: "Maintenance",
          href: "/dashboard/maintenance",
          icon: Wrench,
          badge: null,
        },
        {
          name: "Activity logs",
          href: "/dashboard/activity",
          icon: History,
          badge: null,
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          name: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-100 transition-all duration-200 select-none ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        } ${sidebarCollapsed ? "md:w-16" : "md:w-56"}`}
      >
        {/* Top: Logo Mark Centered */}
        <div className="relative flex items-center justify-center h-14 px-3 border-b border-slate-100">
          <div className="flex items-center justify-center">
            <BrandLogo />
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden md:flex p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer ${
              sidebarCollapsed
                ? "absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 shadow-xs rounded-full p-0.5 z-50 text-slate-500 hover:text-emerald-600 hover:border-emerald-300"
                : "absolute right-2.5 top-1/2 -translate-y-1/2"
            }`}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-3.5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard/home" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.name}
                    onClick={onMobileClose}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <span className="truncate">{item.name}</span>
                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                              item.badgeAlert
                                ? "bg-rose-100 text-rose-700"
                                : isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Section: Logout Action */}
        <div className="p-2.5 border-t border-slate-100 bg-white">
          {!sidebarCollapsed ? (
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors cursor-pointer"
              title="Sign out of Rackbase"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="flex flex-col items-center py-0.5">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-8 h-8 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
