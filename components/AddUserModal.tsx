"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Mail, Lock, User, Phone, Globe } from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUser } from "@/lib/Utilisateurs";
import { uploadImageToFirebase } from "@/lib/firebase-upload";

// 💡 Définir les rôles autorisés
type Role = "EMPLOYE" | "ADMIN" | "DIRECTEUR";

// ✅ Schéma Zod pour la validation
const userSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  prenom: z.string().min(2, "Prénom requis"),
  email: z.string().email("Email invalide"),
  tel: z.string().min(6, "Téléphone requis"),
  password: z.string().min(6, "Mot de passe trop court"),
  pays: z.string().min(2, "Pays requis"),
  role: z.enum(["EMPLOYE", "ADMIN", "DIRECTEUR", "SUPER_ADMIN"]),
  webAccess: z.boolean(),
  mobileAccess: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function AddUserModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 🎯 Initialisation du form avec react-hook-form + zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      tel: "",
      password: "",
      pays: "",
      role: "EMPLOYE",
      webAccess: true,
      mobileAccess: true,
    },
  });

  // ✅ Fonction appelée lors de la soumission
  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);

      console.log("✅ Données valides :", data);
      console.log("🖼️ Image sélectionnée :", imageFile);

      // ✅ Image par défaut si aucune image fournie
      let url_photo_profil =
        "https://cdn2.iconfinder.com/data/icons/4web-3/139/header-account-image-line-512.png";

      if (imageFile) {
        const uploadedUrl = await uploadImageToFirebase(imageFile);
        if (uploadedUrl) {
          url_photo_profil = uploadedUrl;
        }
      }

      const userPayload = {
        ...data,
        url_photo_profil,
      };

      console.log("📦 Payload envoyé à l'API :", userPayload);

      await createUser(userPayload);
      toast.success("Utilisateur ajouté !");
      onSuccess();
      setOpen(false);
    } catch (err: any) {
      console.error("❌ Erreur :", err);
      toast.error(err.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#cd7455] hover:bg-[#f2b49e] text-white flex items-center gap-2">
          <Plus size={18} /> Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center mb-4">
            Ajouter un utilisateur
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* === CHAMPS TEXTE === */}
          <div className="grid grid-cols-2 gap-4">
            {/* Nom */}
            <div className="relative">
              <Label htmlFor="nom" className="mb-2">
                Nom
              </Label>
              <span className="absolute left-2 top-7 text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <Input {...register("nom")} className="pl-10" id="nom" />
              {errors.nom && (
                <p className="text-red-500 text-sm">{errors.nom.message}</p>
              )}
            </div>

            {/* Prénom */}
            <div className="relative">
              <Label htmlFor="prenom" className="mb-2">
                Prénom
              </Label>
              <span className="absolute left-2 top-7 text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <Input {...register("prenom")} className="pl-10" id="prenom" />
              {errors.prenom && (
                <p className="text-red-500 text-sm">{errors.prenom.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <Label htmlFor="email" className="mb-2">
                Email
              </Label>
              <span className="absolute left-2 top-7 text-gray-400">
                <Mail className="w-5 h-5" />
              </span>
              <Input
                {...register("email")}
                type="email"
                className="pl-10"
                id="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="relative">
              <Label htmlFor="tel" className="mb-2">
                Téléphone
              </Label>
              <span className="absolute left-2 top-7 text-gray-400">
                <Phone className="w-5 h-5" />
              </span>
              <Input {...register("tel")} className="pl-10" id="tel" />
              {errors.tel && (
                <p className="text-red-500 text-sm">{errors.tel.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <Label htmlFor="password" className="mb-2">
                Mot de passe
              </Label>
              <span className="absolute left-2 top-7 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <Input
                {...register("password")}
                type="password"
                className="pl-10"
                id="password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Pays */}
            <div className="relative">
              <Label htmlFor="pays" className="mb-2">
                Pays
              </Label>
              <span className="absolute left-2 top-7 text-gray-400">
                <Globe className="w-5 h-5" />
              </span>
              <Input {...register("pays")} className="pl-10" id="pays" />
              {errors.pays && (
                <p className="text-red-500 text-sm">{errors.pays.message}</p>
              )}
            </div>
          </div>

          {/* === RÔLE === */}
          <div>
            <Label htmlFor="role" className="mb-2">
              Rôle
            </Label>
            <select
              {...register("role")}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              id="role"
            >
              <option value="EMPLOYE">Employé</option>
              <option value="ADMIN">Admin</option>
              <option value="DIRECTEUR">Directeur</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {/* === ACCÈS === */}
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("webAccess")} />
              Accès Web
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("mobileAccess")} />
              Accès Mobile
            </label>
          </div>

          {/* === UPLOAD IMAGE === */}
          <div>
            <Label htmlFor="file" className="mb-2">
              Photo de profil
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              id="file"
            />
          </div>

          {/* === BOUTON ENVOYER === */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="bg-[#cd7455]">
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
