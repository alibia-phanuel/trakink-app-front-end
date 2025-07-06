// app/ClientLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/components/header";
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/OTP" ||
    pathname === "/reset-password";
  return (
    <SidebarProvider>
      {!isAuthRoute && <AppSidebar />}
      <main className="w-full  flex flex-col">
        {!isAuthRoute && (
          <div className="bg-white flex h-[109px] shadow-sm  items-center p-4 cursor-pointer ">
            <SidebarTrigger className="bg-[#eeeeee] h-[50px] w-[50px] text-[28px] mr-4" />
            <Header />
          </div>
        )}
        <div className="w-full">{children}</div>
      </main>
      <ToastContainer />
    </SidebarProvider>
  );
}
