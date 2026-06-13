import { create } from 'zustand';
import { HomeworkTask } from '../types';
import { storage } from '../utils/storage';

interface HomeworkTaskStore {
  tasks: HomeworkTask[];
  addTask: (task: HomeworkTask) => void;
  updateTask: (id: string, updates: Partial<HomeworkTask>) => void;
  completeTask: (id: string, checkInId: string) => void;
  getTasksByPetId: (petId: string) => HomeworkTask[];
  getPendingTasks: (petId: string) => HomeworkTask[];
  getTaskByRecordId: (recordId: string) => HomeworkTask | undefined;
  getTasksByCourseId: (courseId: string) => HomeworkTask[];
}

export const useHomeworkTaskStore = create<HomeworkTaskStore>((set, get) => ({
  tasks: storage.get('homeworkTasks', []),

  addTask: (task) => {
    const newTasks = [...get().tasks, task];
    storage.set('homeworkTasks', newTasks);
    set({ tasks: newTasks });
  },

  updateTask: (id, updates) => {
    const newTasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    storage.set('homeworkTasks', newTasks);
    set({ tasks: newTasks });
  },

  completeTask: (id, checkInId) => {
    const newTasks = get().tasks.map((t) =>
      t.id === id
        ? { ...t, status: 'completed' as const, completedAt: new Date(), checkInId }
        : t
    );
    storage.set('homeworkTasks', newTasks);
    set({ tasks: newTasks });
  },

  getTasksByPetId: (petId) =>
    get().tasks.filter((t) => t.petId === petId),

  getPendingTasks: (petId) =>
    get().tasks
      .filter((t) => t.petId === petId && t.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),

  getTaskByRecordId: (recordId) =>
    get().tasks.find((t) => t.recordId === recordId),

  getTasksByCourseId: (courseId) =>
    get().tasks.filter((t) => t.courseId === courseId)
}));
