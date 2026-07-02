import {
  firebaseLogin,
  firebaseLogout,
  firebaseMe,
  firebaseSignup,
  firebaseSyncOnboarding,
} from '../firebase/authService';
import type { StoredSignupConsents } from '../types/consent';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  consents?: StoredSignupConsents;
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const result = await firebaseLogin(data.email, data.password);
    return { data: { token: '', user: result.user } };
  },

  signup: async (data: SignupRequest) => {
    const result = await firebaseSignup(data.email, data.password, data.name, data.consents);
    return { data: { token: '', user: result.user } };
  },

  logout: async () => {
    await firebaseLogout();
    return { data: null };
  },

  me: async () => {
    const result = await firebaseMe();
    return { data: result };
  },

  syncOnboarding: async (onboarding: Record<string, unknown>) => {
    const result = await firebaseSyncOnboarding(onboarding);
    return { data: result };
  },
};
