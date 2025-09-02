"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColisPayload } from "@/type/colis";
import { ColisEditDialog } from "@/components/ColisEditDialog";
import { ColisStatutButton } from "@/components/ColisStatutButton";
import { DeleteColisButton } from "./DeleteColisButton";

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
                checked={isSelected(c.id)}
                onCheckedChange={() => onToggleSelect(c.id)}
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
              <ColisEditDialog colisId={c.id} onUpdated={onDeleted} />
              <ColisStatutButton
                colisId={c.id}
                statut={c.statut as "RECU_DESTINATION" | "QUITTE_CHINE"}
                onUpdated={onDeleted}
              />
              <DeleteColisButton colisId={c.id} onDeleted={onDeleted} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
