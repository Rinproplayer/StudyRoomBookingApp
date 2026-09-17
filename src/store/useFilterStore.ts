import { create } from 'zustand';
import { Amenity, Building } from '../types/room';

interface FilterState {
  searchQuery: string;
  selectedBuilding: Building;
  minCapacity: number; // 0: bất kỳ
  availableOnly: boolean;
  selectedAmenities: Amenity[];

  setSearchQuery: (query: string) => void;
  setSelectedBuilding: (building: Building) => void;
  setMinCapacity: (cap: number) => void;
  setAvailableOnly: (val: boolean) => void;
  toggleAvailableOnly: () => void;
  toggleAmenity: (amenity: Amenity) => void;
  resetFilters: () => void;
  getActiveFilterCount: () => number;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  searchQuery: '',
  selectedBuilding: 'Tất cả',
  minCapacity: 0,
  availableOnly: false,
  selectedAmenities: [],

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
  setMinCapacity: (minCapacity) => set({ minCapacity }),
  setAvailableOnly: (availableOnly) => set({ availableOnly }),
  toggleAvailableOnly: () => set((state) => ({ availableOnly: !state.availableOnly })),

  toggleAmenity: (amenity) =>
    set((state) => {
      const exists = state.selectedAmenities.includes(amenity);
      return {
        selectedAmenities: exists
          ? state.selectedAmenities.filter((a) => a !== amenity)
          : [...state.selectedAmenities, amenity],
      };
    }),

  resetFilters: () =>
    set({
      searchQuery: '',
      selectedBuilding: 'Tất cả',
      minCapacity: 0,
      availableOnly: false,
      selectedAmenities: [],
    }),

  getActiveFilterCount: () => {
    const s = get();
    let count = 0;
    if (s.selectedBuilding !== 'Tất cả') count++;
    if (s.minCapacity > 0) count++;
    if (s.availableOnly) count++;
    count += s.selectedAmenities.length;
    return count;
  },
}));
