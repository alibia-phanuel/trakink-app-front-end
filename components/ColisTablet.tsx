"use client";

import { useState } from "react";
import { Pencil, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import { updateColis, updateColisStatut } from "@/lib/Colis"; // ajuste le chemin
import { DeleteColisButton } from "./DeleteColisButton";
import * as z from "zod";

const updateColisSchema = z.object({
  pays_destination: z.string().min(2, "Pays requis"),
  ville_destination: z.string().min(2, "Ville requise"),
  mode_envoi: z.string().min(2, "Mode d'envoi requis"),
  unite_mesure: z.string().min(1, "Unité requise"),
  taille: z.number().positive("Taille doit être positive"),
});

type UpdateColisType = z.infer<typeof updateColisSchema>;

interface Colis {
  id: string;
  nom_colis: string;
  nom_destinataire: string;
  statut: string;
  pays_destination: string;
  ville_destination: string;
  mode_envoi: string;
  unite_mesure: string;
  taille: number;
}

interface Props {
  colis: Colis[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onDeleted: () => void;
}

export default function ColisTable({
  colis,
  selectedIds,
  onToggleSelect,
  onDeleted,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateColisType>({
    pays_destination: "",
    ville_destination: "",
    mode_envoi: "",
    unite_mesure: "",
    taille: 0,
  });

  const handleEditClick = (id: string) => {
    const colisToEdit = colis.find((c) => c.id === id);
    if (!colisToEdit) return;
    setEditId(id);
    setFormData({
      pays_destination: colisToEdit.pays_destination || "",
      ville_destination: colisToEdit.ville_destination || "",
      mode_envoi: colisToEdit.mode_envoi || "",
      unite_mesure: colisToEdit.unite_mesure || "",
      taille: colisToEdit.taille || 0,
    });
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "taille" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!editId) return;

    const parsed = updateColisSchema.safeParse(formData);
    if (!parsed.success) {
      toast.error("Veuillez remplir correctement le formulaire.");
      return;
    }

    try {
      await updateColis(editId, parsed.data);
      toast.success("Colis mis à jour !");
      onDeleted(); // refresh la liste
      setOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message); // 👈 affichera le bon message personnalisé
      } else {
        toast.error("Une erreur inattendue est survenue.");
      }
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-sm text-gray-700">
          <th className="p-3">
            <Checkbox
              checked={selectedIds.length === colis.length}
              onCheckedChange={() => {
                if (selectedIds.length === colis.length) {
                  colis.forEach((c) => onToggleSelect(c.id));
                } else {
                  colis.forEach((c) => {
                    if (!selectedIds.includes(c.id)) onToggleSelect(c.id);
                  });
                }
              }}
            />
          </th>
          <th className="p-3">Nom colis</th>
          <th className="p-3">Destinataire</th>
          <th className="p-3">Statut</th>
          <th className="p-3">Action</th>
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
            <td className="p-3 flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-full border flex justify-center items-center">
                <AvatarImage className="rounded-full" alt={c.nom_colis} />
                <AvatarFallback>
                  {c.nom_colis[0]}
                  {c.nom_colis[1]}
                </AvatarFallback>
              </Avatar>
              {c.nom_colis}
            </td>
            <td className="p-3">{c.nom_destinataire}</td>
            <td className="p-3">{c.statut}</td>
            <td className="p-3 flex gap-2 flex-wrap">
              {/* ✏️ Modifier colis */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditClick(c.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier le colis</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <Globe className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        name="pays_destination"
                        value={formData.pays_destination}
                        onChange={handleChange}
                        placeholder="Pays destination"
                        required
                        className="pl-8"
                      />
                    </div>
                    <Input
                      name="ville_destination"
                      value={formData.ville_destination}
                      onChange={handleChange}
                      placeholder="Ville destination"
                      required
                      className="pl-8"
                    />
                    <Input
                      name="mode_envoi"
                      value={formData.mode_envoi}
                      onChange={handleChange}
                      placeholder="Mode d'envoi"
                      required
                      className="pl-8"
                    />
                    <Input
                      name="unite_mesure"
                      value={formData.unite_mesure}
                      onChange={handleChange}
                      placeholder="Unité de mesure"
                      required
                      className="pl-8"
                    />
                    <Input
                      type="number"
                      name="taille"
                      value={formData.taille}
                      onChange={handleChange}
                      placeholder="Taille"
                      required
                      className="pl-8"
                      min={0}
                      step={0.01}
                    />
                    <div className="flex justify-end">
                      <Button type="submit">Mettre à jour</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* ✅ Marquer comme reçu */}
              {c.statut !== "RECU_DESTINATION" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Marquer comme reçu
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Confirmer la réception
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Ce colis sera marqué comme{" "}
                        <strong>&#34;REÇU À DESTINATION&ldquo;</strong>. Cette
                        action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            await updateColisStatut(c.id, "RECU_DESTINATION");
                            toast.success("Colis marqué comme reçu !");
                            onDeleted(); // ou onRefreshColis()
                          } catch (error) {
                            const msg =
                              error instanceof Error
                                ? error.message
                                : "Erreur inconnue";
                            toast.error(msg);
                          }
                        }}
                      >
                        Confirmer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* 🗑 Supprimer colis */}
              <DeleteColisButton colisId={c.id} onDeleted={onDeleted} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
