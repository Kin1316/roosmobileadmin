import axios from 'axios';
import Config from 'react-native-config';
import type {AxiosError} from 'axios';

export type ApiErrorKind = 'unauthenticated' | 'internal' | 'unknown';

export interface ApiError {
  status?: number;
  kind: ApiErrorKind;
  message: string;
}

export function normalizeApiBaseUrl(nextBaseUrl: string): string {
  const trimmed = String(nextBaseUrl || '').trim();
  if (!trimmed) {
    return 'https://recolectoralaross.com/api';
  }

  return trimmed.replace(/\/+$/, '');
}

const resolvedBaseUrl = normalizeApiBaseUrl(Config.API_BASE_URL || 'https://recolectoralaross.com/api');

const fallbackBaseUrls = ['https://recolectoralaross.com/api'];

export function getApiBaseUrlCandidates(): string[] {
  const configured = String(Config.API_BASE_URL || '').trim();
  const merged = configured ? [normalizeApiBaseUrl(configured), ...fallbackBaseUrls] : [...fallbackBaseUrls];
  return [...new Set(merged)];
}

export function setApiBaseUrl(nextBaseUrl: string): void {
  api.defaults.baseURL = normalizeApiBaseUrl(nextBaseUrl);
}

export const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function mapApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError;
  const status = axiosError?.response?.status;

  if (!status) {
    return {
      kind: 'unknown',
      message: 'No se pudo conectar con el servidor',
    };
  }

  if (status === 401 || status === 403) {
    return {
      status,
      kind: 'unauthenticated',
      message: 'Sesion expirada o no autenticado',
    };
  }

  if (status === 500) {
    return {
      status,
      kind: 'internal',
      message: 'Error interno del servidor',
    };
  }

  return {
    status,
    kind: 'unknown',
    message: 'No se pudo completar la solicitud',
  };
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    return Promise.reject(mapApiError(error));
  },
);
