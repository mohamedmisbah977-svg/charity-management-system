import axios from "axios";

// For production on Railway, use the backend URL from environment variable
const getBaseURL = () => {
  // Check if VITE_API_URL is set (Railway injection)
  const backendUrl = import.meta.env.VITE_API_URL;
  if (backendUrl) {
    return `${backendUrl}/api`;
  }
  // Development fallback
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;