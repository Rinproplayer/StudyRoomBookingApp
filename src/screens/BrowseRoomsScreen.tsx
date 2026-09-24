import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Room } from '../types/room';
import { RootStackParamList } from '../types/navigation';
import { useRoomsQuery } from '../api/queries';
import { useFilterStore } from '../store/useFilterStore';
import { RoomCard } from '../components/RoomCard';
import { FilterChipBar } from '../components/FilterChipBar';
import { FilterModal } from '../components/FilterModal';
import { Colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BrowseRoomsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Zustand filter store
  const {
    searchQuery,
    setSearchQuery,
    selectedBuilding,
    minCapacity,
    availableOnly,
    selectedAmenities,
    resetFilters,
  } = useFilterStore();

  // TanStack Query for rooms
  const {
    data: rooms,
    isLoading,
    isRefetching,
    refetch,
  } = useRoomsQuery({
    searchQuery,
    selectedBuilding,
    minCapacity,
    availableOnly,
    selectedAmenities,
  });

  const handleRoomPress = useCallback(
    (room: Room) => {
      navigation.navigate('RoomDetails', { roomId: room.id });
    },
    [navigation]
  );

  const renderRoomItem = useCallback(
    ({ item, index }: { item: Room; index: number }) => {
      return <RoomCard room={item} index={index} onPress={handleRoomPress} />;
    },
    [handleRoomPress]
  );

  const renderEmptyComponent = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Không Tìm Thấy Phòng Phù Hợp</Text>
        <Text style={styles.emptySubtitle}>
          Không có phòng học nào thỏa mãn từ khóa hoặc tiêu chí bộ lọc hiện tại.
        </Text>
        <TouchableOpacity style={styles.emptyResetBtn} onPress={resetFilters}>
          <Text style={styles.emptyResetText}>Đặt Lại Tất Cả Bộ Lọc</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerArea}>
        {/* Wireframe Search Bar: [Search rooms...] */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tên phòng, lab, tòa nhà..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Multi-parameter Filter Chips matching wireframe [Filter v] */}
        <FilterChipBar onOpenFilterModal={() => setFilterModalVisible(true)} />

        {/* Results Counter Banner */}
        <View style={styles.resultsCountBar}>
          <Text style={styles.resultsCountText}>
            {rooms ? `${rooms.length} phòng học khả dụng trong campus` : 'Đang tìm kiếm...'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* 60fps Optimized FlatList */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoomItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />

      {/* Loading overlay for initial fetch */}
      {isLoading && (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
        </View>
      )}

      {/* Multi-parameter Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 30,
  },
  headerArea: {
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: Colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  resultsCountBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerLoading: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyResetBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyResetText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
