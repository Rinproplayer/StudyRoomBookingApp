import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { TimeSlot } from '../types/booking';
import { getTodayDateString } from '../api/mockData';
import { Colors } from '../theme/colors';

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  slots: TimeSlot[] | undefined;
  isLoadingSlots: boolean;
  selectedSlotId: string | null;
  onSelectSlot: (slot: TimeSlot) => void;
  conflictError?: string | null;
}

export const TimeSlotPicker: React.FC<Props> = ({
  selectedDate,
  onSelectDate,
  slots,
  isLoadingSlots,
  selectedSlotId,
  onSelectSlot,
  conflictError,
}) => {
  // Generate next 6 days
  const dateOptions = [0, 1, 2, 3, 4, 5].map((offset) => {
    const dateStr = getTodayDateString(offset);
    const d = new Date();
    d.setDate(d.getDate() + offset);

    let dayLabel = '';
    if (offset === 0) dayLabel = 'Hôm nay';
    else if (offset === 1) dayLabel = 'Ngày mai';
    else {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      dayLabel = days[d.getDay()];
    }

    const dayNumber = d.getDate();
    const monthName = `Tháng ${d.getMonth() + 1}`;

    return {
      dateStr,
      dayLabel,
      dayNumber,
      monthName,
    };
  });

  return (
    <View style={styles.container}>
      {/* Date Selector Strip */}
      <Text style={styles.sectionLabel}>Chọn Ngày Đặt Phòng</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStrip}
      >
        {dateOptions.map((item, dIdx) => {
          const isSelected = selectedDate === item.dateStr;
          return (
            <Animated.View
              key={item.dateStr}
              entering={FadeInRight.duration(280).delay(dIdx * 35)}
            >
              <TouchableOpacity
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                onPress={() => onSelectDate(item.dateStr)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {item.dayLabel}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                  {item.dayNumber}
                </Text>
                <Text style={[styles.monthLabel, isSelected && styles.monthLabelSelected]}>
                  {item.monthName}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Slots Section Header */}
      <View style={styles.slotsHeader}>
        <Text style={styles.sectionLabel}>Chọn Khung Giờ</Text>
        <View style={styles.legendWrap}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.available }]} />
            <Text style={styles.legendText}>Còn trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.occupied }]} />
            <Text style={styles.legendText}>Đã có người đặt</Text>
          </View>
        </View>
      </View>

      {/* Conflict error warning banner */}
      {conflictError ? (
        <Animated.View entering={FadeInUp.springify().damping(12)} style={styles.conflictBanner}>
          <Ionicons name="warning" size={18} color="#DC2626" />
          <Text style={styles.conflictBannerText}>{conflictError}</Text>
        </Animated.View>
      ) : null}

      {/* Slots Grid */}
      {isLoadingSlots ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang kiểm tra lịch phòng thời gian thực...</Text>
        </View>
      ) : (
        <View style={styles.slotsGrid}>
          {slots?.map((slot, index) => {
            const isBooked = slot.isBooked;
            const isSelected = selectedSlotId === slot.id;

            return (
              <Animated.View
                key={slot.id}
                entering={FadeInDown.duration(300).delay(index * 25).springify()}
                style={{ flexBasis: '48%', flexGrow: 1 }}
              >
                <TouchableOpacity
                  disabled={isBooked}
                  style={[
                    styles.slotCard,
                    isBooked && styles.slotCardBooked,
                    isSelected && styles.slotCardSelected,
                  ]}
                  onPress={() => onSelectSlot(slot)}
                  activeOpacity={0.7}
                >
                  <View style={styles.slotTop}>
                    <Ionicons
                      name={
                        isBooked
                          ? 'close-circle'
                          : isSelected
                          ? 'checkmark-circle'
                          : 'time-outline'
                      }
                      size={16}
                      color={
                        isBooked
                          ? Colors.occupied
                          : isSelected
                          ? '#FFFFFF'
                          : Colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.slotTime,
                        isBooked && styles.slotTimeBooked,
                        isSelected && styles.slotTimeSelected,
                      ]}
                    >
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </View>

                  <View style={styles.slotBadgeWrap}>
                    <Text
                      style={[
                        styles.slotBadgeText,
                        isBooked && styles.slotBadgeTextBooked,
                        isSelected && styles.slotBadgeTextSelected,
                      ]}
                    >
                      {isBooked ? 'Đã kín lịch' : isSelected ? 'Đang chọn' : 'Còn trống'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  dateStrip: {
    gap: 10,
    paddingBottom: 14,
  },
  dateCard: {
    width: 78,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#E0E7FF',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  monthLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  monthLabelSelected: {
    color: '#EFF6FF',
  },
  slotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  legendWrap: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  conflictBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.availableBorder,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  slotCardBooked: {
    backgroundColor: '#F8FAFC',
    borderColor: Colors.border,
    opacity: 0.65,
  },
  slotCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  slotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  slotTimeBooked: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  slotTimeSelected: {
    color: '#FFFFFF',
  },
  slotBadgeWrap: {
    alignSelf: 'flex-start',
  },
  slotBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.availableText,
  },
  slotBadgeTextBooked: {
    color: Colors.occupiedText,
  },
  slotBadgeTextSelected: {
    color: '#E0E7FF',
  },
});
