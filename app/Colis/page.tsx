"use client";

import { useEffect, useState } from "react";
import ContentWrapper from "@/components/ContentWrapperProps";
import ProtectedRoute from "@/app/context/ProtectedRoute";
import ColisForm from "@/components/AddColisForm";
import ColisList from "@/components/ColisTablet";
import { Skeleton } from "@/components/ui/skeleton";
import { getColis } from "@/lib/Colis"; // ✅ ton service getColis
import type { ColisPayload } from "@/type/colis";

const ITEMS_PER_PAGE = 5; // ⚡️ nombre de colis par page

const Page = () => {
  const [colis, setColis] = useState<ColisPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ✅ Charge les colis
  const loadColis = async (page: number) => {
    try {
      setLoading(true);
      const data = await getColis();
      setColis(data);

      // pagination simple côté front
      const total = data.length;
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
      setCurrentPage(page);
    } catch (err) {
      console.error("Erreur lors du chargement des colis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColis(1);
  }, []);

  // ✅ Gestion de la sélection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Découpe pour pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedColis = colis.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <ProtectedRoute>
      <ContentWrapper className="bg-[#f5dcd3] p-4 sm:p-6 md:p-[22px] flex flex-col h-[calc(100vh-109px)]">
        <h1 className="text-2xl font-bold mb-4">📦 Gestion des Colis</h1>

        <ColisForm />

        {/* Tableau des colis */}
        <div className="flex-1 w-full overflow-auto mt-4 rounded-lg bg-white shadow-md p-4 sm:p-6 min-h-[300px]">
          {loading ? (
            <div className="space-y-4">
              {/* Header skeleton */}
              <div className="flex gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Rows skeleton */}
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
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
              colis={paginatedColis}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDeleted={() => loadColis(currentPage)}
            />
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 gap-2">
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => loadColis(page)}
                className={`px-3 py-1 rounded ${
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      </ContentWrapper>
    </ProtectedRoute>
  );
};

export default Page;
