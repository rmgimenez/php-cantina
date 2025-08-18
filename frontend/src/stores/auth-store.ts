import { create } from 'zustand';

// Interface do usuário autenticado
export interface AuthUser {
  id: number;
  usuario: string;
  nome: string;
  email?: string | null;
  tipo: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  loading: boolean;
  setTokens: (token: string | null, refreshToken: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  hydrate: () => void; // carrega estado salvo (localStorage)
}

const STORAGE_KEY = 'cantinaAuth';

function persist(partial: Pick<AuthState, 'token' | 'refreshToken' | 'user'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partial));
  } catch {
    console.error('Erro ao persistir estado de autenticação');
  }
}

function readPersisted(): Partial<AuthState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return {
      token: data.token || null,
      refreshToken: data.refreshToken || null,
      user: data.user || null,
    };
  } catch {
    return {};
  }
}

export const authStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  loading: false,
  setTokens: (token, refreshToken) => {
    set({ token, refreshToken });
    persist({ token, refreshToken, user: get().user });
  },
  setUser: (user) => {
    set({ user });
    persist({ token: get().token, refreshToken: get().refreshToken, user });
  },
  logout: () => {
    set({ token: null, refreshToken: null, user: null });
    persist({ token: null, refreshToken: null, user: null });
  },
  hydrate: () => {
    const data = readPersisted();
    if (data.token) {
      set({ token: data.token, refreshToken: data.refreshToken || null, user: data.user || null });
    }
  },
}));

// Hidrata imediatamente ao importar (somente lado do browser)
if (typeof window !== 'undefined') {
  authStore.getState().hydrate();
}
