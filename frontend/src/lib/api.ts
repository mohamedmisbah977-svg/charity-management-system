import axios from "axios";

const api = axios.create({
  baseURL: "https://astonishing-kindness-production-a216.up.railway.app/api",
  withCredentials: false, // No more cookies!
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url;
      const path = window.location.pathname;
      if (url !== "/auth/me" && url !== "/auth/login" && path !== "/login" && path !== "/") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;