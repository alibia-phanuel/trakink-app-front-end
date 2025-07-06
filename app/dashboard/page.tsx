"use client";
import { useEffect, useState, useCallback } from "react";
import ContentWrapper from "@/components/ContentWrapperProps";
import { Users } from "@/type/user";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import UsersTable from "@/components/UsersTable";
import SearchBar from "@/components/SearchBar";
import RoleFilter from "@/components/RoleFilter";
import { fetchUsers } from "@/lib/Utilisateurs";
import { PaginationInfo } from "@/type/user";
import AddUserModal from "@/components/AddUserModal";
import ProtectedRoute from "@/app/context/ProtectedRoute";

const Page = () => {
  const [users, setUsers] = useState<Users[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("TOUS");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });

  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await fetchUsers(page, pagination.itemsPerPage);
        setUsers(response.users);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.itemsPerPage]
  );

  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage, loadUsers]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredUsers = users.filter((user) => {
    const fullText = `${user.nom} ${user.prenom} ${user.email}`.toLowerCase();
    const matchSearch = fullText.includes(searchTerm.toLowerCase());
    const matchRole = selectedRole === "TOUS" || user.role === selectedRole;
    return matchSearch && matchRole;
  });

  return (
    <ProtectedRoute>
      <ContentWrapper className="bg-[#f5dcd3] p-4 sm:p-6 md:p-[22px] flex flex-col h-[calc(100vh-109px)]">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md px-4 py-4 sm:px-6 flex flex-col lg:flex-row gap-4 lg:gap-0 items-start lg:items-center justify-between">
          <div className="w-full lg:w-auto">
            <SearchBar
              placeholder="Rechercher un utilisateur..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
            <RoleFilter
              defaultValue="TOUS"
              onChange={(value) => setSelectedRole(value)}
            />
            <AddUserModal onSuccess={() => loadUsers(currentPage)} />
          </div>
        </div>

        {/* Listing users */}
        <div className="flex-1 w-full overflow-auto mt-4 rounded-lg bg-white shadow-md p-4 sm:p-6 min-h-[300px]">
          {loading ? (
            <div className="w-full flex justify-center py-10">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Chargement...</span>
              </div>
            </div>
          ) : (
            <UsersTable
              users={filteredUsers}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDeleted={() => loadUsers(currentPage)}
            />
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="h-auto bg-white rounded-lg shadow-md px-4 sm:px-6 py-4 mt-4 overflow-x-auto">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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
                      if (currentPage < pagination.totalPages) {
                        setCurrentPage((prev) => prev + 1);
                      }
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

export default Page;
