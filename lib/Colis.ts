/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColisPayload, ColisResponse } from "@/type/colis";
import API from "./api"; // ton instance Axios
import type { AxiosResponse } from "axios";

export const createColis = async (
  data: ColisPayload
): Promise<ColisResponse> => {
  try {
    const response: AxiosResponse<ColisResponse> = await API.post(
      "/colis",
      data
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de la création du colis :",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Réponse quand l’API renvoie plusieurs colis
export interface ColisListResponse {
  colis: ColisPayload[];
}

// 🟢 Récupérer TOUS les colis
export const getColis = async (): Promise<ColisPayload[]> => {
  try {
    const response: AxiosResponse<ColisListResponse> = await API.get("/colis");
    return response.data.colis; // un tableau de ColisPayload
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération des colis :",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Récupérer un colis par son ID
 * @param id - ID du colis (UUID)
 */
export const getColiById = async (id: string): Promise<ColisPayload> => {
  try {
    const { data } = await API.get<{ colis: ColisPayload; message?: string }>(
      `/colis/${id}`
    );

    return data.colis;
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération du colis:", error);
    throw error.response?.data || error;
  }
};

// ✅ Service pour supprimer un colis (mais pour l’instant on log d’abord les infos)
// ✅ Supprimer un colis (images Cloudinary + BDD, avec rollback si Cloudinary échoue)
export const deleteColis = async (id: string): Promise<{ message: string }> => {
  try {
    // 1️⃣ Récupérer le colis
    const colis = await getColiById(id);
    console.log("📦 Colis à supprimer :", colis);

    // 2️⃣ Supprimer les images Cloudinary associées (obligatoire avant la BDD)
    if (colis.imageId && colis.imageId.length > 0) {
      const cloudinaryRes = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: colis.imageId }),
      });

      if (!cloudinaryRes.ok) {
        const error = await cloudinaryRes.json();
        console.error("❌ Erreur suppression Cloudinary :", error);
        throw new Error("Échec suppression des images Cloudinary");
      }

      const result = await cloudinaryRes.json();
      console.log("🗑️ Images Cloudinary supprimées :", result);
    }
    // 3️⃣ Supprimer le colis en BDD uniquement si Cloudinary OK
    const response: AxiosResponse<{ message: string }> = await API.delete(
      `/colis/${id}`
    );
    console.log("✅ Colis supprimé :", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Suppression interrompue (rollback activé) :",
      error.response?.data || error.message
    );
    throw error;
  }
};

export interface UpdateStatutResponse {
  message: string;
  colis: ColisPayload & {
    createdAt: string;
    updatedAt: string;
  };
}

export interface UpdateStatutResult {
  data: UpdateStatutResponse;
  status: number;
}

/**
 * Met à jour le statut d'un colis
 * @param id ID du colis
 * @param statut Nouveau statut : "RECU_DESTINATION" | "QUITTE_CHINE"
 * @returns Objet avec data (payload) et status (HTTP)
 */
export const updateColisStatut = async (
  id: string,
  statut: "RECU_DESTINATION" | "QUITTE_CHINE"
): Promise<UpdateStatutResult> => {
  try {
    const response = await API.patch<UpdateStatutResponse>(
      `/colis/${id}/status`,
      {
        statut,
      }
    );

    return {
      data: response.data, // ✅ payload typé
      status: response.status, // ✅ code HTTP
    };
  } catch (err: any) {
    console.error(
      "Erreur lors de la mise à jour du statut :",
      err.response?.data || err.message
    );
    throw err;
  }
};
