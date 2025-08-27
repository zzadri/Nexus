import { useEffect } from 'react';
import { useAuthStore } from '../../app/store/auth.store';

/**
 * Hook pour initialiser l'authentification au chargement de l'app
 */
export function useAuthInit() {
  const { checkAuth, isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    // Vérifier l'authentification si un token est présent
    if (token && isAuthenticated) {
      checkAuth();
    }
  }, [checkAuth, token, isAuthenticated]);
}

/**
 * Hook pour protéger les routes authentifiées
 */
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuthStore();

  return {
    isAuthenticated,
    loading,
    isAuthenticating: loading,
  };
}
