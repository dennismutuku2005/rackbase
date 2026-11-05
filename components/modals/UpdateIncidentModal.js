"use client";

import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import { useRackbase } from "@/context/RackbaseContext";
import { CheckCircle2 } from "lucide-react";

export default function UpdateIncidentModal({ isOpen, onClose, incident }) {
  const { updateIncidentStatus, assignIncident } = useRackbase();

  const [status, setStatus] = useState("Open");
  const [technician, setTechnician] = useState("");
  const [note, setNote] = useState("");
  const [resolutionDetails, setResolutionDetails] = useState("");

  useEffect(() => {
    if (incident) {
      setStatus(incident.status || "Open");
      setTechnician(incident.assignedTechnician || "");
      setResolutionDetails(incident.resolutionDetails || "");
      setNote("");
    }
  }, [incident]);

  if (!incident) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (technician && technician !== incident.assignedTechnician) {
      assignIncident(incident.id, technician);
    }

    updateIncidentStatus(
      incident.id,
      status,
      note.trim() || `Status updated to ${status}.`,
      resolutionDetails.trim()
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update incident — ${incident.referenceNumber}`}
      subtitle={incident.title}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned technician
            </label>
            <input
              type="text"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              placeholder="e.g. Dennis Mutuku"
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Investigation note
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add update to the timeline..."
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {(status === "Resolved" || status === "Closed") && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <label className="block text-xs font-semibold text-emerald-900 mb-1">
              Resolution details
            </label>
            <textarea
              rows={2}
              value={resolutionDetails}
              onChange={(e) => setResolutionDetails(e.target.value)}
              placeholder="Root cause identified, equipment replaced, configuration applied..."
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-emerald-300 bg-white focus:outline-none"
            />
          </div>
        )}

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
            <CheckCircle2 className="w-3.5 h-3.5" />
            Save update
          </button>
        </div>
      </form>
    </Modal>
  );
}
