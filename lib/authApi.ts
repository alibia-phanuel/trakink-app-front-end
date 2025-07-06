/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/authApi.ts
import API from "./api"; // Importation de l'instance Axios
import { UserProfile } from "@/type/userProfileTypes";
import {
  UpdateProfilePayload,
  LoginCredentials,
  LoginResponse,
} from "@/type/userProfileTypes";

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  try {
    const response = await API.post<LoginResponse>("/auth/login", credentials);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Erreur lors de la connexion"
    );
  }
};

export const getProfile = async (): Promise<UserProfile> => {
  try {
    const res = await API.get("/auth/profile");
    return res.data.user;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Erreur lors du chargement du profil"
    );
  }
};

export async function updateProfile(payload: UpdateProfilePayload) {
  try {
    const response = await API.patch("/auth/profile", payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur API updateProfile :",
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        "Erreur lors de la mise à jour du profil"
    );
  }
}

export const logout = async (): Promise<string> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) throw new Error("Aucun token trouvé");

    const response = await API.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    return response.data.message;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Erreur lors de la déconnexion"
    );
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await API.post("/auth/request-password-reset", { email });
    return { success: true, message: response.data.message };
  } catch (error: any) {
    const status = error.response?.status;
    let message = "Une erreur est survenue";

    if (status === 400) message = "Email requis";
    else if (status === 401) message = "Compte bloqué";
    else if (status === 429) message = "Trop de demandes, réessayez plus tard";
    else if (status === 500) message = "Erreur lors de l'envoi de l'e-mail";
    return { success: false, message };
  }
};

// Étape 2 : Vérification OTP - Retourne un token de réinitialisation
export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await API.post("/auth/verify-otp", {
      email,
      otp,
    });

    return {
      success: true,
      message: "Code OTP vérifié avec succès",
      token: response.data?.resetToken || "", // ← on récupère `resetToken` ici
    };
  } catch (error: any) {
    const status = error.response?.status;
    let message = "Une erreur est survenue";

    if (status === 400) message = "Code OTP invalide ou expiré";
    else if (status === 401)
      message = "Utilisateur non trouvé ou compte bloqué";
    else if (status === 429)
      message = "Trop de tentatives, réessayez plus tard";
    else message = "Erreur serveur pendant la vérification";

    return {
      success: false,
      message,
    };
  }
};

// Étape 3 : Réinitialisation du mot de passe avec token
export const resetPasswordWithToken = async (
  resetToken: string,
  newPassword: string
) => {
  try {
    const response = await API.post("/auth/reset-password", {
      resetToken,
      newPassword,
    });

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error: any) {
    const status = error.response?.status;
    let message = "Une erreur est survenue";

    if (status === 400)
      message = "Mot de passe trop faible ou données invalides";
    else if (status === 401) message = "Token invalide ou expiré";
    else message = "Erreur serveur lors de la réinitialisation";

    return {
      success: false,
      message,
    };
  }
};
//mise a jour utilisateur
export const updateUserById = async (
  userId: string,
  payload: {
    nom: string;
    prenom: string;
    tel: string;
    url_photo_profil: string;
    role: "DIRECTEUR" | "EMPLOYE" | "ADMIN";
    status: "ACTIF" | "INACTIF";
    pays: string;
    webAccess: boolean;
    mobileAccess: boolean;
  }
) => {
  try {
    const response = await API.patch(`/users/${userId}`, payload);
    return {
      success: true,
      message: response.data.message,
      user: response.data.user,
    };
  } catch (error: any) {
    console.error(
      "Erreur API updateUserById :",
      error?.response?.data || error.message
    );

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Erreur lors de la mise à jour de l'utilisateur",
    };
  }
};

//get user by id
export const getUserById = async (userId: string) => {
  try {
    const response = await API.get(`/users/${userId}`);
    return {
      success: true,
      user: response.data.user,
    };
  } catch (error: any) {
    console.error(
      "Erreur API getUserById :",
      error?.response?.data || error.message
    );

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Erreur lors du chargement de l'utilisateur",
    };
  }
};