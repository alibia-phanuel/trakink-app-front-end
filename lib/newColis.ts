// services/colis.ts
import API from "./api"; // ton instance axios
import type {
  ColisInput,
  ColisResponse,
  GetColisParams,
  GetColisResponse,
} from "../type/newColis";
import axios from "axios";

/**
 * Crée un nouveau colis via l'API
 * @param data - Données du colis à créer
 * @returns ColisResponse
 */
export const newCreateColis = async (
  data: ColisInput
): Promise<ColisResponse> => {
  try {
    const response = await API.post<ColisResponse>("/colis", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Erreur Axios:", error.response?.data || error.message);
      throw error;
    }
    console.error("Erreur inconnue:", error);
    throw error;
  }
};

/**
 * Récupère la liste des colis avec pagination, filtre et tri
 */
export const getColis = async (
  params: GetColisParams = {}
): Promise<GetColisResponse> => {
  try {
    const response = await API.get<GetColisResponse>("/colis", { params });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        console.warn("Requête annulée, ignorée");
        throw new Error("Requête annulée"); // Ou retourner une valeur par défaut si souhaité
      }
      console.error(
        "Erreur Axios lors de la récupération des colis:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || error.message);
    } else {
      console.error(
        "Erreur inconnue lors de la récupération des colis:",
        error
      );
      throw new Error("Erreur inconnue lors de la récupération des colis");
    }
  }
};
