import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { authStore } from "../stores/auth-store";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = authStore.getState().refreshToken;
        if (refreshToken) {
          const resp = await api.post("/auth/refresh", { refreshToken });
          authStore
            .getState()
            .setTokens(resp.data.data.token, resp.data.data.refreshToken);
          if (error.config) {
            (error.config.headers as any) = error.config.headers || {};
            (
              error.config.headers as any
            ).Authorization = `Bearer ${resp.data.data.token}`;
            return api.request(error.config);
          }
        }
      } catch (e) {
        authStore.getState().logout();
      }
      authStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
