import { create } from 'zustand';

import { apiRequest, ApiError } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  emailVerifiedAt: string | null;
}

export type AuthDialogMode = 'login' | 'register' | 'forgot' | 'reset';
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  dialogOpen: boolean;
  dialogMode: AuthDialogMode;
  resetToken: string | null;
  loadSession: () => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { email: string; password: string; displayName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  openAuthDialog: (mode?: AuthDialogMode, resetToken?: string | null) => void;
  closeAuthDialog: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  dialogOpen: false,
  dialogMode: 'login',
  resetToken: null,
  loadSession: async () => {
    set({ status: 'loading' });
    try {
      const result = await apiRequest<{ user: AuthUser }>('/auth/me');
      set({ user: result.user, status: 'authenticated' });
    } catch (error) {
      set({
        user: null,
        status: error instanceof ApiError && error.status === 401 ? 'anonymous' : 'error',
      });
    }
  },
  login: async (input) => {
    const result = await apiRequest<{ user: AuthUser }>('/auth/login', { body: input });
    set({ user: result.user, status: 'authenticated' });
  },
  register: async (input) => {
    await apiRequest<{ user: AuthUser; verificationRequired: boolean }>('/auth/register', { body: input });
  },
  logout: async () => {
    try {
      await apiRequest<{ loggedOut: boolean }>('/auth/logout', { method: 'POST' });
    } finally {
      set({ user: null, status: 'anonymous' });
    }
  },
  verifyEmail: async (token) => {
    await apiRequest<{ verified: boolean }>('/auth/verify-email', { body: { token } });
  },
  resendVerification: async (email) => {
    await apiRequest<{ accepted: boolean }>('/auth/resend-verification', { body: { email } });
  },
  requestPasswordReset: async (email) => {
    await apiRequest<{ accepted: boolean }>('/auth/forgot-password', { body: { email } });
  },
  resetPassword: async (token, password) => {
    await apiRequest<{ passwordReset: boolean }>('/auth/reset-password', { body: { token, password } });
  },
  openAuthDialog: (mode = 'login', resetToken = null) => {
    set({ dialogOpen: true, dialogMode: mode, resetToken });
  },
  closeAuthDialog: () => set({ dialogOpen: false, resetToken: null }),
}));
