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
  statut: "QUITTE_CHINE" | "RECU_DESTINATION";
  createdAt: string;
  updatedAt: string;
}
