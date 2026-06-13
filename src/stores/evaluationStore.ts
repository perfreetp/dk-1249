import { create } from 'zustand';
import { Evaluation } from '../types';
import { mockEvaluations } from '../data/mockData';

interface EvaluationStore {
  evaluations: Evaluation[];
  addEvaluation: (evaluation: Evaluation) => void;
  getEvaluationsByPetId: (petId: string) => Evaluation[];
  getLatestEvaluation: (petId: string) => Evaluation | undefined;
  getEvaluationByCourseId: (courseId: string) => Evaluation | undefined;
  getTrend: (petId: string, dimension: keyof Omit<Evaluation, 'id' | 'petId' | 'courseId' | 'overallScore' | 'comment' | 'improvement' | 'evaluatedAt'>) => number[];
}

export const useEvaluationStore = create<EvaluationStore>((set, get) => ({
  evaluations: mockEvaluations,

  addEvaluation: (evaluation) => set((state) => ({
    evaluations: [...state.evaluations, evaluation]
  })),

  getEvaluationsByPetId: (petId) =>
    get().evaluations.filter((e) => e.petId === petId).sort(
      (a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
    ),

  getLatestEvaluation: (petId) => {
    const petEvaluations = get().getEvaluationsByPetId(petId);
    return petEvaluations[0];
  },

  getEvaluationByCourseId: (courseId) =>
    get().evaluations.find((e) => e.courseId === courseId),

  getTrend: (petId, dimension) => {
    const petEvaluations = get().getEvaluationsByPetId(petId);
    return petEvaluations.map((e) => e[dimension] as number);
  }
}));
