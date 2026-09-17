import { create } from 'zustand';

export interface UserProfile {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  department: string;
  avatarUrl: string;
  membershipTier: 'Undergraduate' | 'Graduate' | 'Researcher';
  notificationsEnabled: boolean;
}

interface UserState {
  user: UserProfile;
  updateUser: (partial: Partial<UserProfile>) => void;
  toggleNotifications: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: 'STU-2024-88',
    studentCode: '20248819',
    name: 'Alex Nguyen',
    email: 'alex.nguyen@campus.edu.vn',
    department: 'Software Engineering & AI',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    membershipTier: 'Undergraduate',
    notificationsEnabled: true,
  },
  updateUser: (partial) =>
    set((state) => ({
      user: { ...state.user, ...partial },
    })),
  toggleNotifications: () =>
    set((state) => ({
      user: { ...state.user, notificationsEnabled: !state.user.notificationsEnabled },
    })),
}));
