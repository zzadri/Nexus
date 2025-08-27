import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthAPI } from "../../features/auth/api";
import { User, LoginRequest, RegisterRequest } from "../../features/auth/types";
import { showToast, getErrorMessage } from "../../utils/toast";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      login: async (credentials: LoginRequest): Promise<boolean> => {
        set({ loading: true, error: null });
        try {
          console.log('📤 Données de connexion avec CSRF:', credentials); // Debug log

          const response = await AuthAPI.login(credentials);

          if (response.requiresMfa) {
            // TODO: Handle MFA flow - implementer plus tard
            set({ loading: false, error: "MFA non implémenté pour le moment" });
            return false;
          }

          if (response.user && response.token) {
            set({
              user: response.user,
              token: response.token,
              loading: false,
              isAuthenticated: true,
              error: null
            });
            showToast.success("Connexion réussie ! Bienvenue.");
            return true;
          }

          set({ loading: false, error: null });
          showToast.error("Erreur de connexion. Veuillez réessayer.");
          return false;
        } catch (err) {
          const errorMessage = getErrorMessage(err);
          set({ loading: false, error: null });
          showToast.error(errorMessage);
          return false;
        }
      },

      register: async (userData: RegisterRequest): Promise<boolean> => {
        set({ loading: true, error: null });
        try {
          console.log('📤 Données d\'inscription avec CSRF:', userData); // Debug log

          const response = await AuthAPI.register(userData);

          if (response.user && response.token) {
            set({
              user: response.user,
              token: response.token,
              loading: false,
              isAuthenticated: true,
              error: null
            });
            showToast.success("Compte créé avec succès ! Bienvenue.");
            return true;
          }

          set({ loading: false, error: null });
          showToast.error("Erreur lors de la création du compte. Veuillez réessayer.");
          return false;
        } catch (err) {
          const errorMessage = getErrorMessage(err);
          set({ loading: false, error: null });
          showToast.error(errorMessage);
          return false;
        }
      },

      logout: async () => {
        try {
          await AuthAPI.logout();
          showToast.info("Vous avez été déconnecté.");
        } catch (err) {
          console.error("Logout failed:", err);
          showToast.warning("Déconnexion effectuée localement.");
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          });
        }
      },

      refresh: async () => {
        try {
          const response = await AuthAPI.refresh();
          if (response.user) {
            set({
              user: response.user,
              isAuthenticated: true
            });
          }
        } catch (err) {
          console.error("Refresh failed:", err);
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
        }
      },

      checkAuth: async () => {
        const state = get();
        if (state.isAuthenticated && state.user && state.token) {
          // Vérifier si l'authentification est toujours valide
          try {
            await AuthAPI.getMe();
          } catch (err) {
            // Token invalide, déconnecter l'utilisateur
            console.error("Auth check failed:", err);
            set({
              user: null,
              token: null,
              isAuthenticated: false
            });
          }
        }
      },

      setToken: (token: string) => {
        set({ token });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
