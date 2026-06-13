import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, CheckCircle2, Clock, AlertCircle, ChevronRight, Video } from 'lucide-react';
import { usePetStore, useCourseStore, useHomeworkTaskStore, useCheckInStore } from '../../stores';

export default function HomeworkPage() {
  const navigate = useNavigate();
  const { currentPet } = usePetStore();
  const { getCourseById } = useCourseStore();
  const { tasks, getTasksByPetId, getPendingTasks } = useHomeworkTaskStore();
  const { getCheckInsByPetId } = useCheckInStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">请先添加宠物</p>
      </div>
    );
  }

  const petTasks = getTasksByPetId(currentPet.id);
  const pendingTasks = getPendingTasks(currentPet.id);
  const checkIns = getCheckInsByPetId(currentPet.id);

  const filteredTasks = filter === 'all'
    ? petTasks
    : filter === 'pending'
    ? pendingTasks
    : petTasks.filter(t => t.status === 'completed');

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'completed' && b.status === 'pending') return 1;
    if (a.status === 'pending' && b.status === 'completed') return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getTaskCheckIn = (taskId: string) => {
    return checkIns.find(c => {
      const task = tasks.find(t => t.id === taskId);
      return task?.checkInId === c.id;
    });
  };

  const isOverdue = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  const getStatusBadge = (task: typeof petTasks[0]) => {
    if (task.status === 'completed') {
      return (
        <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-xs font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          已完成
        </span>
      );
    }
    if (isOverdue(task.dueDate)) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          已逾期
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs font-medium flex items-center gap-1">
        <Clock className="w-3 h-3" />
        待完成
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-accent to-accent-dark text-white p-6 pt-12">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/20 rounded-lg transition mr-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1">家庭作业</h1>
        </div>

        <p className="text-white/80 text-sm mb-4">跟进豆豆的家庭练习任务</p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{petTasks.length}</p>
            <p className="text-xs text-white/80">总任务</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{pendingTasks.length}</p>
            <p className="text-xs text-white/80">待完成</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{petTasks.filter(t => t.status === 'completed').length}</p>
            <p className="text-xs text-white/80">已完成</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待完成' },
            { key: 'completed', label: '已完成' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                filter === key
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-text-secondary">暂无作业任务</p>
              <p className="text-xs text-gray-400 mt-2">在课堂记录中添加家庭作业后会自动生成</p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const course = getCourseById(task.courseId);
              const checkIn = getTaskCheckIn(task.id);

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                          第{task.lessonNumber}课
                        </span>
                        {getStatusBadge(task)}
                      </div>
                      <p className="text-sm font-medium text-text-primary">{course?.name || '课程'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-text-primary">{task.content}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>截止: {new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                    </div>
                    {task.status === 'completed' && task.completedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-secondary" />
                        <span>完成于: {new Date(task.completedAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    )}
                  </div>

                  {checkIn && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 p-2 bg-secondary/5 rounded-lg">
                        <Video className="w-4 h-4 text-secondary" />
                        <div className="flex-1">
                          <p className="text-xs text-text-secondary">关联打卡</p>
                          <p className="text-sm font-medium text-text-primary">
                            完成度: {checkIn.completionRate}%
                          </p>
                        </div>
                        <span className="text-xs text-text-secondary">
                          {new Date(checkIn.checkInDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}

                  {task.status === 'pending' && (
                    <button
                      onClick={() => navigate('/checkin')}
                      className="w-full mt-3 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition text-sm flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      去打卡
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
