"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import { createColis } from "@/lib/Colis";
import { getCountries } from "@/lib/pays";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, RefreshCw } from "lucide-react";
import Flag from "react-flagkit";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ColisPayload } from "@/type/colis";
import { uploadImagesToCloudinary } from "@/lib/cloudinary";
import { Switch } from "@/components/ui/switch"; // Ajout pour le toggle Express

const colisSchema = z.object({
  nom_destinataire: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  numero_tel_destinataire: z
    .string()
    .regex(/^\d{8,}$/, "Numéro de téléphone invalide (au moins 8 chiffres)"),
  code_pays: z.string().min(1, "Code pays requis"),
  email_destinataire: z.string().email("Adresse email invalide"),
  pays_destination: z.string().min(2, "Pays requis"),
  ville_destination: z.string().min(2, "Ville requise"),
  nature_colis: z.string().min(2, "Nature du colis requise"),
  mode_envoi: z.enum(["Maritime", "Aérien"], {
    message: "Mode d’envoi requis",
  }),
  taille: z
    .number({ invalid_type_error: "La taille doit être un nombre" })
    .positive("La taille doit être positive"),
  images_colis: z.array(z.string()).optional(),
  imageId: z.array(z.string()).optional(),
});

type ColisFormValues = z.infer<typeof colisSchema>;
type ModeEnvoi = ColisFormValues["mode_envoi"];
type Country = {
  id: string;
  nom: string;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
};

