import { create } from 'zustand';

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  department: string;
  avatarUrl: string;
  role: UserRole;
  membershipTier: string;
  notificationsEnabled: boolean;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  toggleNotifications: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null, // Chế độ thực tế: Chưa đăng nhập khi mới mở app
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  toggleNotifications: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, notificationsEnabled: !state.user.notificationsEnabled }
        : null,
    })),

  logout: () => set({ user: null, isAuthenticated: false }),
}));
