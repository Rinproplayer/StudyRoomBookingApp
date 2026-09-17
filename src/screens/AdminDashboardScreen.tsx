import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAddRoomMutation,
  useAdminBookingsQuery,
  useCancelBookingMutation,
  useDeleteRoomMutation,
  useRoomsQuery,
  useUpdateRoomMutation,
} from '../api/queries';
import { Amenity, Building, Room, RoomStatus } from '../types/room';
import { StatusBadge } from '../components/StatusBadge';
import { Colors } from '../theme/colors';

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
  const [activeAdminTab, setActiveAdminTab] = useState<'rooms' | 'bookings'>('rooms');
  const [addModalVisible, setAddModalVisible] = useState(false);

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

  // Queries & Mutations
  const { data: rooms, isLoading: isLoadingRooms } = useRoomsQuery();
  const { data: allBookings, isLoading: isLoadingBookings } = useAdminBookingsQuery();
  const addRoomMutation = useAddRoomMutation();
  const updateRoomMutation = useUpdateRoomMutation();
  const deleteRoomMutation = useDeleteRoomMutation();
  const cancelBookingMutation = useCancelBookingMutation();

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

  return (
    <View style={styles.screen}>
      {/* Overview Stats Bar */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{rooms?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Tổng phòng</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: Colors.primary }]}>
            {allBookings?.filter((b) => b.status === 'Upcoming').length ?? 0}
          </Text>
          <Text style={styles.statLabel}>Lịch sắp tới</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: Colors.available }]}>
            {rooms?.filter((r) => r.status === 'Available').length ?? 0}
          </Text>
          <Text style={styles.statLabel}>Phòng trống</Text>
        </View>
      </View>

      {/* Admin Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, activeAdminTab === 'rooms' && styles.switchBtnActive]}
          onPress={() => setActiveAdminTab('rooms')}
        >
          <Ionicons
            name="business-outline"
            size={16}
            color={activeAdminTab === 'rooms' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.switchText, activeAdminTab === 'rooms' && styles.switchTextActive]}>
            Quản Lý Phòng ({rooms?.length ?? 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeAdminTab === 'bookings' && styles.switchBtnActive]}
          onPress={() => setActiveAdminTab('bookings')}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={activeAdminTab === 'bookings' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[styles.switchText, activeAdminTab === 'bookings' && styles.switchTextActive]}
          >
            Lịch Đặt Toàn Trường ({allBookings?.length ?? 0})
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
              renderItem={({ item }) => (
                <View style={styles.roomItemCard}>
                  <View style={styles.roomHeader}>
                    <Image source={{ uri: item.photoUrl }} style={styles.roomImg} />
                    <View style={styles.roomDetails}>
                      <Text style={styles.roomName}>{item.name}</Text>
                      <Text style={styles.roomBuilding}>
                        {item.building} • {item.floor}
                      </Text>
                      <Text style={styles.roomCapacity}>Sức chứa: {item.capacity} chỗ</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteRoom(item)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
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
                </View>
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
              renderItem={({ item }) => (
                <View style={styles.bookingItemCard}>
                  <View style={styles.bookingTop}>
                    <View>
                      <Text style={styles.bookingRoom}>{item.roomName}</Text>
                      <Text style={styles.bookingStudent}>
                        Sinh viên: {item.studentName} ({item.studentId})
                      </Text>
                      <Text style={styles.bookingTime}>
                        📅 {item.date} • ⏰ {item.startTime} - {item.endTime}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        item.status === 'Upcoming'
                          ? styles.statusUpcoming
                          : item.status === 'Completed'
                          ? styles.statusCompleted
                          : styles.statusCancelled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          item.status === 'Upcoming'
                            ? styles.statusPillTextUpcoming
                            : styles.statusPillTextCancelled,
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingBottom}>
                    <Text style={styles.bookingPass}>Mã vé: {item.checkInCode}</Text>
                    {item.status === 'Upcoming' && (
                      <TouchableOpacity
                        style={styles.adminCancelBtn}
                        onPress={() => handleAdminCancelBooking(item.id, item.studentName)}
                      >
                        <Text style={styles.adminCancelText}>Hủy lịch này</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* Modal Thêm Phòng Mới */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Phòng Mới Vào Campus</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
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
                onPress={() => setAddModalVisible(false)}
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
        </View>
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
  deleteBtn: {
    padding: 8,
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
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  statusPillTextUpcoming: {
    color: Colors.availableText,
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
  adminCancelBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminCancelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
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
});
