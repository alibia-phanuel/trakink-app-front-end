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
import { useDebounce } from "use-debounce";
import { QRCodeCanvas } from "qrcode.react";

// Inline CSS styles for printing
const modalStyles = `
  .modal-content, .modal-content * {
    color: #000000 !important;
    background-color: #ffffff !important;
    border-color: #000000 !important;
    font-family: Arial, Helvetica, sans-serif !important;
    transform: none !important;
    opacity: 1 !important;
    -webkit-font-smoothing: antialiased !important;
    text-rendering: optimizeLegibility !important;
  }
  .modal-content .text-gray-500 { color: #6b7280 !important; }
  .modal-content .text-gray-600 { color: #4b5563 !important; }
  .modal-content .text-gray-700 { color: #374151 !important; }
  .modal-content .text-gray-800 { color: #1f2937 !important; }
  .modal-content .text-gray-900 { color: #111827 !important; }
  .modal-content .text-orange-500 { color: #f97316 !important; }
  .modal-content .bg-gray-50 { background-color: #f9fafb !important; }
  .modal-content .bg-purple-100 { background-color: #f3e8ff !important; }
  .modal-content .text-purple-800 { color: #6b21a8 !important; }
  .modal-content .bg-yellow-100 { background-color: #fefcbf !important; }
  .modal-content .text-yellow-800 { color: #a16207 !important; }
  .modal-content .bg-blue-100 { background-color: #dbeafe !important; }
  .modal-content .text-blue-800 { color: #1e40af !important; }
  .modal-content .bg-green-100 { background-color: #dcfce7 !important; }
  .modal-content .text-green-800 { color: #166534 !important; }
  .modal-content .shadow-sm { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important; }
  .modal-content .shadow-xl { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1) !important; }
  .modal-content .border-b { border-bottom: 1px solid #e5e7eb !important; }
  .modal-content .border-t { border-top: 1px solid #e5e7eb !important; }
  .modal-content .rounded { border-radius: 0.25rem !important; }
  .modal-content .rounded-lg { border-radius: 0.5rem !important; }
  .modal-content .rounded-full { border-radius: 9999px !important; }
  @media print {
    .print-container { box-shadow: none !important; margin: 0 !important; }
    body { margin: 10mm !important; }
  }
`;

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

  // Débouncing des inputs de recherche
  const [debouncedSearch] = useDebounce(search, 500);
  const [debouncedPhoneFilter] = useDebounce(phoneFilter, 500);

  const fetchColis = async () => {
    try {
      setLoading(true);
      const data = await getColis({
        page,
        limit,
        search: debouncedSearch,
        statut: statutFilter !== "TOUS" ? statutFilter : undefined,
      });

      const filteredColis = data.colis.filter((c) => {
        const created = new Date(c.createdAt);
        const matchesDate =
          (!startDate || created >= new Date(startDate)) &&
          (!endDate || created <= new Date(endDate));
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
      if (err.name === "AxiosError" && err.code === "ECONNABORTED") {
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
    fetchColis();
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
      await fetchColis();
      toast.success(response.message);
    } catch (error: any) {
      console.error("Erreur lors de la suppression du colis:", error);
      toast.error(error.message || "Échec de la suppression du colis");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fonction pour générer une image base64 du QR code
  const generateQRCodeImage = (data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Créer un conteneur temporaire pour le QR code
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px"; // Hors écran
      document.body.appendChild(container);

      // Importer createRoot depuis react-dom/client
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

          // Attendre que le canvas soit rendu
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
          }, 100); // Délai pour assurer le rendu
        })
        .catch((error) => {
          document.body.removeChild(container);
          reject(error);
        });
    });
  };

  // Fonction pour gérer l'impression
  const handlePrintColis = async (colis: Colis) => {
    const loadingToast = toast.loading("Préparation de l'impression...");
    console.log("Colis à imprimer:", colis); // Log pour débogage

    try {
      // Validation des données
      if (
        !colis.id ||
        !colis.nom_destinataire ||
        !colis.numero_tel_destinataire ||
        !colis.ville_destination ||
        !colis.statut ||
        !colis.createdAt
      ) {
        throw new Error("Données du colis incomplètes");
      }

      // Générer le QR code comme image base64
      const qrCodeData = JSON.stringify({
        id: colis.id,
        nom_destinataire: colis.nom_destinataire,
        numero_tel_destinataire: colis.numero_tel_destinataire,
        ville_destination: colis.ville_destination,
        statut: colis.statut,
      });

      const qrCodeImage = await generateQRCodeImage(qrCodeData);

      // Ouvre une nouvelle fenêtre d'impression
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Impossible d'ouvrir la fenêtre d'impression");
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Impression Colis ${colis.id}</title>
            <style>
              ${modalStyles}
              body { margin: 20px; }
              .print-container { max-width: 500px; margin: auto; }
              .qr-code-img { width: 150px; height: 150px; }
            </style>
          </head>
          <body>
            <div class="modal-content print-container">
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;">
                <h1 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; display: flex; align-items: center; gap: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#f97316" viewBox="0 0 24 24"><path d="M4 2v6h-2v8h2v6h16v-6h2v-8h-2v-6h-16zm2 2h12v6h-12v-6zm0 8h12v6h-12v-6zm-2 8h16v2h-16v-2z"/></svg>
                  Détails du colis
                </h1>
                <p style="color: #4b5563;">Consultez les informations détaillées du colis et son QR code.</p>
              </div>
              <div style="padding: 24px 0; display: grid; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6b7280" viewBox="0 0 24 24"><path d="M17 2h-10v2h-2v18h14v-18h-2v-2zm-8 2h6v2h-6v-2zm-2 4h10v12h-10v-12z"/></svg>
                  <div style="flex: 1;">
                    <span style="font-weight: 600; color: #374151;">ID</span>
                    <p style="color: #111827;">${colis.id}</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6b7280" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z"/></svg>
                  <div style="flex: 1;">
                    <span style="font-weight: 600; color: #374151;">Destinataire</span>
                    <p style="color: #111827;">${
                      colis.nom_destinataire || "Non spécifié"
                    }</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6b7280" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1v3.43c0 .55-.45 1-1 1-9.94 0-18-8.06-18-18 0-.55.45-1 1-1h3.43c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.12.35.03.74-.24 1.02l-2.2 2.2z"/></svg>
                  <div style="flex: 1;">
                    <span style="font-weight: 600; color: #374151;">Téléphone</span>
                    <p style="color: #111827;">${
                      colis.numero_tel_destinataire || "Non spécifié"
                    }</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6b7280" viewBox="0 0 24 24"><path d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <div style="flex: 1;">
                    <span style="font-weight: 600; color: #374151;">Ville</span>
                    <p style="color: #111827;">${
                      colis.ville_destination || "Non spécifié"
                    }</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6b7280" viewBox="0 0 24 24"><path d="M17 2h-10v2h-2v18h14v-18h-2v-2zm-8 2h6v2h-6v-2zm-2 4h10v12h-10v-12z"/></svg>
                  <div style="flex: 1;">
                    <span style="font-weight: 600; color: #374151;">Statut</span>
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; ${getStatusColor(
                      colis.statut
                    )}">
                      ${STATUT_LABELS[colis.statut ?? ""] || "Inconnu"}
                    </span>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6b7280" viewBox="0 0 24 24"><path d="M19 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2zm-10 2h6v2h-6v-2zm8 14h-12v-12h12v12z"/></svg>
                  <div style="flex: 1;">
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
              <div style="margin-top: 24px;">
                <span style="font-weight: 600; color: #374151; display: block; margin-bottom: 8px;">QR Code</span>
                <div style="display: flex; justify-content: center; background-color: #f9fafb; padding: 16px; border-radius: 0.5rem;">
                  <img src="${qrCodeImage}" class="qr-code-img" alt="QR Code du colis" />
                </div>
                <p style="font-size: 0.875rem; color: #6b7280; margin-top: 8px; text-align: center;">
                  Scannez ce QR code pour accéder aux informations du colis (ID : ${
                    colis.id
                  }).
                </p>
              </div>
            </div>
            <script>console.log("Fenêtre d'impression ouverte, contenu chargé");</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
      toast.update(loadingToast, {
        render: "Impression prête",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error: any) {
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
