import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Amenity, Building } from '../types/room';
import { useFilterStore } from '../store/useFilterStore';
import { Colors } from '../theme/colors';

const ALL_BUILDINGS: Building[] = [
  'Tất cả',
  'Tòa nhà A3',
  'Thư viện Trung tâm',
  'Khu Công nghệ',
  'Giảng đường Khoa học',
  'Không gian Sáng tạo',
];

const CAPACITY_OPTIONS = [
  { label: 'Bất kỳ', value: 0 },
  { label: '10+ chỗ', value: 10 },
  { label: '20+ chỗ', value: 20 },
  { label: '30+ chỗ', value: 30 },
  { label: '40+ chỗ', value: 40 },
];

const ALL_AMENITIES: Amenity[] = [
  'Wi-Fi tốc độ cao',
  'Bảng viết dạ',
  'Máy chiếu 4K',
  'Ổ cắm điện đa năng',
  'Điều hòa không khí',
  'Phòng cách âm',
  'Màn hình kép',
  'Thiết bị họp trực tuyến',
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const FilterModal: React.FC<Props> = ({ visible, onClose }) => {
  const {
    selectedBuilding,
    setSelectedBuilding,
    minCapacity,
    setMinCapacity,
    availableOnly,
    setAvailableOnly,
    selectedAmenities,
    toggleAmenity,
    resetFilters,
  } = useFilterStore();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bộ Lọc Phòng Học</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Building Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tòa nhà / Khu vực</Text>
              <View style={styles.optionsWrap}>
                {ALL_BUILDINGS.map((bldg) => {
                  const active = selectedBuilding === bldg;
                  return (
                    <TouchableOpacity
                      key={bldg}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setSelectedBuilding(bldg)}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {bldg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Minimum Capacity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sức chứa tối thiểu</Text>
              <View style={styles.optionsWrap}>
                {CAPACITY_OPTIONS.map((cap) => {
                  const active = minCapacity === cap.value;
                  return (
                    <TouchableOpacity
                      key={cap.label}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setMinCapacity(cap.value)}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {cap.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Availability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tình trạng sẵn sàng</Text>
              <TouchableOpacity
                style={[styles.toggleRow, availableOnly && styles.toggleRowActive]}
                onPress={() => setAvailableOnly(!availableOnly)}
              >
                <View style={styles.toggleLeft}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={availableOnly ? Colors.available : Colors.textMuted}
                  />
                  <Text style={styles.toggleLabel}>Chỉ hiển thị phòng đang còn chỗ</Text>
                </View>
                <Ionicons
                  name={availableOnly ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={availableOnly ? Colors.primary : Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Amenities Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trang thiết bị & Tiện nghi</Text>
              <View style={styles.optionsWrap}>
                {ALL_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <TouchableOpacity
                      key={amenity}
                      style={[styles.amenityPill, isChecked && styles.amenityPillActive]}
                      onPress={() => toggleAmenity(amenity)}
                    >
                      <Ionicons
                        name={isChecked ? 'checkmark-circle' : 'add-circle-outline'}
                        size={15}
                        color={isChecked ? Colors.primary : Colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.amenityPillText,
                          isChecked && styles.amenityPillTextActive,
                        ]}
                      >
                        {amenity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetText}>Thiết lập lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyText}>Áp dụng bộ lọc</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  body: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    borderRadius: 12,
  },
  toggleRowActive: {
    backgroundColor: Colors.availableLight,
    borderColor: Colors.availableBorder,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amenityPillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
  },
  amenityPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  amenityPillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
