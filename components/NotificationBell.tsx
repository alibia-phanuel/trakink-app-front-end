"use client";

import { Bell } from "lucide-react";

export default function NotificationBell() {
  return (
    <div className="relative w-[50px] h-[50px] rounded-md bg-white flex items-center justify-center shadow-md">
      {/* Icône de cloche */}
      <Bell className="text-gray-700" size={24} />

      {/* Petit point rouge (notification active) */}
      <span className="absolute top-[10px] right-[10px] w-[10px] h-[10px] bg-[#cd7455] rounded-full" />
    </div>
  );
}
