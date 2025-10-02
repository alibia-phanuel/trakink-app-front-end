// services/pays.ts
import API from "@/lib/api"; // ton axios instance
import type {
  GetPaysStatsResponse,
  GetDashboardResponse,
  GetColisStatsResponse,
  ColisStatsFilters,
  StatsTransportResponse,
} from "@/type/stats";
import { AxiosResponse } from "axios";

export async function getPaysStats(): Promise<GetPaysStatsResponse> {
  try {
    const res = await API.get("/pays/stats");

    // On sait que 200 renvoie les stats
    if (res.status === 200) {
      return {
        status: 200,
        message: "Statistiques récupérées",
        stats: res.data.stats,
      };
    }

    // Par sécurité, tu peux gérer d'autres codes ici
    return {
      status: res.status,
      message: res.data?.message ?? "Erreur inconnue",
    } as GetPaysStatsResponse;
  } catch (err: any) {
    // Si axios lance une erreur avec réponse (ex: 403)
    if (err.response) {
      if (err.response.status === 403) {
        return {
          status: 403,
          message: "Accès interdit - Employés non autorisés",
        };
      }

      return {
        status: err.response.status,
        message: err.response.data?.message || "Erreur inconnue",
      } as GetPaysStatsResponse;
    }

    // Si pas de réponse, erreur réseau
    throw new Error(err.message || "Erreur réseau");
  }
}

export async function getDashboard(
  period: "30d" | "90d" | "1y" = "30d"
): Promise<GetDashboardResponse> {
  try {
    const res = await API.get(`/analytics/dashboard?period=${period}`);

    if (res.status === 200) {
      return {
        status: 200,
        message: "Statistiques récupérées avec succès",
        stats: res.data.stats,
      };
    }

    // Pour TS, on caste les autres codes
    return {
      status: res.status,
      message: res.data?.message ?? "Erreur inconnue",
    } as GetDashboardResponse;
  } catch (err: any) {
    if (err.response) {
      switch (err.response.status) {
        case 401:
          return { status: 401, message: "Token invalide ou manquant" };
        case 403:
          return { status: 403, message: "Permissions insuffisantes" };
        case 500:
          return { status: 500, message: "Erreur serveur" };
        default:
          return {
            status: err.response.status,
            message: err.response.data?.message || "Erreur inconnue",
          } as GetDashboardResponse;
      }
    }
    throw new Error(err.message || "Erreur réseau");
  }
}

export async function getColisStats(
  filters?: ColisStatsFilters
): Promise<GetColisStatsResponse> {
  try {
    const res: AxiosResponse<any> = await API.get("/analytics/colis", {
      params: filters,
    });

    if (res.status === 200) {
      return {
        status: 200,
        message: "Analytics récupérées avec succès",
        analytics: res.data.analytics,
        summary: res.data.summary,
        groupBy: res.data.groupBy,
        filters: res.data.filters,
      };
    }

    return {
      status: res.status,
      message: res.data?.message || "Erreur inconnue",
    } as GetColisStatsResponse;
  } catch (err: any) {
    if (err.response) {
      const code = err.response.status;
      const msg = err.response.data?.message || "Erreur inconnue";

      if (code === 401)
        return { status: 401, message: "Token invalide ou manquant" };
      if (code === 403)
        return { status: 403, message: "Permissions insuffisantes" };
      if (code === 500) return { status: 500, message: "Erreur serveur" };

      return { status: code, message: msg } as GetColisStatsResponse;
    }

    throw new Error(err.message || "Erreur réseau");
  }
}

export const getStatTransport = async (
  period: "7d" | "30d" | "90d" | "1y" = "30d"
) => {
  try {
    const res = await API.get<StatsTransportResponse>("/analytics/transport", {
      params: { period },
    });
    return res.data;
  } catch (error: any) {
    console.error(
      "Erreur getStatTransport:",
      error.response?.data || error.message
    );
    throw error;
  }
};
