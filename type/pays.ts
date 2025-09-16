// ✅ Typage des données envoyées
export interface CreateCountryDto {
  nom: string;
  code: string;
}

// ✅ Typage de la réponse
export interface Country {
  id: string;
  nom: string;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CreateCountryResponse {
  message: string;
  pays: Country;
}

export interface GetCountriesResponse {
  pays: Country[];
  pagination: Pagination;
}

export interface GetCountryByIdResponse {
  pays: Country;
}
export interface UpdateCountryDto {
  nom?: string;
  code?: string;
  status?: "ACTIF" | "INACTIF";
}

export interface UpdateCountryResponse {
  message: string;
  pays: Country;
}

export interface DeleteCountryResponse {
  message: string;
}
// Réponse attendue
export interface ToggleCountryStatusResponse {
  message: string;
  pays: Country;
}
