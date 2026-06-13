import { Pet, Course, TrainingRecord, CheckIn, Evaluation, Message, Booking, User, CourseCategory, Temperament, ActionResult, RewardMethod, UserRole } from '../types';

export const mockTrainer: User = {
  id: 'trainer-001',
  name: '张教练',
  role: UserRole.TRAINER,
  phone: '13800138000',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trainer',
  createdAt: new Date('2024-01-01')
};

export const mockOwner: User = {
  id: 'owner-001',
  name: '李主人',
  role: UserRole.OWNER,
  phone: '13900139000',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner',
  createdAt: new Date('2024-01-01')
};

export const mockPets: Pet[] = [
  {
    id: 'pet-001',
    name: '豆豆',
    breed: '金毛',
    age: 2,
    weight: 30,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doudou',
    temperament: [Temperament.ACTIVE, Temperament.FRIENDLY],
    allergies: ['鸡肉'],
    contraindications: ['对大声响敏感', '不喜欢被摸爪子'],
    pastProblems: [
      { behavior: '扑人', startDate: '2024-01', status: 'improved', note: '已改善80%' },
      { behavior: '爆冲', startDate: '2024-02', status: 'improving', note: '正在矫正中' }
    ],
    healthNotes: '左后腿曾有轻微扭伤，已完全恢复',
    createdAt: new Date('2024-01-15')
  }
];

export const mockCourses: Course[] = [
  {
    id: 'course-001',
    petId: 'pet-001',
    trainerId: 'trainer-001',
    name: '基础服从训练',
    category: CourseCategory.BASIC_OBEDIENCE,
    description: '建立基本听从指令的能力，包括坐、卧、停、等基础动作',
    totalLessons: 10,
    completedLessons: 3,
    lessonTargets: [
      { lesson: 1, target: '完成坐指令学习', achieved: true },
      { lesson: 2, target: '完成卧指令学习', achieved: true },
      { lesson: 3, target: '完成停留指令学习', achieved: true },
      { lesson: 4, target: '建立召回能力', achieved: false },
      { lesson: 5, target: '完成随行训练', achieved: false }
    ],
    status: 'active',
    createdAt: new Date('2024-02-01')
  },
  {
    id: 'course-002',
    petId: 'pet-001',
    trainerId: 'trainer-001',
    name: '社交脱敏训练',
    category: CourseCategory.SOCIAL_DESENSITIZATION,
    description: '让狗狗适应各种社交环境，减少焦虑和恐惧',
    totalLessons: 8,
    completedLessons: 1,
    lessonTargets: [
      { lesson: 1, target: '适应公园环境', achieved: true },
      { lesson: 2, target: '接触陌生人', achieved: false }
    ],
    status: 'active',
    createdAt: new Date('2024-02-15')
  },
  {
    id: 'course-003',
    petId: 'pet-001',
    trainerId: 'trainer-001',
    name: '笼内训练',
    category: CourseCategory.CRATE_TRAINING,
    description: '让狗狗舒适地待在笼子里，减少分离焦虑',
    totalLessons: 6,
    completedLessons: 0,
    lessonTargets: [
      { lesson: 1, target: '接受笼子', achieved: false },
      { lesson: 2, target: '在笼内安静休息', achieved: false }
    ],
    status: 'active',
    createdAt: new Date('2024-03-01')
  }
];

export const mockTrainingRecords: TrainingRecord[] = [
  {
    id: 'record-001',
    courseId: 'course-001',
    lessonNumber: 1,
    petId: 'pet-001',
    trainerId: 'trainer-001',
    recordDate: new Date('2024-03-01'),
    actionPerformance: [
      { action: '坐', result: ActionResult.EXCELLENT, attempts: 10, successes: 9 },
      { action: '卧', result: ActionResult.GOOD, attempts: 10, successes: 8 },
      { action: '停', result: ActionResult.GOOD, attempts: 8, successes: 6 }
    ],
    rewardMethod: [RewardMethod.TREAT, RewardMethod.VERBAL],
    problemBehaviors: ['注意力不够集中', '偶尔爆冲'],
    homework: '每天练习坐、卧指令各10次，奖励时多用口头表扬',
    homeworkDue: new Date('2024-03-03'),
    notes: '豆豆今天表现很棒，学习速度很快'
  },
  {
    id: 'record-002',
    courseId: 'course-001',
    lessonNumber: 2,
    petId: 'pet-001',
    trainerId: 'trainer-001',
    recordDate: new Date('2024-03-08'),
    actionPerformance: [
      { action: '坐', result: ActionResult.EXCELLENT, attempts: 10, successes: 10 },
      { action: '卧', result: ActionResult.EXCELLENT, attempts: 10, successes: 9 },
      { action: '停', result: ActionResult.GOOD, attempts: 10, successes: 8 }
    ],
    rewardMethod: [RewardMethod.TREAT, RewardMethod.TOY],
    problemBehaviors: [],
    homework: '复习坐、卧指令，尝试在有干扰的环境中练习',
    homeworkDue: new Date('2024-03-10'),
    notes: '进步明显，可以尝试增加干扰项'
  },
  {
    id: 'record-003',
    courseId: 'course-001',
    lessonNumber: 3,
    petId: 'pet-001',
    trainerId: 'trainer-001',
    recordDate: new Date('2024-03-15'),
    actionPerformance: [
      { action: '坐', result: ActionResult.EXCELLENT, attempts: 10, successes: 10 },
      { action: '卧', result: ActionResult.EXCELLENT, attempts: 10, successes: 10 },
      { action: '停', result: ActionResult.EXCELLENT, attempts: 10, successes: 9 },
      { action: '停留', result: ActionResult.GOOD, attempts: 8, successes: 6 }
    ],
    rewardMethod: [RewardMethod.TREAT, RewardMethod.VERBAL, RewardMethod.PETTING],
    problemBehaviors: [],
    homework: '加强停留指令练习，从3秒逐步延长到10秒',
    homeworkDue: new Date('2024-03-17'),
    notes: '基础指令掌握良好，可以开始学习召回'
  }
];

