import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, BarChart2, MessageCircle, User } from 'lucide-react';
import { useMessageStore } from '../../stores';

export default function Navigation() {
  const location = useLocation();
  const { getUnreadCount } = useMessageStore();
  const unreadCount = getUnreadCount('owner-001');

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/courses', icon: BookOpen, label: '课程' },
    { path: '/checkin', icon: CheckSquare, label: '打卡' },
    { path: '/progress', icon: BarChart2, label: '进度' },
    { path: '/messages', icon: MessageCircle, label: '消息', badge: unreadCount },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-safe z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 min-w-[64px] transition ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
