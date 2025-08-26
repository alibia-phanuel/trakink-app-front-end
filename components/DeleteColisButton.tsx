"use client";

import { useState } from "react";
import { Trash } from "lucide-react";
import { deleteColis } from "@/lib/Colis";
import { toast } from "react-toastify";
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

interface Props {
  colisId: string;
  onDeleted: () => void;
}

export function DeleteColisButton({ colisId, onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteColis(colisId);
      toast.success(res.message || "Colis supprimé avec succès");
      setOpen(false);
      onDeleted(); // met à jour la liste
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 400) {
          toast.error(message || "Impossible de supprimer un colis déjà reçu.");
        } else if (status === 403) {
          toast.error(
            message || "Vous n'avez pas les permissions nécessaires."
          );
        } else {
          toast.error("Une erreur est survenue.");
        }
      } else {
        toast.error("Erreur de connexion au serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce colis ? Cette action est
            irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Non
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            Oui, supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
