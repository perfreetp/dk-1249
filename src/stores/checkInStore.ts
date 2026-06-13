import { create } from 'zustand';
import { CheckIn } from '../types';
import { storage } from '../utils/storage';

interface CheckInStore {
  checkIns: CheckIn[];
  addCheckIn: (checkIn: CheckIn) => void;
  updateCheckIn: (id: string, updates: Partial<CheckIn>) => void;
  getCheckInsByPetId: (petId: string) => CheckIn[];
  getTodayCheckIn: (petId: string) => CheckIn | undefined;
  getCheckInsByRecordId: (recordId: string) => CheckIn[];
}

export const useCheckInStore = create<CheckInStore>((set, get) => ({
  checkIns: storage.get('checkIns', []),

  addCheckIn: (checkIn) => {
    const newCheckIns = [...get().checkIns, checkIn];
    storage.set('checkIns', newCheckIns);
    set({ checkIns: newCheckIns });
  },

  updateCheckIn: (id, updates) => {
    const newCheckIns = get().checkIns.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    storage.set('checkIns', newCheckIns);
    set({ checkIns: newCheckIns });
  },

  getCheckInsByPetId: (petId) => get().checkIns.filter((c) => c.petId === petId),

  getTodayCheckIn: (petId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().checkIns.find((c) => {
      const checkInDate = new Date(c.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);
      return c.petId === petId && checkInDate.getTime() === today.getTime();
    });
  },

  getCheckInsByRecordId: (recordId) =>
    get().checkIns.filter((c) => c.recordId === recordId)
}));
