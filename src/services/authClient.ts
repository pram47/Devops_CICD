import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth";
import { apiGetCompanyIdByUserId } from "@/services/profileService";
import { resolveAuthBaseURL } from "@/services/authBase";

const COMPANY_ID_STORAGE_KEY = "company_id";

const authHttpClient = axios.create({
  baseURL: resolveAuthBaseURL(),
  timeout: 60000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const mapError = (error: unknown): { message: string } => {
  const axiosError = error as AxiosError<{ message?: string }>;
  const responseMessage = axiosError.response?.data?.message;
  if (typeof responseMessage === "string" && responseMessage.trim().length > 0) {
    return { message: responseMessage };
  }
  return { message: "Authentication failed" };
};

export const authClient = {
  signIn: {
    email: async (payload: { email: string; password: string }) => {
      try {
        const response = await authHttpClient.post("/auth/sign-in/email", payload);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: mapError(error) };
      }
    },
  },
  signUp: {
    email: async (payload: { email: string; password: string; name: string }) => {
      try {
        const response = await authHttpClient.post("/auth/sign-up/email", payload);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: mapError(error) };
      }
    },
  },
  getSession: async () => {
    const response = await authHttpClient.get("/auth/session");
    return response.data;
  },
};

export const clearAuthStore = () => {
  useAuthStore.getState().logout();
  window.localStorage.removeItem(COMPANY_ID_STORAGE_KEY);
};

export const hydrateCompanyIdFromUserId = async (userId: string) => {
  if (!userId) {
    window.localStorage.removeItem(COMPANY_ID_STORAGE_KEY);
    return;
  }

  try {
    const result = await apiGetCompanyIdByUserId(userId);
    const companyId = result.data?.company_id;
    if (companyId) {
      window.localStorage.setItem(COMPANY_ID_STORAGE_KEY, companyId);
      return;
    }
  } catch {
    // Ignore fetch errors and clear stale company id.
  }

  window.localStorage.removeItem(COMPANY_ID_STORAGE_KEY);
};

type AuthHydrationPayload = {
  data?: AuthHydrationPayload;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    permissions?: string[] | null;
  };
  token?: string | null;
  session?: {
    token?: string | null;
  };
};

export const hydrateAuthStoreFromPayload = (payload: unknown) => {
  const payloadData = payload as AuthHydrationPayload;
  const data = payloadData.data ?? payloadData;
  const user = data?.user;
  const token = data?.token ?? data?.session?.token ?? null;

  if (!user) {
    return false;
  }

  useAuthStore.getState().setUser({
    id: user.id,
    name: user.name ?? user.email ?? "User",
    email: user.email ?? "",
    role: user.role ?? "user",
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
  });
  useAuthStore.getState().setToken(token);
  return true;
};

export const hydrateAuthStoreFromSession = async () => {
  try {
    const sessionResult = (await authClient.getSession()) as unknown;
    const hydrated = hydrateAuthStoreFromPayload(sessionResult);
    if (!hydrated) {
      const { user, token } = useAuthStore.getState();
      if (!user && !token) {
        clearAuthStore();
      }
    }
  } catch {
    const { user, token } = useAuthStore.getState();
    if (!user && !token) {
      clearAuthStore();
    }
  }
};
