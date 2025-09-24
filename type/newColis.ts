// types/colis.ts
export type ColisStatut =
  | "COLLIS_AJOUTE"
  | "QUITTE_CHINE"
  | "RECU_DESTINATION"
  | "RECU_PAR_LE_CLIENT";

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
 statut?: ColisStatut;
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
  statut?: ColisStatut;
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
