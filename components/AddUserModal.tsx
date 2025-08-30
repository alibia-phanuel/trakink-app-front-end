"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Separator } from "@/components/ui/separator";
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
import {
  Plus,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  Image as ImageIcon,
} from "lucide-react";

import { createUser } from "@/lib/Utilisateurs";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // ✅ Soumission du formulaire
  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);

      // Valeur par défaut de la photo de profil
      let url_photo_profil =
        "https://cdn2.iconfinder.com/data/icons/4web-3/139/header-account-image-line-512.png";
      let imageId: string | null = null;

      if (imageFile) {
        const uploaded = await uploadImageToCloudinary(imageFile);
        if (uploaded) {
          url_photo_profil = uploaded.url;
          imageId = uploaded.imageId;
        }
      }

      // Payload pour l'API
      const userPayload = {
        ...data,
        url_photo_profil,
        imageId, // nouveau champ ajouté
      };

      await createUser(userPayload);

      toast.success("Utilisateur ajouté !");
      onSuccess();
      setOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Gestion du changement de fichier avec prévisualisation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Limite côté client
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10MB)");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-h-[80vh] overflow-y-auto"
        >
          {/* === INFOS UTILISATEUR === */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du destinataire</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-red-500 text-sm">
                    {errors.prenom.message}
                  </p>
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
            </CardContent>
          </Card>

          <Separator />

          {/* === PARAMÈTRES D’ACCÈS === */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres d’accès</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Rôle */}
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

              {/* Accès Web & Mobile */}
              <div className="md:col-span-2 flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register("webAccess")} /> Accès Web
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register("mobileAccess")} /> Accès
                  Mobile
                </label>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* === IMAGE === */}
          <Card>
            <CardHeader>
              <CardTitle>Photo de profil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Prévisualisation"
                  className="w-24 h-24 rounded-full object-cover border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="file"
              />
            </CardContent>
          </Card>

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
