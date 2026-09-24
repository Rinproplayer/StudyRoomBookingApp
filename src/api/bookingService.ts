import { Booking, CreateBookingPayload, TimeSlot } from '../types/booking';
import { INITIAL_BOOKINGS, STANDARD_TIME_SLOTS } from './mockData';
import { roomService } from './roomService';

import { isBookingPast } from '../services/firestoreService';

let bookingsDatabase: Booking[] = [...INITIAL_BOOKINGS];

export const bookingService = {
  getBookings: async (studentId?: string): Promise<Booking[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const list = bookingsDatabase.map((b) => {
      if (b.status !== 'Cancelled' && isBookingPast(b.date, b.endTime)) {
        return { ...b, status: 'Completed' as const };
      }
      return b;
    });
    if (studentId) {
      return list.filter((b) => b.studentId === studentId);
    }
    return [...list];
  },

  getRoomSlotsForDate: async (roomId: string, date: string): Promise<TimeSlot[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Active bookings on that date for that room (Pending or Upcoming, not past)
    const activeBookingsOnDate = bookingsDatabase.filter(
      (b) =>
        b.roomId === roomId &&
        b.date === date &&
        (b.status === 'Upcoming' || b.status === 'Pending') &&
        !isBookingPast(b.date, b.endTime)
    );

    return STANDARD_TIME_SLOTS.map((slot) => {
      const matchingBooking = activeBookingsOnDate.find((b) => b.slotId === slot.id);
      return {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: !!matchingBooking,
        bookedByStudentId: matchingBooking?.studentId,
      };
    });
  },

  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Conflict Check 1: Is this room already booked during this date and time slot?
    const roomConflict = bookingsDatabase.some(
      (b) =>
        b.roomId === payload.roomId &&
        b.date === payload.date &&
        b.slotId === payload.slotId &&
        (b.status === 'Upcoming' || b.status === 'Pending') &&
        !isBookingPast(b.date, b.endTime)
    );

    if (roomConflict) {
      throw new Error(
        'Khung giờ này vừa được người khác đặt hoặc đã có lịch trùng. Vui lòng chọn khung giờ khác!'
      );
    }

    // Conflict Check 2: Does this student already have a booking for the same time slot on this date?
    const studentConflict = bookingsDatabase.some(
      (b) =>
        b.studentId === payload.studentId &&
        b.date === payload.date &&
        b.slotId === payload.slotId &&
        (b.status === 'Upcoming' || b.status === 'Pending') &&
        !isBookingPast(b.date, b.endTime)
    );

    if (studentConflict) {
      throw new Error(
        'Bạn đã có một lịch đặt phòng khác trong cùng khung giờ này. Không thể đặt trùng giờ!'
      );
    }

    const room = await roomService.getRoomById(payload.roomId);
    if (!room) {
      throw new Error('Phòng không tồn tại.');
    }

    const slot = STANDARD_TIME_SLOTS.find((s) => s.id === payload.slotId);
    if (!slot) {
      throw new Error('Khung giờ không hợp lệ.');
    }

    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
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
      purpose: payload.purpose || 'Group Study & Research',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      checkInCode: `SRB-${randomPin}`,
    };

    bookingsDatabase = [newBooking, ...bookingsDatabase];

    return newBooking;
  },

  cancelBooking: async (bookingId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = bookingsDatabase.findIndex((b) => b.id === bookingId);
    if (index === -1) {
      throw new Error('Không tìm thấy lịch đặt phòng.');
    }

    bookingsDatabase[index] = {
      ...bookingsDatabase[index],
      status: 'Cancelled',
    };

    return true;
  },

  approveBooking: async (bookingId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = bookingsDatabase.findIndex((b) => b.id === bookingId);
    if (index === -1) {
      throw new Error('Không tìm thấy lịch đặt phòng.');
    }

    bookingsDatabase[index] = {
      ...bookingsDatabase[index],
      status: 'Upcoming',
    };

    return true;
  },

  deleteBookingAdmin: async (bookingId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    bookingsDatabase = bookingsDatabase.filter((b) => b.id !== bookingId);
    return true;
  },
};
