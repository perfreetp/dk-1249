import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Award, Target, Zap, ClipboardList } from 'lucide-react';
import { usePetStore, useCourseStore, useEvaluationStore, useCheckInStore } from '../../stores';

export default function ProgressPage() {
  const navigate = useNavigate();
  const { currentPet } = usePetStore();
  const { courses, getCoursesByPetId } = useCourseStore();
  const { evaluations, getLatestEvaluation, getEvaluationsByPetId } = useEvaluationStore();
  const { checkIns, getCheckInsByPetId } = useCheckInStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

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

  const getScoreTrend = () => {
    return petEvaluations.map((eval_, index) => ({
      name: `评估${index + 1}`,
      分数: eval_.overallScore,
      反应速度: eval_.reactionSpeed,
      稳定性: eval_.stability,
      专注度: eval_.focus,
      服从性: eval_.obedience,
      抗干扰: eval_.antiInterference,
    })).reverse();
  };

  const getCourseProgress = () => {
    return petCourses.map(course => ({
      name: course.name.length > 6 ? course.name.substring(0, 6) + '...' : course.name,
      完成度: Math.round((course.completedLessons / course.totalLessons) * 100),
      已完成: course.completedLessons,
      总数: course.totalLessons,
    }));
  };

  const getCompletionPieData = () => {
    const completed = petCourses.filter(c => c.status === 'completed').length;
    const active = petCourses.filter(c => c.status === 'active').length;
    const paused = petCourses.filter(c => c.status === 'paused').length;

    return [
      { name: '已完成', value: completed, color: '#52B788' },
      { name: '进行中', value: active, color: '#FF8C42' },
      { name: '已暂停', value: paused, color: '#636E72' },
    ];
  };

  const getAchievements = () => {
    const achievements = [];

    if (petCourses.length > 0) achievements.push({
      icon: Target,
      title: '初出茅庐',
      description: '开始第一个训练课程',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    });

    if (petEvaluations.length > 0) achievements.push({
      icon: TrendingUp,
      title: '首次评估',
      description: '完成第一次能力评估',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    });

    if (petCheckIns.length >= 7) achievements.push({
      icon: Zap,
      title: '连续打卡7天',
      description: '坚持每日练习',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    });

    if (latestEvaluation && latestEvaluation.overallScore >= 80) achievements.push({
      icon: Award,
      title: '优秀学员',
      description: '评估分数达到80分以上',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    });

    return achievements;
  };

  const totalProgress = petCourses.length > 0
    ? Math.round(petCourses.reduce((acc, course) =>
        acc + (course.completedLessons / course.totalLessons) * 100, 0
      ) / petCourses.length)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-secondary to-secondary-dark text-white p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">成长进度</h1>
        <p className="text-white/80">追踪豆豆的每一步成长</p>

        <div className="mt-4 bg-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">总体进度</p>
              <p className="text-4xl font-bold mt-1">{totalProgress}%</p>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${totalProgress * 2.2} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{totalProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {[
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' },
            { key: 'all', label: '全部' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTimeRange(item.key as typeof timeRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === item.key
                  ? 'bg-white text-secondary'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {getAchievements().length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">成就徽章</h3>
            <div className="grid grid-cols-2 gap-3">
              {getAchievements().map((achievement, index) => (
                <div
                  key={index}
                  className={`${achievement.bgColor} rounded-lg p-3 flex items-start gap-3`}
                >
                  <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                  <div>
                    <p className={`text-sm font-medium ${achievement.color}`}>
                      {achievement.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {petEvaluations.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-4">评分趋势</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getScoreTrend()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="分数"
                  stroke="#52B788"
                  strokeWidth={2}
                  dot={{ fill: '#52B788' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {petCourses.length > 0 && (
          <>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-4">课程完成度</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getCourseProgress()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="完成度" fill="#FF8C42" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-4">课程状态分布</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getCompletionPieData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getCompletionPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {getCompletionPieData().map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-text-secondary">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {latestEvaluation && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">最新评估详情</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '反应速度', value: latestEvaluation.reactionSpeed },
                { label: '稳定性', value: latestEvaluation.stability },
                { label: '专注度', value: latestEvaluation.focus },
                { label: '服从性', value: latestEvaluation.obedience },
                { label: '抗干扰', value: latestEvaluation.antiInterference },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-text-secondary mb-1">{item.label}</p>
                  <p className="text-xl font-bold text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">统计数据</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">{petCourses.length}</p>
              <p className="text-xs text-text-secondary">课程总数</p>
            </div>
            <div className="text-center p-3 bg-secondary/10 rounded-lg">
              <p className="text-2xl font-bold text-secondary">{petEvaluations.length}</p>
              <p className="text-xs text-text-secondary">评估次数</p>
            </div>
            <div className="text-center p-3 bg-accent/10 rounded-lg">
              <p className="text-2xl font-bold text-accent">{petCheckIns.length}</p>
              <p className="text-xs text-text-secondary">打卡次数</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/review')}
          className="w-full py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary-dark transition flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-5 h-5" />
          生成阶段复盘
        </button>
      </div>
    </div>
  );
}
