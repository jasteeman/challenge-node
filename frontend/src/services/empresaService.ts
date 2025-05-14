import axios from "axios";
import { handleRequestError, logout } from "../auth/AuthService";
import { Empresa } from "../interfaces/IEmpresa";
import { IApiResponse } from "../interfaces/IApiResponse"; 

const { VITE_AUTH_BASE_URL, VITE_TOKEN } = import.meta.env;

const BASE_URL = `${VITE_AUTH_BASE_URL}/empresas`;

const instance = axios.create({
  baseURL: BASE_URL,
});

export const getToken = (): any => {
  const token = localStorage.getItem(VITE_TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : null;
};

let isLoggingOut = false;
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !isLoggingOut) {
      isLoggingOut = true;
      logout();
    }
    return Promise.reject(error);
  }
);

export const createEmpresa = async (empresa: Omit<Empresa, 'id'>): Promise<Empresa | undefined> => {
  try {
    const response = await instance.post<Empresa>('/', empresa, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const getEmpresas = async (queryString?: string): Promise<{ rows: Empresa[]; count: number; page: number; limit: number; totalPages: number }|undefined> => {
  try {
    const response = await instance.get<IApiResponse<Empresa>>(`?${queryString}`, { headers: getToken() });
    if (response.data && response.data.data) {
      return {
        rows: response.data.data.data,
        count: response.data.data.total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        totalPages: response.data.data.totalPages,
      };
    }
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const getEmpresa = async (id: number): Promise<Empresa | undefined> => {
  try {
    const response = await instance.get<Empresa>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const updateEmpresa = async (id: number, empresa: Omit<Empresa, 'id'>): Promise<Empresa | undefined> => {
  try {
    const response = await instance.put<Empresa>(`/${id}`, empresa, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const deleteEmpresa = async (id: number): Promise<number | undefined> => {
  try {
    const response = await instance.delete<number>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const getEmpresasConTransferenciasUltimoMes = async (queryString:string): Promise<Empresa[] | undefined> => {
  try {
    const response = await instance.get<{data:Empresa[]}>('/transferencias-ultimo-mes'+`?${queryString}`, { headers: getToken() });
    return response.data.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const getEmpresasAdheridasUltimoMes = async (queryString:string): Promise<Empresa[]|undefined> => {
  try {
    const response = await instance.get<{data:Empresa[]}>('/adheridas-ultimo-mes'+`?${queryString}`, { headers: getToken() });
    return response.data.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};