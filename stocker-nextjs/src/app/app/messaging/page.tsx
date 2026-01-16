'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  FaceSmileIcon,
  PaperClipIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  TrashIcon,
  ArchiveBoxIcon,
  BellSlashIcon,
  InformationCircleIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid } from '@heroicons/react/24/solid';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChatHub, ChatMessage as SignalRMessage, ChatUser } from '@/lib/signalr/chat-hub';
import { useChat } from '@/features/chat/hooks/useChat';
import { ChatConversation } from '@/features/chat/types/chat.types';
import { useAuth } from '@/lib/auth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

// Tab type for segmented control
type TabType = 'conversations' | 'online';

export default function MessagingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('conversations');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  const { conversations, fetchConversations, isLoading: storeLoading, markMessagesAsRead: storeMarkAsRead } = useChat();
  // Local state for conversation unread counts (updated when messages are read)
  const [localConversations, setLocalConversations] = useState<ChatConversation[]>([]);

  const {
    isConnected,
    messages,
    privateMessages,
    onlineUsers,
    typingUsers,
    unreadCount,
    currentRoom,
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    leaveRoom,
    loadPrivateMessages,
    markAsRead,
    startTyping,
    stopTyping,
    getOnlineUsers,
  } = useChatHub({
    showToasts: true,
    onMessage: () => scrollToBottom(),
    onPrivateMessage: () => scrollToBottom(),
  });

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Sync conversations to local state
  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (isConnected) {
      getOnlineUsers();
    }
  }, [isConnected, getOnlineUsers]);

  // Handle URL parameters for direct navigation to a conversation
  useEffect(() => {
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');

    if (userId && isConnected && !selectedConversation) {
      // Create a conversation object for the user from URL params
      const conv: ChatConversation = {
        userId: userId,
        userName: userName || 'Kullanıcı',
        isPrivate: true,
        unreadCount: 0,
      };

      // Select the conversation and load messages
      setSelectedConversation(conv);
      setIsMobileListVisible(false);
      loadPrivateMessages(userId);

      // Clear URL params after handling (optional - keeps URL clean)
      router.replace('/app/messaging', { scroll: false });
    }
  }, [searchParams, isConnected, selectedConversation, loadPrivateMessages, router]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, privateMessages, scrollToBottom]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!selectedConversation?.isPrivate || !selectedConversation.userId || !isConnected) return;

    const conversationMessages = privateMessages[selectedConversation.userId] || [];
    // Find unread messages that were sent TO me (not FROM me)
    const unreadMessageIds = conversationMessages
      .filter((msg) => msg.targetUserId === user?.id && !msg.isRead)
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      markAsRead(unreadMessageIds);
    }
  }, [selectedConversation, privateMessages, user?.id, isConnected, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      if (selectedConversation?.isPrivate && selectedConversation.userId) {
        // Private message
        console.log('Sending private message to:', selectedConversation.userId);
        await sendPrivateMessage(selectedConversation.userId, messageInput);
      } else if (currentRoom) {
        // Room message
        console.log('Sending room message to:', currentRoom);
        await sendMessage(messageInput, currentRoom);
      } else {
        // No conversation selected - send to global or default room
        console.log('No room selected, sending to global');
        await sendMessage(messageInput);
      }

      setMessageInput('');
      stopTyping(currentRoom || undefined);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (e.target.value) {
      startTyping(currentRoom || undefined);
    } else {
      stopTyping(currentRoom || undefined);
    }
  };

  const handleSelectConversation = async (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setIsMobileListVisible(false);

    if (currentRoom) {
      await leaveRoom(currentRoom);
    }

    if (conversation.isPrivate && conversation.userId) {
      // Load private message history for this user
      if (isConnected) {
        await loadPrivateMessages(conversation.userId);
      }

      // Mark conversation as read locally (reset unread count to 0)
      if (conversation.unreadCount && conversation.unreadCount > 0) {
        setLocalConversations((prev) =>
          prev.map((conv) =>
            conv.userId === conversation.userId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } else if (conversation.roomName) {
      await joinRoom(conversation.roomName);
    }
  };

  const handleSelectUser = async (chatUser: ChatUser) => {
    const conv: ChatConversation = {
      userId: chatUser.userId,
      userName: chatUser.userName,
      isPrivate: true,
      unreadCount: 0,
    };
    setSelectedConversation(conv);
    setIsMobileListVisible(false);

    // Load private message history for this user
    if (isConnected) {
      await loadPrivateMessages(chatUser.userId);
    }
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
  };

  const handleNewChat = () => {
    setActiveTab('online');
  };

  const handleChatMenuToggle = () => {
    setShowChatMenu(!showChatMenu);
  };

  const handleDeleteConversation = () => {
    // TODO: Implement delete conversation
    setShowChatMenu(false);
    setSelectedConversation(null);
  };

  const handleMuteConversation = () => {
    // TODO: Implement mute conversation
    setShowChatMenu(false);
  };

  const handleArchiveConversation = () => {
    // TODO: Implement archive conversation
    setShowChatMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setShowChatMenu(false);
      }
    };

    if (showChatMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatMenu]);

  const filteredOnlineUsers = onlineUsers.filter(
    (chatUser) =>
      chatUser.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chatUser.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = localConversations.filter(
    (conv) =>
      (conv.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.roomName?.toLowerCase().includes(searchTerm.toLowerCase())) ?? true
  );

  // Get current messages based on conversation type
  const currentMessages = selectedConversation?.isPrivate && selectedConversation.userId
    ? privateMessages[selectedConversation.userId] || []
    : messages;

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Random avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-violet-500',
      'bg-blue-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-cyan-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Left Sidebar - Conversations & Online Users */}
      <aside
        className={`
          w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col
          ${isMobileListVisible ? 'flex' : 'hidden md:flex'}
        `}
      >
        {/* Header */}
        <div className="p-4 lg:p-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Back to App button */}
              <button
                onClick={() => router.push('/app')}
                className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Ana sayfaya dön"
              >
                <HomeIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-2">
                <ChatBubbleLeftRightIconSolid className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-semibold text-slate-900">Mesajlar</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Yeni sohbet başlat"
            >
              <PlusIcon className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Connection Status Badge */}
          <div
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4
              ${isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}
            `}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isConnected ? 'Bağlı' : 'Bağlantı yok'}
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${activeTab === 'conversations'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }
              `}
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Konuşmalar
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${activeTab === 'online'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }
              `}
            >
              <UserGroupIcon className="w-4 h-4" />
              Çevrimiçi
              {onlineUsers.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                  {onlineUsers.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'conversations' ? (
            // Conversations List
            <div className="py-2">
              {storeLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="mt-3 text-sm text-slate-500">Yükleniyor...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 text-center">Henüz konuşma yok</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected =
                    selectedConversation?.userId === conv.userId ||
                    selectedConversation?.roomName === conv.roomName;
                  const displayName = conv.isPrivate ? conv.userName : conv.roomName;

                  return (
                    <button
                      key={conv.userId || conv.roomName}
                      onClick={() => handleSelectConversation(conv)}
                      className={`
                        w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors
                        ${isSelected ? 'bg-indigo-50 hover:bg-indigo-50' : ''}
                      `}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <div
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-white font-medium
                            ${conv.isPrivate ? getAvatarColor(displayName || 'U') : 'bg-slate-600'}
                          `}
                        >
                          {conv.isPrivate ? (
                            getInitials(displayName || 'U')
                          ) : (
                            <UserGroupIcon className="w-5 h-5" />
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span
                            className={`
                              font-medium truncate
                              ${isSelected ? 'text-indigo-900' : 'text-slate-900'}
                            `}
                          >
                            {displayName}
                          </span>
                          {conv.lastMessage && (
                            <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                              {dayjs(conv.lastMessage.sentAt).fromNow()}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-sm text-slate-500 truncate mt-0.5">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            // Online Users List
            <div className="py-2">
              {filteredOnlineUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <UserGroupIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 text-center">Çevrimiçi kullanıcı yok</p>
                </div>
              ) : (
                filteredOnlineUsers.map((chatUser) => (
                  <button
                    key={chatUser.userId}
                    onClick={() => handleSelectUser(chatUser)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(chatUser.userName)}`}
                      >
                        {getInitials(chatUser.userName)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-medium text-slate-900 block truncate">
                        {chatUser.userName}
                      </span>
                      <span className="text-xs text-emerald-600">
                        {dayjs(chatUser.connectedAt).fromNow()} beri çevrimiçi
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main
        className={`
          flex-1 flex flex-col bg-white
          ${!isMobileListVisible ? 'flex' : 'hidden md:flex'}
        `}
      >
        {selectedConversation || currentRoom ? (
          <>
            {/* Chat Header */}
            <header className="px-4 lg:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                <button
                  onClick={handleBackToList}
                  className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
                </button>

                {/* Avatar */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
                    ${selectedConversation?.isPrivate
                      ? getAvatarColor(selectedConversation?.userName || 'U')
                      : 'bg-slate-600'
                    }
                  `}
                >
                  {selectedConversation?.isPrivate ? (
                    getInitials(selectedConversation?.userName || 'U')
                  ) : (
                    <UserGroupIcon className="w-5 h-5" />
                  )}
                </div>

                {/* Info */}
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {selectedConversation?.isPrivate
                      ? selectedConversation?.userName
                      : selectedConversation?.roomName || currentRoom}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedConversation?.isPrivate ? 'Özel Sohbet' : 'Grup Sohbeti'}
                  </p>
                </div>
              </div>

              {/* Chat Menu */}
              <div className="relative" ref={chatMenuRef}>
                <button
                  onClick={handleChatMenuToggle}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5 text-slate-600" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showChatMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                    >
                      <button
                        onClick={handleMuteConversation}
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <BellSlashIcon className="w-5 h-5 text-slate-400" />
                        Bildirimleri kapat
                      </button>
                      <button
                        onClick={handleArchiveConversation}
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ArchiveBoxIcon className="w-5 h-5 text-slate-400" />
                        Arşivle
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={handleDeleteConversation}
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                        Sohbeti sil
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-slate-50">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-1">Sohbete başlayın</h3>
                  <p className="text-sm text-slate-500 text-center max-w-xs">
                    Bu sohbette henüz mesaj yok. Bir mesaj göndererek başlayabilirsiniz.
                  </p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isOwn = msg.userId === user?.id;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar for others */}
                        {!isOwn && (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${getAvatarColor(msg.userName)}`}
                          >
                            {getInitials(msg.userName)}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`
                            px-4 py-2.5 rounded-2xl
                            ${isOwn
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'bg-white text-slate-900 shadow-sm border border-slate-100 rounded-bl-md'
                            }
                          `}
                        >
                          {!isOwn && (
                            <span className="text-xs font-medium text-indigo-600 block mb-1">
                              {msg.userName}
                            </span>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                            <span className={`text-xs ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {dayjs(msg.timestamp).format('HH:mm')}
                            </span>
                            {isOwn && <CheckIcon className="w-3.5 h-3.5 text-indigo-200" />}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            <AnimatePresence>
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4 lg:px-6 py-2 bg-slate-50 border-t border-slate-100"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="italic">
                      {typingUsers.map((u) => u.userName).join(', ')} yazıyor...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input */}
            <div className="p-4 lg:p-6 bg-white border-t border-slate-200">
              <div className="flex items-end gap-3">
                {/* Attachment Button */}
                <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <PaperClipIcon className="w-5 h-5" />
                </button>

                {/* Input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    placeholder="Mesajınızı yazın..."
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    rows={1}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors">
                    <FaceSmileIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                  className={`
                    p-3 rounded-xl transition-all
                    ${messageInput.trim() && isConnected
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/25'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State - No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
            <div className="text-center max-w-md">
              {/* Illustration */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                {/* Background circles */}
                <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-50" />
                <div className="absolute inset-4 bg-indigo-200 rounded-full opacity-50" />
                <div className="absolute inset-8 bg-indigo-300 rounded-full opacity-50" />
                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChatBubbleLeftRightIconSolid className="w-16 h-16 text-indigo-600" />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">+</span>
                </div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-emerald-400 rounded-full" />
              </div>

              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Mesajlarınız</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Yeni bir sohbete başlamak için sol listeden bir konuşma seçin veya çevrimiçi
                kullanıcılara mesaj gönderin.
              </p>

              {/* CTA Button */}
              <button
                onClick={() => setActiveTab('online')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
              >
                <PlusIcon className="w-5 h-5" />
                Yeni Mesaj Oluştur
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
