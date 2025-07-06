/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "./api";
import { Users, PaginationInfo, UserPayload } from "../type/user";
import { User } from "@/type/userProfileTypes";
export const fetchUsers = async (
  page: number = 1,
  itemsPerPage: number = 10
): Promise<{
  users: User[];
  pagination: PaginationInfo;
}> => {
  try {
    const response = await API.get(
      `/users?page=${page}&itemsPerPage=${itemsPerPage}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw new Error("Impossible de charger les utilisateurs.");
  }
};

/**
 * Récupère un utilisateur par son ID
 * @param id - L'identifiant de l'utilisateur
 * @returns Un objet utilisateur
 * @throws Erreur si l'utilisateur est introuvable ou accès interdit
 */
export const getUserById = async (id: string): Promise<Users> => {
  try {
    const response = await API.get(`/users/${id}`);
    return response.data.user;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Utilisateur non trouvé.");
    } else if (error.response?.status === 403) {
      throw new Error("Accès interdit à cet utilisateur.");
    } else {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      throw new Error(
        "Erreur serveur lors de la récupération de l'utilisateur."
      );
    }
  }
};
// lib/Utilisateurs.ts
/**
 * Crée un nouvel utilisateur
 * @param userData - Les données à envoyer pour créer l'utilisateur
 * @returns L'utilisateur créé
 * @throws Erreurs diverses selon le code HTTP
 */
export const createUser = async (userData: UserPayload): Promise<Users> => {
  try {
    const response = await API.post("/users", userData);
    return response.data.user;
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 400) {
      throw new Error("Données invalides.");
    } else if (status === 403) {
      throw new Error("Permissions insuffisantes.");
    } else if (status === 409) {
      throw new Error("Email ou téléphone déjà utilisé.");
    } else {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      throw new Error("Erreur serveur lors de la création.");
    }
  }
};

/**
 * Supprime un utilisateur par ID avec gestion des erreurs et permissions
 * @param userId - l'UUID de l'utilisateur à supprimer
 * @returns message de succès
 * @throws Erreur si la suppression échoue
 */
export const deleteUser = async (userId: string): Promise<string> => {
  try {
    const response = await API.delete(`/users/${userId}`);
    return response.data.message; // "Utilisateur supprimé avec succès"
  } catch (error: any) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);

    const status = error?.response?.status;
    const message = error?.response?.data?.error || "Erreur inconnue";

    if (status === 400) {
      throw new Error(
        "Impossible de supprimer l'utilisateur : colis associés ou auto-suppression."
      );
    }

    if (status === 403) {
      throw new Error(
        "Permissions insuffisantes pour supprimer cet utilisateur."
      );
    }

    throw new Error(message);
  }
};
