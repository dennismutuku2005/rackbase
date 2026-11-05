"use client";

import React from "react";
import { useRackbase } from "@/context/RackbaseContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useRackbase();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = "border-emerald-200 bg-white text-slate-800";
        let iconClass = "text-emerald-500";

        if (toast.type === "error") {
          Icon = AlertCircle;
          borderClass = "border-rose-200 bg-white text-slate-800";
          iconClass = "text-rose-500";
        } else if (toast.type === "info") {
          Icon = Info;
          borderClass = "border-sky-200 bg-white text-slate-800";
          iconClass = "text-sky-500";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg ${borderClass} transition-all animate-in slide-in-from-bottom-2 fade-in duration-200`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

