// types/pays.ts

export interface ColisByPays {
  pays: string;
  count: number;
}

export interface Stats {
  totalColis: number;
  colisQuittesChine: number;
  colisRecus: number;
  tauxReception: string; // si l’API renvoie toujours un string
  colisByPays: ColisByPays[];
}

export interface StatsResponse {
  stats: Stats;
}
// --- Types des entités ---
export interface PaysAvecColis {
  id: string;
  nom: string;
  code: string;
  status: "ACTIF" | "INACTIF";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  colisCount: number;
}

export interface PaysAvecUtilisateurs {
  id: string;
  nom: string;
  code: string;
  status: "ACTIF" | "INACTIF";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  usersCount: number;
}

export interface StatistiquesGenerales {
  nombrePaysAvecColis: number;
  nombrePaysAvecUtilisateurs: number;
}

// --- Types pour la réponse de l'API ---
export interface PaysStats {
  totalPays: number;
  paysActifs: number;
  paysInactifs: number;
  tauxActivation: string; // "100.00"
  paysAvecColis: PaysAvecColis[];
  paysAvecUtilisateurs: PaysAvecUtilisateurs[];
  statistiquesGenerales: StatistiquesGenerales;
}

// --- Status / code / message possibles ---
export type PaysStatsSuccessResponse = {
  status: 200;
  message: "Statistiques récupérées";
  stats: PaysStats;
};

export type PaysStatsForbiddenResponse = {
  status: 403;
  message: "Accès interdit - Employés non autorisés";
};

// --- Type global pour la fonction getPaysStats ---
export type GetPaysStatsResponse =
  | PaysStatsSuccessResponse
  | PaysStatsForbiddenResponse;
// types/analytics.ts

// --- Utilisateurs ---
export interface UserEvolution {
  date: Record<string, unknown>; // peut être string ou objet selon backend
  count: number;
}

export interface UsersStats {
  total: number;
  active: number;
  blocked: number;
  evolution: UserEvolution[];
}

// --- Colis ---
export interface ColisEvolution {
  date: Record<string, unknown>;
  count: number;
  received: number;
}

export interface ColisRecent {
  id: string;
  nom_destinataire: string;
  numero_tel_destinataire: string;
  email_destinataire: string;
  pays_destination: string;
  ville_destination: string;
  adresse_destinataire: string;
  nom_colis: string;
  nature_colis: string;
  mode_envoi: string;
  unite_mesure: string;
  taille: number;
  images_colis: string[];
  imageId: string[];
  statut:
    | "COLLIS_AJOUTE"
    | "QUITTE_CHINE"
    | "RECU_DESTINATION"
    | "RECU_PAR_LE_CLIENT";
  createdAt: string;
  updatedAt: string;
  dureeTransportEstimee: number | null;
  qrCodeData: string | null;
  ajouteParId: string;
  modifieParId: string | null;
  livrerParId: string | null;
  ajoutePar: {
    nom: string;
    prenom: string;
  };
}

export interface ColisStats {
  total: number;
  quittesChine: number;
  recus: number;
  tauxReception: number;
  tauxEnCours: number;
  evolution: ColisEvolution[];
  recent: ColisRecent[];
}

// --- Transport ---
export interface TransportGlobal {
  total_colis: number;
  volume_total_maritime: number;
  poids_total_aerien: number;
  volume_moyen_maritime: number;
  poids_moyen_aerien: number;
  colis_maritime: number;
  colis_aerien: number;
  colis_autres: number;
}

export interface TransportParModeItem {
  count: number;
  total: number;
  moyenne: number;
  type: string;
  unite: string;
}

export interface CroisementStatutModeItem {
  mode_envoi: string;
  statut: string;
  count: number;
  taille_totale: number;
  taille_moyenne: number;
  taille_min: number;
  taille_max: number;
}

export interface TransportStats {
  global: TransportGlobal;
  par_mode: Record<string, TransportParModeItem>; // Aérien, Maritime, Terrestre
  croisement_statut_mode: Record<string, CroisementStatutModeItem>;
}

// --- Destinations ---
export interface Destination {
  pays: string;
  count: number;
}

// --- Date range ---
export interface DateRange {
  start: string;
  end: string;
}

// --- Dashboard complet ---
export interface DashboardStats {
  period: string; // ex: "30d", "90d", "1y"
  users: UsersStats;
  colis: ColisStats;
  transport: TransportStats;
  destinations: Destination[];
  dateRange: DateRange;
}

// --- Codes HTTP possibles ---
export type DashboardSuccessResponse = {
  status: 200;
  message: "Statistiques récupérées avec succès";
  stats: DashboardStats;
};

export type DashboardUnauthorizedResponse = {
  status: 401;
  message: "Token invalide ou manquant";
};

export type DashboardForbiddenResponse = {
  status: 403;
  message: "Permissions insuffisantes";
};

export type DashboardServerErrorResponse = {
  status: 500;
  message: "Erreur serveur";
};

export type GetDashboardResponse =
  | DashboardSuccessResponse
  | DashboardUnauthorizedResponse
  | DashboardForbiddenResponse
  | DashboardServerErrorResponse;

// --- Types des filtres ---
export interface ColisStatsFilters {
  groupBy?: "day" | "week" | "month" | "year";
  pays?: string; // CI, CM, FR...
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  modeEnvoi?: "Aerien" | "Maritime" | "Terrestre";
}

// --- Type pour un élément analytics ---
export interface ColisAnalyticsItem {
  period: string;
  mode_envoi: string;
  pays_destination: string;
  statut: string;
  total: number;
  en_cours: number;
  recus: number;
  taille_totale: number;
  taille_moyenne: number;
  taille_min: number;
  taille_max: number;
  maritime_count: number;
  aerien_count: number;
  volume_maritime: number;
  poids_aerien: number;
}

// --- Type pour le résumé ---
export interface ColisSummaryItem {
  period: string;
  total_colis: number;
  volume_total_maritime: number;
  poids_total_aerien: number;
  colis_maritime: number;
  colis_aerien: number;
}

// --- Type de réponse ---
export interface GetColisStatsResponseSuccess {
  status: 200;
  message: "Analytics récupérées avec succès";
  analytics: ColisAnalyticsItem[];
  summary: ColisSummaryItem[];
  groupBy: string;
  filters: ColisStatsFilters;
}

export interface GetColisStatsResponse401 {
  status: 401;
  message: "Token invalide ou manquant";
}

export interface GetColisStatsResponse403 {
  status: 403;
  message: "Permissions insuffisantes";
}

export interface GetColisStatsResponse500 {
  status: 500;
  message: "Erreur serveur";
}

export type GetColisStatsResponse =
  | GetColisStatsResponseSuccess
  | GetColisStatsResponse401
  | GetColisStatsResponse403
  | GetColisStatsResponse500;
export interface TransportDetail {
  mode_envoi: string;
  pays_destination: string;
  statut: string;
  unite_mesure: string;
  count: number;
  total_taille: number;
  moyenne_taille: number;
  min_taille: number;
  max_taille: number;
  ecart_type_taille: number;
}

export interface TransportEvolution {
  date: DateRange; // parfois la date peut être vide dans l'API
  mode_envoi: string;
  count: number;
  total_taille: number;
  recus: number;
}

export interface StatsTransportResponse {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  transportDetails: TransportDetail[];
  evolution: TransportEvolution[];
}
