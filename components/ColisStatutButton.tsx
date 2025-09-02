"use client";

import { useState } from "react";
import { ArrowRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateColisStatut } from "@/lib/Colis"; // service typé
import { toast } from "react-toastify";

interface Props {
  colisId: string;
  statut: "RECU_DESTINATION" | "QUITTE_CHINE";
  onUpdated: () => void;
}

export function ColisStatutButton({ colisId, statut, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleStatut = async () => {
    setLoading(true);
    try {
      const newStatut =
        statut === "QUITTE_CHINE" ? "RECU_DESTINATION" : "QUITTE_CHINE";

      const res = await updateColisStatut(colisId, newStatut);

      if (res.status === 200) {
        toast.success(`Statut mis à jour avec succès`);
      } else {
        toast.info(`Statut du colis inchangé`);
      }

      onUpdated();
      setOpen(false);
    } catch (err: any) {
      console.error("Erreur mise à jour statut :", err);
      toast.error(
        err.response?.data?.message || "Impossible de changer le statut"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = () => {
    if (statut === "RECU_DESTINATION") return "bg-green-100 text-green-800";
    if (statut === "QUITTE_CHINE") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`px-3 py-1 ${getStatutColor()}`} size="sm">
          {statut === "QUITTE_CHINE" ? "Quitte Chine" : "Reçu"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le statut du colis</DialogTitle>
          <DialogDescription>
            Le statut actuel est : <strong>{statut}</strong>. Veux-tu le changer
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button variant="default" onClick={toggleStatut} disabled={loading}>
            Changer le statut
            <ArrowRightCircle className="w-4 h-4 ml-2 inline" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
