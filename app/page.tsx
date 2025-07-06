"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 3000); // Redirection après 3s pour laisser l'animation s'afficher

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white text-gray-800 animate-fade-in">
      <FaSpinner className="animate-spin text-teal-600 text-5xl mb-6" />
      <p className="text-lg font-medium mb-2">Redirection en cours...</p>
      <p className="text-2xl font-bold text-teal-800">TOUT À UN PRIX</p>
    </div>
  );
}
