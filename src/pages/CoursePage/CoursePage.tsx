import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Target, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { useCourseStore, usePetStore } from '../../stores';
import { CourseCategory } from '../../types';

export default function CoursePage() {
  const navigate = useNavigate();
  const { courses, addCourse, getCoursesByPetId } = useCourseStore();
  const { currentPet } = usePetStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    category: CourseCategory.BASIC_OBEDIENCE,
    description: '',
    totalLessons: 10
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
      lessonTargets: [],
      status: 'active' as const,
      createdAt: new Date()
    };

    addCourse(course);
    setShowCreateModal(false);
    setNewCourse({
      name: '',
      category: CourseCategory.BASIC_OBEDIENCE,
      description: '',
      totalLessons: 10
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
            <div
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
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

              {course.lessonTargets.length > 0 && (
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
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
              )}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">创建新课程</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
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
                  rows={3}
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
                  onChange={(e) => setNewCourse({ ...newCourse, totalLessons: parseInt(e.target.value) })}
                  min={1}
                  max={50}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
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
