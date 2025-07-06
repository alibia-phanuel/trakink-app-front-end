"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Users } from "@/type/user";
import {
  Pencil,
  User,
  Phone,
  Globe,
  ImageIcon,
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

interface UsersTableProps {
  users: Users[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onDeleted: () => void;
}

const UsersTable = ({
  users,
  selectedIds,
  onToggleSelect,
  onDeleted,
}: UsersTableProps) => {
  const isSelected = (id: string) => selectedIds.includes(id);

  const [, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    tel: "",
    url_photo_profil: "",
    role: "EMPLOYE" as "EMPLOYE" | "ADMIN" | "DIRECTEUR",
    status: "ACTIF" as "ACTIF" | "INACTIF",
    pays: "",
    webAccess: false,
    mobileAccess: false,
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleEditClick = async (userId: string) => {
    const res = await getUserById(userId);
    if (res.success && res.user) {
      const user = res.user;
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        tel: user.tel,
        url_photo_profil: user.url_photo_profil,
        role: user.role,
        status: user.status,
        pays: user.pays,
        webAccess: user.webAccess,
        mobileAccess: user.mobileAccess,
      });
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
    const res = await updateUserById(editingUserId, formData);
    if (res.success) {
      setOpen(false);
      toast.success(res.message);
      onDeleted(); // recharge les données
    } else {
      alert("Erreur lors de la mise à jour");
    }
  };

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
                    className="rounded-full"
                    src={user.url_photo_profil || ""}
                    alt={user.nom}
                  />
                  <AvatarFallback>
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

                      {/* URL photo */}
                      <div className="relative">
                        <ImageIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          name="url_photo_profil"
                          value={formData.url_photo_profil}
                          onChange={handleChange}
                          placeholder="URL photo"
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

                      {/* Bouton */}
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
