"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRackbase } from "@/context/RackbaseContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ToastContainer from "./ToastContainer";

export default function DashboardShell({ children }) {
  const router = useRouter();
  const { isClient, isAuthenticated, sidebarCollapsed } = useRackbase();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isClient, isAuthenticated, router]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Loading Rackbase...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <Topbar onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <main
        className={`pt-14 min-h-screen transition-all duration-200 ${
          sidebarCollapsed ? "md:pl-16" : "md:pl-56"
        }`}
      >
        {/* Full-width responsive container without artificial max-width constraints */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-5 pb-32 sm:pb-8">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
