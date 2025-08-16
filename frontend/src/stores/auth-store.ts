import { create } from "zustand";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null; // TODO: tipar com interface do usuário
  loading: boolean;
  setTokens: (token: string | null, refreshToken: string | null) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

export const authStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  loading: false,
  setTokens: (token: string | null, refreshToken: string | null) =>
    set({ token, refreshToken }),
  setUser: (user: any) => set({ user }),
  logout: () => set({ token: null, refreshToken: null, user: null }),
}));
