import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import { useUserStore } from '../store/useUserStore';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setUser, loginAsDemoStudent, loginAsDemoAdmin } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      const userProfile = await authService.login(email.trim(), password);
      setUser(userProfile);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu!';
      Alert.alert('Lỗi đăng nhập', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* App Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.appTitle}>Study Room Booking</Text>
          <Text style={styles.appSubtitle}>
            Hệ thống đặt phòng tự học & lab nghiên cứu Campus
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Đăng Nhập Tài Khoản</Text>

          {/* Email */}
          <Text style={styles.inputLabel}>Email trường hoặc cá nhân</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ten.sinhvien@vku.udn.vn"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <Text style={styles.inputLabel}>Mật khẩu</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Login CTA */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>Đăng Nhập</Text>
            )}
          </TouchableOpacity>

          {/* Go to Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo 1-Click Login Section */}
        <View style={styles.demoSection}>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC TRẢI NGHIỆM NHANH (DEMO)</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.demoStudentBtn}
            onPress={loginAsDemoStudent}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={22} color={Colors.primary} />
            <View style={styles.demoTextWrap}>
              <Text style={styles.demoTitle}>Đăng nhập Sinh viên mẫu</Text>
              <Text style={styles.demoSub}>Alex Nguyễn (MSSV: 23IT.B143)</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoAdminBtn}
            onPress={loginAsDemoAdmin}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark" size={20} color="#B45309" />
            <View style={styles.demoTextWrap}>
              <Text style={styles.demoAdminTitle}>Đăng nhập Quản trị viên (Admin)</Text>
              <Text style={styles.demoSub}>Quyền thêm/sửa/xóa phòng & duyệt lịch</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#B45309" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerPrompt: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  demoSection: {
    marginTop: 28,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  demoStudentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  demoTextWrap: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  demoSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  demoAdminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  demoAdminTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
});
