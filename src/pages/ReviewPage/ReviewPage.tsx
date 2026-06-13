import { useState } from 'react';
import { ClipboardList, TrendingUp, CheckCircle2, Lightbulb, Download, X, Share2 } from 'lucide-react';
import {
  usePetStore,
  useCourseStore,
  useTrainingRecordStore,
  useEvaluationStore,
  useCheckInStore
} from '../../stores';

interface ReviewData {
  period: string;
  summary: string;
  achievements: string[];
  improvements: string[];
  nextPhaseSuggestions: string[];
  courseProgress: { name: string; progress: number }[];
  evaluationTrend: { dimension: string; before: number; after: number }[];
  checkInRate: number;
}

export default function ReviewPage() {
  const { currentPet } = usePetStore();
  const { courses, getCoursesByPetId } = useCourseStore();
  const { records, getRecordsByCourseId } = useTrainingRecordStore();
  const { evaluations, getEvaluationsByPetId } = useEvaluationStore();
  const { checkIns, getCheckInsByPetId } = useCheckInStore();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">请先添加宠物</p>
      </div>
    );
  }

  const petCourses = getCoursesByPetId(currentPet.id);
  const petEvaluations = getEvaluationsByPetId(currentPet.id);
  const petCheckIns = getCheckInsByPetId(currentPet.id);

  const generateReview = () => {
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const courseProgress = petCourses.map(course => ({
      name: course.name,
      progress: Math.round((course.completedLessons / course.totalLessons) * 100)
    }));

    const totalProgress = courseProgress.length > 0
      ? Math.round(courseProgress.reduce((acc, c) => acc + c.progress, 0) / courseProgress.length)
      : 0;

    let evaluationTrend: { dimension: string; before: number; after: number }[] = [];
    if (petEvaluations.length >= 2) {
      const sortedEvals = [...petEvaluations].sort(
        (a, b) => new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime()
      );
      const before = sortedEvals[0];
      const after = sortedEvals[sortedEvals.length - 1];

      evaluationTrend = [
        { dimension: '反应速度', before: before.reactionSpeed, after: after.reactionSpeed },
        { dimension: '稳定性', before: before.stability, after: after.stability },
        { dimension: '专注度', before: before.focus, after: after.focus },
        { dimension: '服从性', before: before.obedience, after: after.obedience },
        { dimension: '抗干扰', before: before.antiInterference, after: after.antiInterference },
      ];
    }

    const recentCheckIns = petCheckIns.filter(c =>
      new Date(c.checkInDate) >= startDate
    );
    const checkInRate = recentCheckIns.length > 0
      ? Math.round(recentCheckIns.reduce((acc, c) => acc + c.completionRate, 0) / recentCheckIns.length)
      : 0;

    const achievements: string[] = [];
    const improvements: string[] = [];

    if (totalProgress >= 30) achievements.push('课程进度良好，已完成30%以上');
    if (petCheckIns.length >= 7) achievements.push('连续打卡超过7天，坚持就是胜利！');
    if (petEvaluations.length > 0 && petEvaluations[0].overallScore >= 80) {
      achievements.push('最新评估分数达到80分以上，表现优秀');
    }

    if (evaluationTrend.length > 0) {
      const improvedDimensions = evaluationTrend.filter(e => e.after > e.before);
      const declinedDimensions = evaluationTrend.filter(e => e.after < e.before);

      improvedDimensions.forEach(d => {
        achievements.push(`${d.dimension}提升了${d.after - d.before}分`);
      });

      declinedDimensions.forEach(d => {
        improvements.push(`${d.dimension}下降了${Math.abs(d.after - d.before)}分，需要加强训练`);
      });
    }

    if (checkInRate < 70) {
      improvements.push('打卡完成率偏低，建议加强家庭练习');
    }

    const nextPhaseSuggestions: string[] = [];

    if (totalProgress < 50) {
      nextPhaseSuggestions.push('继续完成当前课程的基础训练目标');
    }

    if (evaluationTrend.length > 0) {
      const lowestDimension = evaluationTrend.reduce((min, e) =>
        e.after < min.after ? e : min
      );
      nextPhaseSuggestions.push(`重点加强${lowestDimension.dimension}训练`);
    }

    if (checkInRate < 80) {
      nextPhaseSuggestions.push('建议每天固定时间进行家庭练习，提高打卡质量');
    }

    if (petCourses.some(c => c.status === 'completed')) {
      nextPhaseSuggestions.push('可以考虑开启新的训练课程，学习更多技能');
    }

    const summary = totalProgress >= 50
      ? `${currentPet.name}在这阶段的训练表现良好，课程进度达到${totalProgress}%，评估分数也有所提升。建议继续保持当前的训练节奏，同时加强薄弱环节的练习。`
      : `${currentPet.name}正处于训练初期，课程进度为${totalProgress}%。建议增加训练频次，确保护宠物能够充分掌握基础技能。`;

    return {
      period: `${startDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`,
      summary,
      achievements,
      improvements,
      nextPhaseSuggestions,
      courseProgress,
      evaluationTrend,
      checkInRate
    };
  };

  const handleGenerate = () => {
    const review = generateReview();
    setReviewData(review);
    setShowPreview(true);
  };

  const handleDownload = () => {
    if (!reviewData || !currentPet) return;

    let report = `
═══════════════════════════════════════════════════════════════
              ${currentPet.name} 阶段复盘报告
              ${reviewData.period}
═══════════════════════════════════════════════════════════════

【整体总结】
${reviewData.summary}

【课程进度】
`;
    reviewData.courseProgress.forEach(course => {
      report += `  - ${course.name}: ${course.progress}%\n`;
    });

    if (reviewData.evaluationTrend.length > 0) {
      report += `
【能力变化趋势】
  维度      之前   之后   变化
`;
      reviewData.evaluationTrend.forEach(e => {
        const change = e.after - e.before;
        const changeStr = change >= 0 ? `+${change}` : `${change}`;
        report += `  ${e.dimension}    ${e.before}     ${e.after}    ${changeStr}\n`;
      });
    }

    report += `
【打卡情况】
  完成率: ${reviewData.checkInRate}%
  打卡次数: ${petCheckIns.length}次

【达成成就】
`;
    reviewData.achievements.forEach((a, i) => {
      report += `  ${i + 1}. ${a}\n`;
    });

    if (reviewData.improvements.length > 0) {
      report += `
【待改进项】
`;
      reviewData.improvements.forEach((item, i) => {
        report += `  ${i + 1}. ${item}\n`;
      });
    }

    report += `
【下阶段训练建议】
`;
    reviewData.nextPhaseSuggestions.forEach((s, i) => {
      report += `  ${i + 1}. ${s}\n`;
    });

    report += `
═══════════════════════════════════════════════════════════════
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentPet.name}_阶段复盘_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {showPreview && reviewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">阶段复盘预览</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-sm text-primary font-medium mb-2">复盘周期</p>
                <p className="text-text-primary">{reviewData.period}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-2">整体总结</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{reviewData.summary}</p>
              </div>

              {reviewData.courseProgress.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold mb-3">课程进度</h3>
                  <div className="space-y-2">
                    {reviewData.courseProgress.map((course, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{course.name}</span>
                          <span className="text-primary font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviewData.evaluationTrend.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold mb-3">能力变化趋势</h3>
                  <div className="space-y-2">
                    {reviewData.evaluationTrend.map((item, index) => {
                      const change = item.after - item.before;
                      const isPositive = change >= 0;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-text-primary">{item.dimension}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-secondary">
                              {item.before} → {item.after}
                            </span>
                            <span className={`text-xs font-medium ${
                              isPositive ? 'text-secondary' : 'text-red-500'
                            }`}>
                              {isPositive ? '+' : ''}{change}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold mb-3">打卡情况</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">完成率</span>
                  <span className="text-lg font-bold text-primary">{reviewData.checkInRate}%</span>
                </div>
              </div>

              {reviewData.achievements.length > 0 && (
                <div className="bg-secondary/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <h3 className="font-semibold text-secondary">达成成就</h3>
                  </div>
                  <ul className="space-y-2">
                    {reviewData.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-text-secondary">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reviewData.improvements.length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-700">待改进项</h3>
                  </div>
                  <ul className="space-y-2">
                    {reviewData.improvements.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-yellow-200 text-yellow-700 flex items-center justify-center text-xs flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-yellow-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-accent/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-accent">下阶段训练建议</h3>
                </div>
                <ul className="space-y-2">
                  {reviewData.nextPhaseSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-text-secondary">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                下载报告
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${currentPet.name}阶段复盘`,
                      text: reviewData.summary
                    });
                  }
                }}
                className="px-6 py-3 bg-gray-100 text-text-primary rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                分享
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-br from-secondary to-secondary-dark text-white p-6 pt-12">
          <h1 className="text-2xl font-bold mb-2">阶段复盘</h1>
          <p className="text-white/80">生成训练阶段总结与建议</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <ClipboardList className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">智能复盘分析</h3>
            <p className="text-sm text-text-secondary mb-4">
              基于评估、打卡和课程完成情况，自动生成阶段总结报告和训练建议
            </p>
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary-dark transition"
            >
              生成复盘报告
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">复盘报告包含</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">整体总结</p>
                  <p className="text-xs text-text-secondary">基于数据的综合评价</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium">达成成就</p>
                  <p className="text-xs text-text-secondary">训练亮点和进步</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">待改进项</p>
                  <p className="text-xs text-text-secondary">需要加强的训练点</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">训练建议</p>
                  <p className="text-xs text-text-secondary">下一阶段的训练重点</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">温馨提示</p>
              <p>复盘报告可以下载或直接分享给主人，方便沟通训练进展。</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
