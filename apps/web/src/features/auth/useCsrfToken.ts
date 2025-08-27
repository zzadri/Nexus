import { useEffect, useState } from 'react';
import { useCsrfStore } from '../../app/store/csrf.store';

/**
 * Hook pour faciliter l'utilisation du token CSRF dans les formulaires
 * @returns Un objet avec le token CSRF, un indicateur de chargement, et une fonction pour rafraîchir le token
 */
export function useCsrfToken() {
  const { token, fetchToken } = useCsrfStore();
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer le token CSRF au montage du composant si nécessaire
  useEffect(() => {
    // Toujours récupérer un nouveau token CSRF au montage du composant
    setIsLoading(true);
    fetchToken().finally(() => setIsLoading(false));
  }, [fetchToken]);

  // Fonction pour rafraîchir manuellement le token
  const refreshToken = async () => {
    setIsLoading(true);
    await fetchToken();
    setIsLoading(false);
  };

  return {
    csrfToken: token,
    isLoading,
    refreshToken,
  };
}
