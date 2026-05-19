import type { ErrorResponseProps } from "@/types/apiServiceTypes";
import axios, { AxiosError, AxiosHeaders, type AxiosInstance } from "axios";
import { formatError } from "./serviceHandler";
import { useAuthStore } from "@/store/auth";

const readSessionTokenFromCookie = (): string | null => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(
    /(?:^|;\s*)better-auth\.session_token=([^;]*)/,
  );
  if (!match?.[1]) return null;

  try {
    const token = decodeURIComponent(match[1]);
    return token.trim().length > 0 ? token : null;
  } catch {
    return match[1].trim().length > 0 ? match[1] : null;
  }
};

const readPersistedAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("jobby-auth-store");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      state?: { token?: string | null };
      token?: string | null;
    };
    const token = parsed?.state?.token ?? parsed?.token ?? null;
    return typeof token === "string" && token.trim().length > 0 ? token : null;
  } catch {
    return null;
  }
};

const httpClient: AxiosInstance = axios.create({
  timeout: 60000,
  baseURL: (import.meta.env.VITE_APP_BASE_URL ?? "").trim(),
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    const token =
      useAuthStore.getState().getToken() ??
      readSessionTokenFromCookie() ??
      readPersistedAuthToken();
    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

httpClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const formatted = formatError(err);
    return Promise.reject<ErrorResponseProps>(formatted);
  },
);

export default httpClient;
