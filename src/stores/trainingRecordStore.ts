import { create } from 'zustand';
import { TrainingRecord } from '../types';
import { storage } from '../utils/storage';

interface TrainingRecordStore {
  records: TrainingRecord[];
  addRecord: (record: TrainingRecord, isNew?: boolean) => void;
  updateRecord: (id: string, updates: Partial<TrainingRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordsByCourseId: (courseId: string) => TrainingRecord[];
  getRecordById: (id: string) => TrainingRecord | undefined;
  getLatestRecordByCourseId: (courseId: string) => TrainingRecord | undefined;
}

export const useTrainingRecordStore = create<TrainingRecordStore>((set, get) => ({
  records: storage.get('trainingRecords', []),

  addRecord: (record, isNew = true) => {
    const currentRecords = get().records;
    let newRecords: TrainingRecord[];

    if (isNew) {
      const exists = currentRecords.some(r => r.id === record.id);
      if (exists) {
        newRecords = currentRecords.map(r => r.id === record.id ? record : r);
      } else {
        newRecords = [record, ...currentRecords];
      }
    } else {
      const index = currentRecords.findIndex(r => r.id === record.id);
      if (index !== -1) {
        newRecords = [...currentRecords];
        newRecords[index] = record;
      } else {
        newRecords = [record, ...currentRecords];
      }
    }

    storage.set('trainingRecords', newRecords);
    set({ records: newRecords });
  },

  updateRecord: (id, updates) => {
    const newRecords = get().records.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    storage.set('trainingRecords', newRecords);
    set({ records: newRecords });
  },

  deleteRecord: (id) => {
    const newRecords = get().records.filter((r) => r.id !== id);
    storage.set('trainingRecords', newRecords);
    set({ records: newRecords });
  },

  getRecordsByCourseId: (courseId) =>
    get().records
      .filter((r) => r.courseId === courseId)
      .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()),

  getRecordById: (id) => get().records.find((r) => r.id === id),

  getLatestRecordByCourseId: (courseId) => {
    const courseRecords = get().getRecordsByCourseId(courseId);
    return courseRecords[0];
  }
}));
