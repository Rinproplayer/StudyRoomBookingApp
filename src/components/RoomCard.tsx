import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Room } from '../types/room';
import { StatusBadge } from './StatusBadge';
import { Colors } from '../theme/colors';

interface Props {
  room: Room;
  index?: number;
  onPress: (room: Room) => void;
}

export const RoomCard: React.FC<Props> = React.memo(({ room, index = 0, onPress }) => {
  const scale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.975, { damping: 15, stiffness: 350 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 350 });
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(380).delay(Math.min(index * 60, 360)).springify()}
      style={animatedCardStyle}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(room)}
      >
      {/* Room Photo */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: room.photoUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.noiseTag}>
          <Text style={styles.noiseText}>{room.noiseLevel}</Text>
        </View>
        <View style={styles.floorTag}>
          <Text style={styles.floorText}>{room.floor}</Text>
        </View>
      </View>

      {/* Content matching wireframe */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{room.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Location with Pin icon matching wireframe 📍 */}
        <View style={styles.infoRow}>
          <Ionicons name="location-sharp" size={15} color="#DC2626" />
          <Text style={styles.infoText}>{room.building}</Text>
        </View>

        {/* Capacity with Seats icon matching wireframe 👥 */}
        <View style={styles.infoRow}>
          <Ionicons name="people" size={15} color="#2563EB" />
          <Text style={styles.infoText}>{room.capacity} chỗ ngồi</Text>
        </View>

        {/* Amenities preview tags */}
        <View style={styles.amenitiesRow}>
          {room.amenities.slice(0, 3).map((amenity, idx) => (
            <View key={idx} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
          {room.amenities.length > 3 && (
            <View style={styles.amenityChipMore}>
              <Text style={styles.amenityTextMore}>+{room.amenities.length - 3}</Text>
            </View>
          )}
        </View>

        {/* Bottom row: Status badge + Book button */}
        <View style={styles.footerRow}>
          <StatusBadge status={room.status} />

          <TouchableOpacity
            style={[
              styles.actionButton,
              room.status === 'Available' ? styles.actionAvailable : styles.actionOccupied,
            ]}
            onPress={() => onPress(room)}
          >
            <Text
              style={[
                styles.actionButtonText,
                room.status === 'Available' ? styles.actionTextAvailable : styles.actionTextOccupied,
              ]}
            >
              {room.status === 'Available' ? 'Đặt phòng ngay' : 'Xem lịch đặt'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={room.status === 'Available' ? '#FFFFFF' : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </Animated.View>
);
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 148,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noiseTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  noiseText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  floorTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  floorText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  amenityChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  amenityChipMore: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  amenityTextMore: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionAvailable: {
    backgroundColor: Colors.primary,
  },
  actionOccupied: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionTextAvailable: {
    color: '#FFFFFF',
  },
  actionTextOccupied: {
    color: Colors.textSecondary,
  },
});
