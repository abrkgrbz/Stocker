'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Input, Button, List, Avatar, Badge, Typography, Empty, Tabs, Tooltip, Spin } from 'antd';
import {
  PaperAirplaneIcon,
  UserGroupIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useChatHub, ChatMessage as SignalRMessage, ChatUser } from '@/lib/signalr/chat-hub';
import { useChat } from '@/features/chat/hooks/useChat';
import { ChatConversation } from '@/features/chat/types/chat.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ChatPage() {
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, fetchConversations, isLoading: storeLoading } = useChat();

  const {
    isConnected,
    messages,
    onlineUsers,
    typingUsers,
    unreadCount,
    currentRoom,
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    getOnlineUsers,
  } = useChatHub({
    showToasts: true,
    onMessage: (msg) => {
      scrollToBottom();
    },
    onPrivateMessage: (msg) => {
      scrollToBottom();
    },
  });

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (isConnected) {
      getOnlineUsers();
    }
  }, [isConnected, getOnlineUsers]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    if (selectedConversation?.isPrivate && selectedConversation.userId) {
      await sendPrivateMessage(selectedConversation.userId, messageInput);
    } else if (currentRoom) {
      await sendMessage(messageInput, currentRoom);
    }

    setMessageInput('');
    stopTyping(currentRoom || undefined);
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

    if (currentRoom) {
      await leaveRoom(currentRoom);
    }

    if (!conversation.isPrivate && conversation.roomName) {
      await joinRoom(conversation.roomName);
    }
  };

  const handleSelectUser = async (user: ChatUser) => {
    const conv: ChatConversation = {
      userId: user.userId,
      userName: user.userName,
      isPrivate: true,
      unreadCount: 0,
    };
    setSelectedConversation(conv);
  };

  const filteredOnlineUsers = onlineUsers.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderConversationList = () => (
    <List
      dataSource={conversations}
      locale={{ emptyText: <Empty description="Henuz konusma yok" /> }}
      renderItem={(conv) => (
        <List.Item
          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-3 ${
            selectedConversation?.userId === conv.userId || selectedConversation?.roomName === conv.roomName
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : ''
          }`}
          onClick={() => handleSelectConversation(conv)}
        >
          <List.Item.Meta
            avatar={
              <Badge count={conv.unreadCount} size="small">
                <Avatar icon={conv.isPrivate ? <UserIcon className="w-4 h-4" /> : <UserGroupIcon className="w-4 h-4" />} />
              </Badge>
            }
            title={
              <div className="flex items-center justify-between">
                <Text strong>{conv.isPrivate ? conv.userName : conv.roomName}</Text>
                {conv.lastMessage && (
                  <Text type="secondary" className="text-xs">
                    {dayjs(conv.lastMessage.sentAt).fromNow()}
                  </Text>
                )}
              </div>
            }
            description={
              conv.lastMessage && (
                <Text type="secondary" ellipsis className="text-sm">
                  {conv.lastMessage.content}
                </Text>
              )
            }
          />
        </List.Item>
      )}
    />
  );

  const renderOnlineUsersList = () => (
    <div className="p-4">
      <Input
        placeholder="Kullanici ara..."
        prefix={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <List
        dataSource={filteredOnlineUsers}
        locale={{ emptyText: <Empty description="Cevrimici kullanici yok" /> }}
        renderItem={(user) => (
          <List.Item
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-2 rounded"
            onClick={() => handleSelectUser(user)}
          >
            <List.Item.Meta
              avatar={
                <Badge status="success" dot>
                  <Avatar icon={<UserIcon className="w-4 h-4" />} size="small" />
                </Badge>
              }
              title={<Text>{user.userName}</Text>}
              description={
                <Text type="secondary" className="text-xs">
                  {dayjs(user.connectedAt).fromNow()} beri cevrimici
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  const renderMessages = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <Empty description="Henuz mesaj yok. Bir mesaj gondererek baslayabilirsiniz." />
        </div>
      ) : (
        messages.map((msg) => {
          const isOwn = false; // TODO: Compare with current user ID
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                {!isOwn && (
                  <Text strong className="block text-sm mb-1">
                    {msg.userName}
                  </Text>
                )}
                <Text className={isOwn ? 'text-white' : ''}>{msg.message}</Text>
                <Text type="secondary" className={`block text-xs mt-1 ${isOwn ? 'text-blue-100' : ''}`}>
                  {dayjs(msg.timestamp).format('HH:mm')}
                </Text>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingNames = typingUsers.map((u) => u.userName).join(', ');
    return (
      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
        {typingNames} yaziyor...
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* Left Sidebar - Conversations & Online Users */}
      <Card className="w-80 flex flex-col" bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Title level={5} className="m-0">
              <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
              Mesajlar
            </Title>
            <Badge count={unreadCount} showZero={false}>
              <span />
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Badge status={isConnected ? 'success' : 'error'} />
            <Text type="secondary">{isConnected ? 'Bagli' : 'Baglanti yok'}</Text>
          </div>
        </div>

        <Tabs defaultActiveKey="conversations" className="flex-1" style={{ display: 'flex', flexDirection: 'column' }}>
          <Tabs.TabPane
            tab={
              <span>
                <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-1" />
                Konusmalar
              </span>
            }
            key="conversations"
          >
            {storeLoading ? (
              <div className="flex justify-center p-8">
                <Spin />
              </div>
            ) : (
              renderConversationList()
            )}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <Badge count={onlineUsers.length} size="small" offset={[10, 0]}>
                  <UserGroupIcon className="w-4 h-4 inline mr-1" />
                  Cevrimici
                </Badge>
              </span>
            }
            key="online"
          >
            {renderOnlineUsersList()}
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col" bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {selectedConversation || currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  icon={
                    selectedConversation?.isPrivate ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <UserGroupIcon className="w-4 h-4" />
                    )
                  }
                />
                <div>
                  <Text strong className="block">
                    {selectedConversation?.isPrivate
                      ? selectedConversation?.userName
                      : selectedConversation?.roomName || currentRoom}
                  </Text>
                  <Text type="secondary" className="text-sm">
                    {selectedConversation?.isPrivate ? 'Ozel Sohbet' : 'Grup Sohbeti'}
                  </Text>
                </div>
              </div>
            </div>

            {/* Messages */}
            {renderMessages()}

            {/* Typing Indicator */}
            {renderTypingIndicator()}

            {/* Message Input */}
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex gap-2">
                <TextArea
                  placeholder="Mesajinizi yazin..."
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="flex-1"
                />
                <Button
                  type="primary"
                  icon={<PaperAirplaneIcon className="w-5 h-5" />}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Empty
              image={<ChatBubbleLeftRightIcon className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600" />}
              description={
                <div className="text-center">
                  <Title level={4} className="text-gray-500 dark:text-gray-400">
                    Bir konusma secin
                  </Title>
                  <Text type="secondary">
                    Sol panelden bir konusma secin veya cevrimici kullanicilara mesaj gonderin.
                  </Text>
                </div>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
