import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Booking, TimeSlot } from '../types/booking';
import { getTodayDateString } from '../api/mockData';
import {
  useCreateBookingMutation,
  useRoomDetailsQuery,
  useRoomSlotsQuery,
} from '../api/queries';
import { useUserStore } from '../store/useUserStore';
import { StatusBadge } from '../components/StatusBadge';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import { BookingSuccessModal } from '../components/BookingSuccessModal';
import { Colors } from '../theme/colors';

type RouteProps = RouteProp<RootStackParamList, 'RoomDetails'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export const RoomDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const { roomId } = route.params;

  const user = useUserStore((s) => s.user);

  // Selected date & slot state
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString(0));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [purpose, setPurpose] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Success modal
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // TanStack Query for room & slots
  const { data: room, isLoading: isLoadingRoom } = useRoomDetailsQuery(roomId);
  const {
    data: slots,
    isLoading: isLoadingSlots,
  } = useRoomSlotsQuery(roomId, selectedDate);

  const createBookingMutation = useCreateBookingMutation();

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setConflictError(null);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    if (slot.isBooked) {
      setConflictError(
        `Khung giờ ${slot.startTime} - ${slot.endTime} đã có người đặt trước. Vui lòng chọn khung giờ khác!`
      );
      return;
    }
    setConflictError(null);
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Chưa chọn giờ', 'Vui lòng chọn một khung giờ học tập còn trống.');
      return;
    }

    // Client-side conflict guard
    if (selectedSlot.isBooked) {
      setConflictError('Khung giờ này vừa bị chiếm. Hãy chọn khung giờ khác!');
      return;
    }

    try {
      setConflictError(null);
      const booking = await createBookingMutation.mutateAsync({
        roomId,
        date: selectedDate,
        slotId: selectedSlot.id,
        studentId: user?.id || 'STU-GUEST',
        studentName: user?.name || 'Sinh viên',
        purpose: purpose.trim() || 'Thảo luận nhóm & Tự học',
      });

      setConfirmedBooking(booking);
      setIsSuccessModalVisible(true);
      setSelectedSlot(null);
      setPurpose('');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đã có lỗi xảy ra trong quá trình đặt phòng. Vui lòng thử lại.';
      setConflictError(msg);
      Alert.alert('Xung đột lịch đặt', msg);
    }
  };

  if (isLoadingRoom || !room) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết phòng học...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Room Header Photo */}
        <View style={styles.bannerWrap}>
          <Image source={{ uri: room.photoUrl }} style={styles.bannerImage} resizeMode="cover" />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.statusFloat}>
            <StatusBadge status={room.status} />
          </View>
        </View>

        {/* Room Info Block */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomName}>{room.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={16} color="#DC2626" />
                <Text style={styles.locationText}>
                  {room.building} • {room.floor}
                </Text>
              </View>
            </View>

            <View style={styles.capacityBadge}>
              <Ionicons name="people" size={18} color={Colors.primary} />
              <Text style={styles.capacityText}>{room.capacity} chỗ</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeader}>Giới thiệu phòng học</Text>
          <Text style={styles.description}>{room.description}</Text>

          {/* Amenities Grid */}
          <Text style={styles.sectionHeader}>Trang thiết bị & Tiện nghi</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((item, idx) => (
              <View key={idx} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.available} />
                <Text style={styles.amenityLabel}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Time Slot Picker with Conflict Prevention */}
          <TimeSlotPicker
            selectedDate={selectedDate}
            onSelectDate={handleDateChange}
            slots={slots}
            isLoadingSlots={isLoadingSlots}
            selectedSlotId={selectedSlot?.id ?? null}
            onSelectSlot={handleSelectSlot}
            conflictError={conflictError}
          />

          {/* Study Purpose Input */}
          <Text style={styles.sectionHeader}>Mục đích sử dụng (Tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Họp nhóm làm đồ án tốt nghiệp, ôn thi thuật toán..."
            placeholderTextColor={Colors.textMuted}
            value={purpose}
            onChangeText={setPurpose}
          />
        </View>
      </ScrollView>

      {/* Booking Bar Footer */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarLabel}>Khung giờ đã chọn</Text>
          <Text style={styles.bottomBarSlot}>
            {selectedSlot
              ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
              : 'Chọn một khung giờ ở trên'}
          </Text>
        </View>

        <TouchableOpacity
          disabled={!selectedSlot || createBookingMutation.isPending}
          style={[
            styles.bookButton,
            (!selectedSlot || createBookingMutation.isPending) && styles.bookButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          activeOpacity={0.8}
        >
          {createBookingMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="calendar" size={18} color="#FFFFFF" />
              <Text style={styles.bookButtonText}>Xác Nhận Đặt Phòng</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Booking Confirmation Modal */}
      <BookingSuccessModal
        booking={confirmedBooking}
        visible={isSuccessModalVisible}
        onClose={() => setIsSuccessModalVisible(false)}
        onGoToBookings={() => {
          setIsSuccessModalVisible(false);
          navigation.navigate('MainTabs', { screen: 'MyBookings' });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scroll: {
    paddingBottom: 120,
  },
  bannerWrap: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusFloat: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  body: {
    padding: 18,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roomName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  capacityText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  amenityLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomBarLeft: {
    flex: 1,
    marginRight: 12,
  },
  bottomBarLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bottomBarSlot: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
