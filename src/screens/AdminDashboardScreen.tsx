import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
  useAddRoomMutation,
  useAdminBookingsQuery,
  useApproveBookingMutation,
  useCancelBookingMutation,
  useDeleteBookingMutation,
  useDeleteRoomMutation,
  useDeleteUserMutation,
  useRoomsQuery,
  useUpdateRoomMutation,
  useUpdateUserRoleMutation,
  useUsersQuery,
} from '../api/queries';
import { Amenity, Building, Room, RoomStatus } from '../types/room';
import { StatusBadge } from '../components/StatusBadge';
import { Colors } from '../theme/colors';
import { useUserStore, UserProfile, UserRole } from '../store/useUserStore';

const BUILDINGS: Building[] = [
  'Tòa nhà A3',
  'Thư viện Trung tâm',
  'Khu Công nghệ',
  'Giảng đường Khoa học',
  'Không gian Sáng tạo',
];

const AVAILABLE_AMENITIES: Amenity[] = [
  'Wi-Fi tốc độ cao',
  'Bảng viết dạ',
  'Máy chiếu 4K',
  'Ổ cắm điện đa năng',
  'Điều hòa không khí',
  'Phòng cách âm',
  'Màn hình kép',
  'Thiết bị họp trực tuyến',
];

export const AdminDashboardScreen: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'rooms' | 'bookings' | 'users'>('rooms');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form thêm phòng mới
  const [newName, setNewName] = useState('');
  const [newBuilding, setNewBuilding] = useState<Building>('Tòa nhà A3');
  const [newFloor, setNewFloor] = useState('Tầng 1');
  const [newCapacity, setNewCapacity] = useState('30');
  const [newPhotoUrl, setNewPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80'
  );
  const [newDescription, setNewDescription] = useState('');
  const [newAmenities, setNewAmenities] = useState<Amenity[]>([
    'Wi-Fi tốc độ cao',
    'Bảng viết dạ',
    'Điều hòa không khí',
  ]);

  // Form chỉnh sửa thông tin phòng
  const [editName, setEditName] = useState('');
  const [editBuilding, setEditBuilding] = useState<Building>('Tòa nhà A3');
  const [editFloor, setEditFloor] = useState('Tầng 1');
  const [editCapacity, setEditCapacity] = useState('30');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAmenities, setEditAmenities] = useState<Amenity[]>([]);

  // Quản lý người dùng
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'admin'>('all');

  const currentUser = useUserStore((s) => s.user);

  // Queries & Mutations
  const { data: rooms, isLoading: isLoadingRooms } = useRoomsQuery();
  const { data: allBookings, isLoading: isLoadingBookings } = useAdminBookingsQuery();
  const { data: users, isLoading: isLoadingUsers } = useUsersQuery();

  const addRoomMutation = useAddRoomMutation();
  const updateRoomMutation = useUpdateRoomMutation();
  const deleteRoomMutation = useDeleteRoomMutation();
  const cancelBookingMutation = useCancelBookingMutation();
  const approveBookingMutation = useApproveBookingMutation();
  const deleteBookingMutation = useDeleteBookingMutation();
  const updateUserRoleMutation = useUpdateUserRoleMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const handleToggleAmenity = (amenity: Amenity) => {
    setNewAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleCreateRoom = async () => {
    if (!newName.trim() || !newCapacity.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Tên phòng và Sức chứa.');
      return;
    }

    try {
      await addRoomMutation.mutateAsync({
        name: newName.trim(),
        building: newBuilding,
        floor: newFloor.trim() || 'Tầng 1',
        capacity: parseInt(newCapacity, 10) || 20,
        status: 'Available',
        photoUrl: newPhotoUrl.trim(),
        description: newDescription.trim() || 'Phòng tự học và làm việc nhóm sinh viên.',
        amenities: newAmenities,
        rating: 4.8,
        noiseLevel: 'Thảo luận nhóm',
      });

      Alert.alert('Thành công', `Đã thêm phòng ${newName} vào Cloud Firestore!`);
      setAddModalVisible(false);
      setNewName('');
      setNewDescription('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo phòng.';
      Alert.alert('Lỗi', msg);
    }
  };

  const handleChangeRoomStatus = (room: Room, status: RoomStatus) => {
    updateRoomMutation.mutate({
      roomId: room.id,
      data: { status },
    });
  };

  const handleDeleteRoom = (room: Room) => {
    Alert.alert(
      'Xóa phòng học',
      `Bạn có chắc chắn muốn xóa phòng ${room.name} khỏi hệ thống không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa ngay',
          style: 'destructive',
          onPress: () => deleteRoomMutation.mutate(room.id),
        },
      ]
    );
  };

  const handleApproveBooking = (bookingId: string, studentName: string, roomName: string) => {
    Alert.alert(
      'Phê duyệt lịch đặt phòng',
      `Bạn có muốn ĐỒNG Ý duyệt lịch đặt phòng "${roomName}" cho sinh viên ${studentName} không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý duyệt',
          style: 'default',
          onPress: async () => {
            try {
              await approveBookingMutation.mutateAsync(bookingId);
              Alert.alert('Thành công', `Đã phê duyệt lịch đặt của sinh viên ${studentName}!`);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Không thể phê duyệt lịch.';
              Alert.alert('Lỗi', msg);
            }
          },
        },
      ]
    );
  };

  const handleAdminCancelBooking = (bookingId: string, studentName: string) => {
    Alert.alert(
      'Hủy lịch đặt phòng',
      `Hủy lịch đặt của sinh viên ${studentName}? Khung giờ sẽ lập tức được giải phóng.`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Đồng ý hủy',
          style: 'destructive',
          onPress: () => cancelBookingMutation.mutate(bookingId),
        },
      ]
    );
  };

  const handleDeleteBooking = (bookingId: string, roomName: string, studentName: string) => {
    Alert.alert(
      'Xóa vĩnh viễn lịch đặt',
      `Bạn có chắc chắn muốn xóa vĩnh viễn lịch đặt "${roomName}" của sinh viên ${studentName} khỏi cơ sở dữ liệu? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa ngay',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBookingMutation.mutateAsync(bookingId);
              Alert.alert('Thành công', 'Đã xóa lịch đặt phòng khỏi hệ thống!');
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Không thể xóa lịch đặt.';
              Alert.alert('Lỗi', msg);
            }
          },
        },
      ]
    );
  };

  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setEditName(room.name);
    setEditBuilding(room.building);
    setEditFloor(room.floor);
    setEditCapacity(room.capacity.toString());
    setEditPhotoUrl(room.photoUrl);
    setEditDescription(room.description || '');
    setEditAmenities(room.amenities || []);
    setEditModalVisible(true);
  };

  const handleToggleEditAmenity = (amenity: Amenity) => {
    setEditAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSaveEditRoom = async () => {
    if (!editingRoom) return;
    if (!editName.trim() || !editCapacity.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Tên phòng và Sức chứa.');
      return;
    }

    try {
      await updateRoomMutation.mutateAsync({
        roomId: editingRoom.id,
        data: {
          name: editName.trim(),
          building: editBuilding,
          floor: editFloor.trim() || 'Tầng 1',
          capacity: parseInt(editCapacity, 10) || 20,
          photoUrl: editPhotoUrl.trim() || editingRoom.photoUrl,
          description: editDescription.trim(),
          amenities: editAmenities,
        },
      });

      Alert.alert('Thành công', `Đã cập nhật thông tin phòng ${editName.trim()}!`);
      setEditModalVisible(false);
      setEditingRoom(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật thông tin phòng.';
      Alert.alert('Lỗi', msg);
    }
  };

  const handleToggleUserRole = (targetUser: UserProfile) => {
    if (targetUser.id === currentUser?.id) {
      Alert.alert('Không thể thao tác', 'Bạn không thể tự thay đổi quyền hạn của tài khoản đang đăng nhập.');
      return;
    }

    const nextRole: UserRole = targetUser.role === 'admin' ? 'student' : 'admin';
    const actionText = nextRole === 'admin' ? 'Cấp quyền Quản trị viên (Admin)' : 'Hạ quyền xuống Sinh viên';

    Alert.alert(
      'Xác nhận đổi quyền',
      `Bạn có chắc chắn muốn ${actionText} cho người dùng ${targetUser.name} (${targetUser.email})?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: () => {
            updateUserRoleMutation.mutate(
              { userId: targetUser.id, role: nextRole },
              {
                onSuccess: () => {
                  Alert.alert('Thành công', `Đã cập nhật quyền của ${targetUser.name} thành ${nextRole === 'admin' ? 'Quản trị viên' : 'Sinh viên'}!`);
                },
                onError: (err: any) => {
                  Alert.alert('Lỗi', err?.message || 'Không thể cập nhật quyền người dùng.');
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleDeleteUser = (targetUser: UserProfile) => {
    if (targetUser.id === currentUser?.id) {
      Alert.alert('Không thể thao tác', 'Bạn không thể tự xóa tài khoản đang đăng nhập.');
      return;
    }

    Alert.alert(
      'Xác nhận xóa người dùng',
      `Bạn có chắc muốn xóa vĩnh viễn tài khoản của ${targetUser.name} (${targetUser.email}) khỏi hệ thống?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa ngay',
          style: 'destructive',
          onPress: () => {
            deleteUserMutation.mutate(targetUser.id, {
              onSuccess: () => {
                Alert.alert('Thành công', `Đã xóa người dùng ${targetUser.name}.`);
              },
              onError: (err: any) => {
                Alert.alert('Lỗi', err?.message || 'Không thể xóa người dùng.');
              },
            });
          },
        },
      ]
    );
  };

  const filteredUsers = (users || []).filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchCode = u.studentCode?.toLowerCase().includes(q);
      const matchDept = u.department?.toLowerCase().includes(q);
      return matchName || matchEmail || matchCode || matchDept;
    }
    return true;
  });

  return (
    <View style={styles.screen}>
      {/* Overview Stats Bar */}
      <Animated.View entering={FadeInDown.duration(480).springify()} style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{rooms?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Tổng phòng</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#D97706' }]}>
            {allBookings?.filter((b) => b.status === 'Pending').length ?? 0}
          </Text>
          <Text style={styles.statLabel}>Chờ duyệt</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: Colors.primary }]}>
            {allBookings?.filter((b) => b.status === 'Upcoming').length ?? 0}
          </Text>
          <Text style={styles.statLabel}>Đã duyệt</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#8B5CF6' }]}>
            {users?.length ?? 0}
          </Text>
          <Text style={styles.statLabel}>Người dùng</Text>
        </View>
      </Animated.View>

      {/* Admin Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, activeAdminTab === 'rooms' && styles.switchBtnActive]}
          onPress={() => setActiveAdminTab('rooms')}
        >
          <Ionicons
            name="business-outline"
            size={15}
            color={activeAdminTab === 'rooms' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.switchText, activeAdminTab === 'rooms' && styles.switchTextActive]}>
            Phòng ({rooms?.length ?? 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeAdminTab === 'bookings' && styles.switchBtnActive]}
          onPress={() => setActiveAdminTab('bookings')}
        >
          <Ionicons
            name="calendar-outline"
            size={15}
            color={activeAdminTab === 'bookings' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[styles.switchText, activeAdminTab === 'bookings' && styles.switchTextActive]}
          >
            Lịch Đặt ({allBookings?.length ?? 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeAdminTab === 'users' && styles.switchBtnActive]}
          onPress={() => setActiveAdminTab('users')}
        >
          <Ionicons
            name="people-outline"
            size={15}
            color={activeAdminTab === 'users' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[styles.switchText, activeAdminTab === 'users' && styles.switchTextActive]}
          >
            Người Dùng ({users?.length ?? 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Quản Lý Phòng Học */}
      {activeAdminTab === 'rooms' && (
        <View style={{ flex: 1 }}>
          <View style={styles.actionBar}>
            <Text style={styles.actionTitle}>Danh sách phòng trong hệ thống</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setAddModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Thêm phòng</Text>
            </TouchableOpacity>
          </View>

          {isLoadingRooms ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.primary} />
          ) : (
            <FlatList
              data={rooms}
              keyExtractor={(r) => r.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.duration(340).delay(Math.min(index * 45, 250)).springify()}
                  style={styles.roomItemCard}
                >
                  <View style={styles.roomHeader}>
                    <Image source={{ uri: item.photoUrl }} style={styles.roomImg} />
                    <View style={styles.roomDetails}>
                      <Text style={styles.roomName}>{item.name}</Text>
                      <Text style={styles.roomBuilding}>
                        {item.building} • {item.floor}
                      </Text>
                      <Text style={styles.roomCapacity}>Sức chứa: {item.capacity} chỗ</Text>
                    </View>
                    <View style={styles.roomActions}>
                      <TouchableOpacity
                        onPress={() => handleOpenEditRoom(item)}
                        style={styles.editBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="create-outline" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteRoom(item)}
                        style={styles.deleteBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Status buttons */}
                  <View style={styles.statusActionRow}>
                    <Text style={styles.statusLabel}>Trạng thái:</Text>
                    <View style={styles.statusBtnGroup}>
                      <TouchableOpacity
                        style={[
                          styles.statusOption,
                          item.status === 'Available' && styles.statusOptionAvailable,
                        ]}
                        onPress={() => handleChangeRoomStatus(item, 'Available')}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            item.status === 'Available' && styles.statusOptionTextAvailable,
                          ]}
                        >
                          Còn chỗ
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.statusOption,
                          item.status === 'Occupied' && styles.statusOptionOccupied,
                        ]}
                        onPress={() => handleChangeRoomStatus(item, 'Occupied')}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            item.status === 'Occupied' && styles.statusOptionTextOccupied,
                          ]}
                        >
                          Hết chỗ
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.statusOption,
                          item.status === 'Maintenance' && styles.statusOptionMaintenance,
                        ]}
                        onPress={() => handleChangeRoomStatus(item, 'Maintenance')}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            item.status === 'Maintenance' && styles.statusOptionTextMaintenance,
                          ]}
                        >
                          Bảo trì
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}
            />
          )}
        </View>
      )}

      {/* Tab 2: Lịch Đặt Toàn Trường */}
      {activeAdminTab === 'bookings' && (
        <View style={{ flex: 1 }}>
          {isLoadingBookings ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.primary} />
          ) : (
            <FlatList
              data={allBookings}
              keyExtractor={(b) => b.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.duration(340).delay(Math.min(index * 45, 250)).springify()}
                  style={styles.bookingItemCard}
                >
                  <View style={styles.bookingTop}>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingRoom}>{item.roomName}</Text>
                      <Text style={styles.bookingStudent} numberOfLines={2}>
                        Sinh viên: {item.studentName} ({item.studentId})
                      </Text>
                      <Text style={styles.bookingTime}>
                        📅 {item.date} • ⏰ {item.startTime} - {item.endTime}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        item.status === 'Pending'
                          ? styles.statusPending
                          : item.status === 'Upcoming'
                          ? styles.statusUpcoming
                          : item.status === 'Completed'
                          ? styles.statusCompleted
                          : styles.statusCancelled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          item.status === 'Pending'
                            ? styles.statusPillTextPending
                            : item.status === 'Upcoming'
                            ? styles.statusPillTextUpcoming
                            : item.status === 'Completed'
                            ? styles.statusPillTextCompleted
                            : styles.statusPillTextCancelled,
                        ]}
                      >
                        {item.status === 'Pending'
                          ? 'Chờ duyệt'
                          : item.status === 'Upcoming'
                          ? 'Đã duyệt'
                          : item.status === 'Completed'
                          ? 'Hoàn thành'
                          : 'Đã hủy'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingBottom}>
                    <Text style={styles.bookingPass}>Mã vé: {item.checkInCode}</Text>
                    <View style={styles.adminBookingBtnGroup}>
                      {item.status === 'Pending' && (
                        <>
                          <TouchableOpacity
                            style={styles.adminApproveBtn}
                            onPress={() => handleApproveBooking(item.id, item.studentName, item.roomName)}
                            disabled={approveBookingMutation.isPending}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                            <Text style={styles.adminApproveText}>Duyệt</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.adminCancelBtn}
                            onPress={() => handleAdminCancelBooking(item.id, item.studentName)}
                            disabled={cancelBookingMutation.isPending}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="close-circle-outline" size={13} color="#DC2626" />
                            <Text style={styles.adminCancelText}>Từ chối</Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {item.status === 'Upcoming' && (
                        <TouchableOpacity
                          style={styles.adminCancelBtn}
                          onPress={() => handleAdminCancelBooking(item.id, item.studentName)}
                          disabled={cancelBookingMutation.isPending}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close-circle-outline" size={13} color="#DC2626" />
                          <Text style={styles.adminCancelText}>Hủy lịch</Text>
                        </TouchableOpacity>
                      )}

                      {/* Nút Xóa: Luôn hiển thị để Admin xóa bớt các lịch đã xong, đã hủy hoặc không cần thiết */}
                      <TouchableOpacity
                        style={styles.adminDeleteBookingBtn}
                        onPress={() => handleDeleteBooking(item.id, item.roomName, item.studentName)}
                        disabled={deleteBookingMutation.isPending}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={13} color="#DC2626" />
                        <Text style={styles.adminDeleteBookingText}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}
            />
          )}
        </View>
      )}

      {/* Tab 3: Quản Trị Người Dùng */}
      {activeAdminTab === 'users' && (
        <View style={{ flex: 1 }}>
          {/* Search bar & Role Filter */}
          <View style={styles.userSearchContainer}>
            <View style={styles.userSearchRow}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.userSearchInput}
                placeholder="Tìm theo tên, MSSV, email, khoa..."
                placeholderTextColor={Colors.textMuted}
                value={userSearchQuery}
                onChangeText={setUserSearchQuery}
              />
              {userSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setUserSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.userFilterRow}>
              <TouchableOpacity
                style={[styles.userFilterChip, userRoleFilter === 'all' && styles.userFilterChipActive]}
                onPress={() => setUserRoleFilter('all')}
              >
                <Text
                  style={[
                    styles.userFilterChipText,
                    userRoleFilter === 'all' && styles.userFilterChipTextActive,
                  ]}
                >
                  Tất cả ({users?.length ?? 0})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.userFilterChip, userRoleFilter === 'student' && styles.userFilterChipActive]}
                onPress={() => setUserRoleFilter('student')}
              >
                <Text
                  style={[
                    styles.userFilterChipText,
                    userRoleFilter === 'student' && styles.userFilterChipTextActive,
                  ]}
                >
                  Sinh viên ({users?.filter((u) => u.role === 'student').length ?? 0})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.userFilterChip, userRoleFilter === 'admin' && styles.userFilterChipActive]}
                onPress={() => setUserRoleFilter('admin')}
              >
                <Text
                  style={[
                    styles.userFilterChipText,
                    userRoleFilter === 'admin' && styles.userFilterChipTextActive,
                  ]}
                >
                  Quản trị viên ({users?.filter((u) => u.role === 'admin').length ?? 0})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoadingUsers ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.primary} />
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(u) => u.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              ListEmptyComponent={
                <View style={styles.emptyUsersBox}>
                  <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyUsersTitle}>Không tìm thấy người dùng</Text>
                  <Text style={styles.emptyUsersSub}>
                    Hãy thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc.
                  </Text>
                </View>
              }
              renderItem={({ item, index }) => {
                const isMe = item.id === currentUser?.id;
                const isAdmin = item.role === 'admin';

                return (
                  <Animated.View
                    entering={FadeInDown.duration(340).delay(Math.min(index * 45, 250)).springify()}
                    style={styles.userCard}
                  >
                    <View style={styles.userCardTop}>
                      <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
                      <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.userName}>{item.name}</Text>
                          {isMe && (
                            <View style={styles.isMeBadge}>
                              <Text style={styles.isMeText}>Bạn</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.userCode}>
                          {item.studentCode ? `Mã: ${item.studentCode}` : 'Mã: N/A'}
                        </Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                        <Text style={styles.userDept}>{item.department || 'Đại học VKU'}</Text>
                      </View>

                      {/* Role Badge */}
                      <View
                        style={[
                          styles.userRoleBadge,
                          isAdmin ? styles.userRoleBadgeAdmin : styles.userRoleBadgeStudent,
                        ]}
                      >
                        <Ionicons
                          name={isAdmin ? 'shield-checkmark' : 'school-outline'}
                          size={12}
                          color={isAdmin ? '#92400E' : Colors.primary}
                        />
                        <Text
                          style={[
                            styles.userRoleBadgeText,
                            isAdmin ? styles.userRoleBadgeTextAdmin : styles.userRoleBadgeTextStudent,
                          ]}
                        >
                          {isAdmin ? 'Quản trị' : 'Sinh viên'}
                        </Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.userActionRow}>
                      <TouchableOpacity
                        style={[
                          styles.roleToggleBtn,
                          isAdmin ? styles.roleDemoteBtn : styles.rolePromoteBtn,
                          isMe && styles.actionBtnDisabled,
                        ]}
                        onPress={() => handleToggleUserRole(item)}
                        disabled={isMe || updateUserRoleMutation.isPending}
                      >
                        <Ionicons
                          name={isAdmin ? 'arrow-down-circle-outline' : 'shield-outline'}
                          size={14}
                          color={isAdmin ? '#B45309' : Colors.primary}
                        />
                        <Text
                          style={[
                            styles.roleToggleBtnText,
                            isAdmin ? styles.roleDemoteBtnText : styles.rolePromoteBtnText,
                          ]}
                        >
                          {isAdmin ? 'Hạ xuống Sinh viên' : 'Cấp quyền Quản trị (Admin)'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.userDeleteBtn, isMe && styles.actionBtnDisabled]}
                        onPress={() => handleDeleteUser(item)}
                        disabled={isMe || deleteUserMutation.isPending}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={isMe ? Colors.textMuted : '#DC2626'}
                        />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                );
              }}
            />
          )}
        </View>
      )}

      {/* Modal Thêm Phòng Mới */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          Keyboard.dismiss();
          setAddModalVisible(false);
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
              setAddModalVisible(false);
            }}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Phòng Mới Vào Campus</Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setAddModalVisible(false);
                }}
              >
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.fieldLabel}>Tên phòng (ví dụ: Lab AI A3-205)</Text>
              <TextInput
                style={styles.input}
                placeholder="Phòng Lab Robotics & AI"
                placeholderTextColor={Colors.textMuted}
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.fieldLabel}>Tòa nhà</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {BUILDINGS.map((bldg) => (
                  <TouchableOpacity
                    key={bldg}
                    style={[styles.pill, newBuilding === bldg && styles.pillActive]}
                    onPress={() => setNewBuilding(bldg)}
                  >
                    <Text style={[styles.pillText, newBuilding === bldg && styles.pillTextActive]}>
                      {bldg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Vị trí tầng</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tầng 2"
                    placeholderTextColor={Colors.textMuted}
                    value={newFloor}
                    onChangeText={setNewFloor}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Sức chứa (chỗ)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={newCapacity}
                    onChangeText={setNewCapacity}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Link ảnh phòng (URL)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor={Colors.textMuted}
                value={newPhotoUrl}
                onChangeText={setNewPhotoUrl}
              />

              <Text style={styles.fieldLabel}>Trang thiết bị đi kèm</Text>
              <View style={styles.amenityWrap}>
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const active = newAmenities.includes(amenity);
                  return (
                    <TouchableOpacity
                      key={amenity}
                      style={[styles.amenityChip, active && styles.amenityChipActive]}
                      onPress={() => handleToggleAmenity(amenity)}
                    >
                      <Text style={[styles.amenityText, active && styles.amenityTextActive]}>
                        {amenity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Mô tả phòng</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Giới thiệu không gian và lưu ý khi sử dụng..."
                placeholderTextColor={Colors.textMuted}
                multiline
                value={newDescription}
                onChangeText={setNewDescription}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  Keyboard.dismiss();
                  setAddModalVisible(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCreateRoom}
                disabled={addRoomMutation.isPending}
              >
                {addRoomMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Lưu Lên Firestore</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Chỉnh Sửa Thông Tin Phòng */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          Keyboard.dismiss();
          setEditModalVisible(false);
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
              setEditModalVisible(false);
            }}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh Sửa Thông Tin Phòng</Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setEditModalVisible(false);
                }}
              >
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.fieldLabel}>Tên phòng</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên phòng học / lab..."
                placeholderTextColor={Colors.textMuted}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.fieldLabel}>Tòa nhà</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {BUILDINGS.map((bldg) => (
                  <TouchableOpacity
                    key={bldg}
                    style={[styles.pill, editBuilding === bldg && styles.pillActive]}
                    onPress={() => setEditBuilding(bldg)}
                  >
                    <Text style={[styles.pillText, editBuilding === bldg && styles.pillTextActive]}>
                      {bldg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Vị trí tầng</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tầng 1"
                    placeholderTextColor={Colors.textMuted}
                    value={editFloor}
                    onChangeText={setEditFloor}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Sức chứa (chỗ)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={editCapacity}
                    onChangeText={setEditCapacity}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Link ảnh phòng (URL)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor={Colors.textMuted}
                value={editPhotoUrl}
                onChangeText={setEditPhotoUrl}
              />

              <Text style={styles.fieldLabel}>Trang thiết bị đi kèm</Text>
              <View style={styles.amenityWrap}>
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const active = editAmenities.includes(amenity);
                  return (
                    <TouchableOpacity
                      key={amenity}
                      style={[styles.amenityChip, active && styles.amenityChipActive]}
                      onPress={() => handleToggleEditAmenity(amenity)}
                    >
                      <Text style={[styles.amenityText, active && styles.amenityTextActive]}>
                        {amenity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Mô tả phòng</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Giới thiệu không gian phòng..."
                placeholderTextColor={Colors.textMuted}
                multiline
                value={editDescription}
                onChangeText={setEditDescription}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  Keyboard.dismiss();
                  setEditModalVisible(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEditRoom}
                disabled={updateRoomMutation.isPending}
              >
                {updateRoomMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Lưu Thay Đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 10,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  switchBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  switchTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roomItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  roomDetails: {
    flex: 1,
    marginLeft: 12,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roomBuilding: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roomCapacity: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  roomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtn: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  deleteBtn: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  statusActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusOptionAvailable: {
    backgroundColor: Colors.availableLight,
    borderColor: Colors.availableBorder,
  },
  statusOptionOccupied: {
    backgroundColor: Colors.occupiedLight,
    borderColor: Colors.occupiedBorder,
  },
  statusOptionMaintenance: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusOptionTextAvailable: {
    color: Colors.availableText,
    fontWeight: '700',
  },
  statusOptionTextOccupied: {
    color: Colors.occupiedText,
    fontWeight: '700',
  },
  statusOptionTextMaintenance: {
    color: '#92400E',
    fontWeight: '700',
  },
  bookingItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  bookingInfo: {
    flex: 1,
    marginRight: 6,
  },
  bookingRoom: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bookingStudent: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  bookingTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusUpcoming: {
    backgroundColor: Colors.availableLight,
  },
  statusCompleted: {
    backgroundColor: '#EFF6FF',
  },
  statusCancelled: {
    backgroundColor: '#FEF2F2',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPillTextPending: {
    color: '#B45309',
  },
  statusPillTextUpcoming: {
    color: Colors.availableText,
  },
  statusPillTextCompleted: {
    color: '#1D4ED8',
  },
  statusPillTextCancelled: {
    color: '#991B1B',
  },
  bookingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  bookingPass: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  adminBookingBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  adminApproveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adminCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  adminCancelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  adminDeleteBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  adminDeleteBookingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
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
    maxHeight: '90%',
    paddingBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalBody: {
    padding: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  amenityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amenityChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
  },
  amenityText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  amenityTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // User Management Styles
  userSearchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  userSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  userSearchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  userFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  userFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  userFilterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  userFilterChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userFilterChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  isMeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#10B981',
  },
  isMeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  userCode: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  userDept: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  userRoleBadgeAdmin: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  userRoleBadgeStudent: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  userRoleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userRoleBadgeTextAdmin: {
    color: '#92400E',
  },
  userRoleBadgeTextStudent: {
    color: Colors.primary,
  },
  userActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 10,
  },
  roleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  rolePromoteBtn: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  roleDemoteBtn: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  roleToggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rolePromoteBtnText: {
    color: Colors.primary,
  },
  roleDemoteBtnText: {
    color: '#B45309',
  },
  userDeleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  actionBtnDisabled: {
    opacity: 0.35,
  },
  emptyUsersBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyUsersTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptyUsersSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
