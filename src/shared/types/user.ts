export interface User {
  id: string;
  name: string;
  email: string;
  onboarding: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