export const mockCheckIns: CheckIn[] = [
  {
    id: 'checkin-001',
    petId: 'pet-001',
    recordId: 'record-001',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnailUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=checkin1',
    completionRate: 85,
    notes: '豆豆今天练习很认真',
    checkInDate: new Date('2024-03-02')
  },
  {
    id: 'checkin-002',
    petId: 'pet-001',
    recordId: 'record-001',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnailUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=checkin2',
    completionRate: 90,
    notes: '在院子里练习的，干扰比较多',
    checkInDate: new Date('2024-03-03')
  },
  {
    id: 'checkin-003',
    petId: 'pet-001',
    recordId: 'record-002',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnailUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=checkin3',
    completionRate: 95,
    notes: '带豆豆去了公园练习社交',
    checkInDate: new Date('2024-03-09')
  }
];

export const mockEvaluations: Evaluation[] = [
  {
    id: 'eval-001',
    petId: 'pet-001',
    courseId: 'course-001',
    reactionSpeed: 85,
    stability: 75,
    focus: 70,
    obedience: 90,
    antiInterference: 60,
    overallScore: 76,
    comment: '豆豆对指令的反应很迅速，学习能力强。稳定性方面还有提升空间，容易受外界干扰影响。建议加强在复杂环境中的训练。',
    improvement: ['增加抗干扰训练', '延长停留时间', '多环境练习'],
    evaluatedAt: new Date('2024-03-01')
  },
  {
    id: 'eval-002',
    petId: 'pet-001',
    courseId: 'course-001',
    reactionSpeed: 90,
    stability: 82,
    focus: 78,
    obedience: 95,
    antiInterference: 70,
    overallScore: 83,
    comment: '进步明显！豆豆的服从性大幅提升，指令反应速度更快。稳定性也有改善，继续保持。',
    improvement: ['可以开始学习新指令', '增加训练时长', '尝试敏捷训练'],
    evaluatedAt: new Date('2024-03-15')
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg-001',
    senderId: 'trainer-001',
    senderType: 'trainer',
    receiverId: 'owner-001',
    type: 'comment',
    title: '课程点评',
    content: '豆豆今天表现很棒！坐指令的成功率达到了90%，比上次有很大进步。继续加油，每天坚持练习！',
    attachments: [],
    isRead: true,
    sentAt: new Date('2024-03-15 16:30')
  },
  {
    id: 'msg-002',
    senderId: 'system',
    senderType: 'system',
    receiverId: 'owner-001',
    type: 'notification',
    title: '预约确认',
    content: '您预约的课程已确认：3月20日 10:00 基础服从训练课程',
    attachments: [],
    isRead: true,
    sentAt: new Date('2024-03-15 18:00')
  },
  {
    id: 'msg-003',
    senderId: 'trainer-001',
    senderType: 'trainer',
    receiverId: 'owner-001',
    type: 'comment',
    title: '作业提醒',
    content: '别忘了今天的家庭作业哦！记得练习停留指令，从3秒开始逐步延长。有问题随时问我！',
    attachments: [],
    isRead: false,
    sentAt: new Date('2024-03-16 09:00')
  },
  {
    id: 'msg-004',
    senderId: 'system',
    senderType: 'system',
    receiverId: 'owner-001',
    type: 'notification',
    title: '打卡提醒',
    content: '您今天的打卡任务还未完成，记得上传练习视频哦！',
    attachments: [],
    isRead: false,
    sentAt: new Date('2024-03-16 19:00')
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    petId: 'pet-001',
    trainerId: 'trainer-001',
    courseId: 'course-001',
    scheduledDate: new Date('2024-03-20'),
    scheduledTime: '10:00',
    status: 'confirmed',
    notes: '复习基础指令，学习召回',
    createdAt: new Date('2024-03-15')
  },
  {
    id: 'booking-002',
    petId: 'pet-001',
    trainerId: 'trainer-001',
    courseId: 'course-001',
    scheduledDate: new Date('2024-03-27'),
    scheduledTime: '10:00',
    status: 'pending',
    notes: '继续学习新指令',
    createdAt: new Date('2024-03-20')
  }
];
