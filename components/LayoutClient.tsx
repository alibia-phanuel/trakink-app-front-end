"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ne pas afficher la sidebar sur la racine "/"
  const shouldShowSidebar = pathname !== "/";

  return (
    <SidebarProvider>
      {shouldShowSidebar && <AppSidebar />}
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
