const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchCsrfToken(): Promise<string> {
  console.log('Tentative de récupération du token CSRF depuis:', `${API_BASE_URL}/api/v1/auth/csrf`);
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/csrf`, {
      credentials: "include",
    });

    console.log('Réponse CSRF status:', res.status);

    if (!res.ok) throw new Error(`Failed to fetch CSRF token: ${res.status}`);

    // Afficher les cookies reçus
    console.log('Cookies reçus:', document.cookie);

    const data = await res.json();
    console.log('Données CSRF reçues:', data);

    // Pour plus de compatibilité, vérifier si le token est sous csrfToken ou token
    const csrfToken = data.csrfToken || data.token;
    if (!csrfToken) throw new Error('Token CSRF non trouvé dans la réponse');

    return csrfToken;
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
    throw error;
  }
}
