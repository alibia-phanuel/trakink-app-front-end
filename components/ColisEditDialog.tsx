"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Edit, X, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { getColisById, updateColisWithImages } from "@/lib/Colis";
import { ColisUpdateData } from "@/type/colis";
import {
  countries,
  cityMap,
  modeEnvoiOptions,
  uniteMesureOptions,
} from "@/constant/colisConstants";

interface Props {
  colisId: string;
  onUpdated: () => void;
}

export function ColisEditDialog({ colisId, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ColisUpdateData | null>(null);
  const [oldImageIds, setOldImageIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{
    ville_destination: string[];
    mode_envoi: string[];
    unite_mesure: string[];
  }>({
    ville_destination: [],
    mode_envoi: [],
    unite_mesure: [],
  });
  const [isSuggestionOpen, setIsSuggestionOpen] = useState<{
    ville_destination: boolean;
    mode_envoi: boolean;
    unite_mesure: boolean;
  }>({
    ville_destination: false,
    mode_envoi: false,
    unite_mesure: false,
  });

  useEffect(() => {
    if (open) {
      setLoading(true);
      getColisById(colisId)
        .then((data) => {
          setForm({
            ...data,
            images_colis: data.images_colis || [],
            imageId: data.imageId || [],
          });
          setOldImageIds(data.imageId || []);
          setError(null);
        })
        .catch(() => setError("Impossible de charger le colis."))
        .finally(() => setLoading(false));
    }
  }, [open, colisId]);

  const handleChange = (
    field: keyof ColisUpdateData,
    value: string | number
  ) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
  };

  const handleInputWithSuggestions = (
    value: string,
    field: keyof typeof suggestions,
    options: string[]
  ) => {
    handleChange(field, value);
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

  const handleCityInput = (value: string) => {
    handleChange("ville_destination", value);
    if (value.length >= 1) {
      const filteredCities = form?.pays_destination
        ? cityMap[form.pays_destination]?.filter((city) =>
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

  const handleImageRemove = (index: number) => {
    if (!form) return;
    const newImages = [...(form.images_colis || [])];
    newImages.splice(index, 1);
    setForm({ ...form, images_colis: newImages });
  };

  const handleImageAdd = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!form || !e.target.files) return;
    const files = Array.from(e.target.files);

    const newImages: string[] = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    );

    setForm({
      ...form,
      images_colis: [...(form.images_colis || []), ...newImages],
    });
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!form) return;
    setLoading(true);
    try {
      await updateColisWithImages(colisId, form, oldImageIds);
      toast.success("✅  colis mis à jour !");
      onUpdated();
      setOpen(false);
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la mise à jour du colis.");
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

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Éditer le colis</DialogTitle>
          <DialogDescription>
            Modifie les informations puis clique sur Enregistrer.
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-gray-500">Chargement…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {form && !loading && (
          <div className="space-y-4">
            {/* Champs texte */}
            <div>
              <Label htmlFor="pays">Pays destination</Label>
              <div className="relative">
                <select
                  id="pays"
                  value={form.pays_destination || ""}
                  onChange={(e) =>
                    handleChange("pays_destination", e.target.value)
                  }
                  className="w-full border rounded-md p-2 h-10 focus:outline-none focus:ring-2 focus:ring-[#cd7455] appearance-none bg-white"
                >
                  <option value="">Sélectionnez un pays</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="ville">Ville destination</Label>
              <div className="relative">
                <Input
                  id="ville"
                  value={form.ville_destination || ""}
                  onChange={(e) => handleCityInput(e.target.value)}
                  onFocus={() => {
                    if (
                      form.ville_destination ||
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
                  className="h-10"
                />
                {isSuggestionOpen.ville_destination &&
                  suggestions.ville_destination.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-md">
                      {suggestions.ville_destination.map((city) => (
                        <li
                          key={city}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            handleChange("ville_destination", city);
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
              </div>
            </div>
            <div>
              <Label htmlFor="mode">Mode d’envoi</Label>
              <div className="relative">
                <Input
                  id="mode"
                  value={form.mode_envoi || ""}
                  onChange={(e) =>
                    handleInputWithSuggestions(
                      e.target.value,
                      "mode_envoi",
                      modeEnvoiOptions
                    )
                  }
                  onFocus={() => {
                    if (form.mode_envoi || suggestions.mode_envoi.length > 0) {
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
                  className="h-10"
                />
                {isSuggestionOpen.mode_envoi &&
                  suggestions.mode_envoi.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-md">
                      {suggestions.mode_envoi.map((option) => (
                        <li
                          key={option}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            handleChange("mode_envoi", option);
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
              </div>
            </div>
            <div>
              <Label htmlFor="unite">Unité de mesure</Label>
              <div className="relative">
                <Input
                  id="unite"
                  value={form.unite_mesure || ""}
                  onChange={(e) =>
                    handleInputWithSuggestions(
                      e.target.value,
                      "unite_mesure",
                      uniteMesureOptions
                    )
                  }
                  onFocus={() => {
                    if (
                      form.unite_mesure ||
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
                  className="h-10"
                />
                {isSuggestionOpen.unite_mesure &&
                  suggestions.unite_mesure.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-md">
                      {suggestions.unite_mesure.map((option) => (
                        <li
                          key={option}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            handleChange("unite_mesure", option);
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
              </div>
            </div>
            <div>
              <Label htmlFor="taille">Taille</Label>
              <Input
                id="taille"
                value={form.taille || ""}
                onChange={(e) => handleChange("taille", e.target.value)}
                type="number"
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Images du colis</Label>
              <div className="flex flex-wrap gap-3">
                {form.images_colis?.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 border rounded overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`colis-${index}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border rounded flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Plus className="w-6 h-6 text-gray-500" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageAdd}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button variant="default" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
