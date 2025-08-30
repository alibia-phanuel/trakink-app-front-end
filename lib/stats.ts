// src/api/colis.ts
import API from "./api"; // ton fichier où tu as exporté axios.create

// ✅ Typage de la réponse de l'API
export interface ColisByPays {
  pays: string;
  count: number;
}

export interface ColisStats {
  totalColis: number;
  colisQuittesChine: number;
  colisRecus: number;
  tauxReception: string;
  colisByPays: ColisByPays[];
}

export interface StatsResponse {
  stats: ColisStats;
}

// ✅ Fonction pour récupérer les stats
export const getStats = async (): Promise<StatsResponse> => {
  try {
    const response = await API.get<StatsResponse>("/colis/stats");
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des stats :", error);
    throw error;
  }
};
