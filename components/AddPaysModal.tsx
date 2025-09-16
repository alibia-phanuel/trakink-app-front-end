"use client";

import React, { useState } from "react";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { createCountry } from "@/lib/pays";
import { CreateCountryDto } from "@/type/pays";
import Flag from "react-flagkit"; // <-- npm install react-flagkit

interface AddPaysModalProps {
  onSuccess?: () => void;
}

const africanCountries = [
  { nom: "Afrique du Sud", code: "ZA" },
  { nom: "Algérie", code: "DZ" },
  { nom: "Angola", code: "AO" },
  { nom: "Bénin", code: "BJ" },
  { nom: "Botswana", code: "BW" },
  { nom: "Burkina Faso", code: "BF" },
  { nom: "Burundi", code: "BI" },
  { nom: "Cameroun", code: "CM" },
  { nom: "Cap-Vert", code: "CV" },
  { nom: "République centrafricaine", code: "CF" },
  { nom: "Comores", code: "KM" },
  { nom: "Congo", code: "CG" },
  { nom: "République démocratique du Congo", code: "CD" },
  { nom: "Côte d'Ivoire", code: "CI" },
  { nom: "Djibouti", code: "DJ" },
  { nom: "Égypte", code: "EG" },
  { nom: "Érythrée", code: "ER" },
  { nom: "Eswatini", code: "SZ" },
  { nom: "Éthiopie", code: "ET" },
  { nom: "Gabon", code: "GA" },
  { nom: "Gambie", code: "GM" },
  { nom: "Ghana", code: "GH" },
  { nom: "Guinée", code: "GN" },
  { nom: "Guinée équatoriale", code: "GQ" },
  { nom: "Guinée-Bissau", code: "GW" },
  { nom: "Kenya", code: "KE" },
  { nom: "Lesotho", code: "LS" },
  { nom: "Liberia", code: "LR" },
  { nom: "Libye", code: "LY" },
  { nom: "Madagascar", code: "MG" },
  { nom: "Malawi", code: "MW" },
  { nom: "Mali", code: "ML" },
  { nom: "Maroc", code: "MA" },
  { nom: "Maurice", code: "MU" },
  { nom: "Mauritanie", code: "MR" },
  { nom: "Mozambique", code: "MZ" },
  { nom: "Namibie", code: "NA" },
  { nom: "Niger", code: "NE" },
  { nom: "Nigeria", code: "NG" },
  { nom: "Ouganda", code: "UG" },
  { nom: "Rwanda", code: "RW" },
  { nom: "Sao Tomé-et-Principe", code: "ST" },
  { nom: "Sénégal", code: "SN" },
  { nom: "Seychelles", code: "SC" },
  { nom: "Sierra Leone", code: "SL" },
  { nom: "Somalie", code: "SO" },
  { nom: "Soudan", code: "SD" },
  { nom: "Soudan du Sud", code: "SS" },
  { nom: "Tanzanie", code: "TZ" },
  { nom: "Tchad", code: "TD" },
  { nom: "Togo", code: "TG" },
  { nom: "Tunisie", code: "TN" },
  { nom: "Zambie", code: "ZM" },
  { nom: "Zimbabwe", code: "ZW" },
  { nom: "Autre", code: "" }, // pour entrée manuelle
];
const AddPaysModal: React.FC<AddPaysModalProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [code, setCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    if (value === "Autre") {
      setNom("");
      setCode("");
    } else {
      const country = africanCountries.find((c) => c.nom === value);
      if (country) {
        setNom(country.nom);
        setCode(country.code);
      }
    }
  };

 const handleSubmit = async () => {
   if (!nom || !code) {
     toast.error("Nom et code sont obligatoires.");
     return;
   }

   setLoading(true);
   try {
     const data: CreateCountryDto = { nom, code };
     const res = await createCountry(data);

     // ✅ Cas succès (201)
     toast.success(res.message || `Pays "${nom}" créé avec succès !`);

     setNom("");
     setCode("");
     setSelectedCountry("");
     setOpen(false);
     onSuccess?.();
   } catch (err: unknown) {
     const error = err as AxiosError<{ message?: string }>;
     const status = error.response?.status;

     if (status === 403) {
       toast.error(
         "Accès interdit : vous n’êtes pas autorisé à créer un pays."
       );
     } else if (status === 409) {
       toast.error("Conflit : un pays avec ce nom ou code existe déjà.");
     } else {
       toast.error(
         error.response?.data?.message || "Impossible de créer le pays."
       );
     }
   } finally {
     setLoading(false);
   }
 };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Ajouter un pays</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Ajouter un nouveau pays</DialogTitle>

        <div className="grid gap-4 py-4">
          {/* Select Pays */}
          <div className="grid gap-2">
            <label htmlFor="select-country" className="text-sm font-medium">
              Choisir un pays
            </label>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger
                id="select-country"
                className="flex items-center gap-2"
              >
                <SelectValue placeholder="Sélectionner un pays" />
              </SelectTrigger>
              <SelectContent>
                {africanCountries.map((c) => (
                  <SelectItem
                    key={c.nom}
                    value={c.nom}
                    className="flex items-center gap-2"
                  >
                    {c.code && (
                      <Flag
                        country={c.code}
                        style={{ width: 24, height: 16 }}
                      />
                    )}
                    {c.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nom du pays */}
          <div className="grid gap-2">
            <label htmlFor="nom" className="text-sm font-medium">
              Nom
            </label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Côte d'Ivoire"
              disabled={!!selectedCountry && selectedCountry !== "Autre"}
            />
          </div>

          {/* Code du pays */}
          <div className="grid gap-2">
            <label htmlFor="code" className="text-sm font-medium">
              Code
            </label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: CI"
              disabled={!!selectedCountry && selectedCountry !== "Autre"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaysModal;
