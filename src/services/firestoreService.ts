import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Room, RoomFilterState } from '../types/room';
import { Booking, CreateBookingPayload, TimeSlot } from '../types/booking';
import { INITIAL_ROOMS, STANDARD_TIME_SLOTS } from '../api/mockData';
import { UserProfile, UserRole } from '../store/useUserStore';

const ROOMS_COLLECTION = 'rooms';
const BOOKINGS_COLLECTION = 'bookings';
const USERS_COLLECTION = 'users';

let hasCheckedSeed = false;

// Tự động nạp danh sách 8 phòng mẫu lên Firestore nếu database chưa có
async function ensureSeedRooms() {
  if (hasCheckedSeed) return;
  try {
    const roomsCol = collection(db, ROOMS_COLLECTION);
    const snap = await getDocs(roomsCol);
    if (snap.empty) {
      console.log('--- Đang khởi tạo dữ liệu phòng mẫu lên Firestore ---');
      const batch = writeBatch(db);
      for (const room of INITIAL_ROOMS) {
        const ref = doc(roomsCol, room.id);
        batch.set(ref, room);
      }
      await batch.commit();
      console.log('✅ Đã nạp thành công các phòng mẫu lên Cloud Firestore!');
    }
    hasCheckedSeed = true;
  } catch (err) {
    console.error('Lỗi khi kiểm tra seed dữ liệu phòng:', err);
  }
}

// Kiểm tra xem lịch đặt đã kết thúc trong quá khứ chưa
export function isBookingPast(dateStr: string, endTimeStr: string): boolean {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = endTimeStr.split(':').map(Number);
    const bookingEndTime = new Date(year, month - 1, day, hours, minutes);
    return bookingEndTime.getTime() <= Date.now();
  } catch {
    return false;
  }
}

