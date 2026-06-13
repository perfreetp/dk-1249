import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Star, TrendingUp, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useEvaluationStore, usePetStore } from '../../stores';
import { Evaluation } from '../../types';

export default function EvaluationPage() {
  const { evaluations, addEvaluation, getLatestEvaluation, getEvaluationsByPetId } = useEvaluationStore();
  const { currentPet } = usePetStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({
    reactionSpeed: 80,
    stability: 75,
    focus: 70,
    obedience: 85,
    antiInterference: 65,
    comment: '',
    improvement: ''
  });

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">请先添加宠物</p>
      </div>
    );
  }

  const petEvaluations = getEvaluationsByPetId(currentPet.id);
  const latestEvaluation = getLatestEvaluation(currentPet.id);

  const calculateOverall = () => {
    const { reactionSpeed, stability, focus, obedience, antiInterference } = newEvaluation;
    return Math.round((reactionSpeed + stability + focus + obedience + antiInterference) / 5);
  };

  const getRadarData = (evaluation?: Evaluation) => {
    if (!evaluation) {
      return [
        { subject: '反应速度', value: newEvaluation.reactionSpeed, fullMark: 100 },
        { subject: '稳定性', value: newEvaluation.stability, fullMark: 100 },
        { subject: '专注度', value: newEvaluation.focus, fullMark: 100 },
        { subject: '服从性', value: newEvaluation.obedience, fullMark: 100 },
        { subject: '抗干扰', value: newEvaluation.antiInterference, fullMark: 100 },
      ];
    }

    return [
      { subject: '反应速度', value: evaluation.reactionSpeed, fullMark: 100 },
      { subject: '稳定性', value: evaluation.stability, fullMark: 100 },
      { subject: '专注度', value: evaluation.focus, fullMark: 100 },
      { subject: '服从性', value: evaluation.obedience, fullMark: 100 },
      { subject: '抗干扰', value: evaluation.antiInterference, fullMark: 100 },
    ];
  };

  const getProgressData = () => {
    if (petEvaluations.length < 2) return [];

    return petEvaluations
      .slice(0, 5)
      .reverse()
      .map((eval_, index) => ({
        name: `评估${index + 1}`,
        总体: eval_.overallScore,
        反应速度: eval_.reactionSpeed,
        稳定性: eval_.stability,
        专注度: eval_.focus,
        服从性: eval_.obedience,
        抗干扰: eval_.antiInterference,
      }));
  };

  const handleAddEvaluation = () => {
    const evaluation: Evaluation = {
      id: `eval-${Date.now()}`,
      petId: currentPet.id,
      courseId: 'course-001',
      ...newEvaluation,
      overallScore: calculateOverall(),
      improvement: newEvaluation.improvement.split(',').map(s => s.trim()).filter(Boolean),
      evaluatedAt: new Date()
    };

    addEvaluation(evaluation);
    setShowAddModal(false);
    setNewEvaluation({
      reactionSpeed: 80,
      stability: 75,
      focus: 70,
      obedience: 85,
      antiInterference: 65,
      comment: '',
      improvement: ''
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-accent to-accent-dark text-white p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">能力评估</h1>
        <p className="text-white/80">追踪豆豆的成长轨迹</p>

        {latestEvaluation && (
          <div className="mt-4 bg-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">最新评估</p>
                <p className="text-3xl font-bold mt-1">{latestEvaluation.overallScore}分</p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(latestEvaluation.overallScore / 20)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {latestEvaluation && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-4">能力雷达图</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={getRadarData(latestEvaluation)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar
                  name="能力值"
                  dataKey="value"
                  stroke="#4D96FF"
                  fill="#4D96FF"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {petEvaluations.length >= 2 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-4">评分趋势</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getProgressData()}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="总体" fill="#FF8C42" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {latestEvaluation && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">训练师点评</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {latestEvaluation.comment}
            </p>

            {latestEvaluation.improvement.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-text-primary mb-2">改进建议</p>
                <div className="space-y-2">
                  {latestEvaluation.improvement.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5" />
                      <span className="text-sm text-text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition"
        >
          添加新评估
        </button>

        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary">评估历史</h3>
          {petEvaluations.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-text-secondary">暂无评估记录</p>
            </div>
          ) : (
            petEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-text-primary">
                    {new Date(evaluation.evaluatedAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-accent">{evaluation.overallScore}</span>
                    <span className="text-sm text-text-secondary">分</span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: '反应', value: evaluation.reactionSpeed },
                    { label: '稳定', value: evaluation.stability },
                    { label: '专注', value: evaluation.focus },
                    { label: '服从', value: evaluation.obedience },
                    { label: '抗干扰', value: evaluation.antiInterference },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-xs text-text-secondary">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">添加评估</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'reactionSpeed', label: '反应速度' },
                { key: 'stability', label: '稳定性' },
                { key: 'focus', label: '专注度' },
                { key: 'obedience', label: '服从性' },
                { key: 'antiInterference', label: '抗干扰' },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {item.label}: {newEvaluation[item.key as keyof typeof newEvaluation]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newEvaluation[item.key as keyof typeof newEvaluation]}
                    onChange={(e) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        [item.key]: parseInt(e.target.value)
                      })
                    }
                    className="w-full accent-accent"
                  />
                </div>
              ))}

              <div className="bg-accent/10 rounded-lg p-3">
                <p className="text-sm text-accent font-medium">
                  综合评分: {calculateOverall()}分
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  评语
                </label>
                <textarea
                  value={newEvaluation.comment}
                  onChange={(e) => setNewEvaluation({ ...newEvaluation, comment: e.target.value })}
                  placeholder="写一段评语..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  改进建议（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={newEvaluation.improvement}
                  onChange={(e) => setNewEvaluation({ ...newEvaluation, improvement: e.target.value })}
                  placeholder="例如：增加训练时长, 多环境练习"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>

              <button
                onClick={handleAddEvaluation}
                className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition"
              >
                提交评估
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
