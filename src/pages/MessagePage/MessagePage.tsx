import { useState } from 'react';
import { MessageCircle, Bell, User, ChevronRight, CheckCheck, Clock } from 'lucide-react';
import { useMessageStore } from '../../stores';
import { Message } from '../../types';

export default function MessagePage() {
  const { messages, markAsRead, getUnreadCount } = useMessageStore();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'comment' | 'notification'>('all');

  const unreadCount = getUnreadCount('owner-001');
  const filteredMessages = messages.filter((msg) => {
    if (filter === 'all') return true;
    if (filter === 'comment') return msg.type === 'comment';
    if (filter === 'notification') return msg.type === 'notification';
    return true;
  });

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-primary" />;
      case 'notification':
        return <Bell className="w-5 h-5 text-accent" />;
      default:
        return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: Message['type']) => {
    switch (type) {
      case 'comment':
        return '点评';
      case 'notification':
        return '通知';
      case 'booking':
        return '预约';
      case 'report':
        return '报告';
      default:
        return '消息';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return messageDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">消息中心</h1>
            <p className="text-white/80 text-sm mt-1">与训练师的沟通记录</p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} 未读
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'comment', label: '点评' },
            { key: 'notification', label: '通知' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === item.key
                  ? 'bg-white text-primary'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-text-secondary">暂无消息</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.isRead) {
                    markAsRead(message.id);
                  }
                }}
                className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer ${
                  !message.isRead ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getMessageIcon(message.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-primary truncate">
                          {message.title}
                        </h3>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-text-secondary rounded">
                          {getTypeLabel(message.type)}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {formatTime(message.sentAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedMessage.title}</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                {getMessageIcon(selectedMessage.type)}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {selectedMessage.senderType === 'trainer' ? '训练师' :
                   selectedMessage.senderType === 'system' ? '系统' : '主人'}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(selectedMessage.sentAt).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                {selectedMessage.content}
              </p>
            </div>

            {selectedMessage.isRead && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-secondary">
                <CheckCheck className="w-4 h-4" />
                <span>已读</span>
              </div>
            )}

            <button
              onClick={() => setSelectedMessage(null)}
              className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition"
            >
              关闭
            </button>
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
