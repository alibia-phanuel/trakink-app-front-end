"use client";

import React from "react";
import { AxiosError } from "axios";
import { Country } from "@/type/pays";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Flag from "react-flagkit";
import { deleteCountry } from "@/lib/pays";

interface PaysTableProps {
  pays: Country[];
  onDeleted?: () => void;
  onToggled?: () => void;
}

const PaysTable: React.FC<PaysTableProps> = ({ pays, onDeleted }) => {
  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le pays "${nom}" ?`)) return;

    try {
      const res = await deleteCountry(id);

      toast.success(res.message || `Pays "${nom}" supprimé avec succès !`);
      onDeleted?.(); // 🔄 callback pour rafraîchir la liste
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const status = error.response?.status;

      switch (status) {
        case 400:
          toast.error(
            `Impossible de supprimer "${nom}" : des colis ou utilisateurs y sont associés.`
          );
          break;
        case 403:
          toast.error(
            "Accès interdit : vous n’êtes pas autorisé à supprimer ce pays."
          );
          break;
        case 404:
          toast.error(`Pays "${nom}" introuvable.`);
          break;
        default:
          toast.error(
            error.response?.data?.message ||
              `Une erreur est survenue lors de la suppression de "${nom}".`
          );
      }
    }
  };

  if (!pays || pays.length === 0) return <div>Aucun pays trouvé.</div>;

  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-sm text-gray-700">
          <th className="p-3">Nom</th>
          <th className="p-3">Code</th>
          <th className="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {pays.map((p) => (
          <tr key={p.id} className="border-t border-gray-200 hover:bg-gray-50">
            <td className="p-3 flex items-center gap-2">
              <Flag country={p.code} style={{ width: 24, height: 18 }} />
              {p.nom}
            </td>
            <td className="p-3">{p.code}</td>

            <td className="p-3 flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(p.id, p.nom)}
              >
                Supprimer
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PaysTable;
