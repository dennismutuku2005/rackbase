"use client";

import React, { useState } from "react";
import Modal from "../Modal";
import { useRackbase } from "@/context/RackbaseContext";
import { Plus, X } from "lucide-react";

export default function RegisterRouterModal({ isOpen, onClose }) {
  const { addRouter, equipmentModels, addEquipmentModel } = useRackbase();

  const routerModels = equipmentModels.filter((m) => m.type === "Router");
  const defaultModel = routerModels[0]?.name || "MikroTik RB5009UG+S+IN";

  const [formData, setFormData] = useState({
    name: "",
    model: defaultModel,
    routerIdentity: "",
    ipAddress: "",
    winboxPort: "8291",
    apiPort: "8728",
    username: "admin",
    password: "",
    macAddress: "",
    location: "",
    description: "",
    notes: "",
    routerOsVersion: "v7.14.2",
    status: "Online",
  });

  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Router name is required";
    if (isCustomModel && !customModelName.trim()) {
      newErrors.model = "Please enter custom model name";
    }
    if (!formData.ipAddress.trim()) newErrors.ipAddress = "Management IP is required";
    else if (
      !/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(formData.ipAddress.trim())
    ) {
      newErrors.ipAddress = "Invalid IPv4 address format (e.g. 192.168.88.1)";
    }
    if (!formData.location.trim()) newErrors.location = "Physical location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    let finalModel = formData.model;
    if (isCustomModel && customModelName.trim()) {
      const created = addEquipmentModel({
        name: customModelName.trim(),
        type: "Router",
      });
      finalModel = created ? created.name : customModelName.trim();
    }

    addRouter({
      ...formData,
      model: finalModel,
      winboxPort: Number(formData.winboxPort) || 8291,
      apiPort: Number(formData.apiPort) || 8728,
      username: formData.username || "admin",
      password: formData.password || "",
      equipmentType: "Main Router",
      manufacturer: "MikroTik",
    });

    onClose();
    setFormData({
      name: "",
      model: defaultModel,
      routerIdentity: "",
      ipAddress: "",
      winboxPort: "8291",
      apiPort: "8728",
      username: "admin",
      password: "",
      macAddress: "",
      location: "",
      description: "",
      notes: "",
      routerOsVersion: "v7.14.2",
      status: "Online",
    });
    setIsCustomModel(false);
    setCustomModelName("");
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register main MikroTik router"
      subtitle="Add a core MikroTik routerboard to your network inventory"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Router name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Main Router Nairobi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                errors.name ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                MikroTik model <span className="text-rose-500">*</span>
              </label>
              {!isCustomModel ? (
                <button
                  type="button"
                  onClick={() => setIsCustomModel(true)}
                  className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add new model
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomModel(false);
                    setCustomModelName("");
                  }}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer inline-flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" />
                  Choose preset
                </button>
              )}
            </div>

            {!isCustomModel ? (
              <select
                value={formData.model}
                onChange={(e) => {
                  if (e.target.value === "__add_new__") {
                    setIsCustomModel(true);
                  } else {
                    setFormData({ ...formData, model: e.target.value });
                  }
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
              >
                {routerModels.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
                <option value="__add_new__">Add custom router model...</option>
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Enter custom router model (e.g. MikroTik CCR2216-1G-12XS-2XQ)"
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  autoFocus
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                    errors.model ? "border-rose-300 focus:border-rose-500" : "border-emerald-400 focus:border-emerald-500"
                  }`}
                />
                {errors.model && <p className="text-[11px] text-rose-500 mt-0.5">{errors.model}</p>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Router identity / Hostname
            </label>
            <input
              type="text"
              placeholder="e.g. NRB-CORE-01"
              value={formData.routerIdentity}
              onChange={(e) => setFormData({ ...formData, routerIdentity: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Management IP address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 192.168.88.1"
              value={formData.ipAddress}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                errors.ipAddress ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.ipAddress && <p className="text-[11px] text-rose-500 mt-0.5">{errors.ipAddress}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Winbox port
            </label>
            <input
              type="number"
              placeholder="8291"
              value={formData.winboxPort}
              onChange={(e) => setFormData({ ...formData, winboxPort: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              RouterOS API port
            </label>
            <input
              type="number"
              placeholder="8728"
              value={formData.apiPort}
              onChange={(e) => setFormData({ ...formData, apiPort: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Management username
            </label>
            <input
              type="text"
              placeholder="admin"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Management password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical POP location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Nairobi Central POP, Rack A1"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                errors.location ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.location && <p className="text-[11px] text-rose-500 mt-0.5">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              MAC address
            </label>
            <input
              type="text"
              placeholder="e.g. 48:A9:8A:2B:11:01"
              value={formData.macAddress}
              onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operational status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Online">Online / Operational</option>
              <option value="Warning">Warning / Degraded</option>
              <option value="Offline">Offline / Standby</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              RouterOS firmware
            </label>
            <input
              type="text"
              placeholder="e.g. v7.14.2"
              value={formData.routerOsVersion}
              onChange={(e) => setFormData({ ...formData, routerOsVersion: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Brief overview of network role..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Configuration notes
          </label>
          <textarea
            rows={2}
            placeholder="RouterOS version, BGP/OSPF peering, VLAN details..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto h-9 px-3.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Register router
          </button>
        </div>
      </form>
    </Modal>
  );
}
