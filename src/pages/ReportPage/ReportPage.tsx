import { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import {
  usePetStore,
  useCourseStore,
  useTrainingRecordStore,
  useEvaluationStore,
  useCheckInStore
} from '../../stores';

export default function ReportPage() {
  const { currentPet } = usePetStore();
  const { courses, getCoursesByPetId } = useCourseStore();
  const { records, getRecordsByCourseId } = useTrainingRecordStore();
  const { evaluations, getLatestEvaluation, getEvaluationsByPetId } = useEvaluationStore();
  const { checkIns, getCheckInsByPetId } = useCheckInStore();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const handleExport = () => {
      setShowPreview(true);
    };

    window.addEventListener('exportReport', handleExport);
    return () => window.removeEventListener('exportReport', handleExport);
  }, []);

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
  const latestEvaluation = getLatestEvaluation(currentPet.id);

  const generateReport = () => {
    const now = new Date();
    const reportDate = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let report = `
═══════════════════════════════════════════════════════════════
                    宠物训练报告
              ${reportDate}
═══════════════════════════════════════════════════════════════

【宠物档案】
───────────────────────────────────────────────────────────────
姓名：${currentPet.name}
品种：${currentPet.breed}
年龄：${currentPet.age}岁
体重：${currentPet.weight}kg
性格特征：${currentPet.temperament.join('、')}
禁忌事项：${currentPet.contraindications.length > 0 ? currentPet.contraindications.join('、') : '无'}
过敏信息：${currentPet.allergies.length > 0 ? currentPet.allergies.join('、') : '无'}
既往问题：${currentPet.pastProblems.length > 0 ? currentPet.pastProblems.map(p => `${p.behavior}(${p.status === 'improved' ? '已改善' : p.status === 'improving' ? '改善中' : '持续'})`).join('、') : '无'}
健康备注：${currentPet.healthNotes || '无'}

【课程进度】
───────────────────────────────────────────────────────────────
`;

    petCourses.forEach(course => {
      const courseRecords = getRecordsByCourseId(course.id);
      const progress = Math.round((course.completedLessons / course.totalLessons) * 100);
      report += `
【${course.name}】
  类别：${course.category}
  进度：${course.completedLessons}/${course.totalLessons} 课次 (${progress}%)
  状态：${course.status === 'active' ? '进行中' : course.status === 'completed' ? '已完成' : '已暂停'}
  描述：${course.description}
`;
      if (course.lessonTargets.length > 0) {
        report += `  训练目标：
`;
        course.lessonTargets.forEach((target, index) => {
          report += `    第${target.lesson}课次：${target.target} ${target.achieved ? '[✓ 已达成]' : '[ ]'}
`;
        });
      }
    });

    report += `

【课堂记录】
───────────────────────────────────────────────────────────────
`;

    petCourses.slice(0, 3).forEach(course => {
      const courseRecords = getRecordsByCourseId(course.id);
      if (courseRecords.length > 0) {
        report += `
【${course.name}】最近记录：
`;
        courseRecords.slice(0, 3).forEach(record => {
          report += `
  日期：${new Date(record.recordDate).toLocaleDateString('zh-CN')}
  动作表现：
`;
          record.actionPerformance.forEach(action => {
            const successRate = Math.round((action.successes / action.attempts) * 100);
            report += `    - ${action.action}: ${action.successes}/${action.attempts}次 (${successRate}%) [${action.result}]
`;
          });
          report += `  奖励方式：${record.rewardMethod.join('、')}
`;
          if (record.problemBehaviors.length > 0) {
            report += `  问题行为：${record.problemBehaviors.join('、')}
`;
          }
          if (record.homework) {
            report += `  家庭作业：${record.homework}
`;
          }
        });
      }
    });

    report += `

【能力评估】
───────────────────────────────────────────────────────────────
`;

    if (latestEvaluation) {
      report += `
最新评估 (${new Date(latestEvaluation.evaluatedAt).toLocaleDateString('zh-CN')})
  综合评分：${latestEvaluation.overallScore}分

  各维度评分：
    - 反应速度：${latestEvaluation.reactionSpeed}分
    - 稳定性：${latestEvaluation.stability}分
    - 专注度：${latestEvaluation.focus}分
    - 服从性：${latestEvaluation.obedience}分
    - 抗干扰：${latestEvaluation.antiInterference}分

  训练师点评：
  ${latestEvaluation.comment}

  改进建议：
`;
      latestEvaluation.improvement.forEach((item, index) => {
        report += `    ${index + 1}. ${item}
`;
      });
    } else {
      report += `暂无评估记录
`;
    }

    report += `

【打卡统计】
───────────────────────────────────────────────────────────────
  总打卡次数：${petCheckIns.length}次
  平均完成度：${petCheckIns.length > 0 ? Math.round(petCheckIns.reduce((acc, c) => acc + c.completionRate, 0) / petCheckIns.length) : 0}%

【评估历史趋势】
───────────────────────────────────────────────────────────────
`;
    if (petEvaluations.length > 1) {
      report += `
评估次数  综合评分  反应速度  稳定性  专注度  服从性  抗干扰
`;
      petEvaluations.slice(0, 5).reverse().forEach((eval_, index) => {
        report += `  第${index + 1}次     ${eval_.overallScore}分      ${eval_.reactionSpeed}分      ${eval_.stability}分     ${eval_.focus}分     ${eval_.obedience}分     ${eval_.antiInterference}分
`;
      });
    } else {
      report += `暂无足够数据进行趋势分析
`;
    }

    report += `

═══════════════════════════════════════════════════════════════
                      报告生成时间：${now.toLocaleString('zh-CN')}
               如有疑问请联系您的训练师
═══════════════════════════════════════════════════════════════
`;

    return report;
  };

  const handleDownload = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentPet.name}_训练报告_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowPreview(false);
  };

  return (
    <>
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">训练报告预览</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">
                {generateReport()}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                下载报告
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 pt-12">
          <h1 className="text-2xl font-bold mb-2">训练报告</h1>
          <p className="text-white/80">生成并导出完整训练报告</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">训练报告包含</h3>
            <div className="space-y-3 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="text-sm">宠物档案信息</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="text-sm">课程进度详情</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="text-sm">课堂记录摘要</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="text-sm">能力评估结果</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="text-sm">评估历史趋势</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="text-sm">打卡统计</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPreview(true)}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            生成并预览报告
          </button>

          <div className="bg-yellow-50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">温馨提示</p>
              <p>报告将生成文本文件，您可以在任何设备上查看。建议打印后供训练师参考。</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
