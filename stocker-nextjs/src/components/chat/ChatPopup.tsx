'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import { useChatHub, ChatMessage } from '@/lib/signalr/chat-hub';
import { useAuth } from '@/lib/auth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import Link from 'next/link';

dayjs.extend(relativeTime);
dayjs.locale('tr');

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function ChatPopup({ isOpen, onClose, userId, userName }: ChatPopupProps) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isConnected,
    privateMessages,
    sendPrivateMessage,
    loadPrivateMessages,
    markAsRead,
    typingUsers,
    startTyping,
    stopTyping,
  } = useChatHub({
    showToasts: false, // Don't show toasts in popup - we're already viewing messages
  });

  // Load messages when popup opens
  useEffect(() => {
    if (isOpen && isConnected && userId) {
      loadPrivateMessages(userId);
    }
  }, [isOpen, isConnected, userId, loadPrivateMessages]);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [privateMessages, isMinimized, scrollToBottom]);

  // Mark messages as read
  useEffect(() => {
    if (!isOpen || isMinimized || !userId || !isConnected) return;

    const messages = privateMessages[userId] || [];
    const unreadMessageIds = messages
      .filter((msg) => msg.targetUserId === user?.id && !msg.isRead)
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      markAsRead(unreadMessageIds);
    }
  }, [isOpen, isMinimized, userId, privateMessages, user?.id, isConnected, markAsRead]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !isConnected) return;

    try {
      await sendPrivateMessage(userId, messageInput);
      setMessageInput('');
      stopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (e.target.value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const currentMessages = privateMessages[userId] || [];
  const isOtherUserTyping = typingUsers.some((t) => t.userId === userId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 shadow-2xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm truncate">{userName}</h3>
              {isConnected ? (
                <span className="text-xs text-blue-200">Çevrimiçi</span>
              ) : (
                <span className="text-xs text-blue-300">Bağlanıyor...</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/app/messaging?userId=${userId}&userName=${encodeURIComponent(userName)}`}
              className="p-1.5 hover:bg-blue-500 rounded transition-colors"
              title="Tam ekranda aç"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-blue-500 rounded transition-colors"
              title={isMinimized ? 'Genişlet' : 'Küçült'}
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-blue-500 rounded transition-colors"
              title="Kapat"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area - collapsible */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Messages */}
              <div className="h-72 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-900">
                {currentMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                    Henüz mesaj yok. İlk mesajı gönderin!
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isOwn = msg.userId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {dayjs(msg.timestamp).format('HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing indicator */}
                {isOtherUserTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={!isConnected}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isConnected}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
