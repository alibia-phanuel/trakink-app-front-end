"use client";

import { useEffect, useState } from "react";
import ContentWrapper from "@/components/ContentWrapperProps";
import ProtectedRoute from "@/app/context/ProtectedRoute";
import ColisForm from "@/components/AddColisForm";
import ColisList from "@/components/ColisTablet";
import { Skeleton } from "@/components/ui/skeleton";
import { getColis } from "@/lib/Colis";
import type { ColisPayload } from "@/type/colis";

const ITEMS_PER_PAGE = 10;

export default function ColisPage() {
  const [colis, setColis] = useState<ColisPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /** 🔹 Charge les colis depuis le backend (pagination côté serveur) */
  const loadColis = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getColis(page, ITEMS_PER_PAGE);
      setColis(response.colis);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(response.pagination.currentPage);
    } catch (err) {
      console.error("Erreur chargement colis :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColis();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <ProtectedRoute>
      <ContentWrapper className="bg-[#f5dcd3] p-4 sm:p-6 md:p-[22px] flex flex-col h-[calc(100vh-109px)]">
        <h1 className="text-2xl font-bold mb-4">📦 Gestion des Colis</h1>

        <ColisForm onCreated={() => loadColis(currentPage)} />

        <div className="flex-1 w-full overflow-auto mt-4 rounded-lg bg-white shadow-md p-4 sm:p-6 min-h-[300px]">
          {loading ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ColisList
              colis={colis} // ⚡ maintenant c'est déjà paginé côté serveur
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDeleted={() => loadColis(currentPage)}
            />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => loadColis(page)}
                  className={`px-3 py-1 rounded ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}
      </ContentWrapper>
    </ProtectedRoute>
  );
}
