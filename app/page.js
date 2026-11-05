"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/home");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Loading Rackbase NOC...</span>
      </div>
    </div>
  );
}
