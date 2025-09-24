"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEye, FaTrash, FaPrint } from "react-icons/fa";
import { ColisEditDialog } from "@/components/ColisEditDialog";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import ContentWrapper from "@/components/ContentWrapperProps";
import ProtectedRoute from "@/app/context/ProtectedRoute";
import { getColis } from "@/lib/newColis";
import { deleteColis } from "@/lib/Colis";
import type { Colis, Pagination } from "@/type/newColis";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import ColisForm from "@/components/AddColisForm";
import ColisDetailsModal from "@/components/actions/ColisDetailsModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const STATUT_OPTIONS = [
  "TOUS",
  "COLLIS_AJOUTE",
  "QUITTE_CHINE",
  "RECU_DESTINATION",
  "RECU_PAR_LE_CLIENT",
] as const;

const STATUT_LABELS: Record<string, string> = {
  COLLIS_AJOUTE: "Colis ajouté",
  QUITTE_CHINE: "Quitté la Chine",
  RECU_DESTINATION: "Reçu à destination",
  RECU_PAR_LE_CLIENT: "Reçu par le client",
};

const getStatusColor = (statut?: string) => {
  switch (statut) {
    case "COLLIS_AJOUTE":
      return "bg-purple-100 text-purple-800";
    case "QUITTE_CHINE":
      return "bg-yellow-100 text-yellow-800";
    case "RECU_DESTINATION":
      return "bg-blue-100 text-blue-800";
    case "RECU_PAR_LE_CLIENT":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Composant Spinner simple avec Tailwind
const Spinner = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

export default function ColisPage() {
  const [colisList, setColisList] = useState<Colis[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] =
    useState<(typeof STATUT_OPTIONS)[number]>("TOUS");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedColisId, setSelectedColisId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [colisToDeleteId, setColisToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchColis = async () => {
    try {
      setLoading(true);
      const data = await getColis({
        page,
        limit,
        search,
        statut: statutFilter !== "TOUS" ? statutFilter : undefined,
      });

      const filteredColis = data.colis.filter((c) => {
        const created = new Date(c.createdAt);
        if (startDate && created < new Date(startDate)) return false;
        if (endDate && created > new Date(endDate)) return false;
        return true;
      });

      setColisList(filteredColis);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Erreur lors de la récupération des colis:", err);
      toast.error("Erreur lors de la récupération des colis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColis();
  }, [page, search, statutFilter, startDate, endDate]);

  const selectedColis = colisList.find((colis) => colis.id === selectedColisId);

  const handleDeleteColis = async () => {
    if (!colisToDeleteId) return;
    setIsDeleting(true);
    try {
      const response = await deleteColis(colisToDeleteId);
      setIsDeleteModalOpen(false);
      setColisToDeleteId(null);
      await fetchColis(); // Rafraîchir la liste après suppression
      toast.success(response.message); // Afficher le message de l'API
    } catch (error: any) {
      console.error("Erreur lors de la suppression du colis:", error);
      toast.error(error.message || "Échec de la suppression du colis");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <ContentWrapper className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8 min-h-[calc(100vh-109px)]">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
        />
        <Card className="shadow-lg border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">
              📦 Gestion des Colis
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200">
                  <FaPlus className="mr-2 h-4 w-4" /> Ajouter Colis
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[80%] max-w-5xl h-[90%]">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau colis</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations ci-dessous pour enregistrer un
                    colis.
                  </DialogDescription>
                </DialogHeader>
                <ColisForm />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
              <div className="flex flex-col gap-2 w-full sm:w-80">
                <Label htmlFor="search">Rechercher un destinataire</Label>
                <Input
                  id="search"
                  placeholder="🔍 Entrez un nom..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                  aria-label="Rechercher un destinataire"
                />
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-48">
                <Label htmlFor="statut">Statut du colis</Label>
                <Select
                  value={statutFilter}
                  onValueChange={(value) =>
                    setStatutFilter(value as (typeof STATUT_OPTIONS)[number])
                  }
                >
                  <SelectTrigger id="statut">
                    <SelectValue placeholder="Tous statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUT_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s === "TOUS" ? "Tous statuts" : STATUT_LABELS[s] ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2 w-full sm:w-40">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                    aria-label="Date de début"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-40">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                    aria-label="Date de fin"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">
                      Destinataire
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Téléphone
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Ville
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Statut
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-8 w-28 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    : colisList.map((colis) => (
                        <TableRow
                          key={colis.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <TableCell>{colis.nom_destinataire}</TableCell>
                          <TableCell>{colis.numero_tel_destinataire}</TableCell>
                          <TableCell>{colis.ville_destination}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                getStatusColor(colis.statut)
                              )}
                            >
                              {STATUT_LABELS[colis.statut ?? ""] ?? "Inconnu"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right flex gap-2 justify-end">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedColisId(colis.id);
                                      setIsDetailsModalOpen(true);
                                    }}
                                  >
                                    <FaEye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Voir détails</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <ColisEditDialog
                                    colisId={colis.id}
                                    onUpdated={fetchColis}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>Modifier</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <FaPrint className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Imprimer</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                      setColisToDeleteId(colis.id);
                                      setIsDeleteModalOpen(true);
                                    }}
                                  >
                                    <FaTrash className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Supprimer</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

            {/* Modal de confirmation de suppression */}
            <Dialog
              open={isDeleteModalOpen}
              onOpenChange={setIsDeleteModalOpen}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Confirmer la suppression</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir supprimer ce colis ? Cette action
                    est irréversible.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setColisToDeleteId(null);
                    }}
                    disabled={isDeleting}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteColis}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <Spinner />
                        Suppression...
                      </span>
                    ) : (
                      "Oui, supprimer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <ColisDetailsModal
              selectedColis={selectedColis}
              isOpen={isDetailsModalOpen}
              onOpenChange={setIsDetailsModalOpen}
              getStatusColor={getStatusColor}
            />

            <div className="flex items-center justify-end gap-4 mt-4">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="transition-all duration-200"
              >
                ◀ Précédent
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} / {pagination?.totalPages ?? 1}
              </span>
              <Button
                variant="outline"
                disabled={pagination ? page >= pagination.totalPages : false}
                onClick={() => setPage((p) => p + 1)}
                className="transition-all duration-200"
              >
                Suivant ▶
              </Button>
            </div>
          </CardContent>
        </Card>
      </ContentWrapper>
    </ProtectedRoute>
  );
}
