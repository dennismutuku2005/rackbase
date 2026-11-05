"use client";

import React from "react";
import Link from "next/link";

export default function BrandLogo({ className = "" }) {
  return (
    <Link
      href="/dashboard/home"
      title="Rackbase"
      className={`flex items-center justify-center p-1 rounded-xl hover:bg-slate-50 transition-colors ${className}`}
    >
      {/* Brand Logo Image from public/logos/logos.png */}
      <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/logos.png"
          alt="Rackbase Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = "/logos/logo.png";
          }}
        />
      </div>
    </Link>
  );
}
