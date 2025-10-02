// src/api/colis.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatsResponse } from "@/type/stats";
import API from "./api";
import { AxiosResponse } from "axios";
// Classe pour les erreurs API
export class ApiError extends Error {
  status: number;

  constructor({ status, message }: { status: number; message: string }) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Fonction pour récupérer les stats
export const getStats = async (): Promise<StatsResponse> => {
  try {
    const response: AxiosResponse<StatsResponse> = await API.get(
      "/colis/stats"
    );
    if (response.status === 200) {
      return response.data;
    }
    throw new ApiError({
      status: response.status,
      message: "Réponse inattendue du serveur",
    });
  } catch (error: any) {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        throw new ApiError({
          status,
          message: "Token invalide ou manquant",
        });
      } else if (status === 403) {
        throw new ApiError({
          status,
          message: "Permissions insuffisantes",
        });
      } else if (status === 500) {
        throw new ApiError({
          status,
          message: "Erreur serveur",
        });
      }
    }
    throw new ApiError({
      status: error.response?.status || 0,
      message:
        error.message ||
        "Une erreur est survenue lors de la récupération des statistiques",
    });
  }
};
