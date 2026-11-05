"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert, CircleDot } from "lucide-react";

export default function StatusBadge({ status, size = "md" }) {
  let bg = "bg-slate-100 text-slate-700 border-slate-200";
  let Icon = CircleDot;

  const normalized = (status || "").toLowerCase();

  if (normalized === "online" || normalized === "resolved" || normalized === "completed" || normalized === "operational") {
    bg = "bg-emerald-50 text-emerald-700 border-emerald-200";
    Icon = CheckCircle2;
  } else if (normalized === "offline" || normalized === "critical") {
    bg = "bg-rose-50 text-rose-700 border-rose-200";
    Icon = XCircle;
  } else if (normalized === "warning" || normalized === "high" || normalized === "investigating" || normalized === "in progress") {
    bg = "bg-amber-50 text-amber-700 border-amber-200";
    Icon = AlertTriangle;
  } else if (normalized === "medium") {
    bg = "bg-blue-50 text-blue-700 border-blue-200";
    Icon = ShieldAlert;
  } else if (normalized === "low" || normalized === "scheduled" || normalized === "open") {
    bg = "bg-sky-50 text-sky-700 border-sky-200";
    Icon = Clock;
  } else if (normalized === "closed" || normalized === "unknown") {
    bg = "bg-slate-100 text-slate-600 border-slate-200";
    Icon = CircleDot;
  }

  const sizeClasses = size === "sm" ? "px-1.5 py-0.2 text-[10px]" : "px-2 py-0.5 text-[11px] font-medium";

  // Display status in normal sentence case (e.g. "Online", "In progress", "Critical")
  const displayLabel = status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : "";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses} ${bg} font-medium whitespace-nowrap`}>
      <Icon className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      <span>{displayLabel}</span>
    </span>
  );
}
