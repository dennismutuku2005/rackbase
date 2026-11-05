"use client";

import React from "react";

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = "emerald",
}) {
  const variantStyles = {
    emerald: {
      badgeBg: "bg-emerald-50 text-emerald-600",
    },
    sky: {
      badgeBg: "bg-sky-50 text-sky-600",
    },
    amber: {
      badgeBg: "bg-amber-50 text-amber-600",
    },
    purple: {
      badgeBg: "bg-purple-50 text-purple-600",
    },
    rose: {
      badgeBg: "bg-rose-50 text-rose-600",
    },
  };

  const style = variantStyles[variant] || variantStyles.emerald;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5 sm:p-4 shadow-xs flex items-start gap-3 transition-colors hover:border-slate-300 min-w-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.badgeBg}`}>
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-500 truncate">{title}</div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mt-0.5 truncate">
          {value}
        </div>
        {subtext && (
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
