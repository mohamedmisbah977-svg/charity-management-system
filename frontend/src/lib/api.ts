import axios from "axios";

const api = axios.create({
  baseURL: "https://astonishing-kindness-production-a216.up.railway.app/api",  // full backend URL + /api
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url;
      // Don't redirect for /auth/me endpoint and if already on login page or home
      if (url !== '/auth/me' && window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;