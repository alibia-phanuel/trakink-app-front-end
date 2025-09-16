import {
  CreateCountryDto,
  CreateCountryResponse,
  DeleteCountryResponse,
  GetCountriesResponse,
  GetCountryByIdResponse,
  ToggleCountryStatusResponse,
  UpdateCountryDto,
  UpdateCountryResponse,
} from "@/type/pays";
import API from "./api";

// ✅ Fonction pour créer un pays
export const createCountry = async (
  data: CreateCountryDto
): Promise<CreateCountryResponse> => {
  const res = await API.post<CreateCountryResponse>("/pays", data);
  return res.data;
};

// ✅ Fonction pour récupérer les pays avec pagination
export const getCountries = async (
  page: number = 1,
  limit: number = 10
): Promise<GetCountriesResponse> => {
  const res = await API.get<GetCountriesResponse>("/pays", {
    params: { page, limit }, // si ton API supporte ces query params
  });
  return res.data;
};

// ✅ Fonction pour récupérer un pays par ID
export const getCountryById = async (
  id: string
): Promise<GetCountryByIdResponse> => {
  const res = await API.get<GetCountryByIdResponse>(`/pays/${id}`);
  return res.data;
};

// ✅ Fonction pour mettre à jour un pays
export const updateCountry = async (
  id: string,
  data: UpdateCountryDto
): Promise<UpdateCountryResponse> => {
  const res = await API.patch<UpdateCountryResponse>(`/pays/${id}`, data);
  return res.data;
};

// ✅ Fonction pour supprimer un pays
export const deleteCountry = async (
  id: string
): Promise<DeleteCountryResponse> => {
  const res = await API.delete<DeleteCountryResponse>(`/pays/${id}`);
  return res.data;
};

// ✅ Fonction pour activer/désactiver un pays
export const toggleCountryStatus = async (
  id: string
): Promise<ToggleCountryStatusResponse> => {
  const res = await API.patch<ToggleCountryStatusResponse>(
    `/pays/${id}/toggle-status`
  );
  return res.data;
};
