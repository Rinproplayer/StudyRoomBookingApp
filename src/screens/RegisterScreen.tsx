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
import { authService } from '../services/authService';
import { useUserStore, UserRole } from '../store/useUserStore';
import { Colors } from '../theme/colors';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setUser } = useUserStore();

  const [name, setName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !studentCode.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    try {
      setIsLoading(true);
      const userProfile = await authService.register(
        email.trim(),
        password,
        name.trim(),
        studentCode.trim(),
        role
      );
      setUser(userProfile);
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Không thể đăng ký tài khoản. Vui lòng thử lại!';
      Alert.alert('Lỗi đăng ký', msg);
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
        {/* Header */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Tạo Tài Khoản Mới</Text>
        <Text style={styles.subtitle}>
          Đăng ký để đặt phòng tự học hoặc quản lý hệ thống phòng Campus
        </Text>

        <View style={styles.card}>
          {/* Role selector */}
          <Text style={styles.label}>Vai trò trong trường</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
              onPress={() => setRole('student')}
            >
              <Ionicons
                name="school"
                size={18}
                color={role === 'student' ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>
                Sinh viên
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleBtn, role === 'admin' && styles.roleBtnActiveAdmin]}
              onPress={() => setRole('admin')}
            >
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={role === 'admin' ? '#B45309' : Colors.textSecondary}
              />
              <Text style={[styles.roleText, role === 'admin' && styles.roleTextActiveAdmin]}>
                Quản trị viên (Admin)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <Text style={styles.label}>Họ và tên</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color={Colors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Student Code / Staff Code */}
          <Text style={styles.label}>{role === 'admin' ? 'Mã cán bộ' : 'Mã số sinh viên (MSSV)'}</Text>
          <View style={styles.inputRow}>
            <Ionicons name="card-outline" size={18} color={Colors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={role === 'admin' ? 'ADMIN-VKU' : '23IT.Bxxx'}
              placeholderTextColor={Colors.textMuted}
              value={studentCode}
              onChangeText={setStudentCode}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="email@vku.udn.vn"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Mật khẩu (ít nhất 6 ký tự)</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Register CTA */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Đăng Ký Tài Khoản</Text>
            )}
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  card: {
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F8FAFC',
  },
  roleBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleBtnActiveAdmin: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  roleTextActiveAdmin: {
    color: '#92400E',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
