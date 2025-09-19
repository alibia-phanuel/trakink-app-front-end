"use client";

import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Country } from "@/type/pays";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch"; // ✅ toggle shadcn
import { toast } from "react-toastify";
import Flag from "react-flagkit";
import { deleteCountry, togglePaysStatus } from "@/lib/pays";

interface PaysTableProps {
  pays: Country[];
}

const PaysTable: React.FC<PaysTableProps> = ({ pays }) => {
  // ✅ État local qui reflète la liste reçue en props
  const [localPays, setLocalPays] = useState<Country[]>(pays);

  useEffect(() => {
    setLocalPays(pays); // met à jour si les props changent
  }, [pays]);

  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le pays "${nom}" ?`)) return;

    try {
      const res = await deleteCountry(id);
      toast.success(res.message || `Pays "${nom}" supprimé avec succès !`);

      // ✅ Mise à jour immédiate du state local
      setLocalPays((prev) => prev.filter((p) => p.id !== id));
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

  const handleToggle = async (id: string, nom: string) => {
    try {
      const res = await togglePaysStatus(id);
      toast.success(res.message || `Statut de "${nom}" mis à jour.`);

      // ✅ Met à jour localement le statut sans refresh
      setLocalPays((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: p.status === "ACTIF" ? "INACTIF" : "ACTIF" }
            : p
        )
      );
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error(
        error.response?.data?.message ||
          `Impossible de modifier le statut de "${nom}".`
      );
    }
  };

  if (!localPays || localPays.length === 0)
    return <div>Aucun pays trouvé.</div>;

  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-sm text-gray-700">
          <th className="p-3">Nom</th>
          <th className="p-3">Code</th>
          <th className="p-3">Statut</th>
          <th className="p-3">Ajouté par</th>
          <th className="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {localPays.map((p) => (
          <tr key={p.id} className="border-t border-gray-200 hover:bg-gray-50">
            {/* Nom + drapeau */}
            <td className="p-3 flex items-center gap-2">
              <Flag country={p.code} style={{ width: 24, height: 18 }} />
              {p.nom}
            </td>

            {/* Code pays */}
            <td className="p-3">{p.code}</td>

            {/* Statut avec toggle */}
            <td className="p-3 flex items-center gap-2">
              <Badge
                variant={p.status === "ACTIF" ? "secondary" : "destructive"}
                className={
                  p.status === "ACTIF"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : ""
                }
              >
                {p.status}
              </Badge>
              <Switch
                checked={p.status === "ACTIF"}
                onCheckedChange={() => handleToggle(p.id, p.nom)}
              />
            </td>

            {/* Ajouté par */}
            <td className="p-3 text-sm text-gray-700">
              {p.createdByUser
                ? `${p.createdByUser.nom} (${p.createdByUser.role})`
                : "Inconnu"}
            </td>

            {/* Actions */}
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
