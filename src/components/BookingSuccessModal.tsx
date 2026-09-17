import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { Colors } from '../theme/colors';

interface Props {
  booking: Booking | null;
  visible: boolean;
  onClose: () => void;
  onGoToBookings: () => void;
}

export const BookingSuccessModal: React.FC<Props> = ({
  booking,
  visible,
  onClose,
  onGoToBookings,
}) => {
  if (!booking) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Success Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Đặt Phòng Thành Công!</Text>
          <Text style={styles.subtitle}>
            Phòng học của bạn đã được xác nhận giữ chỗ thành công.
          </Text>

          {/* Booking Summary Box */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Phòng học</Text>
              <Text style={styles.valueBold}>{booking.roomName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Tòa nhà</Text>
              <Text style={styles.value}>{booking.building}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Ngày đặt</Text>
              <Text style={styles.value}>{booking.date}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Khung giờ</Text>
              <Text style={styles.valueHighlight}>
                {booking.startTime} - {booking.endTime}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Người đặt</Text>
              <Text style={styles.value}>{booking.studentName}</Text>
            </View>

            {/* Check-in Pass Code */}
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>MÃ CHECK-IN / VÉ VÀO PHÒNG</Text>
              <Text style={styles.codeValue}>{booking.checkInCode}</Text>
              <View style={styles.qrMock}>
                <Ionicons name="qr-code-outline" size={48} color={Colors.primaryDark} />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonStack}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onGoToBookings}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Xem trong Lịch đặt của tôi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.available,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  valueBold: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  valueHighlight: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  codeContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  qrMock: {
    padding: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
