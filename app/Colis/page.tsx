"use client";
import { getErrorMessage } from "@/utils/error";
import { useEffect, useState } from "react";
import ContentWrapper from "@/components/ContentWrapperProps";
import ProtectedRoute from "@/app/context/ProtectedRoute";
import { getColis, createColis } from "@/lib/Colis";
import ColisTable from "@/components/ColisTablet";
import { Colis } from "@/type/colis";
import { toast } from "react-toastify";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Mail, Phone, MapPin, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const colisSchema = z.object({
  nom_destinataire: z.string().min(1, "Nom requis"),
  numero_tel_destinataire: z.string().min(8, "Numéro requis"),
  email_destinataire: z.string().email("Email invalide"),
  pays_destination: z.string().min(1, "Pays requis"),
  ville_destination: z.string().min(1, "Ville requise"),
  adresse_destinataire: z.string().min(1, "Adresse requise"),
  nom_colis: z.string().min(1, "Nom colis requis"),
  nature_colis: z.string().min(1, "Nature requise"),
  mode_envoi: z.string().min(1, "Mode requis"),
  unite_mesure: z.string().min(1, "Unité requise"),
  taille: z.coerce.number().positive("Taille invalide"),
  images_colis: z
    .array(z.string().url("Lien invalide"))
    .min(1, "Image requise"),
});

type FormData = z.infer<typeof colisSchema>;

const Page = () => {
  const [colis, setColis] = useState<Colis[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(colisSchema) });

  const onSubmit = async (data: FormData) => {
    try {
      await createColis(data);
      toast.success("Colis créé avec succès");
      setOpen(false);
      reset();
      loadColis(currentPage);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const loadColis = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getColis({ page, limit: 10 });
      setColis(data.colis);
      console.log("Colis chargés :", data.colis);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(page);
    } catch (error: any) {
      console.error("❌ Erreur lors du chargement des colis :");
      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Headers:", error.response?.headers);
        console.error("Data:", error.response?.data);
        console.error("Message:", error.message);
      } else {
        console.error("Erreur non Axios :", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selected) => selected !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    loadColis();
  }, []);

  return (
    <ProtectedRoute>
      <ContentWrapper className="bg-[#f5dcd3] p-4 sm:p-6 md:p-[22px] flex flex-col h-[calc(100vh-109px)]">
        <h1 className="text-2xl font-bold mb-4">📦 Gestion des Colis</h1>

        <div className="bg-white rounded-lg shadow-md py-4 sm:px-6 flex flex-col lg:flex-row gap-4 lg:gap-0 items-center lg:items-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#cd7455] hover:bg-[#f2b49e] text-white flex items-center gap-2">
                <Plus size={18} /> Ajouter un coli
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Ajouter un Colis</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 max-h-[80vh] overflow-y-auto"
              >
                {/* === INFOS DESTINATAIRE === */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations du destinataire</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Label htmlFor="nom_destinataire" className="mb-2">
                        Nom
                      </Label>
                      <span className="absolute left-2 top-7 text-gray-400">
                        <User className="w-5 h-5" />
                      </span>
                      <Input
                        {...register("nom_destinataire")}
                        className="pl-10"
                        id="nom_destinataire"
                      />
                      {errors.nom_destinataire && (
                        <p className="text-red-500 text-sm">
                          {errors.nom_destinataire.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="numero_tel_destinataire" className="mb-2">
                        Téléphone
                      </Label>
                      <span className="absolute left-2 top-7 text-gray-400">
                        <Phone className="w-5 h-5" />
                      </span>
                      <Input
                        {...register("numero_tel_destinataire")}
                        className="pl-10"
                        id="numero_tel_destinataire"
                      />
                      {errors.numero_tel_destinataire && (
                        <p className="text-red-500 text-sm">
                          {errors.numero_tel_destinataire.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="email_destinataire" className="mb-2">
                        Email
                      </Label>
                      <span className="absolute left-2 top-7 text-gray-400">
                        <Mail className="w-5 h-5" />
                      </span>
                      <Input
                        {...register("email_destinataire")}
                        type="email"
                        className="pl-10"
                        id="email_destinataire"
                      />
                      {errors.email_destinataire && (
                        <p className="text-red-500 text-sm">
                          {errors.email_destinataire.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="pays_destination" className="mb-2">
                        Pays
                      </Label>
                      <span className="absolute left-2 top-7 text-gray-400">
                        <Globe className="w-5 h-5" />
                      </span>
                      <Input
                        {...register("pays_destination")}
                        className="pl-10"
                        id="pays_destination"
                      />
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
                      <span className="absolute left-2 top-7 text-gray-400">
                        <MapPin className="w-5 h-5" />
                      </span>
                      <Input
                        {...register("ville_destination")}
                        className="pl-10"
                        id="ville_destination"
                      />
                      {errors.ville_destination && (
                        <p className="text-red-500 text-sm">
                          {errors.ville_destination.message}
                        </p>
                      )}
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

                {/* === INFOS COLIS === */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations sur le colis</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Label htmlFor="nom_colis" className="mb-2">
                        Nom du colis
                      </Label>
                      <Input {...register("nom_colis")} id="nom_colis" />
                      {errors.nom_colis && (
                        <p className="text-red-500 text-sm">
                          {errors.nom_colis.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="nature_colis" className="mb-2">
                        Nature
                      </Label>
                      <Input {...register("nature_colis")} id="nature_colis" />
                      {errors.nature_colis && (
                        <p className="text-red-500 text-sm">
                          {errors.nature_colis.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="mode_envoi" className="mb-2">
                        Mode d&apos;envoi
                      </Label>
                      <Input {...register("mode_envoi")} id="mode_envoi" />
                      {errors.mode_envoi && (
                        <p className="text-red-500 text-sm">
                          {errors.mode_envoi.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="unite_mesure" className="mb-2">
                        Unité
                      </Label>
                      <Input {...register("unite_mesure")} id="unite_mesure" />
                      {errors.unite_mesure && (
                        <p className="text-red-500 text-sm">
                          {errors.unite_mesure.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="taille" className="mb-2">
                        Taille
                      </Label>
                      <Input
                        {...register("taille", { valueAsNumber: true })}
                        id="taille"
                        type="number"
                        step="0.1"
                      />
                      {errors.taille && (
                        <p className="text-red-500 text-sm">
                          {errors.taille.message}
                        </p>
                      )}
                    </div>

                    <div className="relative md:col-span-2">
                      <Label htmlFor="images_colis_0" className="mb-2">
                        Lien image
                      </Label>
                      <Input
                        {...register("images_colis.0")}
                        id="images_colis_0"
                      />
                      {errors.images_colis && (
                        <p className="text-red-500 text-sm">
                          {errors.images_colis.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* === BOUTON ENVOYER === */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#cd7455]"
                  >
                    {loading ? "Ajout..." : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 w-full overflow-auto mt-4 rounded-lg bg-white shadow-md p-4 sm:p-6 min-h-[300px]">
          {loading ? (
            <div className="w-full flex justify-center py-10">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Chargement...</span>
              </div>
            </div>
          ) : (
            <ColisTable
              colis={colis}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDeleted={() => loadColis(currentPage)}
            />
          )}
        </div>

        <div className="flex justify-center mt-4 gap-2">
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => loadColis(page)}
                className={`px-3 py-1 rounded ${
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      </ContentWrapper>
    </ProtectedRoute>
  );
};

export default Page;
