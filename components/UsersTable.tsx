"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Users } from "@/type/user";
import {
  Pencil,
  User,
  Phone,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Webhook,
  Smartphone,
} from "lucide-react";

import { Checkbox } from "@radix-ui/react-checkbox";
import { Button } from "./ui/button";
import { DeleteUserButton } from "./DeleteUserButton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getUserById, updateUserById } from "@/lib/authApi";
import { toast } from "react-toastify";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

interface UsersTableProps {
  users: Users[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onDeleted: () => void;
  isLoading?: boolean; // Optional prop to explicitly handle loading state
}

// Skeleton Loader Component
const SkeletonTable = () => {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-sm text-gray-700">
          <th className="p-3">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          </th>
          <th className="p-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </th>
          <th className="p-3">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </th>
          <th className="p-3">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </th>
          <th className="p-3">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, idx) => (
          <tr key={idx} className="border-t border-gray-200">
            <td className="p-3">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </td>
            <td className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </td>
            <td className="p-3">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </td>
            <td className="p-3">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </td>
            <td className="p-3 flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const UsersTable = ({
  users,
  selectedIds,
  onToggleSelect,
  onDeleted,
  isLoading = false, // Default to false if not provided
}: UsersTableProps) => {
  const isSelected = (id: string) => selectedIds.includes(id);

  const [, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    tel: "",
    url_photo_profil: "",
    imageId: "",
    role: "EMPLOYE" as "EMPLOYE" | "ADMIN" | "DIRECTEUR",
    status: "ACTIF" as "ACTIF" | "INACTIF",
    pays: "",
    webAccess: false,
    mobileAccess: false,
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = async (userId: string) => {
    const res = await getUserById(userId);
    if (res.success && res.user) {
      const user = res.user;
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        tel: user.tel,
        url_photo_profil: user.url_photo_profil || "",
        imageId: user.imageId || "",
        role: user.role,
        status: user.status,
        pays: user.pays,
        webAccess: user.webAccess,
        mobileAccess: user.mobileAccess,
      });
      setImagePreview(user.url_photo_profil || "");
      setEditingUserId(userId);
      setOpen(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [target.name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [target.name]: target.value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!editingUserId) return;

    let url_photo_profil = formData.url_photo_profil;
    let imageId: string | null = formData.imageId || null;

    if (imageFile) {
      const uploaded = await uploadImageToCloudinary(imageFile);
      if (uploaded) {
        url_photo_profil = uploaded.url;
        imageId = uploaded.imageId;
      }
    }

    const payload = {
      ...formData,
      url_photo_profil,
      imageId,
    };

    const res = await updateUserById(editingUserId, payload);
    if (res.success) {
      setOpen(false);
      toast.success(res.message);
      onDeleted();
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Show skeleton if isLoading is true or users is undefined/empty
  if (isLoading || !users || users.length === 0) {
    return <SkeletonTable />;
  }

  return (
    <>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm text-gray-700">
            <th className="p-3">
              <Checkbox
                checked={selectedIds.length === users.length}
                onCheckedChange={() => {
                  if (selectedIds.length === users.length) {
                    users.forEach((u) => onToggleSelect(u.id));
                  } else {
                    users.forEach((u) => {
                      if (!selectedIds.includes(u.id)) onToggleSelect(u.id);
                    });
                  }
                }}
              />
            </th>
            <th className="p-3">Nom</th>
            <th className="p-3">Rôle</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-t border-gray-200 hover:bg-gray-50 text-sm"
            >
              <td className="p-3">
                <Checkbox
                  checked={isSelected(user.id)}
                  onCheckedChange={() => onToggleSelect(user.id)}
                />
              </td>
              <td className="p-3 flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-full border-1 justify-center items-center">
                  <AvatarImage
                    className="rounded-full overflow-hidden"
                    src={user.url_photo_profil || ""}
                    alt={user.nom}
                  />
                  <AvatarFallback className="flex justify-center items-center text-center  h-full rounded-circle">
                    {user.nom[0]}
                    {user.prenom[0]}
                  </AvatarFallback>
                </Avatar>
                {user.nom} {user.prenom}
              </td>
              <td className="p-3">{user.role}</td>
              <td className="p-3">{user.status}</td>
              <td className="p-3 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(user.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier l’utilisateur</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                      className="space-y-3"
                    >
                      {/* Avatar uploader */}
                      <div className="flex flex-col items-center gap-2">
                        <Avatar
                          className="h-20 w-20 rounded-full cursor-pointer"
                          onClick={handlePickImage}
                        >
                          <AvatarImage src={imagePreview} alt="Photo profil" />
                          <AvatarFallback>
                            {formData.nom[0]}
                            {formData.prenom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-500">
                          Cliquer pour changer la photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </div>

                      {/* Nom */}
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          placeholder="Nom"
                          required
                          className="pl-8"
                        />
                      </div>

                      {/* Prénom */}
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleChange}
                          placeholder="Prénom"
                          required
                          className="pl-8"
                        />
                      </div>

                      {/* Téléphone */}
                      <div className="relative">
                        <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          name="tel"
                          value={formData.tel}
                          onChange={handleChange}
                          placeholder="Téléphone"
                          required
                          className="pl-8"
                        />
                      </div>

                      {/* Pays */}
                      <div className="relative">
                        <Globe className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          name="pays"
                          value={formData.pays}
                          onChange={handleChange}
                          placeholder="Pays"
                          required
                          className="pl-8"
                        />
                      </div>

                      {/* Rôle */}
                      <div className="relative">
                        <ShieldCheck className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full border rounded px-8 py-2"
                        >
                          <option value="EMPLOYE">EMPLOYE</option>
                          <option value="DIRECTEUR">DIRECTEUR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div className="relative">
                        <ShieldAlert className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full border rounded px-8 py-2"
                        >
                          <option value="ACTIF">ACTIF</option>
                          <option value="INACTIF">INACTIF</option>
                        </select>
                      </div>

                      {/* Accès */}
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <Webhook className="h-4 w-4 text-gray-500" />
                          <input
                            type="checkbox"
                            name="webAccess"
                            checked={formData.webAccess}
                            onChange={handleChange}
                          />
                          Accès Web
                        </label>
                        <label className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <input
                            type="checkbox"
                            name="mobileAccess"
                            checked={formData.mobileAccess}
                            onChange={handleChange}
                          />
                          Accès Mobile
                        </label>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit">Mettre à jour</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <DeleteUserButton userId={user.id} onDeleted={onDeleted} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default UsersTable;
