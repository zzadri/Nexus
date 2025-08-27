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
          const response = await AuthAPI.login(credentials);

          if (response.requiresMfa) {
            // TODO: Handle MFA flow - implementer plus tard
            set({ loading: false, error: "MFA non implémenté pour le moment" });
            return false;
          }

          // Vérifier si on a soit un token soit un accessToken
          const token = response.token || response.accessToken;

          if (response.user && typeof token === 'string') {

            set({
              user: response.user,
              token: token,
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
          const response = await AuthAPI.register(userData);
          // Vérifier si on a soit un token soit un accessToken
          const token = response.token || response.accessToken;

          if (response.user && typeof token === 'string') {

            set({
              user: response.user,
              token: token,
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

        // Si on a déjà un user et un token, considérons-nous comme authentifié
        if (state.user && state.token && !state.isAuthenticated) {
          set({ isAuthenticated: true });
          return;
        }

        // Si on a un token (avec ou sans user), tenter une vérification d'API
        if (state.token) {

          try {
            const userData = await AuthAPI.getMe() as User;


            // S'assurer que toutes les propriétés requises sont présentes
            const normalizedUser: User = {
              id: userData.id || (state.user?.id || ''),
              email: userData.email || (state.user?.email || ''),
              displayName: userData.displayName || (state.user?.displayName || userData.email || 'Utilisateur'),
              twoFAEnabled: userData.twoFAEnabled === true,
              createdAt: userData.createdAt || (state.user?.createdAt || new Date().toISOString()),
              updatedAt: userData.updatedAt || (state.user?.updatedAt || new Date().toISOString())
            };

            // Mettre à jour les informations utilisateur
            set({
              user: normalizedUser,
              isAuthenticated: true
            });
          } catch (err) {
            console.error("❌ CheckAuth - Échec de la vérification API");

            // Seulement si l'erreur est 401/403, on déconnecte
            // Sinon, on garde l'état actuel pour éviter les déconnexions en cas de problème réseau temporaire
            if (err && typeof err === 'object' && 'status' in err &&
                ([401, 403].includes((err as any).status))) {
              set({
                user: null,
                token: null,
                isAuthenticated: false
              });
            } else {
              // Si on a déjà un user, le garder
              if (state.user) {
                set({ isAuthenticated: true });
              }
            }
          }
        } else if (!state.token && state.isAuthenticated) {
          // Incohérence : authentifié mais sans token
          console.warn('⚠️ CheckAuth - Incohérence : authentifié sans token, réinitialisation');
          set({
            isAuthenticated: false,
            user: null
          });
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
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('❌ AuthStore - Erreur lors de la réhydratation du state:', error);
          }

          if (rehydratedState) {

            // S'assurer que l'état est cohérent après réhydratation
            if (rehydratedState.token && rehydratedState.user && !rehydratedState.isAuthenticated) {
              rehydratedState.isAuthenticated = true;
            }
          }
        };
      },
    }
  )
);
