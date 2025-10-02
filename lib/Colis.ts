/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ColisPayload,
  ColisResponse,
  ColisUpdateData,
  PaginationMeta,
} from "@/type/colis";
import API from "./api"; // ton instance Axios
import type { AxiosResponse } from "axios";
import { deleteCloudinaryImages } from "./cloudinary";

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
  pagination: PaginationMeta;
}

// ⚙️ tu peux passer page & limit en param
export const getColis = async (
  page = 1,
  limit = 10,
  search = "",
  statut = "",
  pays = ""
): Promise<ColisListResponse> => {
  try {
    const response: AxiosResponse<ColisListResponse> = await API.get("/colis", {
      params: {
        page,
        limit,
        search: search || undefined,
        statut: statut || undefined,
        pays_destination: pays || undefined,
      },
    });

    // ✅ garde tout, pas seulement le tableau
    return response.data;
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
 * @param statut Nouveau statut : "QUITTE_CHINE" | "RECU_DESTINATION"
 * @returns Objet avec data (payload) et status (HTTP)
 */
export const updateColisStatut = async (
  id: string,
  statut: "QUITTE_CHINE" | "RECU_DESTINATION"
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

/**
 * GET /colis/:id → ne renvoie que les champs utiles pour MAJ
 * @param id UUID du colis
 * @returns Données restreintes à pays, ville, mode, unité, taille, images
 */
export async function getColisById(id: string): Promise<ColisUpdateData> {
  try {
    const res = await API.get<{ colis: ColisResponse["colis"] }>(
      `/colis/${id}`
    );
    const c = res.data.colis;

    const mapped: ColisUpdateData = {
      pays_destination: c.pays_destination,
      ville_destination: c.ville_destination,
      mode_envoi: c.mode_envoi,
      unite_mesure: c.unite_mesure,
      taille: c.taille,
      images_colis: c.images_colis,
      imageId: c.imageId,
    };

    return mapped;
  } catch (err: any) {
    if (err.response) {
      throw new Error(
        `Erreur API ${err.response.status}: ${JSON.stringify(
          err.response.data
        )}`
      );
    }
    throw new Error(`Erreur inattendue: ${err.message || err}`);
  }
}

/**
 * Met à jour un colis via PATCH
 * @param id UUID du colis
 * @param data Champs à modifier
 * @throws Error si 403 (colis déjà reçu / permissions) ou autre statut
 */
export async function patchColis(
  id: string,
  data: Partial<
    Pick<
      ColisPayload,
      | "pays_destination"
      | "ville_destination"
      | "mode_envoi"
      | "unite_mesure"
      | "taille"
      | "images_colis"
      | "imageId"
    >
  >
): Promise<ColisResponse> {
  try {
    const res = await API.patch<ColisResponse>(`/colis/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 403) {
        throw new Error("Colis déjà reçu ou permissions insuffisantes");
      }
      throw new Error(
        `Erreur API ${err.response.status}: ${JSON.stringify(
          err.response.data
        )}`
      );
    }
    throw new Error(`Erreur inattendue: ${err.message || err}`);
  }
}

/**
 * Supprime les anciennes images Cloudinary puis met à jour le colis
 * @param colisId UUID du colis
 * @param newData Nouvel état (images à conserver, + autres champs)
 * @param oldImageIds Liste des images existantes avant édition
 */
export async function updateColisWithImages(
  colisId: string,
  newData: ColisUpdateData,
  oldImageIds: string[]
) {
  // 1️⃣ repérer ce qui doit être supprimé
  const toDelete = oldImageIds.filter((id) => !newData.imageId?.includes(id));

  // 2️⃣ purge Cloudinary
  if (toDelete.length) {
    await deleteCloudinaryImages(toDelete);
  }

  // 3️⃣ PATCH du colis
  const response = await patchColis(colisId, newData);
  return response;
}