export const firestoreService = {
  // Lấy danh sách phòng từ Firestore & lọc theo tiêu chí
  getRooms: async (filters?: Partial<RoomFilterState>): Promise<Room[]> => {
    await ensureSeedRooms();
    const snap = await getDocs(collection(db, ROOMS_COLLECTION));
    let result: Room[] = snap.docs.map((d) => ({
      ...(d.data() as Room),
      id: d.id,
    }));

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
        filters.selectedAmenities!.every((amenity) => r.amenities?.includes(amenity))
      );
    }

    return result;
  },

  getRoomById: async (id: string): Promise<Room | undefined> => {
    await ensureSeedRooms();
    const d = await getDoc(doc(db, ROOMS_COLLECTION, id));
    if (!d.exists()) return undefined;
    return { ...(d.data() as Room), id: d.id };
  },

  // Admin: Thêm phòng mới vào Firestore
  addRoom: async (newRoom: Omit<Room, 'id'>): Promise<Room> => {
    const docRef = await addDoc(collection(db, ROOMS_COLLECTION), newRoom);
    return { ...newRoom, id: docRef.id };
  },

  // Admin: Cập nhật thông tin / trạng thái phòng trên Firestore
  updateRoom: async (roomId: string, partial: Partial<Room>): Promise<void> => {
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), partial);
  },

  // Admin: Xóa phòng khỏi Firestore
  deleteRoom: async (roomId: string): Promise<void> => {
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
  },

  // Lấy các khung giờ và trạng thái đã đặt của phòng theo ngày từ Firestore
  getRoomSlotsForDate: async (roomId: string, date: string): Promise<TimeSlot[]> => {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('roomId', '==', roomId),
      where('date', '==', date)
    );

    const snap = await getDocs(q);
    const activeBookings = snap.docs
      .map((d) => {
        const data = d.data() as Booking;
        let status = data.status;
        if (status !== 'Cancelled' && isBookingPast(data.date, data.endTime)) {
          status = 'Completed';
          if (data.status !== 'Completed') {
            updateDoc(doc(db, BOOKINGS_COLLECTION, d.id), { status: 'Completed' }).catch(() => {});
          }
        }
        return { ...data, id: d.id, status };
      })
      .filter(
        (b) =>
          (b.status === 'Upcoming' || b.status === 'Pending') &&
          !isBookingPast(b.date, b.endTime)
      );

    return STANDARD_TIME_SLOTS.map((slot) => {
      const match = activeBookings.find((b) => b.slotId === slot.id);
      return {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: Boolean(match),
        bookedByStudentId: match?.studentId,
      };
    });
  },

  // Đặt phòng với kiểm tra xung đột trực tiếp trên Firestore (Conflict Prevention Engine)
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    // 1. Kiểm tra xem phòng và slot này đã có ai đặt chưa (Pending hoặc Upcoming)
    const roomConflictQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('roomId', '==', payload.roomId),
      where('date', '==', payload.date),
      where('slotId', '==', payload.slotId)
    );
    const roomConflictSnap = await getDocs(roomConflictQuery);
    const hasRoomConflict = roomConflictSnap.docs.some((d) => {
      const b = d.data() as Booking;
      return (
        (b.status === 'Upcoming' || b.status === 'Pending') &&
        !isBookingPast(b.date, b.endTime)
      );
    });
    if (hasRoomConflict) {
      throw new Error(
        'Khung giờ này vừa được người khác đặt trên hệ thống Cloud. Vui lòng chọn khung giờ khác!'
      );
    }

    // 2. Kiểm tra sinh viên có bị trùng lịch cá nhân không
    const studentConflictQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('studentId', '==', payload.studentId),
      where('date', '==', payload.date),
      where('slotId', '==', payload.slotId)
    );
    const studentConflictSnap = await getDocs(studentConflictQuery);
    const hasStudentConflict = studentConflictSnap.docs.some((d) => {
      const b = d.data() as Booking;
      return (
        (b.status === 'Upcoming' || b.status === 'Pending') &&
        !isBookingPast(b.date, b.endTime)
      );
    });
    if (hasStudentConflict) {
      throw new Error(
        'Bạn đã có một lịch đặt phòng khác trong cùng khung giờ này. Không thể đặt trùng giờ!'
      );
    }

    // Lấy thông tin phòng
    const roomDoc = await getDoc(doc(db, ROOMS_COLLECTION, payload.roomId));
    if (!roomDoc.exists()) {
      throw new Error('Phòng học không tồn tại trên hệ thống.');
    }
    const room = roomDoc.data() as Room;

    const slot = STANDARD_TIME_SLOTS.find((s) => s.id === payload.slotId);
    if (!slot) {
      throw new Error('Khung giờ không hợp lệ.');
    }

    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const bookingData: Omit<Booking, 'id'> = {
      roomId: payload.roomId,
      roomName: room.name,
      roomPhoto: room.photoUrl,
      building: room.building,
      date: payload.date,
      slotId: payload.slotId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      studentId: payload.studentId,
      studentName: payload.studentName,
      purpose: payload.purpose || 'Thảo luận nhóm & Tự học',
      status: 'Pending', // Ban đầu ở trạng thái Chờ Quản trị viên duyệt
      createdAt: new Date().toISOString(),
      checkInCode: `SRB-${randomPin}`,
    };

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingData);
    return { ...bookingData, id: docRef.id };
  },

  // Lấy lịch đặt của một sinh viên từ Firestore
  getBookings: async (studentId?: string): Promise<Booking[]> => {
    let q;
    if (studentId) {
      q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('studentId', '==', studentId)
      );
    } else {
      q = collection(db, BOOKINGS_COLLECTION);
    }

    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data() as Booking;
      let status = data.status;
      // Tự động chuyển các lịch đã quá giờ sang Hoàn thành (Đã học)
      if (status !== 'Cancelled' && isBookingPast(data.date, data.endTime)) {
        status = 'Completed';
        if (data.status !== 'Completed') {
          updateDoc(doc(db, BOOKINGS_COLLECTION, d.id), { status: 'Completed' }).catch(() => {});
        }
      }
      return {
        ...data,
        id: d.id,
        status,
      };
    });

    // Sắp xếp lịch mới nhất lên đầu
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Hủy đặt phòng trên Firestore
  cancelBooking: async (bookingId: string): Promise<boolean> => {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, { status: 'Cancelled' });
    return true;
  },

  // Admin: Phê duyệt (đồng ý) lịch đặt phòng
  approveBooking: async (bookingId: string): Promise<boolean> => {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, { status: 'Upcoming' });
    return true;
  },

  // Admin: Xóa vĩnh viễn lịch đặt phòng khỏi Firestore
  deleteBookingAdmin: async (bookingId: string): Promise<boolean> => {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await deleteDoc(bookingRef);
    return true;
  },

  // Admin: Lấy toàn bộ lịch đặt phòng trên toàn trường
  getAllBookingsAdmin: async (): Promise<Booking[]> => {
    const snap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    const list = snap.docs.map((d) => {
      const data = d.data() as Booking;
      let status = data.status;
      if (status !== 'Cancelled' && isBookingPast(data.date, data.endTime)) {
        status = 'Completed';
        if (data.status !== 'Completed') {
          updateDoc(doc(db, BOOKINGS_COLLECTION, d.id), { status: 'Completed' }).catch(() => {});
        }
      }
      return {
        ...data,
        id: d.id,
        status,
      };
    });
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Admin: Lấy danh sách toàn bộ người dùng trong hệ thống Firestore
  getAllUsersAdmin: async (): Promise<UserProfile[]> => {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map((d) => ({
      ...(d.data() as UserProfile),
      id: d.id,
    }));
  },

  // Admin: Cập nhật quyền của người dùng (Sinh viên <-> Admin)
  updateUserRoleAdmin: async (userId: string, role: UserRole): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      role,
      membershipTier: role === 'admin' ? 'Quản trị viên Campus' : 'Sinh viên Chính quy',
    });
  },

  // Admin: Xóa tài khoản người dùng khỏi hệ thống
  deleteUserAdmin: async (userId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  },
};
