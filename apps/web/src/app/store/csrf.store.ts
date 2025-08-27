import { create } from "zustand";
import { fetchCsrfToken } from "../../features/csrf/api";

interface CsrfState {
  token: string | null;
  fetchToken: () => Promise<void>;
}

export const useCsrfStore = create<CsrfState>((set) => ({
  token: null,
  fetchToken: async () => {
    try {
      const token = await fetchCsrfToken();
      console.log('✓ Token CSRF récupéré et stocké dans le store:', token);
      set({ token });
      
      // Vérifie que le cookie CSRF est présent
      const cookies = document.cookie.split(';');
      console.log('Cookies disponibles dans le navigateur:', cookies.map(c => c.trim()).join(', '));
    } catch (err) {
      console.error("CSRF fetch failed:", err);
    }
  },
}));
