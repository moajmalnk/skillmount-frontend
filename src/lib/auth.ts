// Types for our user system
export type UserRole = 'super_admin' | 'tutor' | 'student' | 'affiliate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isProfileComplete: boolean; // CRITICAL: Determines if they go to Onboarding
  avatar?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// MOCK DATABASE OF USERS
// Use these credentials to test different flows
const MOCK_USERS: User[] = [
  // 1. SUPER ADMIN
  {
    id: 'ADMIN-001',
    name: 'Super Admin',
    email: 'admin@skillmount.com',
    role: 'super_admin',
    isProfileComplete: true, // Admins always complete
  },

  // 2. STUDENTS
  {
    id: 'STU-ACTIVE',
    name: 'Alex Johnson',
    email: 'student@skillmount.com', // Password: 123 (or any > 3 chars)
    role: 'student',
    isProfileComplete: true, // Goes to Home/Dashboard
  },
  {
    id: 'STU-NEW',
    name: 'Sarah Williams',
    email: 'new@skillmount.com', 
    role: 'student',
    isProfileComplete: false, // Goes to Onboarding (Student View)
  },

  // 3. TUTORS
  {
    id: 'TUT-001',
    name: 'Dr. Alan Grant',
    email: 'tutor@skillmount.com',
    role: 'tutor',
    isProfileComplete: true, // Goes to Home/Inbox
  },
  {
    id: 'TUT-NEW',
    name: 'Prof. Newbie',
    email: 'newtutor@skillmount.com',
    role: 'tutor',
    isProfileComplete: false, // Goes to Onboarding (Tutor View)
  },

  // 4. AFFILIATES
  {
    id: 'AFF-001',
    name: 'Marketing Pro',
    email: 'affiliate@skillmount.com',
    role: 'affiliate',
    isProfileComplete: true, // Goes to Home
  },
  {
    id: 'AFF-NEW',
    name: 'New Partner',
    email: 'newaffiliate@skillmount.com',
    role: 'affiliate',
    isProfileComplete: false, // Goes to Onboarding (Affiliate View)
  }
];

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple check (In real app, password hash check happens here)
    const user = MOCK_USERS.find((u) => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    // For mock purposes, accept any password length > 3
    if (password.length < 3) {
      throw new Error('Invalid password');
    }

    // Return user data and a fake token
    return {
      user,
      token: 'mock-jwt-token-' + Date.now(),
    };
  },

  // Helper to save user to local storage (Persist login)
  saveSession: (user: User) => {
    localStorage.setItem('skillmount_user', JSON.stringify(user));
  },

  getSession: (): User | null => {
    const data = localStorage.getItem('skillmount_user');
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem('skillmount_user');
    window.location.href = '/login';
  }
};