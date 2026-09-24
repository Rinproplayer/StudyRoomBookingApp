import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Booking, BookingStatus } from '../types/booking';
import { useBookingsQuery, useCancelBookingMutation } from '../api/queries';
import { useUserStore } from '../store/useUserStore';
import { Colors } from '../theme/colors';

const STATUS_TABS: { key: BookingStatus; label: string }[] = [
  { key: 'Upcoming', label: 'Sắp tới' },
  { key: 'Completed', label: 'Đã học' },
  { key: 'Cancelled', label: 'Đã hủy' },
];

export const MyBookingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BookingStatus>('Upcoming');
  const user = useUserStore((s) => s.user);

  const {
    data: bookings,
    isLoading,
    isRefetching,
    refetch,
  } = useBookingsQuery(user?.id);

  const cancelMutation = useCancelBookingMutation();

  const filteredBookings = bookings?.filter((b) => b.status === activeTab) ?? [];

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Hủy Đặt Phòng',
      `Bạn có chắc chắn muốn hủy lịch đặt ${booking.roomName} vào lúc ${booking.startTime} - ${booking.endTime}, ngày ${booking.date}? Khung giờ này sẽ lập tức được mở lại cho sinh viên khác.`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Đồng ý hủy',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync(booking.id);
              Alert.alert('Thành công', 'Lịch đặt phòng đã được hủy thành công!');
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Không thể hủy lịch đặt.';
              Alert.alert('Lỗi', msg);
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item, index }: { item: Booking; index: number }) => {
    const isUpcoming = item.status === 'Upcoming';
    const isCompleted = item.status === 'Completed';

    const statusLabel = isUpcoming
      ? 'Sắp tới'
      : isCompleted
      ? 'Đã hoàn thành'
      : 'Đã hủy';

    return (
      <Animated.View
        entering={FadeInDown.duration(360).delay(Math.min(index * 55, 300)).springify()}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.roomPhoto }} style={styles.thumbnail} />
          <View style={styles.headerInfo}>
            <Text style={styles.roomName}>{item.roomName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={13} color="#DC2626" />
              <Text style={styles.buildingText}>{item.building}</Text>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusPill,
              isUpcoming
                ? styles.statusUpcoming
                : isCompleted
                ? styles.statusCompleted
                : styles.statusCancelled,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isUpcoming
                  ? styles.statusTextUpcoming
                  : isCompleted
                  ? styles.statusTextCompleted
                  : styles.statusTextCancelled,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Slot time info */}
        <View style={styles.slotBanner}>
          <Ionicons name="time" size={16} color={Colors.primary} />
          <Text style={styles.slotTimeText}>
            {item.startTime} - {item.endTime}
          </Text>
          <View style={styles.slotDivider} />
          <Text style={styles.purposeText} numberOfLines={1}>
            {item.purpose}
          </Text>
        </View>

        {/* Check-in pass & action */}
        <View style={styles.cardFooter}>
          <View style={styles.checkInPass}>
            <Ionicons name="qr-code-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.passLabel}>MÃ CHECK-IN:</Text>
            <Text style={styles.passCode}>{item.checkInCode}</Text>
          </View>

          {isUpcoming && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item)}
              activeOpacity={0.7}
              disabled={cancelMutation.isPending}
            >
              <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
              <Text style={styles.cancelButtonText}>Hủy đặt</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Segmented status tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.segmentedControl}>
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = bookings?.filter((b) => b.status === tab.key).length ?? 0;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {tab.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>
                Không Có Lịch {STATUS_TABS.find((t) => t.key === activeTab)?.label}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'Upcoming'
                  ? 'Bạn chưa có buổi học nhóm nào được lên lịch. Hãy khám phá phòng và đặt ngay!'
                  : `Bạn chưa có lịch học nào thuộc mục ${activeTab.toLowerCase()}.`}
              </Text>
            </View>
          )
        }
      />

      {isLoading && (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  buildingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextUpcoming: {
    color: Colors.availableText,
  },
  statusTextCompleted: {
    color: Colors.primaryDark,
  },
  statusTextCancelled: {
    color: '#991B1B',
  },
  slotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 12,
    gap: 8,
  },
  slotTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  slotDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.divider,
  },
  purposeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  checkInPass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  passCode: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    gap: 4,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingCenter: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(248, 250, 252, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
