import { create } from 'zustand';
import { TrainingRecord } from '../types';
import { mockTrainingRecords } from '../data/mockData';

interface TrainingRecordStore {
  records: TrainingRecord[];
  addRecord: (record: TrainingRecord) => void;
  updateRecord: (id: string, updates: Partial<TrainingRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordsByCourseId: (courseId: string) => TrainingRecord[];
  getRecordById: (id: string) => TrainingRecord | undefined;
  getLatestRecordByCourseId: (courseId: string) => TrainingRecord | undefined;
}

export const useTrainingRecordStore = create<TrainingRecordStore>((set, get) => ({
  records: mockTrainingRecords,

  addRecord: (record) => set((state) => ({
    records: [...state.records, record].sort(
      (a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
    )
  })),

  updateRecord: (id, updates) => set((state) => ({
    records: state.records.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    )
  })),

  deleteRecord: (id) => set((state) => ({
    records: state.records.filter((r) => r.id !== id)
  })),

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
