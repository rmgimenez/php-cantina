import { useCallback } from "react";
import { authStore } from "../stores/auth-store";
import api from "../lib/axios";

interface LoginCredentials {
  usuario: string;
  senha: string;
}

export function useAuth() {
  const state = authStore();

  const login = useCallback(
    async ({ usuario, senha }: LoginCredentials) => {
      try {
        const resp = await api.post("/auth/login", { usuario, senha });
        const data = resp.data?.data;
        if (data?.token) {
          state.setTokens(data.token, null);
        }
        if (data?.funcionario) {
          state.setUser(data.funcionario);
        }
        return { success: true };
      } catch (e: any) {
        return {
          success: false,
          message: e?.response?.data?.message || "Falha ao autenticar",
        };
      }
    },
    [state]
  );

  const logout = useCallback(() => {
    state.logout();
  }, [state]);

  const loadUser = useCallback(async () => {
    if (!state.token) return;
    try {
      const resp = await api.get("/auth/me");
      state.setUser(resp.data?.data);
    } catch {
      state.logout();
    }
  }, [state]);

  return { ...state, login, logout, loadUser };
}
