"use client";

import React, { useState } from "react";
import { useRackbase } from "@/context/RackbaseContext";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import {
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Save,
  LogOut,
  Key,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUserProfile, logout, addToast } = useRackbase();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "",
    organization: user.organization || "",
    phone: user.phone || "",
    location: user.location || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Account profile</h2>
          <p className="text-xs text-slate-500">
            Manage your personal operator credentials, contact information, and session
          </p>
        </div>

        <button
          onClick={() => setLogoutModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out of session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Profile Card & Session Info (4 Cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100/90 p-6 text-center shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)]">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-xs">
              {user.avatar || "DM"}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-3">{user.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{user.role}</p>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              NOC administrator
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-left text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-600">
                <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{user.organization}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Member since {user.joinedDate || "January 2024"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100/90 p-5 text-xs space-y-2 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)]">
            <div className="font-semibold text-slate-700">Security & access</div>
            <div className="text-[11px] text-slate-500">
              Session token verified via localStorage demo auth. Full administrative control over MikroTik equipment and incident escalation.
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form (8 Cols) */}
        <div className="md:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-100/90 p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)]">
            <h3 className="text-xs font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4">
              Edit personal information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / ISP
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full sm:w-auto h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          logout();
        }}
      />
    </div>
  );
}

