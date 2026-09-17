import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, UserRole } from '../store/useUserStore';

const USERS_COLLECTION = 'users';

const ADMIN_PROFILE: UserProfile = {
  id: 'admin-vku-root',
  email: 'admin@vku.udn.vn',
  name: 'Ban Quản Trị Hệ Thống (Admin)',
  studentCode: 'ADMIN',
  department: 'Ban Quản trị Phòng Lab & Thư viện Campus',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  membershipTier: 'Quản trị viên Cấp cao',
  notificationsEnabled: true,
};

const DEFAULT_STUDENT_PROFILE: UserProfile = {
  id: 'student-vku-default',
  email: 'student@vku.udn.vn',
  name: 'Nguyễn Văn An (Sinh viên)',
  studentCode: '23IT.B143',
  department: 'Khoa Công nghệ Thông tin & AI',
  role: 'student',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  membershipTier: 'Sinh viên Chính quy',
  notificationsEnabled: true,
};

export const authService = {
  // Đăng ký tài khoản mới trên Firebase Auth & lưu profile vào Firestore
  register: async (
    email: string,
    pass: string,
    name: string,
    studentCode: string,
    role: UserRole = 'student'
  ): Promise<UserProfile> => {
    let emailToRegister = email.trim().toLowerCase();
    if (!emailToRegister.includes('@')) {
      emailToRegister = `${emailToRegister}@vku.udn.vn`;
    }

    const cred = await createUserWithEmailAndPassword(auth, emailToRegister, pass);
    const uid = cred.user.uid;

    const profile: UserProfile = {
      id: uid,
      email: emailToRegister,
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

  // Đăng nhập với Tài khoản (Hỗ trợ TK: admin / MK: 123456)
  login: async (accountInput: string, pass: string): Promise<UserProfile> => {
    const rawAccount = accountInput.trim().toLowerCase();

    // 1. Kiểm tra tài khoản Quản trị viên theo yêu cầu: TK: admin, MK: 123456
    if (
      (rawAccount === 'admin' || rawAccount === 'admin@vku.udn.vn') &&
      pass === '123456'
    ) {
      // Đảm bảo document admin tồn tại trên Firestore
      try {
        await setDoc(doc(db, USERS_COLLECTION, ADMIN_PROFILE.id), ADMIN_PROFILE, { merge: true });
        // Cố gắng đăng nhập hoặc tạo tài khoản trên Firebase Auth nếu có thể
        try {
          await signInWithEmailAndPassword(auth, 'admin@vku.udn.vn', '123456');
        } catch {
          try {
            await createUserWithEmailAndPassword(auth, 'admin@vku.udn.vn', '123456');
          } catch {
            // Đã tồn tại hoặc xác thực cục bộ
          }
        }
      } catch (e) {
        console.warn('Lưu admin profile:', e);
      }
      return ADMIN_PROFILE;
    }

    // 2. Kiểm tra tài khoản Sinh viên mẫu mặc định: TK: student hoặc sinhvien, MK: 123456
    if (
      (rawAccount === 'student' || rawAccount === 'sinhvien' || rawAccount === 'student@vku.udn.vn') &&
      pass === '123456'
    ) {
      try {
        await setDoc(doc(db, USERS_COLLECTION, DEFAULT_STUDENT_PROFILE.id), DEFAULT_STUDENT_PROFILE, { merge: true });
        try {
          await signInWithEmailAndPassword(auth, 'student@vku.udn.vn', '123456');
        } catch {
          try {
            await createUserWithEmailAndPassword(auth, 'student@vku.udn.vn', '123456');
          } catch {
            // Đã tồn tại hoặc xác thực cục bộ
          }
        }
      } catch (e) {
        console.warn('Lưu student profile:', e);
      }
      return DEFAULT_STUDENT_PROFILE;
    }

    // 3. Đăng nhập cho các tài khoản sinh viên / người dùng thông thường qua Firebase Auth
    let emailToUse = rawAccount;
    if (!emailToUse.includes('@')) {
      emailToUse = `${emailToUse}@vku.udn.vn`;
    }

    const cred = await signInWithEmailAndPassword(auth, emailToUse, pass);
    const uid = cred.user.uid;

    const docSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }

    // Fallback profile nếu tài khoản chưa có trong Firestore
    const defaultRole: UserRole = emailToUse.includes('admin') ? 'admin' : 'student';
    const fallbackProfile: UserProfile = {
      id: uid,
      email: emailToUse,
      name: emailToUse.split('@')[0],
      studentCode: defaultRole === 'admin' ? 'ADMIN' : '23IT.B143',
      department: defaultRole === 'admin' ? 'Ban Quản trị' : 'Sinh viên VKU',
      role: defaultRole,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      membershipTier: defaultRole === 'admin' ? 'Quản trị viên' : 'Sinh viên',
      notificationsEnabled: true,
    };
    await setDoc(doc(db, USERS_COLLECTION, uid), fallbackProfile);
    return fallbackProfile;
  },

  // Đăng nhập bằng Google Account & đồng bộ Firestore
  loginWithGoogleAccount: async (googleData: {
    email: string;
    name?: string;
    photoUrl?: string;
    idToken?: string;
  }): Promise<UserProfile> => {
    const rawEmail = googleData.email.trim().toLowerCase();

    // Nếu có idToken từ Google OAuth Credential, xác thực trực tiếp qua Firebase
    let uid = '';
    if (googleData.idToken) {
      try {
        const credential = GoogleAuthProvider.credential(googleData.idToken);
        const cred = await signInWithCredential(auth, credential);
        uid = cred.user.uid;
      } catch (e) {
        console.warn('Firebase credential sign-in:', e);
      }
    }

    if (!uid) {
      uid = `google-${rawEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    // Kiểm tra xem user này đã tồn tại trong Firestore chưa
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    // Nếu là người dùng Google mới, tự động khởi tạo profile
    const isAdmin = rawEmail.includes('admin') || rawEmail === 'admin@vku.udn.vn';
    const profile: UserProfile = {
      id: uid,
      email: rawEmail,
      name: googleData.name || rawEmail.split('@')[0],
      studentCode: isAdmin ? 'ADMIN-GOOGLE' : `SV-${Math.floor(1000 + Math.random() * 9000)}`,
      department: isAdmin ? 'Ban Quản trị Cơ sở Vật chất' : 'Sinh viên (Google Auth)',
      role: isAdmin ? 'admin' : 'student',
      avatarUrl:
        googleData.photoUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      membershipTier: isAdmin ? 'Quản trị viên Campus' : 'Sinh viên Chính quy',
      notificationsEnabled: true,
    };

    await setDoc(userDocRef, profile);
    return profile;
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    await signOut(auth);
  },
};
