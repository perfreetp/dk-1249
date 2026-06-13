import { create } from 'zustand';
import { Course, LessonTarget } from '../types';
import { mockCourses } from '../data/mockData';

interface CourseStore {
  courses: Course[];
  currentCourse: Course | null;
  setCurrentCourse: (course: Course | null) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
  getCoursesByPetId: (petId: string) => Course[];
  updateLessonTarget: (courseId: string, lesson: number, achieved: boolean) => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: mockCourses,
  currentCourse: null,

  setCurrentCourse: (course) => set({ currentCourse: course }),

  addCourse: (course) => set((state) => ({
    courses: [...state.courses, course]
  })),

  updateCourse: (id, updates) => set((state) => ({
    courses: state.courses.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
    currentCourse: state.currentCourse?.id === id
      ? { ...state.currentCourse, ...updates }
      : state.currentCourse
  })),

  deleteCourse: (id) => set((state) => ({
    courses: state.courses.filter((c) => c.id !== id),
    currentCourse: state.currentCourse?.id === id ? null : state.currentCourse
  })),

  getCourseById: (id) => get().courses.find((c) => c.id === id),

  getCoursesByPetId: (petId) => get().courses.filter((c) => c.petId === petId),

  updateLessonTarget: (courseId, lesson, achieved) => set((state) => ({
    courses: state.courses.map((c) => {
      if (c.id !== courseId) return c;

      const updatedTargets = c.lessonTargets.map((t: LessonTarget) =>
        t.lesson === lesson ? { ...t, achieved } : t
      );

      return { ...c, lessonTargets: updatedTargets };
    })
  }))
}));
