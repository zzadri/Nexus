const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/csrf`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch CSRF token");
  const data = await res.json();
  return data.csrfToken;
}
