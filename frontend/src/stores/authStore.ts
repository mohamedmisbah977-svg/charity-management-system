import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: "Admin" | "Staff";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { username, password });

          if (!data.access_token) {
            throw new Error("No access token received");
          }

          // Save token to localStorage for Bearer authentication
          localStorage.setItem("access_token", data.access_token);

          // Use user from login response directly - no extra API call
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (err) {
          console.error("Logout error:", err);
        } finally {
          // Clear token from localStorage
          localStorage.removeItem("access_token");
          set({ user: null, isAuthenticated: false });
          window.location.href = "/login";
        }
      },

      fetchMe: async () => {
        // Check if token exists before making request
        const token = localStorage.getItem("access_token");
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data, isAuthenticated: true });
        } catch (error) {
          // Token might be expired, clear it
          localStorage.removeItem("access_token");
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "charity-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);