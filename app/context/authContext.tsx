/* eslint-disable @typescript-eslint/no-explicit-any */
// context/authContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, getProfile, logout } from "@/lib/authApi";
import { UserProfile, LoginCredentials } from "@/type/userProfileTypes";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginUser: (credentials: LoginCredentials) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      initializeUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = async (credentials: LoginCredentials) => {
    const res: any = await login(credentials);

    // Vérifier les droits d'accès
    // Supposons que tu envoies un header "X-Device-Type" pour distinguer mobile/web
    // Ici, on détermine deviceType côté frontend (exemple pour web)
    const deviceType = window.navigator.userAgent.match(/Mobi|Android/i)
      ? "mobile"
      : "web";

    const user = res.user;

    if (deviceType === "web" && !user.webAccess) {
      throw new Error(
        "Accès refusé : vous ne pouvez pas vous connecter depuis un PC."
      );
    }

    if (deviceType === "mobile" && !user.mobileAccess) {
      throw new Error(
        "Accès refusé : vous ne pouvez pas vous connecter depuis un mobile."
      );
    }

    // Sinon tout va bien : on sauvegarde les tokens
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);

    // Charger profil complet (optionnel si déjà dans res.user)
    const profile = await getProfile();
    setUser(profile);

    router.push("/dashboard");
  };
  const logoutUser = async () => {
    await logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
