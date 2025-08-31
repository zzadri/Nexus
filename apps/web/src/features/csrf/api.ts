const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchCsrfToken(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/csrf`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error(`Failed to fetch CSRF token: ${res.status}`);

    const data = await res.json();

    // Pour plus de compatibilité, vérifier si le token est sous csrfToken ou token
    const csrfToken = data.csrfToken || data.token;
    if (!csrfToken) throw new Error('Token CSRF non trouvé dans la réponse');

    return csrfToken;
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
    throw error;
  }
}
