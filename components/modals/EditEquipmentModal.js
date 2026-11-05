"use client";

import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import { useRackbase } from "@/context/RackbaseContext";
import { Save, Plus, X } from "lucide-react";

export default function EditEquipmentModal({ isOpen, onClose, equipment }) {
  const { routers, updateEquipment, equipmentModels, addEquipmentModel } = useRackbase();

  const isRouter = equipment?.id?.startsWith("RTR");
  const isAp = equipment?.id?.startsWith("AP");

  const relevantModels = equipmentModels.filter((m) =>
    isRouter ? m.type === "Router" : isAp ? m.type === "Access Point" : true
  );

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    ipAddress: "",
    winboxPort: "8291",
    apiPort: "8728",
    username: "admin",
    password: "",
    macAddress: "",
    location: "",
    parentRouterId: "",
    status: "Online",
    description: "",
    notes: "",
  });

  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || "",
        model: equipment.model || "",
        ipAddress: equipment.ipAddress || "",
        winboxPort: equipment.winboxPort?.toString() || "8291",
        apiPort: equipment.apiPort?.toString() || "8728",
        username: equipment.username || "admin",
        password: equipment.password || "",
        macAddress: equipment.macAddress || "",
        location: equipment.location || equipment.physicalLocation || "",
        parentRouterId: equipment.parentRouterId || "",
        status: equipment.status || "Online",
        description: equipment.description || "",
        notes: equipment.notes || "",
      });
      setIsCustomModel(false);
      setCustomModelName("");
      setErrors({});
    }
  }, [equipment]);

  if (!equipment) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Equipment name is required";
    if (isRouter && formData.ipAddress) {
      if (!/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(formData.ipAddress.trim())) {
        newErrors.ip = "Invalid IPv4 address format";
      }
    }
    if (isCustomModel && !customModelName.trim()) {
      newErrors.model = "Custom model name is required";
    }
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
        type: isRouter ? "Router" : isAp ? "Access Point" : "Other",
      });
      finalModel = created ? created.name : customModelName.trim();
    }

    const dataToSave = {
      name: formData.name,
      model: finalModel,
      macAddress: formData.macAddress,
      status: formData.status,
      description: formData.description,
      notes: formData.notes,
    };

    if (isRouter) {
      dataToSave.ipAddress = formData.ipAddress;
      dataToSave.winboxPort = Number(formData.winboxPort) || 8291;
      dataToSave.apiPort = Number(formData.apiPort) || 8728;
      dataToSave.username = formData.username;
      dataToSave.password = formData.password;
      dataToSave.location = formData.location;
    } else if (isAp) {
      dataToSave.physicalLocation = formData.location;
      dataToSave.parentRouterId = formData.parentRouterId;
    } else {
      dataToSave.location = formData.location;
    }

    updateEquipment(equipment.id, dataToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit equipment — ${equipment.name}`}
      subtitle={`ID: ${equipment.id} • ${isRouter ? "Main router" : isAp ? "Access point" : "Network equipment"}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {isAp && (
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg">
            <label className="block text-xs font-semibold text-emerald-900 mb-1">
              Parent MikroTik router (Move AP)
            </label>
            <select
              value={formData.parentRouterId}
              onChange={(e) => setFormData({ ...formData, parentRouterId: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs font-medium rounded-md border border-emerald-300 bg-white focus:outline-none"
            >
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.model}) — {r.ipAddress}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Equipment name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
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
                Hardware model <span className="text-rose-500">*</span>
              </label>
              {!isCustomModel ? (
                <button
                  type="button"
                  onClick={() => setIsCustomModel(true)}
                  className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  New model
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
                  Preset
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
                {relevantModels.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
                {!relevantModels.some((m) => m.name === formData.model) && (
                  <option value={formData.model}>{formData.model}</option>
                )}
                <option value="__add_new__">Add custom model...</option>
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Enter custom model..."
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  autoFocus
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-emerald-400 bg-slate-50 focus:bg-white focus:outline-none"
                />
                {errors.model && <p className="text-[11px] text-rose-500 mt-0.5">{errors.model}</p>}
              </div>
            )}
          </div>

          {isRouter && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Management IP
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                    errors.ip ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"
                  }`}
                />
                {errors.ip && <p className="text-[11px] text-rose-500 mt-0.5">{errors.ip}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Winbox port
                </label>
                <input
                  type="number"
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
                  value={formData.apiPort}
                  onChange={(e) => setFormData({ ...formData, apiPort: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isAp ? "Tower / Pole location" : "Physical location"}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">MAC address</label>
            <input
              type="text"
              value={formData.macAddress}
              onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Operational status</label>
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
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            <Save className="w-3.5 h-3.5" />
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
