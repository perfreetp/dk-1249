import { create } from 'zustand';
import { Message } from '../types';
import { storage } from '../utils/storage';

interface MessageStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  markAsRead: (messageId: string) => void;
  getUnreadCount: (userId: string) => number;
  getMessagesByUserId: (userId: string) => Message[];
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: storage.get('messages', []),

  addMessage: (message) => {
    const newMessages = [...get().messages, message];
    storage.set('messages', newMessages);
    set({ messages: newMessages });
  },

  markAsRead: (messageId) => {
    const newMessages = get().messages.map((m) =>
      m.id === messageId ? { ...m, isRead: true } : m
    );
    storage.set('messages', newMessages);
    set({ messages: newMessages });
  },

  getUnreadCount: (userId) =>
    get().messages.filter((m) => m.receiverId === userId && !m.isRead).length,

  getMessagesByUserId: (userId) =>
    get().messages
      .filter((m) => m.receiverId === userId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
}));
