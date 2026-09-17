import { Room, RoomFilterState } from '../types/room';
import { INITIAL_ROOMS } from './mockData';

// In-memory mock room store
let roomsDatabase: Room[] = [...INITIAL_ROOMS];

export const roomService = {
  getRooms: async (filters?: Partial<RoomFilterState>): Promise<Room[]> => {
    // Simulate brief network delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    let result = [...roomsDatabase];

    if (!filters) return result;

    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.building.toLowerCase().includes(q) ||
          r.floor.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    if (filters.selectedBuilding && filters.selectedBuilding !== 'Tất cả') {
      result = result.filter((r) => r.building === filters.selectedBuilding);
    }

    if (filters.minCapacity && filters.minCapacity > 0) {
      result = result.filter((r) => r.capacity >= filters.minCapacity!);
    }

    if (filters.availableOnly) {
      result = result.filter((r) => r.status === 'Available');
    }

    if (filters.selectedAmenities && filters.selectedAmenities.length > 0) {
      result = result.filter((r) =>
        filters.selectedAmenities!.every((amenity) => r.amenities.includes(amenity))
      );
    }

    return result;
  },

  getRoomById: async (id: string): Promise<Room | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return roomsDatabase.find((r) => r.id === id);
  },

  updateRoomStatus: (roomId: string, status: Room['status']) => {
    roomsDatabase = roomsDatabase.map((r) =>
      r.id === roomId ? { ...r, status } : r
    );
  },
};
