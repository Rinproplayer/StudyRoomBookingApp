import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateBookingPayload } from '../types/booking';
import { RoomFilterState } from '../types/room';
import { bookingService } from './bookingService';
import { roomService } from './roomService';

export const QUERY_KEYS = {
  rooms: (filters?: Partial<RoomFilterState>) => ['rooms', filters] as const,
  room: (id: string) => ['room', id] as const,
  slots: (roomId: string, date: string) => ['slots', roomId, date] as const,
  bookings: (studentId?: string) => ['bookings', studentId] as const,
};

export const useRoomsQuery = (filters?: Partial<RoomFilterState>) => {
  return useQuery({
    queryKey: QUERY_KEYS.rooms(filters),
    queryFn: () => roomService.getRooms(filters),
  });
};

export const useRoomDetailsQuery = (roomId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.room(roomId),
    queryFn: () => roomService.getRoomById(roomId),
    enabled: Boolean(roomId),
  });
};

export const useRoomSlotsQuery = (roomId: string, date: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.slots(roomId, date),
    queryFn: () => bookingService.getRoomSlotsForDate(roomId, date),
    enabled: Boolean(roomId && date),
  });
};

export const useBookingsQuery = (studentId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookings(studentId),
    queryFn: () => bookingService.getBookings(studentId),
  });
};

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingService.createBooking(payload),
    onSuccess: (_, variables) => {
      // Invalidate relevant query caches to immediately reflect booked slot
      queryClient.invalidateQueries({ queryKey: ['slots', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
