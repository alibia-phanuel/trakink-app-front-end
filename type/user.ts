export interface Users {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  url_photo_profil: string;
  role: "DIRECTEUR" | "EMPLOYE" | "ADMIN";
  status: "ACTIF" | "INACTIF";
  pays: string;
  webAccess: boolean;
  mobileAccess: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isVerified: boolean;
}

export interface UserPayload {
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  password: string;
  role: "EMPLOYE" | "ADMIN" | "DIRECTEUR" | "SUPER_ADMIN";
  pays: string;
  url_photo_profil: string;
  webAccess: boolean;
  mobileAccess: boolean;
}


export interface PaginationInfo {
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

