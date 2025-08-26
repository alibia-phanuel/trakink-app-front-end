"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Users, Package, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/authContext";

const items = [
  {
    title: "Utilisateurs",
    url: "/dashboard",
    icon: Users,
  },
  {
    title: "Colis",
    url: "/Colis",
    icon: Package,
  },
];

export function AppSidebar() {
  const { logoutUser } = useAuth(); // ⬅️ Utilise le contexte ici
  const handleLogout = async () => {
    try {
      await logoutUser(); // ✅ Appelle le logout du contexte
      toast.success("Déconnexion réussie !");
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion :", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-white flex flex-col justify-between min-h-screen">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[20px] text-[#0000006a]">
              Accueil
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="pl-3">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className="flex items-center space-x-2"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* ✅ Bouton Déconnexion en bas */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-800"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
