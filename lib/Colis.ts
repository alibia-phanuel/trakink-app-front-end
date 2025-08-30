/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Colis,
  ColisPayload,
  ColisResponse,
  ColisListResponse,
} from "@/type/colis";
import API from "./api";
import type { AxiosResponse } from "axios";

/**
 * Créer un colis
 */
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

/**
 * Récupérer TOUS les colis
 */
export const getColis = async (): Promise<Colis[]> => {
  try {
    const response: AxiosResponse<ColisListResponse> = await API.get("/colis");
    return response.data.colis;
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération des colis :",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Récupérer UN colis par ID
 */
export const getColisById = async (id: string): Promise<ColisResponse> => {
  try {
    const response: AxiosResponse<ColisResponse> = await API.get(
      `/colis/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération du colis :",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Supprimer une image Cloudinary par son public_id via l'API route sécurisée
 */
const deleteImageCloudinary = async (publicId: string) => {
  try {
    await API.post("/api/cloudinary/delete", { publicId });
  } catch (error: any) {
    console.error("Erreur lors de la suppression Cloudinary :", error.message);
  }
};

/**
 * Supprimer un colis + ses images Cloudinary
 */
export const deleteColis = async (id: string): Promise<{ message: string }> => {
  try {
    // 1. Récupérer le colis pour avoir ses imageId
    const { colis } = await getColisById(id);
    console.log(colis);

    // 2. Supprimer toutes les images via l'API route Cloudinary
    if (colis.imageId && colis.imageId.length > 0) {
     
      for (const publicId of colis.imageId) {
         console.log("Suppression image Cloudinary :", publicId);
        await deleteImageCloudinary(publicId);
      }
    }

    // 3. Supprimer le colis en BDD via ton API
    const response: AxiosResponse<{ message: string }> = await API.delete(
      `/colis/${id}`
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de la suppression du colis :",
      error.response?.data || error.message
    );
    throw error;
  }
};
