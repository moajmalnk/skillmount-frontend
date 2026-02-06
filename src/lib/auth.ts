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
    // If logging out while impersonating, we should probably just clear everything
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('skillmount_user');

    // Clear Impersonation Backups
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user_backup');

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
  },

  // --- IMPERSONATION Logic ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enterImpersonation: (studentTokens: { access: string, refresh: string }, studentUser: any) => {
    // 1. Backup Admin Session
    const adminAccess = localStorage.getItem('access_token');
    const adminRefresh = localStorage.getItem('refresh_token');
    const adminUser = localStorage.getItem('skillmount_user');

    if (adminAccess && adminRefresh && adminUser) {
      localStorage.setItem('admin_access_token', adminAccess);
      localStorage.setItem('admin_refresh_token', adminRefresh);
      localStorage.setItem('admin_user_backup', adminUser);
    }

    // 2. Set Student Session
    localStorage.setItem('access_token', studentTokens.access);
    localStorage.setItem('refresh_token', studentTokens.refresh);

    const user: User = {
      ...studentUser,
      isProfileComplete: studentUser.is_profile_complete || studentUser.isProfileComplete || false
    };

    localStorage.setItem('skillmount_user', JSON.stringify(user));

    // 3. Force Reload to Apply
    window.location.href = '/';
  },

  exitImpersonation: () => {
    // 1. Retrieve Admin Session
    const adminAccess = localStorage.getItem('admin_access_token');
    const adminRefresh = localStorage.getItem('admin_refresh_token');
    const adminUser = localStorage.getItem('admin_user_backup');

    if (!adminAccess || !adminRefresh || !adminUser) {
      // Fallback if backup missing
      authService.logout();
      return;
    }

    // 2. Restore Admin Session
    localStorage.setItem('access_token', adminAccess);
    localStorage.setItem('refresh_token', adminRefresh);
    localStorage.setItem('skillmount_user', adminUser);

    // 3. Clear Backups
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user_backup');

    // 4. Force Reload to Apply
    window.location.href = '/admin';
  },

  isImpersonating: (): boolean => {
    return !!localStorage.getItem('admin_access_token');
  }
};