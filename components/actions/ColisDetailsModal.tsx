"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Colis } from "@/type/newColis";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaTag,
  FaCalendarAlt,
  FaQrcode,
} from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";

interface ColisDetailsModalProps {
  selectedColis: Colis | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getStatusColor: (statut?: string) => string;
}

const STATUT_LABELS: Record<string, string> = {
  COLLIS_AJOUTE: "Colis ajouté",
  QUITTE_CHINE: "Quitté la Chine",
  RECU_DESTINATION: "Reçu à destination",
  RECU_PAR_LE_CLIENT: "Reçu par le client",
};

// Inline CSS to override oklch colors and optimize for canvas rendering
const modalStyles = `
  .modal-content, .modal-content * {
    color: #000000 !important;
    background-color: #ffffff !important;
    border-color: #000000 !important;
    font-family: Arial, Helvetica, sans-serif !important; /* Standard font for better rendering */
    transform: none !important; /* Remove transforms */
    opacity: 1 !important; /* Ensure full opacity */
    -webkit-font-smoothing: antialiased !important; /* Improve font rendering */
    text-rendering: optimizeLegibility !important; /* Optimize text for clarity */
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
`;

export default function ColisDetailsModal({
  selectedColis,
  isOpen,
  onOpenChange,
  getStatusColor,
}: ColisDetailsModalProps) {
  // Generate QR code data
  const qrCodeData = selectedColis
    ? JSON.stringify({
        id: selectedColis.id,
        nom_destinataire: selectedColis.nom_destinataire,
        statut: selectedColis.statut,
      })
    : "";

  // Function to download the modal content as an image
  const handleDownloadImage = async () => {
    const element = document.querySelector(".modal-content") as HTMLElement;
    if (!element) return;

    // Inject CSS styles to override oklch and optimize rendering
    const styleElement = document.createElement("style");
    styleElement.innerHTML = modalStyles;
    document.head.appendChild(styleElement);

    try {
      // Ensure the element is fully visible before capture
      element.style.display = "block";
      element.style.position = "relative";
      element.style.width = "500px"; // Match sm:max-w-[500px]
      element.style.padding = "20px"; // Add padding for better appearance

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: window.devicePixelRatio * 3, // Increase scale based on DPR
        useCORS: true,
        logging: false, // Disable logging for cleaner console
        windowWidth: 500, // Set explicit window width
        windowHeight: element.scrollHeight, // Use element height
      });

      // Convert canvas to image
      const image = canvas.toDataURL("image/png", 1.0); // Use maximum quality
      const link = document.createElement("a");
      link.href = image;
      link.download = `colis_${selectedColis?.id || "details"}.png`;
      link.click();
    } catch (error) {
      console.error("Erreur lors de la génération de l'image :", error);
    } finally {
      // Clean up styles and reset element
      document.head.removeChild(styleElement);
      element.style.display = "";
      element.style.position = "";
      element.style.width = "";
      element.style.padding = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-lg shadow-xl transition-all duration-300 modal-content">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaQrcode className="h-5 w-5 text-orange-500" />
            Détails du colis
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Consultez les informations détaillées du colis et son QR code.
          </DialogDescription>
        </DialogHeader>
        {selectedColis ? (
          <div className="py-6 space-y-6">
            {/* Détails du colis */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <FaTag className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="font-semibold text-gray-700">ID</Label>
                  <p className="text-gray-900">{selectedColis.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaUser className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="font-semibold text-gray-700">
                    Destinataire
                  </Label>
                  <p className="text-gray-900">
                    {selectedColis.nom_destinataire}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="font-semibold text-gray-700">
                    Téléphone
                  </Label>
                  <p className="text-gray-900">
                    {selectedColis.numero_tel_destinataire}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="font-semibold text-gray-700">Ville</Label>
                  <p className="text-gray-900">
                    {selectedColis.ville_destination}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaTag className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="font-semibold text-gray-700">Statut</Label>
                  <span
                    className={cn(
                      "inline-block px-3 py-1 rounded-full text-sm font-medium",
                      getStatusColor(selectedColis.statut)
                    )}
                  >
                    {STATUT_LABELS[selectedColis.statut ?? ""] ?? "Inconnu"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="font-semibold text-gray-700">
                    Date de création
                  </Label>
                  <p className="text-gray-900">
                    {new Date(selectedColis.createdAt).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
            {/* QR Code */}
            <div className="mt-6">
              <Label className="font-semibold text-gray-700 mb-2 block">
                QR Code
              </Label>
              <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                {qrCodeData && (
                  <QRCodeSVG
                    value={qrCodeData}
                    size={150}
                    bgColor="#f9fafb"
                    fgColor="#1f2937"
                    level="H"
                    className="shadow-sm rounded"
                  />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Scannez ce QR code pour accéder aux informations du colis (ID :{" "}
                {selectedColis.id}).
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-600">
            Aucun colis sélectionné.
          </div>
        )}
        <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadImage}
            className="w-full sm:w-auto"
            disabled={!selectedColis}
          >
            Télécharger en image
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
