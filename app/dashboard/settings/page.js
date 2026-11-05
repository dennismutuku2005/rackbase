"use client";

import React, { useState } from "react";
import { useRackbase } from "@/context/RackbaseContext";
import {
  Settings,
  Lock,
  Sliders,
  RefreshCw,
  Download,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const {
    user,
    updatePreferences,
    resetToDefaultData,
    addToast,
    routers,
    accessPoints,
    incidents,
  } = useRackbase();

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    defaultSubnet: user.preferences?.defaultSubnet || "192.168.88.0/24",
    pingIntervalSeconds: user.preferences?.pingIntervalSeconds || 30,
    emailAlerts: user.preferences?.emailAlerts ?? true,
    compactView: user.preferences?.compactView ?? false,
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwords.newPass || !passwords.current) {
      addToast("Please fill in current and new password", "error");
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      addToast("New passwords do not match", "error");
      return;
    }
    addToast("Password changed successfully", "success");
    setPasswords({ current: "", newPass: "", confirmPass: "" });
  };

  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    updatePreferences(preferences);
  };

  const handleExportData = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      user,
      routers,
      accessPoints,
      incidents,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rackbase-network-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    addToast("Network configuration exported to JSON", "info");
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Application settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure default network subnets, ping monitoring intervals, and security credentials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Application Preferences */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <h3 className="text-xs font-bold text-slate-800 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            Monitoring preferences
          </h3>

          <form onSubmit={handlePreferencesSubmit} className="space-y-3 mt-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default subnet range
              </label>
              <input
                type="text"
                value={preferences.defaultSubnet}
                onChange={(e) =>
                  setPreferences({ ...preferences, defaultSubnet: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ping probe interval (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={preferences.pingIntervalSeconds}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    pingIntervalSeconds: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-xs"
              />
            </div>

            <div className="pt-1 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, emailAlerts: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-slate-700">
                  Send immediate email alerts on critical incidents
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.compactView}
                  onChange={(e) =>
                    setPreferences({ ...preferences, compactView: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-slate-700">
                  Use high-density table view
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="w-full sm:w-auto h-9 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
              >
                Save preferences
              </button>
            </div>
          </form>
        </div>

        {/* Password Management */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <h3 className="text-xs font-bold text-slate-800 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            Security & password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-3 mt-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="w-full sm:w-auto h-9 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
              >
                Update password
              </button>
            </div>
          </form>
        </div>

        {/* Database & Demo Management (Span 2) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] p-5">
          <h3 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
            Data export & demo recovery
          </h3>
          <p className="text-xs text-slate-500 mt-2 mb-3 leading-relaxed">
            Download your current network inventory in JSON format, or reset all router, AP and incident records back to the factory initial state.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportData}
              className="w-full sm:w-auto h-9 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Export network data (JSON)
            </button>

            <button
              type="button"
              onClick={resetToDefaultData}
              className="w-full sm:w-auto h-9 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
              Reset demo database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
