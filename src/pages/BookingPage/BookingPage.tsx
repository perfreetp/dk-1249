import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Download, Plus, Edit2, Trash2, List, Grid3X3 } from 'lucide-react';
import { usePetStore, useCourseStore, useBookingStore } from '../../stores';
import { Booking } from '../../types';

export default function BookingPage() {
  const navigate = useNavigate();
  const { currentPet } = usePetStore();
  const { courses, getCoursesByPetId } = useCourseStore();
  const { bookings, addBooking, updateBooking, cancelBooking, getBookingsByPetId, getUpcomingBooking, getBookingsByDate, getWeekBookings } = useBookingStore();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newBooking, setNewBooking] = useState({
    courseId: '',
    notes: ''
  });
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

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

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeek);
      day.setDate(currentWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeek]);

  const weekBookings = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const day of weekDays) {
      const dayKey = day.toDateString();
      const dayBookings = getBookingsByDate(currentPet.id, day);
      map.set(dayKey, dayBookings);
    }
    return map;
  }, [weekDays, currentPet.id]);

  const selectedDateBookings = selectedDate ? getBookingsByDate(currentPet.id, selectedDate) : [];

  const handlePrevWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const handleToday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeek(monday);
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedTime('');
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !newBooking.courseId || !currentPet) return;

    if (editingBooking) {
      updateBooking(editingBooking.id, {
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        courseId: newBooking.courseId,
        notes: newBooking.notes
      });
    } else {
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
    }

    setShowBookingModal(false);
    setSelectedDate(null);
    setSelectedTime('');
    setNewBooking({ courseId: '', notes: '' });
    setEditingBooking(null);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setSelectedDate(new Date(booking.scheduledDate));
    setSelectedTime(booking.scheduledTime);
    setNewBooking({
      courseId: booking.courseId,
      notes: booking.notes
    });
    setShowBookingModal(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('确定要取消这个预约吗？')) {
      cancelBooking(bookingId);
      if (selectedDate) {
        const remainingBookings = getBookingsByDate(currentPet.id, selectedDate);
        if (remainingBookings.length === 0) {
          setSelectedDate(null);
        }
      }
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const weekDaysLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-secondary" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
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

  const isToday = (day: Date) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  const isSelected = (day: Date) => {
    return selectedDate?.toDateString() === day.toDateString();
  };

  const formatWeekRange = () => {
    const startMonth = weekDays[0].getMonth() + 1;
    const startDay = weekDays[0].getDate();
    const endMonth = weekDays[6].getMonth() + 1;
    const endDay = weekDays[6].getDate();
    if (startMonth === endMonth) {
      return `${startMonth}月${startDay}日 - ${endDay}日`;
    }
    return `${startMonth}月${startDay}日 - ${endMonth}月${endDay}日`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-accent to-accent-dark text-white p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">课程预约</h1>
        <p className="text-white/80">管理训练课程安排</p>

        {upcomingBooking ? (
          <div className="mt-4 bg-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">下次课程</p>
                <p className="text-lg font-bold mt-1">
                  {new Date(upcomingBooking.scheduledDate).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric'
                  })} {upcomingBooking.scheduledTime}
                </p>
                <p className="text-sm text-white/70 mt-1">
                  {courses.find(c => c.id === upcomingBooking.courseId)?.name || '课程'}
                </p>
              </div>
              {getStatusIcon(upcomingBooking.status)}
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-white/20 rounded-xl p-4">
            <p className="text-white/80">暂无预约</p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              const today = new Date();
              setSelectedDate(today);
              handleDateClick(today);
              setShowBookingModal(true);
            }}
            className="flex-1 py-2 bg-white text-accent rounded-lg font-medium hover:bg-white/90 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新预约
          </button>
          <button
            onClick={() => navigate('/report')}
            className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            报告
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">周计划视图</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('week')}
                className={`p-2 rounded-lg transition ${viewMode === 'week' ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{formatWeekRange()}</h3>
              <button
                onClick={handleToday}
                className="text-xs text-accent hover:underline"
              >
                今天
              </button>
            </div>
            <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {viewMode === 'week' ? (
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, index) => {
                const dayBookings = weekBookings.get(day.toDateString()) || [];
                const hasBookings = dayBookings.length > 0;
                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`p-2 rounded-lg cursor-pointer transition text-center min-h-[80px] ${
                      isSelected(day)
                        ? 'bg-accent text-white'
                        : isToday(day)
                        ? 'bg-accent/20'
                        : hasBookings
                        ? 'bg-accent/10 hover:bg-accent/20'
                        : 'hover:bg-gray-50'
                    } ${isPast && !hasBookings ? 'opacity-50' : ''}`}
                  >
                    <div className="text-xs mb-1">
                      {weekDaysLabels[index]}
                    </div>
                    <div className={`text-lg font-bold ${isSelected(day) ? 'text-white' : ''}`}>
                      {day.getDate()}
                    </div>
                    {hasBookings && (
                      <div className="mt-1">
                        <div className={`text-xs font-medium ${isSelected(day) ? 'text-white/90' : 'text-accent'}`}>
                          {dayBookings.length}节课
                        </div>
                        <div className="flex justify-center gap-0.5 mt-1">
                          {dayBookings.slice(0, 3).map((b, i) => (
                            <div
                              key={b.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.status === 'cancelled'
                                  ? 'bg-red-400'
                                  : isSelected(day)
                                  ? 'bg-white'
                                  : 'bg-accent'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {weekDays.map((day) => {
                const dayBookings = weekBookings.get(day.toDateString()) || [];
                if (dayBookings.length === 0) return null;

                return (
                  <div key={day.toISOString()} className="border-b border-gray-100 pb-2 mb-2">
                    <p className={`text-sm font-medium mb-2 ${isToday(day) ? 'text-accent' : 'text-gray-600'}`}>
                      {isToday(day) ? '今天' : `${day.getMonth() + 1}/${day.getDate()} ${weekDaysLabels[weekDays.indexOf(day)]}`}
                    </p>
                    {dayBookings.map((booking) => {
                      const course = courses.find(c => c.id === booking.courseId);
                      return (
                        <div
                          key={booking.id}
                          className={`p-2 rounded-lg mb-1 ${
                            booking.status === 'cancelled'
                              ? 'bg-gray-100 opacity-60'
                              : 'bg-accent/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(booking.status)}
                              <span className="text-sm font-medium">{course?.name || '课程'}</span>
                            </div>
                            <span className="text-sm text-gray-500">{booking.scheduledTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {petBookings.filter(b => {
                const bookingDate = new Date(b.scheduledDate);
                return bookingDate < weekDays[0] || bookingDate >= weekDays[7];
              }).length > 0 && (
                <p className="text-xs text-gray-400 text-center pt-2">
                  还有 {petBookings.filter(b => {
                    const bookingDate = new Date(b.scheduledDate);
                    return bookingDate < weekDays[0] || bookingDate >= weekDays[7];
                  }).length} 条更早/更晚的预约
                </p>
              )}
            </div>
          )}
        </div>

        {selectedDate && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">
              {isToday(selectedDate) ? '今天' : selectedDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} 安排
            </h3>

            {selectedDateBookings.length > 0 ? (
              <div className="space-y-3">
                {selectedDateBookings.map((booking) => {
                  const course = courses.find(c => c.id === booking.courseId);
                  return (
                    <div key={booking.id} className={`p-3 rounded-lg ${
                      booking.status === 'cancelled' ? 'bg-gray-50' : 'bg-accent/10'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-accent" />
                          <span className="font-medium">{booking.scheduledTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          <span className="text-sm">{getStatusText(booking.status)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium">{course?.name || '课程'}</p>
                      {booking.notes && (
                        <p className="text-xs text-gray-500 mt-1">{booking.notes}</p>
                      )}
                    </div>
                  );
                })}

                <div className="flex gap-2 pt-2">
                  {selectedDateBookings.filter(b => b.status !== 'cancelled').map((booking) => (
                    <button
                      key={`edit-${booking.id}`}
                      onClick={() => handleEditBooking(booking)}
                      className="flex-1 py-2 bg-accent/10 text-accent rounded-lg font-medium hover:bg-accent/20 transition text-sm"
                    >
                      修改
                    </button>
                  ))}
                  {selectedDateBookings.filter(b => b.status !== 'cancelled').map((booking) => (
                    <button
                      key={`cancel-${booking.id}`}
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex-1 py-2 bg-red-50 text-red-500 rounded-lg font-medium hover:bg-red-100 transition text-sm"
                    >
                      取消
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full py-2 border-2 border-dashed border-accent text-accent rounded-lg font-medium hover:bg-accent/5 transition text-sm"
                >
                  + 添加更多预约
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-text-secondary mb-3">选择时间</p>
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
              </>
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
            petBookings.slice(0, 5).map((booking) => {
              const course = courses.find(c => c.id === booking.courseId);
              return (
                <div key={booking.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
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
                    <p className="text-sm text-text-secondary mt-2">{booking.notes}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingBooking ? '修改预约' : '新建预约'}
              </h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setEditingBooking(null);
                  setNewBooking({ courseId: '', notes: '' });
                }}
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
                {editingBooking ? '确认修改' : '确认预约'}
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
