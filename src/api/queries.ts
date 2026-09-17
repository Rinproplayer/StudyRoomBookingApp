import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateBookingPayload } from '../types/booking';
import { Room, RoomFilterState } from '../types/room';
import { firestoreService } from '../services/firestoreService';

export const QUERY_KEYS = {
  rooms: (filters?: Partial<RoomFilterState>) => ['rooms', filters] as const,
  room: (id: string) => ['room', id] as const,
  slots: (roomId: string, date: string) => ['slots', roomId, date] as const,
  bookings: (studentId?: string) => ['bookings', studentId] as const,
  adminBookings: ['adminBookings'] as const,
};

export const useRoomsQuery = (filters?: Partial<RoomFilterState>) => {
  return useQuery({
    queryKey: QUERY_KEYS.rooms(filters),
    queryFn: () => firestoreService.getRooms(filters),
  });
};

export const useRoomDetailsQuery = (roomId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.room(roomId),
    queryFn: () => firestoreService.getRoomById(roomId),
    enabled: Boolean(roomId),
  });
};

export const useRoomSlotsQuery = (roomId: string, date: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.slots(roomId, date),
    queryFn: () => firestoreService.getRoomSlotsForDate(roomId, date),
    enabled: Boolean(roomId && date),
  });
};

export const useBookingsQuery = (studentId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookings(studentId),
    queryFn: () => firestoreService.getBookings(studentId),
  });
};

export const useAdminBookingsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.adminBookings,
    queryFn: () => firestoreService.getAllBookingsAdmin(),
  });
};

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => firestoreService.createBooking(payload),
    onSuccess: (_, variables) => {
      // Làm mới cache tức thời để phản ánh slot vừa được đặt
      queryClient.invalidateQueries({ queryKey: ['slots', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminBookings });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => firestoreService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminBookings });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

// Admin Mutations
export const useAddRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newRoom: Omit<Room, 'id'>) => firestoreService.addRoom(newRoom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useUpdateRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: Partial<Room> }) =>
      firestoreService.updateRoom(roomId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.room(variables.roomId) });
    },
  });
};

export const useDeleteRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => firestoreService.deleteRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
