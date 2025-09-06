"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  countries,
  cityMap,
  modeEnvoiOptions,
  uniteMesureOptions,
  natureColisOptions,
} from "@/constant/colisConstants";

const colisSchema = z.object({
  nom_destinataire: z.string().min(2, "Nom requis"),
  numero_tel_destinataire: z.string().min(5, "Téléphone requis"),
  email_destinataire: z.string().email("Email invalide"),
  pays_destination: z.enum(countries, {
    errorMap: () => ({ message: "Pays requis" }),
  }),
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

interface ColisFormProps {
  onCreated: () => void | Promise<void>;
}

export default function ColisForm({ onCreated }: ColisFormProps) {
  const [open, setOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<
    { url: string; uploading: boolean }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    ville_destination: string[];
    nature_colis: string[];
    mode_envoi: string[];
    unite_mesure: string[];
  }>({
    ville_destination: [],
    nature_colis: [],
    mode_envoi: [],
    unite_mesure: [],
  });
  const [isSuggestionOpen, setIsSuggestionOpen] = useState<{
    ville_destination: boolean;
    nature_colis: boolean;
    mode_envoi: boolean;
    unite_mesure: boolean;
  }>({
    ville_destination: false,
    nature_colis: false,
    mode_envoi: false,
    unite_mesure: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm<ColisFormData>({
    resolver: zodResolver(colisSchema),
  });

  const selectedCountry = watch("pays_destination");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const previews = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      uploading: true,
    }));
    setImagePreviews(previews);
  };

  const handleInputWithSuggestions = (
    value: string,
    onChange: (value: string) => void,
    field: keyof typeof suggestions,
    options: string[]
  ) => {
    onChange(value);
    if (value.length >= 1) {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions((prev) => ({ ...prev, [field]: filtered }));
      setIsSuggestionOpen((prev) => ({ ...prev, [field]: true }));
    } else {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      setIsSuggestionOpen((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleCityInput = (
    value: string,
    onChange: (value: string) => void
  ) => {
    onChange(value);
    if (value.length >= 1) {
      const filteredCities = selectedCountry
        ? cityMap[selectedCountry]?.filter((city) =>
            city.toLowerCase().includes(value.toLowerCase())
          ) || []
        : Object.values(cityMap)
            .flat()
            .filter((city) => city.toLowerCase().includes(value.toLowerCase()));
      setSuggestions((prev) => ({
        ...prev,
        ville_destination: filteredCities,
      }));
      setIsSuggestionOpen((prev) => ({ ...prev, ville_destination: true }));
    } else {
      setSuggestions((prev) => ({ ...prev, ville_destination: [] }));
      setIsSuggestionOpen((prev) => ({ ...prev, ville_destination: false }));
    }
  };

  const onSubmit = async (data: ColisFormData) => {
    if (!data.images_colis_files || data.images_colis_files.length === 0) {
      toast.error("Au moins une image est requise !");
      return;
    }

    setUploading(true);

    try {
      const files = Array.from(data.images_colis_files) as File[];
      const uploadedImages = await uploadImagesToCloudinary(files);

      const successImages = uploadedImages.filter(
        (img): img is { url: string; imageId: string } => img !== null
      );
      if (successImages.length === 0) {
        toast.error("Échec de l'upload de toutes les images !");
        return;
      }

      const payload: ColisPayload = {
        ...data,
        images_colis: successImages.map((img) => img.url),
        imageId: successImages.map((img) => img.imageId),
      };

      console.log("Données prêtes à envoyer :", payload);

      const res = await createColis(payload);
      toast.success(res.message || "Colis créé avec succès !");

      setImagePreviews(
        successImages.map((img) => ({ url: img.url, uploading: false }))
      );
      setOpen(false);
      reset(); // Reset form fields
      await onCreated(); // Trigger parent refresh
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
                <div className="relative">
                  <Label htmlFor="pays_destination" className="mb-2">
                    Pays
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <Globe className="w-5 h-5" />
                    </span>
                    <select
                      {...register("pays_destination")}
                      id="pays_destination"
                      className="pl-10 w-full border rounded-md p-2 h-10 focus:outline-none focus:ring-2 focus:ring-[#cd7455] appearance-none bg-white"
                    >
                      <option value="">Sélectionnez un pays</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.pays_destination && (
                    <p className="text-red-500 text-sm">
                      {errors.pays_destination.message}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <Label htmlFor="ville_destination" className="mb-2">
                    Ville
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <Controller
                      name="ville_destination"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Input
                            {...field}
                            id="ville_destination"
                            className="pl-10 h-10"
                            onChange={(e) =>
                              handleCityInput(e.target.value, field.onChange)
                            }
                            onFocus={() => {
                              if (
                                field.value ||
                                suggestions.ville_destination.length > 0
                              ) {
                                setIsSuggestionOpen((prev) => ({
                                  ...prev,
                                  ville_destination: true,
                                }));
                              }
                            }}
                            onBlur={() =>
                              setTimeout(
                                () =>
                                  setIsSuggestionOpen((prev) => ({
                                    ...prev,
                                    ville_destination: false,
                                  })),
                                200
                              )
                            }
                          />
                          {isSuggestionOpen.ville_destination &&
                            suggestions.ville_destination.length > 0 && (
                              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-md">
                                {suggestions.ville_destination.map((city) => (
                                  <li
                                    key={city}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      field.onChange(city);
                                      setIsSuggestionOpen((prev) => ({
                                        ...prev,
                                        ville_destination: false,
                                      }));
                                    }}
                                  >
                                    {city}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </>
                      )}
                    />
                    {errors.ville_destination && (
                      <p className="text-red-500 text-sm">
                        {errors.ville_destination.message}
                      </p>
                    )}
                  </div>
                </div>
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
                {[{ id: "nom_colis", label: "Nom du colis" }].map((field) => (
                  <div className="relative" key={field.id}>
                    <Label htmlFor={field.id} className="mb-2">
                      {field.label}
                    </Label>
                    <Input
                      {...register(field.id as any)}
                      id={field.id}
                      type="text"
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
                <div className="relative">
                  <Label htmlFor="nature_colis" className="mb-2">
                    Nature
                  </Label>
                  <div className="relative">
                    <Controller
                      name="nature_colis"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Input
                            {...field}
                            id="nature_colis"
                            className="h-10"
                            onChange={(e) =>
                              handleInputWithSuggestions(
                                e.target.value,
                                field.onChange,
                                "nature_colis",
                                natureColisOptions
                              )
                            }
                            onFocus={() => {
                              if (
                                field.value ||
                                suggestions.nature_colis.length > 0
                              ) {
                                setIsSuggestionOpen((prev) => ({
                                  ...prev,
                                  nature_colis: true,
                                }));
                              }
                            }}
                            onBlur={() =>
                              setTimeout(
                                () =>
                                  setIsSuggestionOpen((prev) => ({
                                    ...prev,
                                    nature_colis: false,
                                  })),
                                200
                              )
                            }
                          />
                          {isSuggestionOpen.nature_colis &&
                            suggestions.nature_colis.length > 0 && (
                              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-md">
                                {suggestions.nature_colis.map((option) => (
                                  <li
                                    key={option}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      field.onChange(option);
                                      setIsSuggestionOpen((prev) => ({
                                        ...prev,
                                        nature_colis: false,
                                      }));
                                    }}
                                  >
                                    {option}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </>
                      )}
                    />
                    {errors.nature_colis && (
                      <p className="text-red-500 text-sm">
                        {errors.nature_colis.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Label htmlFor="mode_envoi" className="mb-2">
                    Mode d&apos;envoi
                  </Label>
                  <div className="relative">
                    <Controller
                      name="mode_envoi"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Input
                            {...field}
                            id="mode_envoi"
                            className="h-10"
                            onChange={(e) =>
                              handleInputWithSuggestions(
                                e.target.value,
                                field.onChange,
                                "mode_envoi",
                                modeEnvoiOptions
                              )
                            }
                            onFocus={() => {
                              if (
                                field.value ||
                                suggestions.mode_envoi.length > 0
                              ) {
                                setIsSuggestionOpen((prev) => ({
                                  ...prev,
                                  mode_envoi: true,
                                }));
                              }
                            }}
                            onBlur={() =>
                              setTimeout(
                                () =>
                                  setIsSuggestionOpen((prev) => ({
                                    ...prev,
                                    mode_envoi: false,
                                  })),
                                200
                              )
                            }
                          />
                          {isSuggestionOpen.mode_envoi &&
                            suggestions.mode_envoi.length > 0 && (
                              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-md">
                                {suggestions.mode_envoi.map((option) => (
                                  <li
                                    key={option}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      field.onChange(option);
                                      setIsSuggestionOpen((prev) => ({
                                        ...prev,
                                        mode_envoi: false,
                                      }));
                                    }}
                                  >
                                    {option}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </>
                      )}
                    />
                    {errors.mode_envoi && (
                      <p className="text-red-500 text-sm">
                        {errors.mode_envoi.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Label htmlFor="unite_mesure" className="mb-2">
                    Unité
                  </Label>
                  <div className="relative">
                    <Controller
                      name="unite_mesure"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Input
                            {...field}
                            id="unite_mesure"
                            className="h-10"
                            onChange={(e) =>
                              handleInputWithSuggestions(
                                e.target.value,
                                field.onChange,
                                "unite_mesure",
                                uniteMesureOptions
                              )
                            }
                            onFocus={() => {
                              if (
                                field.value ||
                                suggestions.unite_mesure.length > 0
                              ) {
                                setIsSuggestionOpen((prev) => ({
                                  ...prev,
                                  unite_mesure: true,
                                }));
                              }
                            }}
                            onBlur={() =>
                              setTimeout(
                                () =>
                                  setIsSuggestionOpen((prev) => ({
                                    ...prev,
                                    unite_mesure: false,
                                  })),
                                200
                              )
                            }
                          />
                          {isSuggestionOpen.unite_mesure &&
                            suggestions.unite_mesure.length > 0 && (
                              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-md">
                                {suggestions.unite_mesure.map((option) => (
                                  <li
                                    key={option}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      field.onChange(option);
                                      setIsSuggestionOpen((prev) => ({
                                        ...prev,
                                        unite_mesure: false,
                                      }));
                                    }}
                                  >
                                    {option}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </>
                      )}
                    />
                    {errors.unite_mesure && (
                      <p className="text-red-500 text-sm">
                        {errors.unite_mesure.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Label htmlFor="taille" className="mb-2">
                    Taille
                  </Label>
                  <Input
                    {...register("taille", { valueAsNumber: true })}
                    id="taille"
                    type="number"
                  />
                  {errors.taille && (
                    <p className="text-red-500 text-sm">
                      {errors.taille.message}
                    </p>
                  )}
                </div>
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
                      {String(errors.images_colis_files.message)}
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
