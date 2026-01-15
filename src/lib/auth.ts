import api from './api'; // Ensure you created api.ts
import { User } from '@/types/user';

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string) => {
    // Hits Django Endpoint
    const response = await api.post<any>('/auth/login/', { email, password });

    // Save Tokens
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);

    // Normalize User Data (Snake to Camel)
    const rawUser = response.data.user;
    const user: User = {
      ...rawUser,
      isProfileComplete: rawUser.is_profile_complete || rawUser.isProfileComplete || false
    };

    // Save User for UI
    authService.saveSession(user);

    return { user };
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('skillmount_user');
    window.location.href = '/login';
  },

  saveSession: (user: User) => {
    localStorage.setItem('skillmount_user', JSON.stringify(user));
  },

  getSession: (): User | null => {
    const data = localStorage.getItem('skillmount_user');
    return data ? JSON.parse(data) : null;
  },

  requestPasswordReset: async (email: string) => {
    return await api.post('/auth/password-reset/', { email });
  },

  resetPassword: async (uid: string, token: string, password: string) => {
    return await api.post('/auth/password-reset-confirm/', { uid, token, password });
  },

  sendOTP: async (identifier: string, method: 'email' | 'whatsapp') => {
    return await api.post('/auth/send-otp/', { identifier, method });
  },

  verifyOTP: async (identifier: string, otp: string, method: 'email' | 'whatsapp') => {
    const response = await api.post<any>('/auth/verify-otp/', { identifier, otp, method });

    // Save Tokens
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);

    // Normalize User Data (Snake to Camel)
    const rawUser = response.data.user;
    const user: User = {
      ...rawUser,
      isProfileComplete: rawUser.is_profile_complete || rawUser.isProfileComplete || false
    };

    // Save User for UI
    authService.saveSession(user);

    return { user };
  },

  getMe: async () => {
    // This assumes tokens are already in localStorage (which they are)
    const response = await api.get('/auth/me/');
    const rawUser = response.data;
    const user: User = {
      ...rawUser,
      isProfileComplete: rawUser.is_profile_complete || rawUser.isProfileComplete || false
    };
    authService.saveSession(user);
    return user;
  }
};