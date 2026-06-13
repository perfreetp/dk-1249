import { create } from 'zustand';
import { Course, LessonTarget } from '../types';
import { storage } from '../utils/storage';

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
  courses: storage.get('courses', []),

  currentCourse: null,

  setCurrentCourse: (course) => set({ currentCourse: course }),

  addCourse: (course) => {
    const newCourses = [...get().courses, course];
    storage.set('courses', newCourses);
    set({ courses: newCourses });
  },

  updateCourse: (id, updates) => {
    const newCourses = get().courses.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    storage.set('courses', newCourses);
    set({
      courses: newCourses,
      currentCourse: get().currentCourse?.id === id
        ? { ...get().currentCourse!, ...updates }
        : get().currentCourse
    });
  },

  deleteCourse: (id) => {
    const newCourses = get().courses.filter((c) => c.id !== id);
    storage.set('courses', newCourses);
    set({
      courses: newCourses,
      currentCourse: get().currentCourse?.id === id ? null : get().currentCourse
    });
  },

  getCourseById: (id) => get().courses.find((c) => c.id === id),

  getCoursesByPetId: (petId) => get().courses.filter((c) => c.petId === petId),

  updateLessonTarget: (courseId, lesson, achieved) => {
    const newCourses = get().courses.map((c) => {
      if (c.id !== courseId) return c;

      const updatedTargets = c.lessonTargets.map((t: LessonTarget) =>
        t.lesson === lesson ? { ...t, achieved } : t
      );

      return { ...c, lessonTargets: updatedTargets };
    });
    storage.set('courses', newCourses);
    set({ courses: newCourses });
  }
}));
