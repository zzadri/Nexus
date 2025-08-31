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
      set({ token });
    } catch (e) {
      console.error("CSRF fetch failed");
    }
  },
}));
