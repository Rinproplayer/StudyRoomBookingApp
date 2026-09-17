import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import { GOOGLE_OAUTH_CONFIG } from '../config/firebase';
import { useUserStore } from '../store/useUserStore';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setUser } = useUserStore();

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth States
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [webClientIdInput, setWebClientIdInput] = useState('');

  const handleLogin = async () => {
    if (!account.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ Tài khoản và Mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      const userProfile = await authService.login(account.trim(), password);
      setUser(userProfile);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!';
      Alert.alert('Lỗi đăng nhập', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuthLogin = async (customClientId?: string) => {
    try {
      setIsGoogleLoading(true);

      const profile = await authService.signInWithGoogleOAuth(customClientId);
      setUser(profile);
      setConfigModalVisible(false);
      Alert.alert('Đăng nhập thành công', `Chào mừng ${profile.name} đã đăng nhập qua Google!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đăng nhập Google.';
      if (msg.includes('hủy') || msg.includes('cancel') || msg.includes('dismiss')) {
        return;
      }
      Alert.alert('Xác thực Google', msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSaveClientIdAndLogin = async () => {
    const trimmed = webClientIdInput.trim();
    if (!trimmed) {
      Alert.alert('Thiếu thông tin', 'Vui lòng dán Web Client ID từ Firebase Console.');
      return;
    }
    if (!trimmed.includes('.apps.googleusercontent.com')) {
      Alert.alert(
        'Định dạng không hợp lệ',
        'Web Client ID thường có dạng: 501686531347-xxxx.apps.googleusercontent.com'
      );
      return;
    }

    try {
      await AsyncStorage.setItem('@google_web_client_id', trimmed);
      setConfigModalVisible(false);
      await handleGoogleOAuthLogin(trimmed);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu cấu hình Client ID.');
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
            <Ionicons name="school" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.appTitle}>Study Room Booking</Text>
          <Text style={styles.appSubtitle}>
            Hệ thống đặt phòng tự học & lab nghiên cứu Campus
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Đăng Nhập</Text>

          {/* Account */}
          <Text style={styles.inputLabel}>Tài khoản hoặc Email</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="admin hoặc email sinh viên..."
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              value={account}
              onChangeText={setAccount}
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

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In CTA */}
          <TouchableOpacity
            style={[styles.googleBtn, isGoogleLoading && styles.loginBtnDisabled]}
            onPress={() => handleGoogleOAuthLogin()}
            disabled={isGoogleLoading || isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.googleBtnContent}>
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#EA4335" />
              ) : (
                <Ionicons name="logo-google" size={18} color="#EA4335" />
              )}
              <Text style={styles.googleBtnText}>
                {isGoogleLoading ? 'Đang xác thực Google...' : 'Đăng nhập bằng Google'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Go to Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Chưa có tài khoản sinh viên? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Cấu hình Google Web Client ID Modal (Chỉ hiển thị khi chưa cấu hình Web Client ID) */}
      <Modal
        visible={configModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          Keyboard.dismiss();
          setConfigModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setConfigModalVisible(false);
            }}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="logo-google" size={22} color="#EA4335" />
                <Text style={styles.modalTitle}>Cấu hình Google Sign-In</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setConfigModalVisible(false);
                }}
              >
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text style={styles.modalSubtitle}>
                Để mở màn hình xác thực Google chính thức (không nhập thủ công), vui lòng cung cấp Web Client ID từ Firebase Console của bạn:
              </Text>

              <View style={styles.stepsCard}>
                <Text style={styles.stepText}>1. Vào Firebase Console → Authentication → Sign-in method</Text>
                <Text style={styles.stepText}>2. Bấm vào dòng "Google" đã bật</Text>
                <Text style={styles.stepText}>3. Mở mục "Cấu hình Web SDK" và sao chép "ID ứng dụng web"</Text>
              </View>

              <Text style={styles.fieldLabel}>ID ứng dụng web (Web Client ID)</Text>
              <View style={styles.inputRow}>
                <Ionicons name="key-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="501686531347-xxx.apps.googleusercontent.com"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  value={webClientIdInput}
                  onChangeText={setWebClientIdInput}
                />
              </View>

              <TouchableOpacity
                style={styles.googleSubmitBtn}
                onPress={handleSaveClientIdAndLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.googleSubmitBtnText}>Lưu & Đăng Nhập Google Ngay</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
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
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
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
    marginTop: 18,
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
  // Divider Styles
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  // Google Button
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalBody: {
    padding: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  stepsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  stepText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  googleNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  googleNoticeText: {
    fontSize: 12,
    color: Colors.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  googleSubmitBtn: {
    backgroundColor: '#4285F4',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  googleSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
