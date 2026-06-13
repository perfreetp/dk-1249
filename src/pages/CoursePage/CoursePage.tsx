import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Target, ChevronRight, Clock, CheckCircle2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useCourseStore, usePetStore } from '../../stores';
import { CourseCategory, LessonTarget } from '../../types';

export default function CoursePage() {
  const navigate = useNavigate();
  const { courses, addCourse, getCoursesByPetId } = useCourseStore();
  const { currentPet } = usePetStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({
    name: '',
    category: CourseCategory.BASIC_OBEDIENCE,
    description: '',
    totalLessons: 5,
    lessonTargets: [] as { lesson: number; target: string }[]
  });

  const petCourses = currentPet ? getCoursesByPetId(currentPet.id) : [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case CourseCategory.BASIC_OBEDIENCE:
        return 'bg-primary/10 text-primary';
      case CourseCategory.SOCIAL_DESENSITIZATION:
        return 'bg-secondary/10 text-secondary';
      case CourseCategory.CRATE_TRAINING:
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getProgressPercentage = (course: typeof petCourses[0]) => {
    return Math.round((course.completedLessons / course.totalLessons) * 100);
  };

  const handleAddTarget = () => {
    setNewCourse({
      ...newCourse,
      lessonTargets: [
        ...newCourse.lessonTargets,
        { lesson: newCourse.lessonTargets.length + 1, target: '' }
      ]
    });
  };

  const handleRemoveTarget = (index: number) => {
    const newTargets = newCourse.lessonTargets
      .filter((_, i) => i !== index)
      .map((t, i) => ({ ...t, lesson: i + 1 }));
    setNewCourse({ ...newCourse, lessonTargets: newTargets });
  };

  const handleTargetChange = (index: number, target: string) => {
    const newTargets = [...newCourse.lessonTargets];
    newTargets[index] = { ...newTargets[index], target };
    setNewCourse({ ...newCourse, lessonTargets: newTargets });
  };

  const handleCreateCourse = () => {
    if (!currentPet || !newCourse.name) return;

    const course = {
      id: `course-${Date.now()}`,
      petId: currentPet.id,
      trainerId: 'trainer-001',
      name: newCourse.name,
      category: newCourse.category,
      description: newCourse.description,
      totalLessons: newCourse.totalLessons,
      completedLessons: 0,
      lessonTargets: newCourse.lessonTargets.map(t => ({ ...t, achieved: false })),
      status: 'active' as const,
      createdAt: new Date()
    };

    addCourse(course);
    setShowCreateModal(false);
    setNewCourse({
      name: '',
      category: CourseCategory.BASIC_OBEDIENCE,
      description: '',
      totalLessons: 5,
      lessonTargets: []
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">训练课程</h1>
            <p className="text-white/80 text-sm mt-1">
              {currentPet?.name}的课程安排
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-3 bg-white text-primary rounded-full shadow-lg hover:bg-white/90 transition"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{petCourses.length}</p>
            <p className="text-xs text-white/80">总课程</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">
              {petCourses.filter(c => c.status === 'active').length}
            </p>
            <p className="text-xs text-white/80">进行中</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">
              {petCourses.filter(c => c.status === 'completed').length}
            </p>
            <p className="text-xs text-white/80">已完成</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {petCourses.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-text-secondary">暂无训练课程</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              创建第一个课程
            </button>
          </div>
        ) : (
          petCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                onClick={() => navigate(`/course/${course.id}`)}
                className="p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(course.category)}`}>
                        {course.category}
                      </span>
                      {course.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                      )}
                    </div>
                    <h3 className="font-semibold text-text-primary">{course.name}</h3>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                    <span>课程进度</span>
                    <span>{course.completedLessons}/{course.totalLessons}课次</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-primary-light h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(course)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <Target className="w-3 h-3" />
                      <span>目标: {course.lessonTargets.filter(t => t.achieved).length}/{course.lessonTargets.length}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(course.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {course.lessonTargets.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCourse(expandedCourse === course.id ? null : course.id);
                      }}
                      className="flex items-center gap-1 text-xs text-primary"
                    >
                      {expandedCourse === course.id ? (
                        <>
                          收起 <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          目标 <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {expandedCourse === course.id && course.lessonTargets.length > 0 && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-text-primary mb-3">课程目标</h4>
                  <div className="space-y-2">
                    {course.lessonTargets.map((target) => (
                      <div key={target.lesson} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          target.achieved
                            ? 'bg-secondary text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {target.achieved ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">{target.lesson}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-text-primary">{target.target}</p>
                          <p className="text-xs text-text-secondary">第{target.lesson}课次</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">创建新课程</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pb-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  课程名称
                </label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  placeholder="例如：基础服从训练"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  课程类别
                </label>
                <select
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value as CourseCategory })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                >
                  {Object.values(CourseCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  课程描述
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="简要描述课程目标..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  总课次
                </label>
                <input
                  type="number"
                  value={newCourse.totalLessons}
                  onChange={(e) => setNewCourse({ ...newCourse, totalLessons: parseInt(e.target.value) || 1 })}
                  min={1}
                  max={50}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-text-primary">
                    训练目标（可选）
                  </label>
                  <button
                    onClick={handleAddTarget}
                    type="button"
                    className="text-xs text-primary hover:text-primary-dark"
                  >
                    + 添加目标
                  </button>
                </div>

                {newCourse.lessonTargets.length > 0 && (
                  <div className="space-y-2">
                    {newCourse.lessonTargets.map((target, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary font-medium">{target.lesson}</span>
                        </div>
                        <input
                          type="text"
                          value={target.target}
                          onChange={(e) => handleTargetChange(index, e.target.value)}
                          placeholder={`第${target.lesson}课次目标`}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />
                        <button
                          onClick={() => handleRemoveTarget(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newCourse.lessonTargets.length === 0 && (
                  <p className="text-xs text-text-secondary">
                    点击"添加目标"设置每节课的训练目标，方便后续按课次复盘
                  </p>
                )}
              </div>

              <button
                onClick={handleCreateCourse}
                disabled={!newCourse.name}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建课程
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
