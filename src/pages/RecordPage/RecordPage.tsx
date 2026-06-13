import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clipboard, Star, Gift, AlertCircle, FileText, Save } from 'lucide-react';
import { useCourseStore, usePetStore } from '../../stores';
import { ActionResult, RewardMethod } from '../../types';

export default function RecordPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { getCourseById, updateCourse } = useCourseStore();
  const { currentPet } = usePetStore();
  const [record, setRecord] = useState({
    actions: [
      { action: '坐', result: ActionResult.GOOD, attempts: 10, successes: 8 },
      { action: '卧', result: ActionResult.GOOD, attempts: 10, successes: 7 },
      { action: '停', result: ActionResult.AVERAGE, attempts: 10, successes: 6 },
    ],
    rewardMethods: [RewardMethod.TREAT, RewardMethod.VERBAL] as RewardMethod[],
    problemBehaviors: [] as string[],
    homework: '',
    notes: ''
  });
  const [newProblem, setNewProblem] = useState('');

  const course = courseId ? getCourseById(courseId) : null;

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
    setRecord({
      ...record,
      actions: record.actions.filter((_, i) => i !== index)
    });
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
    const successCount = record.actions.reduce((acc, action) => {
      return acc + (action.result === ActionResult.EXCELLENT ? 1 : 0);
    }, 0);

    updateCourse(course.id, {
      completedLessons: course.completedLessons + 1
    });

    alert('记录已保存');
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
        <h1 className="text-2xl font-bold mb-2">课堂记录</h1>
        <p className="text-white/80 text-sm">{currentPet.name} · 第{course.completedLessons + 1}课次</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clipboard className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">动作表现</h3>
          </div>

          <div className="space-y-3">
            {record.actions.map((action, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={action.action}
                    onChange={(e) => handleActionChange(index, 'action', e.target.value)}
                    placeholder="动作名称"
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
          保存记录
        </button>
      </div>
    </div>
  );
}
