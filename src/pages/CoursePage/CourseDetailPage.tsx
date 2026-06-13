import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clipboard, ChevronDown, ChevronUp, CheckCircle2, Target, Clock } from 'lucide-react';
import { useCourseStore, usePetStore, useTrainingRecordStore } from '../../stores';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourseById } = useCourseStore();
  const { currentPet } = usePetStore();
  const { records, getRecordsByCourseId } = useTrainingRecordStore();
  const [expandedTargets, setExpandedTargets] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState(false);

  const course = id ? getCourseById(id) : null;
  const courseRecords = id ? getRecordsByCourseId(id) : [];

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">课程不存在</p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '基础服从':
        return 'bg-primary/10 text-primary';
      case '社交脱敏':
        return 'bg-secondary/10 text-secondary';
      case '笼内训练':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const progress = Math.round((course.completedLessons / course.totalLessons) * 100);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 pt-12">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/20 rounded-lg transition mr-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1">课程详情</h1>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(course.category)}`}>
            {course.category}
          </span>
          {course.status === 'completed' && (
            <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm">
              已完成
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">{course.name}</h2>
        <p className="text-white/80 text-sm mb-4">{course.description}</p>

        <div className="bg-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80">课程进度</span>
            <span className="font-bold">{course.completedLessons}/{course.totalLessons} 课次</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">课程目标</h3>
            </div>
            <span className="text-sm text-text-secondary">
              {course.lessonTargets.filter(t => t.achieved).length}/{course.lessonTargets.length} 已完成
            </span>
          </div>

          {course.lessonTargets.length > 0 ? (
            <>
              <button
                onClick={() => setExpandedTargets(!expandedTargets)}
                className="w-full mt-3 text-primary text-sm flex items-center justify-center gap-1"
              >
                {expandedTargets ? (
                  <>
                    收起 <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    查看全部目标 <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>

              {(expandedTargets || course.lessonTargets.length <= 3) && (
                <div className="mt-3 space-y-2">
                  {course.lessonTargets.map((target) => (
                    <div key={target.lesson} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        target.achieved
                          ? 'bg-secondary text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {target.achieved ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{target.lesson}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">{target.target}</p>
                        <p className="text-xs text-text-secondary mt-0.5">第{target.lesson}课次目标</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-text-secondary mt-3">暂无课程目标</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">课堂记录</h3>
            </div>
            <span className="text-sm text-text-secondary">{courseRecords.length}条记录</span>
          </div>

          {courseRecords.length > 0 ? (
            <>
              <button
                onClick={() => setExpandedRecords(!expandedRecords)}
                className="w-full text-primary text-sm flex items-center justify-center gap-1 mb-3"
              >
                {expandedRecords ? (
                  <>
                    收起 <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    查看全部记录 <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>

              {(expandedRecords || courseRecords.length <= 2) ? (
                <div className="space-y-2">
                  {courseRecords.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => navigate(`/record/${course.id}?recordId=${record.id}`)}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-primary text-white rounded text-xs font-medium">
                            第{record.lessonNumber}课
                          </span>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-text-secondary" />
                            <span className="text-text-primary">
                              {new Date(record.recordDate).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-primary">编辑</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {record.actionPerformance.map((action, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                            {action.action}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-text-secondary">暂无课堂记录</p>
          )}

          <button
            onClick={() => navigate(`/record/${course.id}`)}
            className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition flex items-center justify-center gap-2"
          >
            <Clipboard className="w-5 h-5" />
            {courseRecords.length > 0 ? '添加新记录' : '开始记录'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
