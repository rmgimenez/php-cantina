import { useCallback, useEffect } from 'react';
import api from '../lib/axios';
import { authStore } from '../stores/auth-store';

interface LoginCredentials {
  usuario: string;
  senha: string;
}

export function useAuth() {
  const state = authStore();

  const loadUser = useCallback(async () => {
    if (!state.token || state.user) return;
    try {
      const resp = await api.get('/auth/me');
      state.setUser(resp.data?.data);
    } catch {
      state.logout();
    }
  }, [state]);

  const login = useCallback(
    async ({ usuario, senha }: LoginCredentials) => {
      try {
        const resp = await api.post('/auth/login', { usuario, senha });
        const data = resp.data?.data;
        if (data?.token) {
          state.setTokens(data.token, null);
        }
        if (data?.funcionario) {
          state.setUser(data.funcionario);
        } else {
          await loadUser();
        }
        return { success: true };
      } catch (err) {
        type ErrorResp = { response?: { data?: { message?: string } } };
        const e = err as ErrorResp;
        const message = e.response?.data?.message || 'Falha ao autenticar';
        return { success: false, message };
      }
    },
    [state, loadUser]
  );

  const logout = useCallback(() => {
    state.logout();
  }, [state]);

  // carrega usuário quando token presente e componente usando hook montar
  useEffect(() => {
    if (state.token && !state.user) {
      void loadUser();
    }
  }, [state.token, state.user, loadUser]);

  return { ...state, login, logout, loadUser };
}
