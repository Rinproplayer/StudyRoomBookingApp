export interface TimeSlot {
  id: string; // e.g. "08:00-09:30"
  startTime: string; // "08:00"
  endTime: string;   // "09:30"
  isBooked: boolean;
  bookedByStudentId?: string;
}

export type BookingStatus = 'Pending' | 'Upcoming' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  roomPhoto: string;
  building: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  startTime: string;
  endTime: string;
  studentId: string;
  studentName: string;
  purpose: string;
  status: BookingStatus;
  createdAt: string;
  checkInCode: string;
}

export interface CreateBookingPayload {
  roomId: string;
  date: string;
  slotId: string;
  studentId: string;
  studentName: string;
  purpose: string;
}
