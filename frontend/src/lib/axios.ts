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
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

function processQueue(error: any, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // evita loop infinito
      originalRequest._retry = true;
      // Se já está tentando refresh, aguarda
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api.request(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      isRefreshing = true;
      try {
        const resp = await api.post("/auth/refresh");
        const newToken = resp.data?.data?.token;
        if (newToken) {
          authStore.getState().setTokens(newToken, null);
          processQueue(null, newToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api.request(originalRequest);
        }
        throw new Error("Refresh sem token");
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        authStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
