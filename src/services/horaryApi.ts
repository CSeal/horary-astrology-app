// src/services/horaryApi.ts
// Axios instance + POST /horary/ask + retry logic + error normalization.
// API key priority: SecureStore → EXPO_PUBLIC_ASTROLOGY_API_KEY env var

import axios, { AxiosError, AxiosInstance } from 'axios';
import { secureKeyService } from './secureKeyService';
import { API_BASE_URL, API_TIMEOUT } from '../constants/config';
import type { HoraryRequest, HoraryResponse, HoraryAPIError } from '../types/horary';

const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

export async function getApiKey(): Promise<string> {
  // Priority 1: User-supplied key in SecureStore
  const stored = await secureKeyService.getKey();
  if (stored && stored.trim().length > 0) {
    return stored;
  }

  // Priority 2: Build-time env var (non-secret dev key)
  const envKey = process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey;
  }

  console.warn('[horaryApi] No API key found — request will likely fail with 401');
  return '';
}

export function normalizeError(error: AxiosError): HoraryAPIError {
  if (!error.response) {
    const isTimeout =
      error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout');
    if (isTimeout) {
      return {
        code: 'TIMEOUT',
        message: 'The server took too long to respond. Please try again.',
        retryable: false,
      };
    }
    return {
      code: 'NETWORK_ERROR',
      message: 'No internet connection. Please check your network and try again.',
      retryable: false,
    };
  }

  const status = error.response.status;
  const apiMessage = (error.response.data as { message?: string })?.message;

  if (status >= 400 && status < 500) {
    return {
      code: 'API_4XX',
      message: apiMessage ?? 'Something went wrong. Please try again.',
      retryable: false,
      originalStatus: status,
      originalMessage: apiMessage,
    };
  }

  if (status >= 500) {
    return {
      code: 'API_5XX',
      message: apiMessage ?? 'The server encountered an error. Please try again.',
      retryable: true,
      originalStatus: status,
      originalMessage: apiMessage,
    };
  }

  return {
    code: 'UNKNOWN',
    message: 'An unexpected error occurred. Please try again.',
    retryable: false,
    originalStatus: status,
  };
}

const apiInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiInstance.interceptors.request.use(async (config) => {
  const key = await getApiKey();
  config.headers.Authorization = `Bearer ${key}`;
  return config;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    throw normalizeError(error);
  }
);

async function askWithRetry(
  request: HoraryRequest,
  attempt = 1
): Promise<HoraryResponse> {
  try {
    const response = await apiInstance.post<HoraryResponse>('/horary/ask', request);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as HoraryAPIError;
    if (apiError.retryable && attempt < MAX_RETRIES) {
      const delay = BACKOFF_BASE_MS * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay));
      return askWithRetry(request, attempt + 1);
    }
    throw apiError;
  }
}

export const horaryApi = {
  ask: (request: HoraryRequest): Promise<HoraryResponse> => askWithRetry(request),
};
