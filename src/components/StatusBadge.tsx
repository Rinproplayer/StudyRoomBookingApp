import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomStatus } from '../types/room';
import { Colors } from '../theme/colors';

interface Props {
  status: RoomStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const isAvailable = status === 'Available';

  return (
    <View
      style={[
        styles.container,
        isAvailable ? styles.availableContainer : styles.occupiedContainer,
        size === 'sm' && styles.containerSm,
      ]}
    >
      <Ionicons
        name={isAvailable ? 'checkmark-circle' : 'close-circle'}
        size={size === 'sm' ? 12 : 14}
        color={isAvailable ? Colors.available : Colors.occupied}
      />
      <Text
        style={[
          styles.text,
          isAvailable ? styles.availableText : styles.occupiedText,
          size === 'sm' && styles.textSm,
        ]}
      >
        {isAvailable ? 'Còn chỗ' : 'Hết chỗ'}
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
});
