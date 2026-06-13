import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, CheckCircle2, Star, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCheckInStore, usePetStore, useCourseStore } from '../../stores';
import { CheckIn } from '../../types';

export default function CheckInPage() {
  const navigate = useNavigate();
  const { checkIns, addCheckIn, getTodayCheckIn, getCheckInsByPetId } = useCheckInStore();
  const { currentPet } = usePetStore();
  const { courses, getCourseById } = useCourseStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    videoUrl: '',
    completionRate: 80,
    notes: ''
  });

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">请先添加宠物</p>
      </div>
    );
  }

  const petCheckIns = getCheckInsByPetId(currentPet.id);
  const todayCheckIn = getTodayCheckIn(currentPet.id);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isDateCheckedIn = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return petCheckIns.some(checkIn => {
      const checkInDate = new Date(checkIn.checkInDate);
      return checkInDate.toDateString() === date.toDateString();
    });
  };

  const getCheckInForDate = (day: number): CheckIn | undefined => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return petCheckIns.find(checkIn => {
      const checkInDate = new Date(checkIn.checkInDate);
      return checkInDate.toDateString() === date.toDateString();
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleUpload = () => {
    if (!currentPet) return;

    const newCheckIn: CheckIn = {
      id: `checkin-${Date.now()}`,
      petId: currentPet.id,
      recordId: 'homework',
      videoUrl: uploadData.videoUrl || 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=checkin',
      completionRate: uploadData.completionRate,
      notes: uploadData.notes,
      checkInDate: new Date()
    };

    addCheckIn(newCheckIn);
    setShowUploadModal(false);
    setUploadData({
      videoUrl: '',
      completionRate: 80,
      notes: ''
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-secondary to-secondary-dark text-white p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">每日打卡</h1>
        <p className="text-white/80">记录豆豆的家庭练习</p>

        <div className="mt-4 bg-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">今日完成度</p>
              <p className="text-3xl font-bold mt-1">
                {todayCheckIn ? `${todayCheckIn.completionRate}%` : '未打卡'}
              </p>
            </div>
            {todayCheckIn ? (
              <CheckCircle2 className="w-12 h-12 text-white" />
            ) : (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-white text-secondary rounded-lg font-medium hover:bg-white/90 transition"
              >
                立即打卡
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-semibold">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h3>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs text-text-secondary py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div key={index} className="aspect-square flex items-center justify-center">
                {day !== null && (
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm ${
                      isDateCheckedIn(day)
                        ? 'bg-secondary text-white font-medium'
                        : 'text-text-primary hover:bg-gray-100'
                    }`}
                  >
                    {day}
                    {isDateCheckedIn(day) && (
                      <CheckCircle2 className="absolute w-3 h-3 -top-1 -right-1 text-secondary" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <span>已打卡</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary">打卡历史</h3>
          {petCheckIns.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-text-secondary">暂无打卡记录</p>
            </div>
          ) : (
            petCheckIns.slice(0, 5).map((checkIn) => {
              const course = getCourseById(checkIn.recordId);
              return (
                <div key={checkIn.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <Video className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-text-primary">
                          {new Date(checkIn.checkInDate).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{checkIn.completionRate}%</span>
                        </div>
                      </div>
                      {course && (
                        <p className="text-xs text-text-secondary mb-1">{course.name}</p>
                      )}
                      {checkIn.notes && (
                        <p className="text-xs text-text-secondary">{checkIn.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">上传练习视频</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary transition cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-text-secondary">点击上传视频文件</p>
                <p className="text-xs text-text-secondary mt-1">支持 MP4、MOV 格式</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  完成度: {uploadData.completionRate}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={uploadData.completionRate}
                  onChange={(e) => setUploadData({ ...uploadData, completionRate: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  备注说明
                </label>
                <textarea
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  placeholder="描述一下今天的练习情况..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={handleUpload}
                className="w-full py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary-dark transition"
              >
                提交打卡
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
