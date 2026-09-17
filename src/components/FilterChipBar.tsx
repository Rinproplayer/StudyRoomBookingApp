import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Building } from '../types/room';
import { useFilterStore } from '../store/useFilterStore';
import { Colors } from '../theme/colors';

const BUILDINGS: Building[] = [
  'Tất cả',
  'Tòa nhà A3',
  'Thư viện Trung tâm',
  'Khu Công nghệ',
  'Giảng đường Khoa học',
  'Không gian Sáng tạo',
];

interface Props {
  onOpenFilterModal: () => void;
}

export const FilterChipBar: React.FC<Props> = ({ onOpenFilterModal }) => {
  const {
    selectedBuilding,
    setSelectedBuilding,
    availableOnly,
    toggleAvailableOnly,
    getActiveFilterCount,
  } = useFilterStore();

  const activeCount = getActiveFilterCount();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Modal trigger button matching [Filter v] in wireframe */}
        <TouchableOpacity
          style={[styles.filterButton, activeCount > 0 && styles.filterButtonActive]}
          onPress={onOpenFilterModal}
          activeOpacity={0.7}
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={activeCount > 0 ? '#FFFFFF' : Colors.textPrimary}
          />
          <Text
            style={[styles.filterButtonText, activeCount > 0 && styles.filterButtonTextActive]}
          >
            Bộ lọc {activeCount > 0 ? `(${activeCount})` : '▾'}
          </Text>
        </TouchableOpacity>

        {/* Available only quick toggle chip */}
        <TouchableOpacity
          style={[styles.chip, availableOnly && styles.chipActiveAvailable]}
          onPress={toggleAvailableOnly}
          activeOpacity={0.7}
        >
          <Ionicons
            name={availableOnly ? 'checkmark-circle' : 'radio-button-off'}
            size={14}
            color={availableOnly ? Colors.available : Colors.textSecondary}
          />
          <Text style={[styles.chipText, availableOnly && styles.chipTextAvailable]}>
            Chỉ phòng còn chỗ
          </Text>
        </TouchableOpacity>

        {/* Building chips */}
        {BUILDINGS.map((building) => {
          const isSelected = selectedBuilding === building;
          return (
            <TouchableOpacity
              key={building}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => setSelectedBuilding(building)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {building}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
  },
  chipActiveAvailable: {
    backgroundColor: Colors.availableLight,
    borderColor: Colors.availableBorder,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  chipTextAvailable: {
    color: Colors.availableText,
    fontWeight: '700',
  },
});
