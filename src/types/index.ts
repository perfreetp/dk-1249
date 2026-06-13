export enum Temperament {
  ACTIVE = '活泼',
  CALM = '安静',
  TIMID = '胆小',
  STUBBORN = '固执',
  FRIENDLY = '友善',
  INDEPENDENT = '独立'
}

export enum CourseCategory {
  BASIC_OBEDIENCE = '基础服从',
  SOCIAL_DESENSITIZATION = '社交脱敏',
  CRATE_TRAINING = '笼内训练',
  AGILITY = '敏捷训练',
  BEHAVIOR_CORRECTION = '行为纠正'
}

export enum ActionResult {
  EXCELLENT = '优秀',
  GOOD = '良好',
  AVERAGE = '一般',
  NEEDS_IMPROVEMENT = '需改进'
}

export enum RewardMethod {
  TREAT = '零食奖励',
  VERBAL = '口头表扬',
  TOY = '玩具互动',
  PETTING = '抚摸奖励'
}

export enum UserRole {
  TRAINER = 'trainer',
  OWNER = 'owner'
}

export interface ProblemRecord {
  behavior: string;
  startDate: string;
  status: 'improving' | 'improved' | 'persistent';
  note: string;
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  avatar: string;
  temperament: Temperament[];
  allergies: string[];
  contraindications: string[];
  pastProblems: ProblemRecord[];
  healthNotes: string;
  createdAt: Date;
}

export interface LessonTarget {
  lesson: number;
  target: string;
  achieved: boolean;
}

export interface Course {
  id: string;
  petId: string;
  trainerId: string;
  name: string;
  category: CourseCategory;
  description: string;
  totalLessons: number;
  completedLessons: number;
  lessonTargets: LessonTarget[];
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
}

export interface ActionRecord {
  action: string;
  result: ActionResult;
  attempts: number;
  successes: number;
}

export interface TrainingRecord {
  id: string;
  courseId: string;
  lessonNumber: number;
  petId: string;
  trainerId: string;
  recordDate: Date;
  actionPerformance: ActionRecord[];
  rewardMethod: RewardMethod[];
  problemBehaviors: string[];
  homework: string;
  homeworkDue: Date;
  notes: string;
}

export interface HomeworkTask {
  id: string;
  recordId: string;
  courseId: string;
  lessonNumber: number;
  petId: string;
  content: string;
  dueDate: Date;
  status: 'pending' | 'completed';
  completedAt?: Date;
  checkInId?: string;
}

export interface CheckIn {
  id: string;
  petId: string;
  recordId: string;
  videoUrl: string;
  thumbnailUrl: string;
  completionRate: number;
  notes: string;
  checkInDate: Date;
}

export interface Evaluation {
  id: string;
  petId: string;
  courseId: string;
  reactionSpeed: number;
  stability: number;
  focus: number;
  obedience: number;
  antiInterference: number;
  overallScore: number;
  comment: string;
  improvement: string[];
  evaluatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderType: 'trainer' | 'owner' | 'system';
  receiverId: string;
  type: 'comment' | 'notification' | 'booking' | 'report';
  title: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  sentAt: Date;
}

export interface Booking {
  id: string;
  petId: string;
  trainerId: string;
  courseId: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar: string;
  createdAt: Date;
}
