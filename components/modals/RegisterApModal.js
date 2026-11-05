"use client";

import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import { useRackbase } from "@/context/RackbaseContext";
import { Plus, X } from "lucide-react";

export default function RegisterApModal({ isOpen, onClose, defaultParentRouterId = "" }) {
  const { routers, addAccessPoint, equipmentModels, addEquipmentModel } = useRackbase();

  const apModels = equipmentModels.filter((m) => m.type === "Access Point");
  const defaultModel = apModels[0]?.name || "MikroTik LHG 5";

  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "MikroTik",
    model: defaultModel,
    macAddress: "",
    physicalLocation: "",
    parentRouterId: defaultParentRouterId || (routers[0] ? routers[0].id : ""),
    installationDate: new Date().toISOString().split("T")[0],
    description: "",
    notes: "",
    status: "Online",
    frequency: "5GHz 802.11ac",
  });

  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (defaultParentRouterId) {
      setFormData((prev) => ({ ...prev, parentRouterId: defaultParentRouterId }));
    } else if (routers.length > 0 && !formData.parentRouterId) {
      setFormData((prev) => ({ ...prev, parentRouterId: routers[0].id }));
    }
  }, [defaultParentRouterId, routers]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "AP name is required";
    if (!formData.parentRouterId) newErrors.parentRouterId = "Parent main router is required";
    if (isCustomModel && !customModelName.trim()) {
      newErrors.model = "Please enter custom model name";
    }
    if (!formData.physicalLocation.trim()) newErrors.physicalLocation = "Physical location is required";
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
        type: "Access Point",
      });
      finalModel = created ? created.name : customModelName.trim();
    }

    addAccessPoint({
      ...formData,
      model: finalModel,
      equipmentType: "Access Point",
    });

    onClose();
    setFormData({
      name: "",
      manufacturer: "MikroTik",
      model: defaultModel,
      macAddress: "",
      physicalLocation: "",
      parentRouterId: routers[0] ? routers[0].id : "",
      installationDate: new Date().toISOString().split("T")[0],
      description: "",
      notes: "",
      status: "Online",
      frequency: "5GHz 802.11ac",
    });
    setIsCustomModel(false);
    setCustomModelName("");
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register access point"
      subtitle="Link a new wireless access point to its parent MikroTik router"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Parent Router Selector Banner */}
        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg">
          <label className="block text-xs font-semibold text-emerald-900 mb-1">
            Connected parent MikroTik router <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.parentRouterId}
            onChange={(e) => setFormData({ ...formData, parentRouterId: e.target.value })}
            className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-md border bg-white focus:outline-none transition-all ${
              errors.parentRouterId ? "border-rose-400" : "border-emerald-300 focus:border-emerald-600"
            }`}
          >
            {routers.length === 0 ? (
              <option value="">No main routers registered yet</option>
            ) : (
              routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.model}) — {r.ipAddress}
                </option>
              ))
            )}
          </select>
          {errors.parentRouterId && (
            <p className="text-[11px] text-rose-600 mt-1">{errors.parentRouterId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Access point name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kayaba AP 01"
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
                AP model <span className="text-rose-500">*</span>
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
                {apModels.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
                <option value="__add_new__">Add custom AP model...</option>
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Enter custom AP model (e.g. MikroTik DISC Lite5)"
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
              Physical tower location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kayaba Water Tower Mast #1"
              value={formData.physicalLocation}
              onChange={(e) => setFormData({ ...formData, physicalLocation: e.target.value })}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                errors.physicalLocation ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.physicalLocation && <p className="text-[11px] text-rose-500 mt-0.5">{errors.physicalLocation}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Wireless frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="5GHz 802.11ac">5GHz 802.11ac</option>
              <option value="5GHz 802.11ax">5GHz 802.11ax (Wi-Fi 6)</option>
              <option value="2.4GHz 802.11b/g/n">2.4GHz 802.11b/g/n</option>
              <option value="Dual Band 2.4/5GHz">Dual Band 2.4/5GHz</option>
              <option value="60GHz Wireless Wire">60GHz Wireless Wire</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">MAC address</label>
            <input
              type="text"
              placeholder="e.g. 48:A9:8A:90:33:14"
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
              <option value="Online">Online / Broadcasting</option>
              <option value="Warning">Warning / High Interference</option>
              <option value="Offline">Offline / Unreachable</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={2}
            placeholder="Coverage sector, antenna azimuth, subscriber profile..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Technical notes
          </label>
          <textarea
            rows={2}
            placeholder="PoE source, switch port, RF channel..."
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
            disabled={routers.length === 0}
            className="w-full sm:w-auto h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Register access point
          </button>
        </div>
      </form>
    </Modal>
  );
}
