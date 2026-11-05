"use client";

import React from "react";
import Modal from "../Modal";
import { useRackbase } from "@/context/RackbaseContext";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, equipment }) {
  const { deleteEquipment, accessPoints } = useRackbase();

  if (!equipment) return null;

  const isRouter = equipment.id?.startsWith("RTR");
  const linkedAps = isRouter ? accessPoints.filter((ap) => ap.parentRouterId === equipment.id) : [];

  const handleConfirm = () => {
    deleteEquipment(equipment.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete equipment record"
      maxWidth="max-w-md"
    >
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200/80 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 leading-relaxed">
            <span className="font-semibold">Warning:</span> Are you sure you want to permanently delete{" "}
            <span className="font-bold text-rose-950">'{equipment.name}'</span> ({equipment.id})? This action cannot be undone.
          </div>
        </div>

        {linkedAps.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
            <div className="font-semibold">
              {linkedAps.length} connected access points detected:
            </div>
            <ul className="list-disc pl-4 text-[11px] space-y-0.5 mt-1">
              {linkedAps.map((ap) => (
                <li key={ap.id}>
                  {ap.name} ({ap.managementIp})
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-amber-900 pt-0.5">
              These APs will be automatically unlinked.
            </p>
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
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Confirm deletion
          </button>
        </div>
      </div>
    </Modal>
  );
}
