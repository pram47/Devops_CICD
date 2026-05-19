export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

export type AuthState = {
  user: User | null;
  token: string | null;
};

export type AuthActions = {
  getUser: () => AuthState["user"];
  getToken: () => AuthState["token"];
  setUser: (user: AuthState["user"]) => void;
  setToken: (token: AuthState["token"]) => void;
  logout: () => void;
};
