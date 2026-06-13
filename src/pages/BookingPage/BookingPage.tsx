import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { usePetStore, useCourseStore, useBookingStore } from '../../stores';
import { Booking } from '../../types';

export default function BookingPage() {
  const navigate = useNavigate();
  const { currentPet } = usePetStore();
  const { courses, getCoursesByPetId } = useCourseStore();
  const { bookings, addBooking, getBookingsByPetId, getUpcomingBooking } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    courseId: '',
    notes: ''
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">请先添加宠物</p>
      </div>
    );
  }

  const petCourses = getCoursesByPetId(currentPet.id);
  const petBookings = getBookingsByPetId(currentPet.id);
  const upcomingBooking = getUpcomingBooking(currentPet.id);

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

  const isDateHasBooking = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return petBookings.some(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      return bookingDate.toDateString() === date.toDateString() && booking.status !== 'cancelled';
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !newBooking.courseId || !currentPet) return;

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      petId: currentPet.id,
      trainerId: 'trainer-001',
      courseId: newBooking.courseId,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      status: 'pending',
      notes: newBooking.notes,
      createdAt: new Date()
    };

    addBooking(booking);
    setShowBookingModal(false);
    setSelectedDate(null);
    setSelectedTime('');
    setNewBooking({ courseId: '', notes: '' });
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return '已确认';
      case 'pending':
        return '待确认';
      case 'cancelled':
        return '已取消';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-accent to-accent-dark text-white p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">课程预约</h1>
        <p className="text-white/80">预约下次训练课程</p>

        <div className="mt-4 bg-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">下次课程</p>
              <p className="text-lg font-bold mt-1">
                {upcomingBooking
                  ? `${new Date(upcomingBooking.scheduledDate).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric'
                    })} ${upcomingBooking.scheduledTime}`
                  : '暂无预约'}
              </p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-4 py-2 bg-white text-accent rounded-lg font-medium hover:bg-white/90 transition"
            >
              新预约
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
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
              <div key={index} className="aspect-square flex items-center justify-center relative">
                {day !== null && (
                  <div
                    onClick={() => handleDateClick(day)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm cursor-pointer transition ${
                      isDateHasBooking(day)
                        ? 'bg-accent text-white font-medium'
                        : selectedDate?.getDate() === day
                        ? 'bg-accent/20 text-accent font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {day}
                    {isDateHasBooking(day) && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">
              {selectedDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} 可选时间
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSlotClick(time)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                    selectedTime === time
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {selectedTime && (
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full mt-4 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition"
              >
                选择课程并确认预约
              </button>
            )}
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary">预约记录</h3>
          {petBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-text-secondary">暂无预约记录</p>
            </div>
          ) : (
            petBookings.map((booking) => {
              const course = courses.find(c => c.id === booking.courseId);
              return (
                <div key={booking.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">
                        {course?.name || '课程'}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(booking.scheduledDate).toLocaleDateString('zh-CN', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{booking.scheduledTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(booking.status)}
                      <span className="text-sm font-medium">
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  </div>
                  {booking.notes && (
                    <p className="text-sm text-text-secondary">{booking.notes}</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => navigate('/report')}
          className="w-full py-3 bg-gray-100 text-text-primary rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          导出训练报告
        </button>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">确认预约</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  选择课程
                </label>
                <select
                  value={newBooking.courseId}
                  onChange={(e) => setNewBooking({ ...newBooking, courseId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                >
                  <option value="">请选择课程</option>
                  {petCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  备注
                </label>
                <textarea
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  placeholder="添加预约备注..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>

              <button
                onClick={handleBooking}
                disabled={!newBooking.courseId}
                className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认预约
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
