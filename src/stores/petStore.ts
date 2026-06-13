import { create } from 'zustand';
import { Pet } from '../types';
import { mockPets } from '../data/mockData';

interface PetStore {
  pets: Pet[];
  currentPet: Pet | null;
  setCurrentPet: (pet: Pet | null) => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  getPetById: (id: string) => Pet | undefined;
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: mockPets,
  currentPet: mockPets[0] || null,

  setCurrentPet: (pet) => set({ currentPet: pet }),

  addPet: (pet) => set((state) => ({
    pets: [...state.pets, pet]
  })),

  updatePet: (id, updates) => set((state) => ({
    pets: state.pets.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
    currentPet: state.currentPet?.id === id
      ? { ...state.currentPet, ...updates }
      : state.currentPet
  })),

  getPetById: (id) => get().pets.find((p) => p.id === id)
}));
