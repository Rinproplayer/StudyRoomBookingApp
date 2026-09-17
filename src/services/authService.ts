import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, GOOGLE_OAUTH_CONFIG } from '../config/firebase';
import { UserProfile, UserRole } from '../store/useUserStore';

WebBrowser.maybeCompleteAuthSession();

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

  // Lưu hoặc lấy hồ sơ người dùng Google từ Firestore
  saveOrFetchGoogleUser: async (googleData: {
    uid: string;
    email: string;
    name?: string;
    photoUrl?: string;
  }): Promise<UserProfile> => {
    const rawEmail = googleData.email.trim().toLowerCase();
    const uid = googleData.uid;

    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    const isAdmin = rawEmail.includes('admin') || rawEmail === 'admin@vku.udn.vn';
    const profile: UserProfile = {
      id: uid,
      email: rawEmail,
      name: googleData.name || rawEmail.split('@')[0],
      studentCode: isAdmin ? 'ADMIN-GOOGLE' : `SV-${Math.floor(1000 + Math.random() * 9000)}`,
      department: isAdmin ? 'Ban Quản trị Cơ sở Vật chất' : 'Khoa Công nghệ Thông tin & AI',
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

  // Đăng nhập bằng Google chuẩn OAuth 2.0 (Xác thực tài khoản Google thực tế)
  signInWithGoogleOAuth: async (customClientId?: string): Promise<UserProfile> => {
    // 1. Nếu chạy trên Web: Sử dụng Firebase Popup chính thức của Google
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      return authService.saveOrFetchGoogleUser({
        uid: cred.user.uid,
        email: cred.user.email || '',
        name: cred.user.displayName || '',
        photoUrl: cred.user.photoURL || '',
      });
    }

    // 2. Nếu chạy trên Mobile (iOS / Android): Mở Google OAuth qua WebBrowser an toàn
    const clientId = customClientId || GOOGLE_OAUTH_CONFIG.webClientId;
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'studyroombooking',
    });

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `response_type=token%20id_token&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `prompt=select_account&` +
      `nonce=${Math.random().toString(36).substring(7)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const url = result.url;
      const params: Record<string, string> = {};
      const hash = url.split('#')[1] || url.split('?')[1] || '';
      hash.split('&').forEach((item) => {
        const [k, v] = item.split('=');
        if (k && v) params[k] = decodeURIComponent(v);
      });

      const accessToken = params.access_token;
      const idToken = params.id_token;

      if (!accessToken && !idToken) {
        throw new Error('Không nhận được token xác thực từ Google.');
      }

      // Lấy thông tin người dùng thực tế từ Google OAuth API
      let googleUserInfo: {
        sub?: string;
        email: string;
        email_verified?: boolean;
        name?: string;
        picture?: string;
      } | null = null;

      if (accessToken) {
        try {
          const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (userRes.ok) {
            googleUserInfo = await userRes.json();
          }
        } catch (err) {
          console.warn('Lỗi lấy userinfo:', err);
        }
      }

      if (!googleUserInfo && idToken) {
        try {
          const payloadBase64 = idToken.split('.')[1];
          let decodedJson = '';
          if (typeof atob === 'function') {
            decodedJson = atob(payloadBase64);
          } else {
            // Manual base64 decode for React Native environments without atob
            const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            let output = '';
            for (let i = 0; i < padded.length; i += 4) {
              const enc1 = chars.indexOf(padded.charAt(i));
              const enc2 = chars.indexOf(padded.charAt(i + 1));
              const enc3 = chars.indexOf(padded.charAt(i + 2));
              const enc4 = chars.indexOf(padded.charAt(i + 3));
              const chr1 = (enc1 << 2) | (enc2 >> 4);
              const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
              const chr3 = ((enc3 & 3) << 6) | enc4;
              output += String.fromCharCode(chr1);
              if (enc3 !== 64 && enc3 !== -1) output += String.fromCharCode(chr2);
              if (enc4 !== 64 && enc4 !== -1) output += String.fromCharCode(chr3);
            }
            decodedJson = output;
          }
          if (decodedJson) {
            googleUserInfo = JSON.parse(decodedJson);
          }
        } catch (e) {
          console.warn('Lỗi giải mã idToken:', e);
        }
      }

      if (!googleUserInfo || !googleUserInfo.email) {
        throw new Error('Không thể xác thực thông tin tài khoản từ Google.');
      }

      // Xác thực Firebase Auth Credential với idToken nếu có
      let firebaseUid = '';
      if (idToken) {
        try {
          const credential = GoogleAuthProvider.credential(idToken);
          const cred = await signInWithCredential(auth, credential);
          firebaseUid = cred.user.uid;
        } catch (e) {
          console.warn('Firebase signInWithCredential:', e);
        }
      }

      return authService.saveOrFetchGoogleUser({
        uid:
          firebaseUid ||
          `google-${googleUserInfo.sub || googleUserInfo.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: googleUserInfo.email,
        name: googleUserInfo.name || googleUserInfo.email.split('@')[0],
        photoUrl: googleUserInfo.picture || '',
      });
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Đã hủy đăng nhập Google.');
    }

    throw new Error('Quá trình đăng nhập Google không thành công.');
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    await signOut(auth);
  },
};
