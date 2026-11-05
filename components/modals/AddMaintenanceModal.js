"use client";

import React, { useState } from "react";
import Modal from "../Modal";
import { useRackbase } from "@/context/RackbaseContext";
import { Plus } from "lucide-react";

export default function AddMaintenanceModal({ isOpen, onClose, defaultEquipmentId = "" }) {
  const { routers, accessPoints, otherEquipment, addMaintenance, user } = useRackbase();

  const allEquipment = [
    ...routers.map((r) => ({ id: r.id, name: r.name, type: "Main router", ip: r.ipAddress })),
    ...accessPoints.map((ap) => ({ id: ap.id, name: ap.name, type: "Access point", ip: ap.model })),
    ...otherEquipment.map((eq) => ({ id: eq.id, name: eq.name, type: eq.category || "Hardware", ip: eq.managementIp || "" })),
  ];

  const [formData, setFormData] = useState({
    title: "",
    equipmentId: defaultEquipmentId || (allEquipment[0] ? allEquipment[0].id : ""),
    technician: user.name || "Dennis Mutuku",
    scheduledDate: new Date().toISOString().split("T")[0] + " 02:00",
    status: "Scheduled",
    description: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Maintenance title is required";
    if (!formData.equipmentId) newErrors.equipmentId = "Target equipment must be selected";
    if (!formData.scheduledDate) newErrors.scheduledDate = "Scheduled date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedEq = allEquipment.find((eq) => eq.id === formData.equipmentId);

    addMaintenance({
      ...formData,
      equipmentName: selectedEq ? selectedEq.name : formData.equipmentId,
      equipmentType: selectedEq ? selectedEq.type : "Equipment",
    });

    onClose();
    setFormData({
      title: "",
      equipmentId: allEquipment[0] ? allEquipment[0].id : "",
      technician: user.name || "Dennis Mutuku",
      scheduledDate: new Date().toISOString().split("T")[0] + " 02:00",
      status: "Scheduled",
      description: "",
      notes: "",
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule equipment maintenance"
      subtitle="Create a preventive or corrective servicing work order"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Maintenance title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. RouterOS v7.15 upgrade & full backup"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
              errors.title ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"
            }`}
          />
          {errors.title && <p className="text-[11px] text-rose-500 mt-0.5">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target equipment <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              {allEquipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  [{eq.type}] {eq.name} {eq.ip ? `(${eq.ip})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field technician
            </label>
            <input
              type="text"
              placeholder="e.g. Dennis Mutuku"
              value={formData.technician}
              onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scheduled date & time <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="YYYY-MM-DD HH:mm"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Procedure description
          </label>
          <textarea
            rows={2}
            placeholder="Explain steps, firmware version, equipment to service..."
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
            <Plus className="w-3.5 h-3.5" />
            Schedule maintenance
          </button>
        </div>
      </form>
    </Modal>
  );
}
