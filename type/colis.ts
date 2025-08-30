// 🎯 Type central : un colis tel qu'il existe dans ta base
export interface Colis {
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
  modifiePar?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
}

// 🟢 Quand tu veux CRÉER un colis (input côté frontend)
export type ColisPayload = Omit<
  Colis,
  "id" | "createdAt" | "updatedAt" | "ajoutePar" | "modifiePar"
>;

// 🟢 Quand l’API renvoie un seul colis
export interface ColisResponse {
  message: string;
  colis: Colis;
}

// 🟢 Quand l’API renvoie plusieurs colis
export interface ColisListResponse {
  colis: Colis[];
}
