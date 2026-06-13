import { create } from 'zustand';
import { Pet } from '../types';
import { storage } from '../utils/storage';

interface PetStore {
  pets: Pet[];
  currentPet: Pet | null;
  setCurrentPet: (pet: Pet | null) => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  getPetById: (id: string) => Pet | undefined;
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: storage.get('pets', []),
  currentPet: storage.get('currentPet', null),

  setCurrentPet: (pet) => {
    storage.set('currentPet', pet);
    set({ currentPet: pet });
  },

  addPet: (pet) => {
    const newPets = [...get().pets, pet];
    storage.set('pets', newPets);
    set({ pets: newPets });
  },

  updatePet: (id, updates) => {
    const newPets = get().pets.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    storage.set('pets', newPets);
    set({
      pets: newPets,
      currentPet: get().currentPet?.id === id
        ? { ...get().currentPet!, ...updates }
        : get().currentPet
    });
  },

  getPetById: (id) => get().pets.find((p) => p.id === id)
}));
