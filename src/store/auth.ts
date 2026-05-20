import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

type AuthState = {
  user: User | null;
  token: string | null;
};

type AuthActions = {
  getUser: () => AuthState["user"];
  getToken: () => AuthState["token"];
  setUser: (user: AuthState["user"]) => void;
  setToken: (token: AuthState["token"]) => void;
  logout: () => void;
};

export const useAuthStore = create(
  persist(
    combine<AuthState, AuthActions>(
      {
        user: null,
        token: null,
      },
      (set, get) => ({
        getUser: () => get().user,
        getToken: () => get().token,
        setUser: (user) => set({ user }),
        setToken: (token) => set({ token }),
        logout: () => set({ user: null, token: null }),
      }),
    ),
    {
      name: "jobby-auth-store",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
