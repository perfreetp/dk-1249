import { create } from 'zustand';
import { Booking } from '../types';
import { storage } from '../utils/storage';

interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  getBookingsByPetId: (petId: string) => Booking[];
  getUpcomingBooking: (petId: string) => Booking | undefined;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: storage.get('bookings', []),

  addBooking: (booking) => {
    const newBookings = [...get().bookings, booking].sort(
      (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
    storage.set('bookings', newBookings);
    set({ bookings: newBookings });
  },

  updateBooking: (id, updates) => {
    const newBookings = get().bookings.map((b) =>
      b.id === id ? { ...b, ...updates } : b
    );
    storage.set('bookings', newBookings);
    set({ bookings: newBookings });
  },

  cancelBooking: (id) => {
    const newBookings = get().bookings.map((b) =>
      b.id === id ? { ...b, status: 'cancelled' as const } : b
    );
    storage.set('bookings', newBookings);
    set({ bookings: newBookings });
  },

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
