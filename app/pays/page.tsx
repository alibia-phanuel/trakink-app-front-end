"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "../context/ProtectedRoute";
import ContentWrapper from "@/components/ContentWrapperProps";
import SearchBar from "@/components/SearchBar";
import { getCountries } from "@/lib/pays";
import { Country } from "@/type/pays";
import PaysTable from "@/components/PaysTable";
import AddPaysModal from "@/components/AddPaysModal";
import { getPaysStats, PaysStats } from "@/lib/pays"; // ✅ stats
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const PaysPage = () => {
  // 📦 State principal
  const [paysList, setPaysList] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIF" | "INACTIF">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // 📄 Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });

  // 🔹 Stats
  const [stats, setStats] = useState<PaysStats | null>(null);
  const [statsAccess, setStatsAccess] = useState(false); // ✅ indique si l’utilisateur a le droit
  const [loadingStats, setLoadingStats] = useState(false);

  // 📥 Chargement des pays
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

  // 🔹 Chargement des stats pour le bouton/modal
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await getPaysStats();
      setStats(data);
      setStatsAccess(true); // l’accès est autorisé
    } catch (err: any) {
      if (err.message.includes("Accès interdit")) {
        setStatsAccess(false); // pas d’accès → bouton caché
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 🔎 Filtrage par recherche + statut
  const filteredPays = paysList.filter((p) => {
    const matchSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <ProtectedRoute>
      <ContentWrapper className="bg-[#f5dcd3] p-4 sm:p-6 md:p-[22px] flex flex-col h-[calc(100vh-109px)]">
        {/* 🔹 Header */}
        <div className="bg-white rounded-lg shadow-md px-4 py-4 sm:px-6 flex flex-col lg:flex-row gap-4 lg:gap-0 items-start lg:items-center justify-between">
          <div className="w-full lg:w-auto">
            <SearchBar
              placeholder="Rechercher un pays..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
            {/* ✅ Filtre par statut */}
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="ACTIF">Actifs</SelectItem>
                <SelectItem value="INACTIF">Inactifs</SelectItem>
              </SelectContent>
            </Select>

            {/* ➕ Ajout pays */}
            <AddPaysModal onSuccess={() => loadPays(currentPage)} />

            {/* 📊 Bouton Stats → visible seulement si accès autorisé */}
            {statsAccess && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">Voir les stats</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Statistiques des pays</DialogTitle>
                  </DialogHeader>

                  {loadingStats ? (
                    <p>Chargement...</p>
                  ) : stats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="bg-gray-100 p-3 rounded">
                        <p>Total pays</p>
                        <p className="font-bold text-lg">{stats.totalPays}</p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded">
                        <p>Pays actifs</p>
                        <p className="font-bold text-lg">{stats.paysActifs}</p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded">
                        <p>Pays inactifs</p>
                        <p className="font-bold text-lg">
                          {stats.paysInactifs}
                        </p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded">
                        <p>Taux activation</p>
                        <p className="font-bold text-lg">
                          {stats.tauxActivation}%
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p>Pas de données disponibles.</p>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* 📊 Tableau */}
        <div className="flex-1 w-full overflow-auto mt-4 rounded-lg bg-white shadow-md p-4 sm:p-6 min-h-[300px]">
          <PaysTable pays={filteredPays} />
        </div>

        {/* 📑 Pagination */}
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
