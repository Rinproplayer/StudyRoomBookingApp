export type Building =
  | 'Tất cả'
  | 'Tòa nhà A3'
  | 'Thư viện Trung tâm'
  | 'Khu Công nghệ'
  | 'Giảng đường Khoa học'
  | 'Không gian Sáng tạo';

export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';

export type Amenity =
  | 'Wi-Fi tốc độ cao'
  | 'Bảng viết dạ'
  | 'Máy chiếu 4K'
  | 'Ổ cắm điện đa năng'
  | 'Điều hòa không khí'
  | 'Phòng cách âm'
  | 'Màn hình kép'
  | 'Thiết bị họp trực tuyến';

export interface Room {
  id: string;
  name: string;
  building: Building;
  floor: string;
  capacity: number;
  status: RoomStatus;
  photoUrl: string;
  description: string;
  amenities: Amenity[];
  hourlyRate?: number;
  rating: number;
  noiseLevel: 'Yên tĩnh tuyệt đối' | 'Yên tĩnh' | 'Thảo luận nhóm';
}

export interface RoomFilterState {
  searchQuery: string;
  selectedBuilding: Building;
  minCapacity: number;
  availableOnly: boolean;
  selectedAmenities: Amenity[];
}
