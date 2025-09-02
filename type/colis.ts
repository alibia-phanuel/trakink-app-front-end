export interface ColisPayload {
  id: string;
  nom_destinataire: string;
  numero_tel_destinataire: string;
  email_destinataire: string;
  pays_destination: string;
  statut: string;
  ville_destination: string;
  adresse_destinataire: string;
  nom_colis: string;
  nature_colis: string;
  mode_envoi: string;
  unite_mesure: string;
  taille: number;
  images_colis: string[]; // URLs des images
  imageId?: string[]; // si tu veux garder les IDs d'images
}

export interface ColisResponse {
  message: string;
  colis: {
    id: string;
    nom_destinataire: string;
    numero_tel_destinataire: string;
    email_destinataire: string;
    pays_destination: string;
    ville_destination: string;
    adresse_destinataire: string;
    nom_colis: string;
    nature_colis: string;
    mode_envoi: string;
    unite_mesure: string;
    taille: number;
    images_colis: string[];
    imageId?: string[];
    statut: string;
    createdAt: string;
    updatedAt: string;
    ajouteParId: string;
    modifieParId: string | null;
    ajoutePar: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
    };
  };
}
