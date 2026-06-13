import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clipboard, ChevronDown, ChevronUp, CheckCircle2, Target, Clock, BarChart3, FileText, Video } from 'lucide-react';
import { useCourseStore, usePetStore, useTrainingRecordStore, useHomeworkTaskStore, useCheckInStore, useEvaluationStore } from '../../stores';
import { useState, useEffect } from 'react';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourseById } = useCourseStore();
  const { currentPet } = usePetStore();
  const { records, getRecordsByCourseId } = useTrainingRecordStore();
  const { getTasksByCourseId } = useHomeworkTaskStore();
  const { checkIns, getCheckInsByPetId } = useCheckInStore();
  const { evaluations } = useEvaluationStore();
  const [expandedTargets, setExpandedTargets] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState(false);
  const [selectedLessonForReview, setSelectedLessonForReview] = useState<number | null>(null);

  const course = id ? getCourseById(id) : null;
  const courseRecords = id ? getRecordsByCourseId(id) : [];
  const courseTasks = id ? getTasksByCourseId(id) : [];
  const courseEvaluations = id ? evaluations.filter(e => e.courseId === id) : [];

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

  const getRecordForLesson = (lessonNumber: number) => {
    return courseRecords.find(r => r.lessonNumber === lessonNumber);
  };

  const getTaskForLesson = (lessonNumber: number) => {
    return courseTasks.find(t => t.lessonNumber === lessonNumber);
  };

  const getEvaluationForLesson = (lessonNumber: number) => {
    const relatedRecord = getRecordForLesson(lessonNumber);
    if (!relatedRecord) return null;
    const recordDate = new Date(relatedRecord.recordDate);
    return courseEvaluations.find(e => {
      const evalDate = new Date(e.evaluatedAt);
      return Math.abs(evalDate.getTime() - recordDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
    });
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
                  {courseRecords.map((record) => {
                    const task = getTaskForLesson(record.lessonNumber);
                    const evaluation = getEvaluationForLesson(record.lessonNumber);
                    return (
                      <div
                        key={record.id}
                        className="p-3 bg-gray-50 rounded-lg"
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
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                              {record.actionPerformance.length}个动作
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {record.actionPerformance.map((action, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                              {action.action}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          {task && (
                            <span className={`flex items-center gap-1 ${
                              task.status === 'completed' ? 'text-secondary' : 'text-yellow-500'
                            }`}>
                              <FileText className="w-3 h-3" />
                              {task.status === 'completed' ? '作业已完成' : '作业待完成'}
                            </span>
                          )}
                          {evaluation && (
                            <span className="flex items-center gap-1 text-accent">
                              <BarChart3 className="w-3 h-3" />
                              评分{evaluation.overallScore}分
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => navigate(`/record/${course.id}?recordId=${record.id}`)}
                            className="flex-1 py-1.5 bg-primary text-white rounded text-xs font-medium hover:bg-primary-dark transition"
                          >
                            编辑记录
                          </button>
                        </div>
                      </div>
                    );
                  })}
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

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">课程复盘</h3>
            </div>
          </div>

          <p className="text-sm text-text-secondary mb-3">
            按课次查看完整的训练记录、作业和评估
          </p>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {Array.from({ length: Math.min(course.totalLessons, 8) }, (_, i) => i + 1).map(lessonNum => {
              const hasRecord = !!getRecordForLesson(lessonNum);
              return (
                <button
                  key={lessonNum}
                  onClick={() => hasRecord && setSelectedLessonForReview(lessonNum)}
                  className={`py-2 rounded-lg text-sm font-medium transition ${
                    hasRecord
                      ? selectedLessonForReview === lessonNum
                        ? 'bg-accent text-white'
                        : 'bg-accent/10 text-accent hover:bg-accent/20'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!hasRecord}
                >
                  第{lessonNum}课
                </button>
              );
            })}
          </div>

          {selectedLessonForReview && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">第{selectedLessonForReview}课 复盘</h4>
                <button
                  onClick={() => setSelectedLessonForReview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {(() => {
                const record = getRecordForLesson(selectedLessonForReview);
                const task = getTaskForLesson(selectedLessonForReview);
                const evaluation = getEvaluationForLesson(selectedLessonForReview);

                if (!record) return <p className="text-sm text-text-secondary">暂无记录</p>;

                return (
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                        <Clipboard className="w-4 h-4" />
                        课堂记录
                      </h5>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {record.actionPerformance.map((action, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                              {action.action} ({action.result})
                            </span>
                          ))}
                        </div>
                        {record.rewardMethod.length > 0 && (
                          <p className="text-xs text-text-secondary">
                            奖励方式: {record.rewardMethod.join(', ')}
                          </p>
                        )}
                        {record.problemBehaviors.length > 0 && (
                          <p className="text-xs text-yellow-600">
                            问题行为: {record.problemBehaviors.join(', ')}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-xs text-text-secondary mt-2">{record.notes}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        家庭作业
                      </h5>
                      {task ? (
                        <div className={`rounded-lg p-3 text-sm ${
                          task.status === 'completed' ? 'bg-secondary/10' : 'bg-yellow-50'
                        }`}>
                          <p className="text-text-primary">{task.content}</p>
                          <p className="text-xs text-text-secondary mt-1">
                            截止: {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                          </p>
                          <p className={`text-xs mt-1 ${
                            task.status === 'completed' ? 'text-secondary' : 'text-yellow-600'
                          }`}>
                            状态: {task.status === 'completed' ? '已完成' : '待完成'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-text-secondary bg-gray-50 rounded-lg p-3">暂无作业</p>
                      )}
                    </div>

                    {evaluation && (
                      <div>
                        <h5 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          评估结果
                        </h5>
                        <div className="bg-accent/10 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-text-secondary">综合评分</span>
                            <span className="text-lg font-bold text-accent">{evaluation.overallScore}分</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>反应速度: {evaluation.reactionSpeed}分</div>
                            <div>稳定性: {evaluation.stability}分</div>
                            <div>专注度: {evaluation.focus}分</div>
                            <div>服从性: {evaluation.obedience}分</div>
                          </div>
                          <p className="text-xs text-text-secondary mt-2">{evaluation.comment}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
