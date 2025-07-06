export type UserStatus = "ACTIF" | "INACTIF"; // si besoin tu peux élargir

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DIRECTEUR" | "EMPLOYE"; // tu peux compléter selon ton app
export interface UpdateProfileData {
  nom: string;
  prenom: string;
  tel: string;
  url_photo_profil: string;
  password: string;
  currentPassword: string;
}

export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  url_photo_profil: string | null;
  role: UserRole;
  status: UserStatus;
  pays: string | null;
  createdAt: string; // ISO date string
  updatedAt: string;
}

export interface ProfileResponse {
  user: UserProfile;
}
export interface UpdateProfilePayload {
  nom?: string;
  prenom?: string;
  tel?: string;
  url_photo_profil?: string | null;
  password?: string;
  currentPassword?: string;
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    url_photo_profil: string;
    role: string;
    status: string;
    pays: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
};
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  url_photo_profil: string;
  role: "DIRECTEUR" | "EMPLOYE" | "ADMIN";
  status: "ACTIF" | "INACTIF";
  pays: string;
  webAccess: boolean;
  mobileAccess: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isVerified: boolean;
}
