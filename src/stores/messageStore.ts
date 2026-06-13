import { create } from 'zustand';
import { Message } from '../types';
import { mockMessages } from '../data/mockData';

interface MessageStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  markAsRead: (messageId: string) => void;
  getUnreadCount: (userId: string) => number;
  getMessagesByUserId: (userId: string) => Message[];
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: mockMessages,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  markAsRead: (messageId) => set((state) => ({
    messages: state.messages.map((m) =>
      m.id === messageId ? { ...m, isRead: true } : m
    )
  })),

  getUnreadCount: (userId) =>
    get().messages.filter((m) => m.receiverId === userId && !m.isRead).length,

  getMessagesByUserId: (userId) =>
    get().messages
      .filter((m) => m.receiverId === userId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
}));
