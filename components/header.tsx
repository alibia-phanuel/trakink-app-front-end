"use client";
import React, { useState } from "react";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/app/context/authContext";
import { UpdateProfileData } from "@/type/userProfileTypes";
import { updateProfile } from "@/lib/authApi";

const Header = () => {
  const { user: profil, loading } = useAuth(); // ⬅️ utilise le contexte ici
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [tel, setTel] = useState("");
  const [url_photo_profil, setUrlPhoto] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  React.useEffect(() => {
    if (profil) {
      setNom(profil.nom);
      setPrenom(profil.prenom);
      setTel(profil.tel || "");
      setUrlPhoto(profil.url_photo_profil || "");
    }
  }, [profil]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      </div>
    );
  }

  if (!profil) {
    return null; // ou un fallback
  }

  const initials =
    profil.nom
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "PA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setError("");

    try {
      const updateData: UpdateProfileData = {
        nom,
        prenom,
        tel,
        url_photo_profil,
        currentPassword,
        password,
      };
      await updateProfile(updateData);
      alert("Profil mis à jour avec succès !");
      setIsModalOpen(false);
      // Option : tu peux forcer un getProfile() ici si tu veux mettre à jour le contexte
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="w-full px-4 py-2 flex flex-col sm:flex-row items-center justify-end gap-4">
      {/* Search bar */}
      <div className="w-full sm:w-auto hidden justify-center sm:justify-start">
        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none cursor-pointer">
            <Avatar className="w-9 h-9">
              <AvatarImage
                src={profil.url_photo_profil ?? "/user.jpg"}
                alt="Photo de profil"
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-gray-800">
              {profil.nom}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 mt-2 p-4 space-y-4 relative right-3.5">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-16 h-16 mb-2">
                <AvatarImage
                  src={profil.url_photo_profil ?? "/user.jpg"}
                  alt="Photo de profil"
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{profil.nom}</h2>
              <p className="text-sm text-gray-500">{profil.email}</p>
              <p className="text-xs text-gray-400 mt-1">{profil.role}</p>
            </div>
            <div className=" flex-col gap-2 hidden">
              <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                Modifier
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modal de modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Modifiez vos informations de profil ici.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="tel">Téléphone</Label>
              <Input
                id="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={loadingUpdate}>
                {loadingUpdate ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={loadingUpdate}
              >
                Annuler
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
