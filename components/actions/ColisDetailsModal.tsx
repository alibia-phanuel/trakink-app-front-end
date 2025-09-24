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

export default function ColisDetailsModal({
  selectedColis,
  isOpen,
  onOpenChange,
  getStatusColor,
}: ColisDetailsModalProps) {
  // Générer les données pour le QR code
  const qrCodeData = selectedColis
    ? JSON.stringify({
        id: selectedColis.id,
        nom_destinataire: selectedColis.nom_destinataire,
        statut: selectedColis.statut,
      })
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-lg shadow-xl transition-all duration-300">
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
        <DialogFooter className="border-t pt-4">
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
