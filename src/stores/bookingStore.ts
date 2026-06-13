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
  getBookingsByDate: (petId: string, date: Date) => Booking[];
  getWeekBookings: (petId: string, weekStart: Date) => Booking[];
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
    const validBookings = petBookings.filter(b => b.status !== 'cancelled');

    if (validBookings.length === 0) return undefined;

    let nearestBooking: Booking | undefined;
    let nearestTime = Infinity;

    for (const booking of validBookings) {
      const bookingDate = new Date(booking.scheduledDate);
      const [hours, minutes] = booking.scheduledTime.split(':').map(Number);
      bookingDate.setHours(hours, minutes, 0, 0);

      const timeDiff = bookingDate.getTime() - now.getTime();
      if (timeDiff >= 0 && timeDiff < nearestTime) {
        nearestTime = timeDiff;
        nearestBooking = booking;
      }
    }

    return nearestBooking;
  },

  getBookingsByDate: (petId, date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return get().bookings
      .filter((b) => {
        const bookingDate = new Date(b.scheduledDate);
        return b.petId === petId && bookingDate >= startOfDay && bookingDate <= endOfDay;
      })
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  },

  getWeekBookings: (petId, weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return get().bookings
      .filter((b) => {
        const bookingDate = new Date(b.scheduledDate);
        return b.petId === petId && bookingDate >= weekStart && bookingDate < weekEnd;
      })
      .sort((a, b) => {
        const dateCompare = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
  }
}));
