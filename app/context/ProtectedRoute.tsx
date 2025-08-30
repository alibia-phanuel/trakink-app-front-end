"use client";

import { useAuth } from "@/app/context/authContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Skeleton Loader for ProtectedRoute
const SkeletonProtectedRoute = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-[#f5dcd3]">
      <div className="w-64 h-12 bg-gray-200 rounded animate-pulse" />
    </div>
  );
};

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
    return <SkeletonProtectedRoute />;
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
