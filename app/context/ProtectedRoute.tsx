"use client";

import { useAuth } from "@/app/context/authContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Chargement des données utilisateur...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
