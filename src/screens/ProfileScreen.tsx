import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/useUserStore';
import { useBookingsQuery } from '../api/queries';
import { Colors } from '../theme/colors';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    toggleNotifications,
    logout,
    loginAsDemoStudent,
    loginAsDemoAdmin,
  } = useUserStore();
  const { data: bookings } = useBookingsQuery(user?.id);

  const totalBookings = bookings?.length ?? 0;
  const activeBookings = bookings?.filter((b) => b.status === 'Upcoming').length ?? 0;
  const completedBookings = bookings?.filter((b) => b.status === 'Completed').length ?? 0;
  const hoursStudied = completedBookings * 1.5;

  const showInfo = (title: string, msg: string) => {
    Alert.alert(title, msg);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Student Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.studentId}>
              {isAdmin ? 'Mã cán bộ' : 'MSSV'}: {user.studentCode}
            </Text>
            <View
              style={[
                styles.tierPill,
                isAdmin && { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
              ]}
            >
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'school-outline'}
                size={12}
                color={isAdmin ? '#B45309' : Colors.primary}
              />
              <Text
                style={[
                  styles.tierText,
                  isAdmin && { color: '#92400E' },
                ]}
              >
                {isAdmin ? 'Quản trị viên Campus' : 'Sinh viên Chính quy'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{user.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{user.department}</Text>
        </View>
      </View>

      {/* Switch Demo Roles directly */}
      <View style={styles.roleSwitchCard}>
        <Text style={styles.roleSwitchTitle}>Chuyển Đổi Nhanh Vai Trò (Testing Demo)</Text>
        <View style={styles.roleBtnRow}>
          <TouchableOpacity
            style={[
              styles.demoRoleBtn,
              !isAdmin && styles.demoRoleBtnActive,
            ]}
            onPress={loginAsDemoStudent}
          >
            <Ionicons
              name="school"
              size={14}
              color={!isAdmin ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.demoRoleText,
                !isAdmin && styles.demoRoleTextActive,
              ]}
            >
              Sinh viên mẫu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.demoRoleBtn,
              isAdmin && styles.demoRoleBtnActiveAdmin,
            ]}
            onPress={loginAsDemoAdmin}
          >
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={isAdmin ? '#B45309' : Colors.textSecondary}
            />
            <Text
              style={[
                styles.demoRoleText,
                isAdmin && styles.demoRoleTextActiveAdmin,
              ]}
            >
              Quản trị viên (Admin)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking Statistics */}
      <Text style={styles.sectionTitle}>Thống Kê Hoạt Động</Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalBookings}</Text>
          <Text style={styles.statLabel}>Lịch cá nhân</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: Colors.available }]}>{activeBookings}</Text>
          <Text style={styles.statLabel}>Sắp tới</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{hoursStudied}h</Text>
          <Text style={styles.statLabel}>Giờ đã học</Text>
        </View>
      </View>

      {/* Preferences & Settings */}
      <Text style={styles.sectionTitle}>Cài Đặt & Tiện Ích</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
            <Text style={styles.settingText}>Thông báo nhắc lịch học</Text>
          </View>
          <Switch
            value={user.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#CBD5E1', true: Colors.primaryLight }}
            thumbColor={user.notificationsEnabled ? Colors.primary : '#F1F5F9'}
          />
        </View>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            showInfo(
              'Quy định sử dụng phòng học & lab',
              '1. Sinh viên cần check-in trước 15 phút bằng mã QR / Pass.\n2. Giữ trật tự và vệ sinh chung trong phòng học.\n3. Hủy phòng trước ít nhất 30 phút nếu không sử dụng để nhường chỗ cho sinh viên khác.'
            )
          }
        >
          <View style={styles.settingLeft}>
            <Ionicons name="document-text-outline" size={20} color={Colors.textPrimary} />
            <Text style={styles.settingText}>Quy định sử dụng phòng học</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            showInfo(
              'Hỗ trợ kỹ thuật campus',
              'Hotline Ban Quản lý Phòng học: 028-3829-xxxx\nEmail: campus-facilities@campus.edu.vn'
            )
          }
        >
          <View style={styles.settingLeft}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.textPrimary} />
            <Text style={styles.settingText}>Hỗ trợ & Trợ giúp</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={[styles.settingText, { color: '#DC2626', fontWeight: '600' }]}>
              Đăng xuất tài khoản
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* App Version Info */}
      <View style={styles.footerInfo}>
        <Text style={styles.versionText}>Study Room Booking App v1.0.0 (Expo SDK 57 + Firebase)</Text>
        <Text style={styles.copyrightText}>Hệ thống đặt phòng học và nghiên cứu Campus</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  studentId: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  roleSwitchCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 16,
  },
  roleSwitchTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  roleBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoRoleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  demoRoleBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  demoRoleBtnActiveAdmin: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  demoRoleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  demoRoleTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  demoRoleTextActiveAdmin: {
    color: '#92400E',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
