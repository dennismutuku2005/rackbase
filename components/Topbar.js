"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRackbase } from "@/context/RackbaseContext";
import LogoutConfirmModal from "./LogoutConfirmModal";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  User,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Menu,
} from "lucide-react";

export default function Topbar({ onToggleMobile = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    logout,
    globalSearch,
    setGlobalSearch,
    sidebarCollapsed,
    incidents,
    resetToDefaultData,
  } = useRackbase();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return { section: "Overview", title: "Dashboard" };

    const page = parts[1];
    switch (page) {
      case "home":
        return { section: "Overview", title: "Dashboard" };
      case "inventory":
        if (parts[2] === "view") return { section: "Network / Inventory", title: "Equipment record" };
        return { section: "Network", title: "Equipment inventory" };
      case "routers":
        if (parts[2] === "view") return { section: "Network / Main routers", title: "Router details" };
        return { section: "Network", title: "Main routers" };
      case "access-points":
        if (parts[2] === "view") return { section: "Network / Access points", title: "Access point details" };
        return { section: "Network", title: "Access points" };
      case "incidents":
        if (parts[2] === "view") return { section: "Operations / Incidents", title: "Incident details" };
        return { section: "Operations", title: "Incident management" };
      case "maintenance":
        return { section: "Operations", title: "Maintenance" };
      case "activity":
        return { section: "Operations", title: "Activity logs" };
      case "profile":
        return { section: "Account", title: "Profile" };
      case "settings":
        return { section: "System", title: "Settings" };
      default:
        return { section: "Dashboard", title: page };
    }
  };

  const breadcrumbs = getBreadcrumbs();
  const unreadIncidents = incidents.filter((i) => i.status === "Open" || i.status === "Critical");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim() && pathname !== "/dashboard/inventory") {
      router.push(`/dashboard/inventory?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-20 h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 transition-all duration-200 left-0 ${
          sidebarCollapsed ? "md:left-16" : "md:left-56"
        }`}
      >
        {/* Left: Mobile menu toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div>
            <div className="text-[11px] font-normal text-slate-400">
              {breadcrumbs.section}
            </div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">
              {breadcrumbs.title}
            </h1>
          </div>
        </div>

        {/* Center: Search input */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search equipment, IP, MAC, serial, incidents..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F4F6F8] hover:bg-[#EEF1F4] focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-lg border border-transparent focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadIncidents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Alerts</span>
                  <span className="text-[11px] font-medium bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                    {unreadIncidents.length} open
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {unreadIncidents.length === 0 ? (
                    <div className="p-3.5 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      All equipment operational
                    </div>
                  ) : (
                    unreadIncidents.map((inc) => (
                      <Link
                        key={inc.id}
                        href={`/dashboard/incidents/view?id=${inc.id}`}
                        onClick={() => setNotificationsOpen(false)}
                        className="p-2.5 hover:bg-slate-50 flex items-start gap-2 transition-colors block text-left"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-800 truncate">
                            {inc.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {inc.referenceNumber} • {inc.severity}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 text-center">
                  <Link
                    href="/dashboard/incidents"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                  >
                    View all incidents <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Settings Shortcut */}
          <Link
            href="/dashboard/settings"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Vertical Divider */}
          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={`flex items-center gap-2 p-1.5 pl-2 rounded-lg transition-colors cursor-pointer ${
                pathname === "/dashboard/profile"
                  ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-200"
                  : "hover:bg-slate-100 text-slate-800"
              }`}
              title="Account profile & menu"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.avatar || "DM"}
              </div>
              <span className="hidden sm:inline-block text-xs font-medium max-w-[120px] truncate">
                {user.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2.5 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-900 truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5 truncate">
                    {user.organization || "Network Operator"}
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                      pathname === "/dashboard/profile"
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Account profile</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">Manage</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors ${
                      pathname === "/dashboard/settings"
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Preferences & security</span>
                  </Link>

                  <button
                    onClick={() => {
                      resetToDefaultData();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset demo database</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 p-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          logout();
        }}
      />
    </>
  );
}
