// types/colis.ts
export type StatutColis =
  | "EN_TRANSIT"
  | "QUITTE_CHINE"
  | "LIVRE"
  | "COLLIS_AJOUTE"
  | "EN_ATTENTE";

export interface UserInfo {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface ColisInput {
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
  statut?: StatutColis;
  dureeTransportEstimee?: number | null;
  qrCodeData?: string | null;
  ajouteParId?: string;
  modifieParId?: string | null;
  livrerParId?: string | null;
}

export interface ColisResponse {
  message: string;
  colis: Colis & {
    ajoutePar: UserInfo;
    modifiePar: UserInfo | null;
  };
}

export interface Colis extends ColisInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetColisParams {
  page?: number;
  limit?: number;
  statut?:
    | "EN_TRANSIT"
    | "QUITTE_CHINE"
    | "LIVRE"
    | "COLLIS_AJOUTE"
    | "EN_ATTENTE";
  pays_destination?: string;
  search?: string;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "nom_colis"
    | "pays_destination"
    | "statut";
  sortOrder?: "asc" | "desc";
}

export interface GetColisResponse {
  colis: Colis[];
  pagination: Pagination;
}
