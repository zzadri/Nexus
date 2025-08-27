import { useCsrfStore } from "../../app/store/csrf.store";
import { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, RefreshResponse, AuthError } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(public status: number, public data: AuthError) {
    super(data.message || data.error);
    this.name = 'ApiError';
  }
}

// Fonction pour obtenir le token JWT depuis le storage
function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  skipAuth: boolean = false
): Promise<T> {
  const { token } = useCsrfStore.getState();
  const authToken = skipAuth ? null : getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { "X-CSRF-TOKEN": token } : {}),
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include", // important pour cookies HttpOnly
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data;
}

export const AuthAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const fullUrl = `${API_BASE_URL}/api/v1/auth/login`;

    console.log('📤 Envoi login avec données:', credentials); // Debug log

    const res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(res.status, data);
    }

    return data;
  },

  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const fullUrl = `${API_BASE_URL}/api/v1/auth/register`;

    console.log('📤 Envoi register avec données:', userData); // Debug log

    const res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(res.status, data);
    }

    return data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>("/api/v1/auth/logout", {
      method: "POST"
    });
  },

  refresh: async (): Promise<RefreshResponse> => {
    return apiFetch<RefreshResponse>("/api/v1/auth/refresh", {
      method: "POST"
    });
  },

  getMe: async () => {
    return apiFetch("/api/v1/me");
  },
};

export { ApiError };
