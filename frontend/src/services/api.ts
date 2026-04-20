import axios from "axios";

// Use environment variable for production, fallback to relative path for development
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Don't redirect on login failures
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