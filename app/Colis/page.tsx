/* eslint-disable @typescript-eslint/no-explicit-any */
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
import ColisFormDialog from "@/components/AddColisForm";
import ColisDetailsModal from "@/components/actions/ColisDetailsModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useDebounce } from "use-debounce";
import { QRCodeCanvas } from "qrcode.react";
import { isValidDate } from "@/utils/isValidDate";

// Inline CSS styles for printing (unchanged)
const modalStyles = `...`; // Omitted for brevity

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
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statutFilter, setStatutFilter] =
    useState<(typeof STATUT_OPTIONS)[number]>("TOUS");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedColisId, setSelectedColisId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [colisToDeleteId, setColisToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddColisOpen, setIsAddColisOpen] = useState(false);

  const [debouncedSearch] = useDebounce(search, 500);
  const [debouncedPhoneFilter] = useDebounce(phoneFilter, 500);

  const handleColisCreated = (newColis: Colis) => {
    const created = new Date(newColis.createdAt);
    const matchesSearch =
      !debouncedSearch ||
      newColis.nom_destinataire
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
    const matchesPhone =
      !debouncedPhoneFilter ||
      newColis.numero_tel_destinataire
        .toLowerCase()
        .includes(debouncedPhoneFilter.toLowerCase());
    const matchesStatus =
      statutFilter === "TOUS" || newColis.statut === statutFilter;
    const matchesDate =
      (!startDate ||
        (isValidDate(startDate) && created >= new Date(startDate))) &&
      (!endDate || (isValidDate(endDate) && created <= new Date(endDate)));

    if (matchesSearch && matchesPhone && matchesStatus && matchesDate) {
      setColisList((prev) => [newColis, ...prev].slice(0, limit));
    }

    setPagination((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        total: prev.total + 1,
        totalPages: Math.ceil((prev.total + 1) / limit),
      };
    });

    setIsAddColisOpen(false);
  };

  const fetchColis = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await getColis({
        page,
        limit,
        search: debouncedSearch,
        statut: statutFilter !== "TOUS" ? statutFilter : undefined,
        signal,
      });

      const filteredColis = data.colis.filter((c) => {
        const created = new Date(c.createdAt);
        const matchesDate =
          (!startDate ||
            (isValidDate(startDate) && created >= new Date(startDate))) &&
          (!endDate || (isValidDate(endDate) && created <= new Date(endDate)));
        const matchesPhone =
          !debouncedPhoneFilter ||
          c.numero_tel_destinataire
            .toLowerCase()
            .includes(debouncedPhoneFilter.toLowerCase());
        return matchesDate && matchesPhone;
      });

      setColisList(filteredColis);
      setPagination(data.pagination);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.warn("Requête annulée, ignorée");
        return;
      }
      console.error("Erreur lors de la récupération des colis:", err);
      toast.error("Erreur lors de la récupération des colis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchColis(controller.signal);
    return () => controller.abort();
  }, [
    page,
    debouncedSearch,
    debouncedPhoneFilter,
    statutFilter,
    startDate,
    endDate,
  ]);

  const selectedColis = colisList.find((colis) => colis.id === selectedColisId);

  const handleDeleteColis = async () => {
    if (!colisToDeleteId) return;
    setIsDeleting(true);
    try {
      const response = await deleteColis(colisToDeleteId);
      setIsDeleteModalOpen(false);
      setColisToDeleteId(null);
      setColisList((prev) =>
        prev.filter((colis) => colis.id !== colisToDeleteId)
      );
      setPagination((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / limit),
        };
      });
      toast.success(response.message);
    } catch (error: any) {
      console.error("Erreur lors de la suppression du colis:", error);
      toast.error(error.message || "Échec de la suppression du colis");
    } finally {
      setIsDeleting(false);
    }
  };

  const generateQRCodeImage = (data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      import("react-dom/client")
        .then(({ createRoot }) => {
          const root = createRoot(container);
          root.render(
            <QRCodeCanvas
              value={data}
              size={150}
              bgColor="#f9fafb"
              fgColor="#1f2937"
              level="H"
              includeMargin={true}
            />
          );

          setTimeout(() => {
            const canvas = container.querySelector("canvas");
            if (canvas) {
              const image = canvas.toDataURL("image/png");
              root.unmount();
              document.body.removeChild(container);
              resolve(image);
            } else {
              root.unmount();
              document.body.removeChild(container);
              reject(new Error("Échec de la génération du QR code"));
            }
          }, 100);
        })
        .catch((error) => {
          document.body.removeChild(container);
          reject(error);
        });
    });
  };

  // Fonction pour gérer l'impression avec taille prédéfinie de 70mm x 90mm
  const handlePrintColis = async (colis: Colis) => {
    // Afficher un toast de chargement pendant la préparation
    const loadingToast = toast.loading("Préparation de l'impression...");
    try {
      // Vérifier que les données essentielles du colis sont présentes (statut non requis)
      if (
        !colis.id ||
        !colis.nom_destinataire ||
        !colis.numero_tel_destinataire ||
        !colis.ville_destination ||
        !colis.createdAt
      ) {
        throw new Error("Données du colis incomplètes");
      }

      // Créer les données pour le QR code avec les informations du colis
      const qrCodeData = JSON.stringify({
        id: colis.id,
        nom_destinataire: colis.nom_destinataire,
        numero_tel_destinataire: colis.numero_tel_destinataire,
        ville_destination: colis.ville_destination,
        statut: colis.statut,
      });

      // Générer l'image du QR code en base64
      const qrCodeImage = await generateQRCodeImage(qrCodeData);

      // Ouvrir une nouvelle fenêtre pour l'impression
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Impossible d'ouvrir la fenêtre d'impression");
      }

      // Écrire le contenu HTML dans la fenêtre d'impression avec taille 70mm x 90mm
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression Colis ${colis.id}</title>
            <style>
              ${modalStyles}
              body { margin: 0; padding: 5mm; box-sizing: border-box; }
              .print-container { 
                width: 70mm; 
                height: 90mm; 
                margin: auto; 
                font-size: 10px; 
                line-height: 1.2; 
                padding: 5mm; 
                box-sizing: border-box;
                border: 1px solid #e5e7eb;
              }
              .qr-code-img { width: 30mm; height: 30mm; } /* Augmenter la taille du QR code */
              h1 { font-size: 12px; margin-bottom: 4px; }
              p, span { font-size: 9px; }
              .info-row { 
                display: flex; 
                align-items: flex-start; 
                gap: 4px; 
                margin-bottom: 6px; 
              }
              .info-row svg { flex-shrink: 0; }
              .info-content { flex: 1; }
            </style>
          </head>
          <body>
            <div class="print-container">
              <!-- Entête avec titre et description -->
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">
                <h1 style="font-weight: bold; color: #1f2937; display: flex; align-items: center; gap: 4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#f97316" viewBox="0 0 24 24"><path d="M4 2v6h-2v8h2v6h16v-6h2v-8h-2v-6h-16zm2 2h12v6h-12v-6zm0 8h12v6h-12v-6zm-2 8h16v2h-16v-2z"/></svg>
                  Détails du colis
                </h1>
                <p style="color: #4b5563;">Informations du colis et QR code.</p>
              </div>
              <!-- Section des informations du colis -->
              <div style="padding: 8px 0; display: grid; gap: 6px;">
                <div class="info-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#6b7280" viewBox="0 0 24 24"><path d="M17 2h-10v2h-2v18h14v-18h-2v-2zm-8 2h6v2h-6v-2zm-2 4h10v12h-10v-12z"/></svg>
                  <div class="info-content">
                    <span style="font-weight: 600; color: #374151;">ID</span>
                    <p style="color: #111827;">${colis.id}</p>
                  </div>
                </div>
                <div class="info-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#6b7280" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z"/></svg>
                  <div class="info-content">
                    <span style="font-weight: 600; color: #374151;">Destinataire</span>
                    <p style="color: #111827;">${
                      colis.nom_destinataire || "Non spécifié"
                    }</p>
                  </div>
                </div>
                <div class="info-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#6b7280" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1v3.43c0 .55-.45 1-1 1-9.94 0-18-8.06-18-18 0-.55.45-1 1-1h3.43c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.12.35.03.74-.24 1.02l-2.2 2.2z"/></svg>
                  <div class="info-content">
                    <span style="font-weight: 600; color: #374151;">Téléphone</span>
                    <p style="color: #111827;">${
                      colis.numero_tel_destinataire || "Non spécifié"
                    }</p>
                  </div>
                </div>
                <div class="info-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#6b7280" viewBox="0 0 24 24"><path d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <div class="info-content">
                    <span style="font-weight: 600; color: #374151;">Ville</span>
                    <p style="color: #111827;">${
                      colis.ville_destination || "Non spécifié"
                    }</p>
                  </div>
                </div>
                <div class="info-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#6b7280" viewBox="0 0 24 24"><path d="M19 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2zm-10 2h6v2h-6v-2zm8 14h-12v-12h12v12z"/></svg>
                  <div class="info-content">
                    <span style="font-weight: 600; color: #374151;">Date de création</span>
                    <p style="color: #111827;">${
                      new Date(colis.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }) || "Non spécifié"
                    }</p>
                  </div>
                </div>
              </div>
              <!-- Section QR code -->
              <div style="margin-top: 6px; display: flex; flex-direction: column; align-items: center;">
                <span style="font-weight: 600; color: #374151; display: block; margin-bottom: 4px;">QR Code</span>
                <div style="background-color: #f9fafb; padding: 3mm; border-radius: 0.25rem;">
                  <img src="${qrCodeImage}" class="qr-code-img" alt="QR Code du colis" />
                </div>
                <p style="font-size: 8px; color: #6b7280; margin-top: 4px; text-align: center;">
                  Scannez pour infos (ID: ${colis.id}).
                </p>
              </div>
            </div>
            <script>console.log("Fenêtre d'impression ouverte, contenu chargé");</script>
          </body>
        </html>
      `);
      // Fermer le document et lancer l'impression
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
      // Mettre à jour le toast pour indiquer le succès
      toast.update(loadingToast, {
        render: "Impression prête",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error: any) {
      // Gérer les erreurs d'impression et mettre à jour le toast
      console.error("Erreur lors de la préparation de l'impression:", error);
      toast.update(loadingToast, {
        render: `Échec de l'impression: ${error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
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
            <Dialog open={isAddColisOpen} onOpenChange={setIsAddColisOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200">
                  <FaPlus className="mr-2 h-4 w-4" /> Ajouter Colis
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[80%] max-w-3xl overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau colis</DialogTitle>
                  <DialogDescription id="dialog-description">
                    Remplissez les informations ci-dessous pour enregistrer un
                    colis.
                  </DialogDescription>
                </DialogHeader>
                <ColisFormDialog onColisCreated={handleColisCreated} />
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
              <div className="flex flex-col gap-2 w-full sm:w-80">
                <Label htmlFor="phoneFilter">
                  Rechercher un numéro de téléphone
                </Label>
                <Input
                  id="phoneFilter"
                  placeholder="🔍 Entrez un numéro..."
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                  aria-label="Rechercher un numéro de téléphone"
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
                                    aria-label="Voir les détails du colis"
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
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePrintColis(colis)}
                                    aria-label="Imprimer les détails du colis"
                                  >
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
                                    aria-label="Supprimer le colis"
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
                Page {page} / {pagination?.totalPages || 1}
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
