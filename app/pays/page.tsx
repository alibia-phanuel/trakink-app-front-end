"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "../context/ProtectedRoute";
import ContentWrapper from "@/components/ContentWrapperProps";
import SearchBar from "@/components/SearchBar";
import { getCountries } from "@/lib/pays";
import { Country } from "@/type/pays";
import PaysTable from "@/components/PaysTable"; // à créer similaire à UsersTable
import AddPaysModal from "@/components/AddPaysModal"; // modal pour créer un pays
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

const PaysPage = () => {
  const [paysList, setPaysList] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });

  const loadPays = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await getCountries(page, pagination.itemsPerPage);
        setPaysList(response.pays);
        setPagination(response.pagination);
      } catch (err) {
        console.error("Erreur lors du chargement des pays", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.itemsPerPage]
  );

  useEffect(() => {
    loadPays(currentPage);
  }, [currentPage, loadPays]);

  const filteredPays = paysList.filter((p) =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <ContentWrapper className="bg-[#f5dcd3] p-4 sm:p-6 md:p-[22px] flex flex-col h-[calc(100vh-109px)]">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md px-4 py-4 sm:px-6 flex flex-col lg:flex-row gap-4 lg:gap-0 items-start lg:items-center justify-between">
          <div className="w-full lg:w-auto">
            <SearchBar
              placeholder="Rechercher un pays..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
            <AddPaysModal onSuccess={() => loadPays(currentPage)} />
          </div>
        </div>

        {/* Tableau */}
        <div className="flex-1 w-full overflow-auto mt-4 rounded-lg bg-white shadow-md p-4 sm:p-6 min-h-[300px]">
          <PaysTable pays={filteredPays} />
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="h-auto bg-white rounded-lg shadow-md px-4 sm:px-6 py-4 mt-4 overflow-x-auto">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                  >
                    Précédent
                  </PaginationPrevious>
                </PaginationItem>

                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={i + 1 === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.totalPages)
                        setCurrentPage((p) => p + 1);
                    }}
                  >
                    Suivant
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </ContentWrapper>
    </ProtectedRoute>
  );
};

export default PaysPage;
