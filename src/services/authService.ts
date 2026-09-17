import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, UserRole } from '../store/useUserStore';

const USERS_COLLECTION = 'users';

export const authService = {
  // Đăng ký tài khoản mới trên Firebase Auth & lưu profile vào Firestore
  register: async (
    email: string,
    pass: string,
    name: string,
    studentCode: string,
    role: UserRole = 'student'
  ): Promise<UserProfile> => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    const profile: UserProfile = {
      id: uid,
      email,
      name,
      studentCode,
      department: role === 'admin' ? 'Ban Quản trị Cơ sở Vật chất' : 'Công nghệ Thông tin & AI',
      role,
      avatarUrl:
        role === 'admin'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      membershipTier: role === 'admin' ? 'Quản trị viên Campus' : 'Sinh viên Chính quy',
      notificationsEnabled: true,
    };

    await setDoc(doc(db, USERS_COLLECTION, uid), profile);
    return profile;
  },

  // Đăng nhập với Email và Mật khẩu
  login: async (email: string, pass: string): Promise<UserProfile> => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    const docSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }

    // Fallback nếu tài khoản chưa có profile trong Firestore
    const defaultRole: UserRole = email.includes('admin') ? 'admin' : 'student';
    const fallbackProfile: UserProfile = {
      id: uid,
      email,
      name: email.split('@')[0],
      studentCode: defaultRole === 'admin' ? 'ADMIN-VKU' : '23IT.B143',
      department: defaultRole === 'admin' ? 'Ban Quản lý Campus' : 'Kỹ thuật Phần mềm',
      role: defaultRole,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      membershipTier: defaultRole === 'admin' ? 'Quản trị viên' : 'Sinh viên',
      notificationsEnabled: true,
    };
    await setDoc(doc(db, USERS_COLLECTION, uid), fallbackProfile);
    return fallbackProfile;
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    await signOut(auth);
  },
};
