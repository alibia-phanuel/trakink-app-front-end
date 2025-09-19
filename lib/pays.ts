import {
  CreateCountryDto,
  CreateCountryResponse,
  DeleteCountryResponse,
  GetCountriesResponse,
  GetCountryByIdResponse,
  UpdateCountryDto,
  UpdateCountryResponse,
} from "@/type/pays";
import API from "./api";

// ✅ Fonction pour créer un pays
export const createCountry = async (
  data: CreateCountryDto
): Promise<CreateCountryResponse> => {
  const res = await API.post<CreateCountryResponse>("/pays", data);
  return res.data;
};

// ✅ Fonction pour récupérer les pays avec pagination
export const getCountries = async (
  page: number = 1,
  limit: number = 10
): Promise<GetCountriesResponse> => {
  const res = await API.get<GetCountriesResponse>("/pays", {
    params: { page, limit }, // si ton API supporte ces query params
  });
  return res.data;
};

// ✅ Fonction pour récupérer un pays par ID
export const getCountryById = async (
  id: string
): Promise<GetCountryByIdResponse> => {
  const res = await API.get<GetCountryByIdResponse>(`/pays/${id}`);
  return res.data;
};

// ✅ Fonction pour mettre à jour un pays
export const updateCountry = async (
  id: string,
  data: UpdateCountryDto
): Promise<UpdateCountryResponse> => {
  const res = await API.patch<UpdateCountryResponse>(`/pays/${id}`, data);
  return res.data;
};

// ✅ Fonction pour supprimer un pays
export const deleteCountry = async (
  id: string
): Promise<DeleteCountryResponse> => {
  const res = await API.delete<DeleteCountryResponse>(`/pays/${id}`);
  return res.data;
};

// Type du pays renvoyé par l'API
export interface Pays {
  id: string;
  nom: string;
  code: string;
  status: "ACTIF" | "INACTIF";
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

// Réponse du backend pour toggle-status
interface ToggleStatusResponse {
  message: string;
  pays: Pays;
}

/**
 * ✅ Active ou désactive un pays
 * @param paysId ID du pays
 * @returns Objet `pays` mis à jour
 */
export async function togglePaysStatus(
  paysId: string
): Promise<ToggleStatusResponse> {
  try {
    const { data } = await API.patch<ToggleStatusResponse>(
      `/pays/${paysId}/toggle-status`
    );
    return data;
  } catch (error: unknown) {
    console.error("Erreur lors du toggle du pays:", error);
    throw error;
  }
}

// ✅ Fonction pour récupérer les statistiques des pays
export interface PaysStats {
  totalPays: number;
  paysActifs: number;
  paysInactifs: number;
  tauxActivation: string;
  paysAvecColis: { nom: string; code: string; colisCount: number }[];
  paysAvecUtilisateurs: { nom: string; code: string; usersCount: number }[];
}

export async function getPaysStats(): Promise<PaysStats> {
  try {
    const response = await API.get("/pays/stats");
    return response.data.stats as PaysStats;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error("Accès interdit - Employés non autorisés");
    }
    console.error("Erreur lors de la récupération des stats pays:", error);
    throw new Error(
      error.response?.data?.message ||
        "Impossible de charger les statistiques des pays."
    );
  }
}
