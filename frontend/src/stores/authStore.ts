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
  created_at?: string;  // ← Add this
  updated_at?: string;  // ← Add this

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
          
          // ✅ Use the user from login response directly - NO extra /auth/me call
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return;
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
          set({ user: null, isAuthenticated: false });
          window.location.href = "/login";
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data, isAuthenticated: true });
        } catch (error) {
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

