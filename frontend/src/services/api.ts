import axios from "axios";

const getBaseURL = () => {
  const backendUrl = import.meta.env.VITE_API_URL;
  if (backendUrl) {
    return `${backendUrl}/api`;
  }
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false,  // No cookies needed
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ THIS IS THE MISSING PART - Attach token to every request
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
    const url = error.config?.url;
    const isLoginRequest = url === '/auth/login';

    if (error.response?.status === 401 && !isLoginRequest) {
      const isAuthMe = url === '/auth/me';
      const isLoginPage = window.location.pathname === "/login";
      const isHomePage = window.location.pathname === "/";

      if (!isLoginPage && !isHomePage && !isAuthMe) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;