"use client";

import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import { useRackbase } from "@/context/RackbaseContext";
import { AlertOctagon } from "lucide-react";

export default function ReportIncidentModal({
  isOpen,
  onClose,
  defaultRouterId = "",
  defaultApId = "",
}) {
  const { routers, accessPoints, reportIncident, user } = useRackbase();

  const [formData, setFormData] = useState({
    title: "",
    affectedRouterId: defaultRouterId || (routers[0] ? routers[0].id : ""),
    affectedApId: defaultApId || "",
    category: "Connectivity Problem",
    severity: "High",
    assignedTechnician: user.name || "Dennis Mutuku",
    description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (defaultRouterId) {
      setFormData((prev) => ({ ...prev, affectedRouterId: defaultRouterId }));
    } else if (routers.length > 0 && !formData.affectedRouterId) {
      setFormData((prev) => ({ ...prev, affectedRouterId: routers[0].id }));
    }
    if (defaultApId) {
      setFormData((prev) => ({ ...prev, affectedApId: defaultApId }));
    }
  }, [defaultRouterId, defaultApId, routers]);

  const availableAps = accessPoints.filter(
    (ap) => ap.parentRouterId === formData.affectedRouterId
  );

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Incident title is required";
    if (!formData.affectedRouterId) newErrors.affectedRouterId = "Affected router is required";
    if (!formData.description.trim()) newErrors.description = "Incident description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    reportIncident({
      ...formData,
      reportedBy: user.name,
    });

    onClose();
    setFormData({
      title: "",
      affectedRouterId: routers[0] ? routers[0].id : "",
      affectedApId: "",
      category: "Connectivity Problem",
      severity: "High",
      assignedTechnician: user.name || "Dennis Mutuku",
      description: "",
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report equipment incident"
      subtitle="Log an outage, configuration error, or hardware failure"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Incident title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. AP disconnected - Kayaba AP 02 unreachable"
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
              Affected main router <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.affectedRouterId}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  affectedRouterId: e.target.value,
                  affectedApId: "",
                });
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.ipAddress})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Affected access point (Optional)
            </label>
            <select
              value={formData.affectedApId}
              onChange={(e) => setFormData({ ...formData, affectedApId: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">None / Core router incident</option>
              {availableAps.map((ap) => (
                <option key={ap.id} value={ap.id}>
                  {ap.name} ({ap.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Incident category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Connectivity Problem">Connectivity Problem</option>
              <option value="Hardware Fault">Hardware Fault</option>
              <option value="Router Configuration Error">Router Configuration Error</option>
              <option value="AP Disconnected">AP Disconnected</option>
              <option value="Incorrect IP Configuration">Incorrect IP Configuration</option>
              <option value="Network Instability">Network Instability</option>
              <option value="Power Failure">Power Failure</option>
              <option value="Device Overheating">Device Overheating</option>
              <option value="Unexpected Reboot">Unexpected Reboot</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Severity level
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Critical">Critical (Immediate Outage)</option>
              <option value="High">High (Severe Degradation)</option>
              <option value="Medium">Medium (Partial Impact)</option>
              <option value="Low">Low (Minor Warning)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned technician
            </label>
            <input
              type="text"
              placeholder="e.g. Dennis Mutuku"
              value={formData.assignedTechnician}
              onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Fault description & symptoms <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Describe ping failure, packet loss, or symptoms..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
              errors.description ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"
            }`}
          />
          {errors.description && <p className="text-[11px] text-rose-500 mt-0.5">{errors.description}</p>}
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
            className="w-full sm:w-auto h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Submit report
          </button>
        </div>
      </form>
    </Modal>
  );
}
