export interface User {
  id: string;
  phone: string;
  username: string;
  first_name: string;
  last_name: string;
  nin?: string;
  email?: string;
  password_hash?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  phone: string;
  firstName: string;
  lastName: string;
  nin: string;
  password: string;
  dateOfBirth: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}