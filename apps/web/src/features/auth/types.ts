export interface User {
  id: string;
  email: string;
  displayName: string;
  twoFAEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthError {
  error: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  csrfToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  csrfToken: string;
}

export interface AuthSuccessResponse {
  token: string;
  user: User;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  accessToken?: string;  // Ajouté pour supporter la réponse de l'API
  requiresMfa?: boolean;
  mfaToken?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  token?: string;
  accessToken?: string;  // Ajouté pour supporter la réponse de l'API
}

export interface RefreshResponse {
  success: boolean;
  user: User;
}
