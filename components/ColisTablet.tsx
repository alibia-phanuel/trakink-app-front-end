"use client";
import { Checkbox } from "@/components/ui/checkbox";
 import { ColisPayload } from "@/type/colis";
// import ColisEditDialog from "./ColisEditDialog";
// import ColisStatutButton from "./ColisStatutButton";
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
            <td className="p-3">{c.statut}</td>
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
              {/* <ColisEditDialog colis={c} onUpdated={onDeleted} />
              <ColisStatutButton
                colisId={c.id}
                statut={c.statut}
                onUpdated={onDeleted}
              /> */}
              <DeleteColisButton colisId={c.id} onDeleted={onDeleted} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
