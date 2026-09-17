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
  loginAsDemoStudent: () => void;
  loginAsDemoAdmin: () => void;
}

const DEMO_STUDENT: UserProfile = {
  id: 'STU-2024-88',
  studentCode: '23IT.B143',
  name: 'Alex Nguyễn',
  email: 'alex.nguyen@vku.udn.vn',
  department: 'Kỹ thuật Phần mềm & Trí tuệ Nhân tạo',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  role: 'student',
  membershipTier: 'Sinh viên Chính quy',
  notificationsEnabled: true,
};

const DEMO_ADMIN: UserProfile = {
  id: 'ADM-VKU-001',
  studentCode: 'ADMIN-VKU',
  name: 'Ban Quản trị Phòng Lab & Thư viện',
  email: 'admin.facilities@vku.udn.vn',
  department: 'Phòng Cơ sở Vật chất & CNTT',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  role: 'admin',
  membershipTier: 'Quản trị viên Campus',
  notificationsEnabled: true,
};

export const useUserStore = create<UserState>((set) => ({
  user: DEMO_STUDENT, // Mặc định đăng nhập với vai trò sinh viên
  isAuthenticated: true,

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

  loginAsDemoStudent: () => set({ user: DEMO_STUDENT, isAuthenticated: true }),

  loginAsDemoAdmin: () => set({ user: DEMO_ADMIN, isAuthenticated: true }),
}));
