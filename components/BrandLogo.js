"use client";

import React from "react";
import Link from "next/link";

export default function BrandLogo({ className = "" }) {
  return (
    <Link
      href="/dashboard/home"
      title="Rackbase"
      className={`flex items-center justify-center p-1 rounded-lg hover:bg-slate-50 transition-colors ${className}`}
    >
      {/* Logo Mark Only */}
      <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 3L28 9.8L16 16.5L4 9.8L16 3Z" fill="#34D399" />
          <path d="M28 9.8V22.2L16 29V16.5L28 9.8Z" fill="#10B981" />
          <path d="M4 9.8L16 16.5V29L4 22.2V9.8Z" fill="#059669" />
          <path d="M16 16.5V29" stroke="#047857" strokeWidth="0.5" strokeOpacity="0.4" />
        </svg>
      </div>
    </Link>
  );
}
