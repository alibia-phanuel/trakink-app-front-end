/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";
import API from "./api";
import { toast } from "react-toastify";

/**
 * 🧩 Interface principale d’un Colis
 */
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
  ajouteParId: string;
  modifieParId: string | null;
  ajoutePar: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

/**
 * ✅ Réponse pour les listes de colis
 */
interface ColisPaginationResponse {
  colis: Colis[]; // ✅ tableau ici
  pagination: Pagination;
}

/**
 * ✅ Réponse pour un seul colis (création, getById, etc.)
 */
interface ColisSingleResponse {
  message: string;
  colis: Colis;
}

interface GetColisParams {
  page?: number;
  limit?: number;
  statut?: "QUITTE_CHINE" | "RECU_DESTINATION";
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

/**
 * 🔥 Récupère la liste des colis avec pagination et filtres
 */
export const getColis = async (
  params: GetColisParams = {}
): Promise<ColisPaginationResponse> => {
  try {
    const response = await API.get<ColisPaginationResponse>("/colis", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        statut: params.statut,
        pays_destination: params.pays_destination,
        search: params.search,
        sortBy: params.sortBy ?? "createdAt",
        sortOrder: params.sortOrder ?? "desc",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des colis:", error);
    throw error;
  }
};

// 🔹 Récupérer tous les colis sans typage strict (à adapter si besoin)
export const getAllColis = async (params?: Record<string, any>) => {
  const response = await API.get("/colis", { params });
  return response.data;
};

// 🔹 Récupérer un colis par ID
export const getColisById = async (
  id: string
): Promise<ColisSingleResponse> => {
  const response = await API.get<ColisSingleResponse>(`/colis/${id}`);
  return response.data;
};

// 🔹 Mettre à jour les infos d’un colis
interface UpdateColisPayload {
  pays_destination: string;
  ville_destination: string;
  mode_envoi: string;
  unite_mesure: string;
  taille: number;
}

export async function updateColis(id: string, data: UpdateColisPayload) {
  try {
    const response = await API.patch(`/colis/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    let errorMessage = "Erreur inconnue.";

    if (axiosError.response?.status === 403) {
      errorMessage =
        "Ce colis ne peut plus être modifié (déjà reçu ou accès refusé).";
    } else if (
      axiosError.response?.data &&
      typeof axiosError.response.data === "object"
    ) {
      // Si jamais le backend ajoute un message un jour
      errorMessage =
        (axiosError.response.data as any).message || axiosError.message;
    } else {
      errorMessage = axiosError.message;
    }

    console.error("Erreur updateColis:", errorMessage);
    throw new Error(errorMessage);
  }
}
// 🔹 Supprimer un colis
export const deleteColis = async (id: string) => {
  try {
    const response = await API.delete(`/colis/${id}`);

    if (response.status === 200) {
      toast.success("Colis supprimé avec succès");
    }

    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 400) {
      toast.error("Impossible de supprimer un colis déjà reçu");
    } else if (status === 403) {
      toast.error("Permissions insuffisantes");
    } else {
      toast.error("Erreur lors de la suppression du colis");
    }

    throw error;
  }
};

// 🔹 Modifier le statut d’un colis
export const updateColisStatus = async (
  id: string,
  statut: Colis["statut"]
): Promise<ColisSingleResponse> => {
  const response = await API.patch<ColisSingleResponse>(`/colis/${id}/status`, {
    statut,
  });

  return response.data;
};

// 🔹 Récupérer les statistiques des colis
export const getColisStats = async () => {
  const response = await API.get("/colis/stats");
  return response.data;
};

// 🔹 Créer un nouveau colis
export interface ColisData {
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
}

export async function createColis(
  data: ColisData
): Promise<ColisSingleResponse> {
  try {
    const response = await API.post<ColisSingleResponse>("/colis", data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de la création du colis:",
      error.response?.data || error.message
    );
    throw error;
  }
}
export async function updateColisStatut(id: string, statut: string) {
  try {
    const response = await API.patch(`/colis/${id}/status`, { statut });
    return response.data; // ✅ contient message + colis mis à jour
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    let errorMessage = "Erreur lors de la mise à jour du statut.";

    if (axiosError.response?.status === 403) {
      errorMessage = "Accès refusé : vous ne pouvez pas modifier ce colis.";
    } else if (
      axiosError.response?.data &&
      typeof axiosError.response.data === "object"
    ) {
      errorMessage =
        (axiosError.response.data as any).message || axiosError.message;
    } else {
      errorMessage = axiosError.message;
    }

    throw new Error(errorMessage);
  }
}
