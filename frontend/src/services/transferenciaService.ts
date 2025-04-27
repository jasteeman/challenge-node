import axios from "axios";
import { handleRequestError, logout } from "../auth/AuthService"; 
import { Transferencia } from "../interfaces/ITransferencia";

const { VITE_AUTH_BASE_URL, VITE_TOKEN } = import.meta.env;

const BASE_URL = `${VITE_AUTH_BASE_URL}/transferencias`;

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

export const createTransferencia = async (transferencia: Omit<Transferencia, 'id'>): Promise<Transferencia | undefined> => {
  try {
    const response = await instance.post<Transferencia>('/', transferencia, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const getTransferenciasPorEmpresa = async (idEmpresa: number): Promise<any> => {
  try {
    const {data} = await instance.get<Transferencia[]>(`/empresa/${idEmpresa}`, { headers: getToken() });
   return data
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const getTransferencia = async (id: number): Promise<Transferencia | undefined> => {
  try {
    const response = await instance.get<Transferencia>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const updateTransferencia = async (id: number, transferencia: Omit<Transferencia, 'id'>): Promise<Transferencia | undefined> => {
  try {
    const response = await instance.put<Transferencia>(`/${id}`, transferencia, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const deleteTransferencia = async (id: number): Promise<number | undefined> => {
  try {
    const response = await instance.delete<number>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};