import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditUserModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formData: {
    nom: string;
    prenom: string;
    tel: string;
    url_photo_profil: string;
    role: "EMPLOYE" | "DIRECTEUR" | "ADMIN";
    status: "ACTIF" | "INACTIF";
    pays: string;
    webAccess: boolean;
    mobileAccess: boolean;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: () => void;
}

export default function EditUserModal({
  open,
  setOpen,
  formData,
  handleChange,
  handleSubmit,
}: EditUserModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Modifier</Button>
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
          <Input
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Nom"
            required
          />
          <Input
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            required
          />
          <Input
            name="tel"
            value={formData.tel}
            onChange={handleChange}
            placeholder="Téléphone"
            required
          />
          <Input
            name="url_photo_profil"
            value={formData.url_photo_profil}
            onChange={handleChange}
            placeholder="URL de la photo"
            required
          />
          <Input
            name="pays"
            value={formData.pays}
            onChange={handleChange}
            placeholder="Pays"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="EMPLOYE">EMPLOYE</option>
            <option value="DIRECTEUR">DIRECTEUR</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="ACTIF">ACTIF</option>
            <option value="INACTIF">INACTIF</option>
          </select>

          <div className="flex gap-4">
            <label>
              <input
                type="checkbox"
                name="webAccess"
                checked={formData.webAccess}
                onChange={handleChange}
              />
              Accès Web
            </label>
            <label>
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
  );
}
