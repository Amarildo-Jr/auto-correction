'use client'

import { AdminProtection } from "@/components/AdminProtection";
import { DynamicSidebar } from "@/components/DynamicSidebar";
import { useState } from "react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <AdminProtection allowedRoles={['student']}>
      <div className="flex min-h-screen">
        <DynamicSidebar
          currentPath="/student"
          expanded={expanded}
          onToggle={() => setExpanded(prev => !prev)}
        />
        <div
          className={`flex-1 p-4 transition-all duration-300 ${expanded ? "ml-[280px]" : "ml-[80px]"
            }`}
        >
          {children}
        </div>
      </div>
    </AdminProtection>
  );
}
