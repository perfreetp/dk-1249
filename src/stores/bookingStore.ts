import { create } from 'zustand';
import { Booking } from '../types';
import { mockBookings } from '../data/mockData';

interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  getBookingsByPetId: (petId: string) => Booking[];
  getUpcomingBooking: (petId: string) => Booking | undefined;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: mockBookings,

  addBooking: (booking) => set((state) => ({
    bookings: [...state.bookings, booking].sort(
      (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    )
  })),

  updateBooking: (id, updates) => set((state) => ({
    bookings: state.bookings.map((b) =>
      b.id === id ? { ...b, ...updates } : b
    )
  })),

  cancelBooking: (id) => set((state) => ({
    bookings: state.bookings.map((b) =>
      b.id === id ? { ...b, status: 'cancelled' as const } : b
    )
  })),

  getBookingsByPetId: (petId) =>
    get().bookings.filter((b) => b.petId === petId),

  getUpcomingBooking: (petId) => {
    const now = new Date();
    const petBookings = get().getBookingsByPetId(petId);
    return petBookings.find((b) => {
      const bookingDate = new Date(b.scheduledDate);
      return bookingDate >= now && b.status !== 'cancelled';
    });
  }
}));
