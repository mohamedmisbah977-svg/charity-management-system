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
      const path = window.location.pathname;
      // Skip redirect for auth endpoints and public pages
      if (
        url !== "/auth/me" &&
        url !== "/auth/login" &&        // add this line
        path !== "/login" &&
        path !== "/"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;