/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import API from "@/lib/api";

export function DeleteUserButton({
  userId,
  onDeleted,
}: {
  userId: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // ❌ avant : API.post("/users/delete", { userId })
      // ✅ maintenant : DELETE sur /users/{id}
      const res = await API.delete(`/users/${userId}`);
      toast.success(res.data.message || "Utilisateur supprimé avec succès");
      setOpen(false);
      onDeleted();
    } catch (err: any) {
      console.error("❌ Erreur détaillée :", err);
      if (err.response) {
        toast.error(
          `Erreur ${err.response.status} : ${
            err.response.data?.message || JSON.stringify(err.response.data)
          }`
        );
      } else {
        toast.error(err.message || "Erreur inconnue lors de la suppression");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon" className="cursor-pointer">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
        </DialogHeader>
        <p>
          Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est
          irréversible.
        </p>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
