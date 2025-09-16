"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColisPayload } from "@/type/colis";
import { ColisEditDialog } from "@/components/ColisEditDialog";
import { DeleteColisButton } from "./DeleteColisButton";
import { Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  colis: ColisPayload[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onDeleted: () => void;
}

export default function ColisList({
  colis,
  selectedIds,
  onToggleSelect,
  onDeleted,
}: Props) {
  const isSelected = (id: string) => selectedIds.includes(id);

  const handlePrint = (colisId: string) => {
    console.log(colisId);
    // Implement print functionality here
    window.print();
  };

  const handleViewDetails = (colisId: string) => {
    // Implement view details functionality here
    console.log(`View details for colis: ${colisId}`);
  };

  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-sm text-gray-700">
          <th className="p-3"></th>
          <th className="p-3">Nom colis</th>
          <th className="p-3">Destinataire</th>
          <th className="p-3">Statut</th>
          <th className="p-3">Image</th>
          <th className="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {colis.map((c) => (
          <tr
            key={c.id}
            className="border-t border-gray-200 hover:bg-gray-50 text-sm"
          >
            <td className="p-3">
              <Checkbox
                checked={isSelected(c.id ?? "")}
                onCheckedChange={() => onToggleSelect(c.id ?? "")}
              />
            </td>
            <td className="p-3">{c.nom_colis}</td>
            <td className="p-3">{c.nom_destinataire}</td>
            <td className="p-3">
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${
                  c.statut === "RECU_DESTINATION"
                    ? "bg-green-100 text-green-800"
                    : c.statut === "QUITTE_CHINE"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {c.statut === "RECU_DESTINATION"
                  ? "Reçu à destination"
                  : c.statut === "QUITTE_CHINE"
                  ? "Quitte Chine"
                  : c.statut}
              </span>
            </td>
            <td className="p-3">
              {c.images_colis?.[0] ? (
                <img
                  src={c.images_colis[0]}
                  alt={c.nom_colis}
                  className="w-16 h-16 object-cover rounded-md"
                />
              ) : (
                <span className="text-gray-500">Aucune image</span>
              )}
            </td>
            <td className="p-3 flex gap-2 flex-wrap">
              {c.id && <ColisEditDialog colisId={c.id} onUpdated={onDeleted} />}
              {c.id && (
                <DeleteColisButton colisId={c.id} onDeleted={onDeleted} />
              )}
              {c.id && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline" // Changé de "ghost" à "outline" pour correspondre à ColisEditDialog
                        size="icon"
                        onClick={() => handleViewDetails(c.id!)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voir détails</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {c.id && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline" // Changé de "ghost" à "outline" pour correspondre à ColisEditDialog
                        size="icon"
                        onClick={() => handlePrint(c.id!)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Imprimer</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
