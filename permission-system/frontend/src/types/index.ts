export * from './shared';

export interface FrontendUser extends Omit<import('./shared').User, 'password'> {
  permissions?: import('./shared').Permission[];
}

export interface AuthContextType {
  user: FrontendUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: FrontendUser;
  token: string;
  expiresIn: number;
}

export type Position = 'member' | 'group_leader' | 'department_leader' | 'admin';