import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { RoomStatus } from '../types/room';
import { Colors } from '../theme/colors';

interface Props {
  status: RoomStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const isAvailable = status === 'Available';
  const isMaintenance = status === 'Maintenance';

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isAvailable) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.22, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = 1;
    }
  }, [isAvailable, pulse]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        isAvailable
          ? styles.availableContainer
          : isMaintenance
          ? styles.maintenanceContainer
          : styles.occupiedContainer,
        size === 'sm' && styles.containerSm,
      ]}
    >
      <Animated.View style={animatedIconStyle}>
        <Ionicons
          name={
            isAvailable
              ? 'checkmark-circle'
              : isMaintenance
              ? 'construct-outline'
              : 'close-circle'
          }
          size={size === 'sm' ? 12 : 14}
          color={
            isAvailable
              ? Colors.available
              : isMaintenance
              ? '#D97706'
              : Colors.occupied
          }
        />
      </Animated.View>
      <Text
        style={[
          styles.text,
          isAvailable
            ? styles.availableText
            : isMaintenance
            ? styles.maintenanceText
            : styles.occupiedText,
          size === 'sm' && styles.textSm,
        ]}
      >
        {isAvailable ? 'Còn chỗ' : isMaintenance ? 'Bảo trì' : 'Hết chỗ'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  containerSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  availableContainer: {
    backgroundColor: Colors.availableLight,
    borderColor: Colors.availableBorder,
  },
  occupiedContainer: {
    backgroundColor: Colors.occupiedLight,
    borderColor: Colors.occupiedBorder,
  },
  maintenanceContainer: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 11,
  },
  availableText: {
    color: Colors.availableText,
  },
  occupiedText: {
    color: Colors.occupiedText,
  },
  maintenanceText: {
    color: '#B45309',
  },
});