export default function ColisFormDialog() {
  return (
    <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-lg">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          Ajouter un nouveau colis
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          Remplissez les informations ci-dessous pour enregistrer un colis. Tous
          les champs marqués d’un * sont obligatoires.
        </DialogDescription>
      </DialogHeader>
      <ColisForm />
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => window.dispatchEvent(new Event("close-dialog"))}
        >
          Annuler
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ColisForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ColisFormValues>({
    resolver: zodResolver(colisSchema),
    defaultValues: {
      mode_envoi: "Aérien",
      code_pays: "+233", // Default to Ghana
      pays_destination: "Ghana",
    },
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [isExpress, setIsExpress] = useState(false); // Nouveau état pour Aérien express
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const modeEnvoi = watch("mode_envoi");
  const paysDestination = watch("pays_destination");

  // Unité dynamique pour affichage
  const uniteMesure = modeEnvoi === "Aérien" ? "kg" : "m³";

  // Sample phone code mapping (extend with all countries from your API)
  const phoneCodeMapping: { [key: string]: string } = {
    DZ: "+213", // Algérie
    AO: "+244", // Angola
    BJ: "+229", // Bénin
    BW: "+267", // Botswana
    BF: "+226", // Burkina Faso
    BI: "+257", // Burundi
    CM: "+237", // Cameroun
    CV: "+238", // Cap-Vert
    CF: "+236", // République Centrafricaine
    TD: "+235", // Tchad
    KM: "+269", // Comores
    CD: "+243", // République Démocratique du Congo
    DJ: "+253", // Djibouti
    EG: "+20", // Égypte
    GQ: "+240", // Guinée équatoriale
    ER: "+291", // Érythrée
    ET: "+251", // Éthiopie
    GA: "+241", // Gabon
    GM: "+220", // Gambie
    GH: "+233", // Ghana
    GN: "+224", // Guinée
    GW: "+245", // Guinée-Bissau
    KE: "+254", // Kenya
    LS: "+266", // Lesotho
    LR: "+231", // Libéria
    LY: "+218", // Libye
    MA: "+212", // Maroc
    MG: "+261", // Madagascar
    MW: "+265", // Malawi
    ML: "+223", // Mali
    MR: "+222", // Mauritanie
    MU: "+230", // Maurice
    MAU: "+262", // Mayotte
    MZ: "+258", // Mozambique
    NA: "+264", // Namibie
    NE: "+227", // Niger
    NG: "+234", // Nigéria
    RW: "+250", // Rwanda
    ST: "+239", // Sao Tomé-et-Principe
    SN: "+221", // Sénégal
    SC: "+248", // Seychelles
    SL: "+232", // Sierra Leone
    SO: "+252", // Somalie
    ZA: "+27", // Afrique du Sud
    SS: "+211", // Soudan du Sud
    SD: "+249", // Soudan
    SZ: "+268", // Eswatini
    TZ: "+255", // Tanzanie
    TG: "+228", // Togo
    TN: "+216", // Tunisie
    UG: "+256", // Ouganda
    ZM: "+260", // Zambie
    ZW: "+263", // Zimbabwe
  };

  const fetchAllCountries = async () => {
    setIsLoadingCountries(true);
    setCountryError(null);
    try {
      let allCountries: Country[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const response = await getCountries(page, 10);
        const activeCountries = response.pays.filter(
          (country: Country) => country.status === "ACTIF"
        );
        allCountries = [...allCountries, ...activeCountries];
        hasNext = response.pagination.hasNext;
        page += 1;
      }

      setCountries(allCountries);
      setIsLoadingCountries(false);
      if (allCountries.length === 0) {
        setCountryError("Aucun pays actif trouvé.");
      }
    } catch (err) {
      setCountryError(
        "Erreur lors du chargement des pays. Veuillez réessayer."
      );
      toast.error("Erreur lors du chargement des pays");
      console.error(err);
      setIsLoadingCountries(false);
    }
  };

  useEffect(() => {
    fetchAllCountries();
  }, []);

  useEffect(() => {
    if (paysDestination) {
      const selectedCountry = countries.find((c) => c.nom === paysDestination);
      if (selectedCountry && phoneCodeMapping[selectedCountry.code]) {
        setValue("code_pays", phoneCodeMapping[selectedCountry.code]);
      } else {
        setValue("code_pays", "");
      }
    }
  }, [paysDestination, countries, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files).slice(0, 5);
    setImages((prev) => [...prev, ...selectedFiles].slice(0, 5));
    setPreviewUrls((prev) =>
      [
        ...prev,
        ...selectedFiles.map((file) => URL.createObjectURL(file)),
      ].slice(0, 5)
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.files) return;
    const selectedFiles = Array.from(e.dataTransfer.files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 5);
    setImages((prev) => [...prev, ...selectedFiles].slice(0, 5));
    setPreviewUrls((prev) =>
      [
        ...prev,
        ...selectedFiles.map((file) => URL.createObjectURL(file)),
      ].slice(0, 5)
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas
      .getContext("2d")
      ?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setImages((prev) => [...prev, file].slice(0, 5));
        setPreviewUrls((prev) =>
          [...prev, URL.createObjectURL(file)].slice(0, 5)
        );
        closeCamera();
      }
    }, "image/jpeg");
  };

  const onSubmit = async (data: ColisFormValues) => {
    try {
      // 🔹 Upload les images sélectionnées vers Cloudinary
      const uploadedImages = await uploadImagesToCloudinary(images);

      // 🔹 On filtre les null au cas où certains uploads échouent
      const successImages = uploadedImages.filter(
        (img): img is { url: string; imageId: string } => img !== null
      );

      // Définition automatique des valeurs
      const nomColisDefault = "Colis standard";
      const uniteMesureAuto = modeEnvoi === "Aérien" ? "kg" : "m³";
      const dureeAuto = modeEnvoi === "Maritime" ? 60 : isExpress ? 5 : 14;

      const payload: ColisPayload = {
        nom_destinataire: data.nom_destinataire,
        numero_tel_destinataire: `${data.code_pays.replace("+", "")}${
          data.numero_tel_destinataire
        }`, // sans "+"
        email_destinataire: data.email_destinataire,
        pays_destination: data.pays_destination,
        ville_destination: data.ville_destination,
        adresse_destinataire:
          data.ville_destination + " " + "de la pars de chris CCI",
        nom_colis: nomColisDefault, // Valeur par défaut
        nature_colis: data.nature_colis,
        mode_envoi: data.mode_envoi,
        unite_mesure: uniteMesureAuto, // Automatique
        taille: data.taille,
        images_colis: successImages.map((img) => img.url), // ✅ URLs Cloudinary
        imageId: successImages.map((img) => img.imageId), // ✅ IDs Cloudinary
        dureeTransportEstimee: dureeAuto, // Automatique
      };

      console.log("les données du colis", payload);
      await createColis(payload);

      toast.success("Colis créé avec succès !");
      reset();
      setImages([]);
      setPreviewUrls([]);
    } catch (err: unknown) {
      toast.error("Erreur lors de la création du colis");

      if (err instanceof Error) {
        console.error("Message:", err.message);
      } else {
        console.error("Erreur inconnue:", err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Informations destinataire */}
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Informations du destinataire
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nom_destinataire" className="text-sm font-medium">
              Nom complet *
            </Label>
            <Input
              {...register("nom_destinataire")}
              id="nom_destinataire"
              placeholder="Jean Dupont"
              className="mt-1"
              aria-invalid={!!errors.nom_destinataire}
            />
            {errors.nom_destinataire && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nom_destinataire.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="pays_destination" className="text-sm font-medium">
              Pays *
            </Label>
            <Select
              onValueChange={(value) => setValue("pays_destination", value)}
              defaultValue="Ghana"
              disabled={isLoadingCountries || !!countryError}
            >
              <SelectTrigger
                className="mt-1"
                aria-invalid={!!errors.pays_destination}
              >
                <SelectValue
                  placeholder={
                    isLoadingCountries
                      ? "Chargement des pays..."
                      : countryError
                      ? "Erreur de chargement"
                      : "Sélectionner un pays"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.nom}>
                    <div className="flex items-center gap-2">
                      <Flag country={country.code} size={20} />
                      {country.nom}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pays_destination && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pays_destination.message}
              </p>
            )}
            {countryError && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-red-500 text-sm">{countryError}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fetchAllCountries}
                  aria-label="Réessayer le chargement des pays"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <div className="w-1/3">
              <Label htmlFor="code_pays" className="text-sm font-medium">
                Code *
              </Label>
              <Input
                {...register("code_pays")}
                id="code_pays"
                placeholder="+233"
                className="mt-1"
                readOnly
                aria-invalid={!!errors.code_pays}
              />
              {errors.code_pays && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.code_pays.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label
                htmlFor="numero_tel_destinataire"
                className="text-sm font-medium"
              >
                Téléphone *
              </Label>
              <Input
                {...register("numero_tel_destinataire")}
                id="numero_tel_destinataire"
                placeholder="123456789"
                className="mt-1"
                aria-invalid={!!errors.numero_tel_destinataire}
              />
              {errors.numero_tel_destinataire && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.numero_tel_destinataire.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="email_destinataire" className="text-sm font-medium">
              Email *
            </Label>
            <Input
              {...register("email_destinataire")}
              id="email_destinataire"
              placeholder="exemple@domaine.com"
              type="email"
              className="mt-1"
              aria-invalid={!!errors.email_destinataire}
            />
            {errors.email_destinataire && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email_destinataire.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="ville_destination" className="text-sm font-medium">
              Ville *
            </Label>
            <Input
              {...register("ville_destination")}
              id="ville_destination"
              placeholder="Paris"
              className="mt-1"
              aria-invalid={!!errors.ville_destination}
            />
            {errors.ville_destination && (
              <p className="text-red-500 text-sm mt-1">
                {errors.ville_destination.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2 hidden">
            <Label
              htmlFor="adresse_destinataire"
              className="text-sm font-medium"
            >
              Adresse *
            </Label>
            {/* <Input
              {...register("adresse_destinataire")}
              id="adresse_destinataire"
              placeholder="123 Rue Exemple, 75001"
              className="mt-1"
              aria-invalid={!!errors.adresse_destinataire}
            />
            {errors.adresse_destinataire && (
              <p className="text-red-500 text-sm mt-1">
                {errors.adresse_destinataire.message}
              </p>
            )} */}
          </div>
        </CardContent>
      </Card>

      {/* Informations colis */}
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Informations sur le colis
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nature_colis" className="text-sm font-medium">
              Nature du colis *
            </Label>
            <Input
              {...register("nature_colis")}
              id="nature_colis"
              placeholder="Électronique, vêtements, etc."
              className="mt-1"
              aria-invalid={!!errors.nature_colis}
            />
            {errors.nature_colis && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nature_colis.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="mode_envoi" className="text-sm font-medium">
              Mode d’envoi *
            </Label>
            <Select
              onValueChange={(value: ModeEnvoi) => {
                setValue("mode_envoi", value);
                setIsExpress(false); // Réinitialiser express si mode change
              }}
              defaultValue="Aérien"
            >
              <SelectTrigger
                className="mt-1"
                aria-invalid={!!errors.mode_envoi}
              >
                <SelectValue placeholder="Sélectionner un mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maritime">Maritime</SelectItem>
                <SelectItem value="Aérien">Aérien</SelectItem>
              </SelectContent>
            </Select>
            {errors.mode_envoi && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mode_envoi.message}
              </p>
            )}
          </div>
          {modeEnvoi === "Aérien" && (
            <div>
              <Label htmlFor="express" className="text-sm font-medium">
                Mode express (5 jours au lieu de 14)
              </Label>
              <Switch
                id="express"
                checked={isExpress}
                onCheckedChange={setIsExpress}
                className="mt-1"
              />
            </div>
          )}
          <div>
            <Label htmlFor="taille" className="text-sm font-medium">
              Taille ({uniteMesure}) *
            </Label>
            <Input
              {...register("taille", { valueAsNumber: true })}
              id="taille"
              type="number"
              step="0.1"
              placeholder="10.5"
              className="mt-1"
              aria-invalid={!!errors.taille}
            />
            {errors.taille && (
              <p className="text-red-500 text-sm mt-1">
                {errors.taille.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="images_colis" className="text-sm font-medium">
              Images du colis (max 5)
            </Label>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-5 w-5" />
                Ajouter des images
              </Button>
            </div>
            <div
              className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="h-8 w-8 mb-2 text-gray-500" />
              <p className="text-sm text-gray-500">
                Glissez-déposez ou cliquez pour ajouter des images
              </p>
              <Input
                id="images_colis"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
              />
            </div>

            {isCameraOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg max-w-lg w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Prendre une photo</h3>
                    <Button
                      variant="ghost"
                      onClick={closeCamera}
                      aria-label="Fermer la caméra"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <video ref={videoRef} className="w-full rounded" autoPlay />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={closeCamera}>
                      Annuler
                    </Button>
                    <Button onClick={capturePhoto}>Capturer</Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={url}
                    alt={`preview-${idx}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full"
                    onClick={() => handleRemoveImage(idx)}
                    aria-label={`Supprimer l'image ${idx + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons */}
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || isLoadingCountries || !!countryError}
          className="bg-primary hover:bg-primary-dark"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Création...
            </>
          ) : (
            "Créer le colis"
          )}
        </Button>
      </div>
    </form>
  );
}
