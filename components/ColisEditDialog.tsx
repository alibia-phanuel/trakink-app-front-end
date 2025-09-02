"use client";

import { useState } from "react";
import { Edit } from "lucide-react"; // icône d’édition
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
  onUpdated: () => void; // callback quand édition terminée
}

export function ColisEditDialog({ colisId, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    setLoading(true);
    try {
      // 🔹 Ici, tu mettras plus tard la logique de mise à jour du colis
      console.log("Edition du colis :", colisId);
      // on peut simuler un timeout pour test
      await new Promise((res) => setTimeout(res, 500));
      onUpdated(); // pour rafraîchir la liste si nécessaire
      setOpen(false);
    } catch (err) {
      console.error("Erreur édition colis :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Éditer le colis</DialogTitle>
          <DialogDescription>
            Pour le moment, cette fonction est vide. Plus tard, tu pourras
            modifier le colis ici.
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
          <Button variant="default" onClick={handleEdit} disabled={loading}>
            Éditer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
