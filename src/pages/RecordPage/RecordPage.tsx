import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Clipboard, Gift, AlertCircle, FileText, Save, ChevronLeft, CheckCircle2, Clock } from 'lucide-react';
import { useCourseStore, usePetStore, useTrainingRecordStore } from '../../stores';
import { ActionResult, RewardMethod, TrainingRecord } from '../../types';

export default function RecordPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordIdParam = searchParams.get('recordId');

  const { getCourseById, updateCourse } = useCourseStore();
  const { currentPet } = usePetStore();
  const { records, addRecord, getRecordsByCourseId, getRecordById } = useTrainingRecordStore();

  const course = courseId ? getCourseById(courseId) : null;
  const courseRecords = courseId ? getRecordsByCourseId(courseId) : [];

  const existingRecord = recordIdParam ? getRecordById(recordIdParam) : null;
  const isEditing = !!existingRecord;

  const [record, setRecord] = useState({
    actions: [
      { action: '', result: ActionResult.GOOD, attempts: 10, successes: 0 }
    ],
    rewardMethods: [] as RewardMethod[],
    problemBehaviors: [] as string[],
    homework: '',
    homeworkDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    notes: ''
  });

  const [newProblem, setNewProblem] = useState('');

  useEffect(() => {
    if (existingRecord) {
      setRecord({
        actions: existingRecord.actionPerformance.length > 0
          ? existingRecord.actionPerformance
          : [{ action: '', result: ActionResult.GOOD, attempts: 10, successes: 0 }],
        rewardMethods: existingRecord.rewardMethod,
        problemBehaviors: existingRecord.problemBehaviors,
        homework: existingRecord.homework,
        homeworkDue: new Date(existingRecord.homeworkDue),
        notes: existingRecord.notes
      });
    }
  }, [existingRecord]);

  if (!course || !currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">课程不存在</p>
      </div>
    );
  }

  const handleAddAction = () => {
    setRecord({
      ...record,
      actions: [...record.actions, { action: '', result: ActionResult.GOOD, attempts: 10, successes: 0 }]
    });
  };

  const handleRemoveAction = (index: number) => {
    if (record.actions.length > 1) {
      setRecord({
        ...record,
        actions: record.actions.filter((_, i) => i !== index)
      });
    }
  };

  const handleActionChange = (index: number, field: string, value: any) => {
    const newActions = [...record.actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setRecord({ ...record, actions: newActions });
  };

  const toggleRewardMethod = (method: RewardMethod) => {
    if (record.rewardMethods.includes(method)) {
      setRecord({
        ...record,
        rewardMethods: record.rewardMethods.filter(m => m !== method)
      });
    } else {
      setRecord({
        ...record,
        rewardMethods: [...record.rewardMethods, method]
      });
    }
  };

  const handleAddProblem = () => {
    if (newProblem.trim()) {
      setRecord({
        ...record,
        problemBehaviors: [...record.problemBehaviors, newProblem.trim()]
      });
      setNewProblem('');
    }
  };

  const handleRemoveProblem = (index: number) => {
    setRecord({
      ...record,
      problemBehaviors: record.problemBehaviors.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (!course || !currentPet) return;

    const validActions = record.actions.filter(a => a.action.trim() !== '');

    const trainingRecord: TrainingRecord = {
      id: existingRecord ? existingRecord.id : `record-${Date.now()}`,
      courseId: course.id,
      petId: currentPet.id,
      trainerId: 'trainer-001',
      recordDate: existingRecord ? existingRecord.recordDate : new Date(),
      actionPerformance: validActions,
      rewardMethod: record.rewardMethods,
      problemBehaviors: record.problemBehaviors,
      homework: record.homework,
      homeworkDue: record.homeworkDue,
      notes: record.notes
    };

    addRecord(trainingRecord, !existingRecord);

    if (!existingRecord) {
      const nextLesson = course.completedLessons + 1;
      if (nextLesson <= course.totalLessons) {
        updateCourse(course.id, {
          completedLessons: nextLesson
        });
      }
    }

    navigate(`/course/${course.id}`);
  };

  const getResultColor = (result: ActionResult) => {
    switch (result) {
      case ActionResult.EXCELLENT:
        return 'bg-secondary/10 text-secondary';
      case ActionResult.GOOD:
        return 'bg-primary/10 text-primary';
      case ActionResult.AVERAGE:
        return 'bg-yellow-100 text-yellow-600';
      case ActionResult.NEEDS_IMPROVEMENT:
        return 'bg-red-100 text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 pt-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/course/${course.id}`)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">
            {isEditing ? '编辑记录' : '新建记录'}
          </h1>
          <div className="w-10"></div>
        </div>
        <p className="text-white/80 text-sm mt-2 text-center">
          {currentPet.name} · {course.name} · 第{course.completedLessons + 1}课次
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clipboard className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">动作表现</h3>
            {isEditing && (
              <span className="ml-auto text-xs text-secondary flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                编辑模式
              </span>
            )}
          </div>

          <div className="space-y-3">
            {record.actions.map((action, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={action.action}
                    onChange={(e) => handleActionChange(index, 'action', e.target.value)}
                    placeholder="动作名称（如：坐、卧、停）"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <select
                    value={action.result}
                    onChange={(e) => handleActionChange(index, 'result', e.target.value)}
                    className={`px-3 py-2 rounded-lg focus:outline-none ${getResultColor(action.result)}`}
                  >
                    {Object.values(ActionResult).map((result) => (
                      <option key={result} value={result}>
                        {result}
                      </option>
                    ))}
                  </select>
                  {record.actions.length > 1 && (
                    <button
                      onClick={() => handleRemoveAction(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary">尝试次数</label>
                    <input
                      type="number"
                      value={action.attempts}
                      onChange={(e) => handleActionChange(index, 'attempts', parseInt(e.target.value))}
                      min={0}
                      className="w-full px-3 py-1 border border-gray-200 rounded mt-1 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary">成功次数</label>
                    <input
                      type="number"
                      value={action.successes}
                      onChange={(e) => handleActionChange(index, 'successes', parseInt(e.target.value))}
                      min={0}
                      max={action.attempts}
                      className="w-full px-3 py-1 border border-gray-200 rounded mt-1 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddAction}
            className="w-full mt-3 py-2 border-2 border-dashed border-primary text-primary rounded-lg hover:bg-primary/5 transition"
          >
            + 添加动作
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold">奖励方式</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.values(RewardMethod).map((method) => (
              <button
                key={method}
                onClick={() => toggleRewardMethod(method)}
                className={`py-3 px-4 rounded-lg font-medium transition ${
                  record.rewardMethods.includes(method)
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">问题行为</h3>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newProblem}
              onChange={(e) => setNewProblem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddProblem()}
              placeholder="记录观察到的问题行为..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleAddProblem}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              添加
            </button>
          </div>

          {record.problemBehaviors.length > 0 && (
            <div className="space-y-2">
              {record.problemBehaviors.map((problem, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{problem}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveProblem(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">家庭作业</h3>
          </div>

          <textarea
            value={record.homework}
            onChange={(e) => setRecord({ ...record, homework: e.target.value })}
            placeholder="布置今天的家庭作业..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
          />

          <div className="mt-3">
            <label className="text-xs text-text-secondary">作业截止日期</label>
            <input
              type="date"
              value={record.homeworkDue.toISOString().split('T')[0]}
              onChange={(e) => setRecord({ ...record, homeworkDue: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mt-1 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">训练笔记</h3>
          <textarea
            value={record.notes}
            onChange={(e) => setRecord({ ...record, notes: e.target.value })}
            placeholder="记录训练中的观察和心得..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isEditing ? '保存修改' : '保存记录'}
        </button>
      </div>
    </div>
  );
}
