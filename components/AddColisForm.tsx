"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { uploadImagesToCloudinary } from "@/lib/cloudinary";
import { createColis } from "@/lib/Colis";
import { ColisPayload } from "@/type/colis";

const colisSchema = z.object({
  nom_destinataire: z.string().min(2, "Nom requis"),
  numero_tel_destinataire: z.string().min(5, "Téléphone requis"),
  email_destinataire: z.string().email("Email invalide"),
  pays_destination: z.string().min(2, "Pays requis"),
  ville_destination: z.string().min(2, "Ville requise"),
  adresse_destinataire: z.string().min(5, "Adresse requise"),
  nom_colis: z.string().min(1, "Nom du colis requis"),
  nature_colis: z.string().min(1, "Nature du colis requise"),
  mode_envoi: z.string().min(1, "Mode d'envoi requis"),
  unite_mesure: z.string().min(1, "Unité requise"),
  taille: z.number({ invalid_type_error: "Taille requise" }).positive(),
  images_colis_files: z
    .any()
    .refine((files) => files?.length > 0, "Au moins une image requise"),
});

type ColisFormData = z.infer<typeof colisSchema>;

export default function ColisForm() {
  const [open, setOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<
    { url: string; uploading: boolean }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ColisFormData>({
    resolver: zodResolver(colisSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const previews = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      uploading: true,
    }));
    setImagePreviews(previews);
  };

  const onSubmit = async (data: ColisFormData) => {
    if (!data.images_colis_files || data.images_colis_files.length === 0) {
      toast.error("Au moins une image est requise !");
      return;
    }

    setUploading(true);

    try {
      // 1️⃣ Upload des images vers Cloudinary
      const files = Array.from(data.images_colis_files) as File[];
      const uploadedImages = await uploadImagesToCloudinary(files);

      // 2️⃣ Vérifie les images uploadées avec succès
      const successImages = uploadedImages.filter(
        (img): img is { url: string; imageId: string } => img !== null
      );
      if (successImages.length === 0) {
        toast.error("Échec de l'upload de toutes les images !");
        return;
      }

      // 3️⃣ Prépare le payload final pour le backend
      const payload: ColisPayload = {
        ...data,
        images_colis: successImages.map((img) => img.url),
        imageId: successImages.map((img) => img.imageId),
      };

      console.log("Données prêtes à envoyer :", payload);

      // 4️⃣ POST vers ton backend
      // 3️⃣ POST via ton helper createColis
      const res = await createColis(payload);
      toast.success(res.message || "Colis créé avec succès !");

      // 5️⃣ Met à jour les previews pour signaler la fin d'upload
      setImagePreviews(
        successImages.map((img) => ({ url: img.url, uploading: false }))
      );

      // 6️⃣ Reset du formulaire si besoin
      // reset(); // décommenter si tu veux vider le form
    } catch (err: any) {
      console.error("Erreur création colis :", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la création du colis"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md py-4 sm:px-6 flex flex-col lg:flex-row gap-4 lg:gap-0 items-center lg:items-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#cd7455] hover:bg-[#f2b49e] text-white flex items-center gap-2">
            <Plus size={18} /> Ajouter un colis
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un Colis</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouveau colis
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 max-h-[80vh] overflow-y-auto"
          >
            {/* === DESTINATAIRE === */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du destinataire</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: "nom_destinataire",
                    label: "Nom",
                    icon: <User className="w-5 h-5" />,
                  },
                  {
                    id: "numero_tel_destinataire",
                    label: "Téléphone",
                    icon: <Phone className="w-5 h-5" />,
                  },
                  {
                    id: "email_destinataire",
                    label: "Email",
                    icon: <Mail className="w-5 h-5" />,
                  },
                  {
                    id: "pays_destination",
                    label: "Pays",
                    icon: <Globe className="w-5 h-5" />,
                  },
                  {
                    id: "ville_destination",
                    label: "Ville",
                    icon: <MapPin className="w-5 h-5" />,
                  },
                ].map((field, idx) => (
                  <div className="relative" key={field.id}>
                    <Label htmlFor={field.id} className="mb-2">
                      {field.label}
                    </Label>
                    <span className="absolute left-2 top-7 text-gray-400">
                      {field.icon}
                    </span>
                    <Input
                      {...register(field.id as any)}
                      className="pl-10"
                      id={field.id}
                      autoFocus={idx === 0}
                    />
                    {errors[field.id as keyof ColisFormData] && (
                      <p className="text-red-500 text-sm">
                        {
                          errors[field.id as keyof ColisFormData]
                            ?.message as string
                        }
                      </p>
                    )}
                  </div>
                ))}
                <div className="relative md:col-span-2">
                  <Label htmlFor="adresse_destinataire" className="mb-2">
                    Adresse
                  </Label>
                  <Textarea
                    {...register("adresse_destinataire")}
                    id="adresse_destinataire"
                    className="pl-3"
                  />
                  {errors.adresse_destinataire && (
                    <p className="text-red-500 text-sm">
                      {errors.adresse_destinataire.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* === COLIS === */}
            <Card>
              <CardHeader>
                <CardTitle>Informations sur le colis</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "nom_colis", label: "Nom du colis" },
                  { id: "nature_colis", label: "Nature" },
                  { id: "mode_envoi", label: "Mode d'envoi" },
                  { id: "unite_mesure", label: "Unité" },
                  { id: "taille", label: "Taille", type: "number" },
                ].map((field) => (
                  <div className="relative" key={field.id}>
                    <Label htmlFor={field.id} className="mb-2">
                      {field.label}
                    </Label>
                    <Input
                      {...register(
                        field.id as any,
                        field.id === "taille" ? { valueAsNumber: true } : {}
                      )}
                      id={field.id}
                      type={field.type || "text"}
                    />
                    {errors[field.id as keyof ColisFormData] && (
                      <p className="text-red-500 text-sm">
                        {
                          errors[field.id as keyof ColisFormData]
                            ?.message as string
                        }
                      </p>
                    )}
                  </div>
                ))}

                <div className="relative md:col-span-2">
                  <Label htmlFor="images_colis_files" className="mb-2">
                    Images du colis
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-gray-400">
                      <ImageIcon className="w-5 h-5" />
                    </span>
                    <Input
                      {...register("images_colis_files")}
                      id="images_colis_files"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/bmp"
                      className="pl-10"
                      onChange={handleFileChange}
                    />
                  </div>
                  {errors.images_colis_files?.message && (
                    <p className="text-red-500 text-sm">
                      {errors.images_colis_files.message}
                    </p>
                  )}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {imagePreviews.map((img, index) => (
                        <div
                          key={index}
                          className="relative w-24 h-24 border rounded-md overflow-hidden"
                        >
                          <img
                            src={img.url}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                          {img.uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-bold">
                              Uploading...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={uploading}
                className="bg-[#cd7455]"
              >
                {uploading ? "Upload en cours..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
