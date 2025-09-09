import React, { useState, useEffect, useRef } from 'react';
import {
  Badge,
  Button,
  Input,
  Avatar,
  Space,
  Typography,
  Tooltip,
  Card,
  List,
  Upload,
  message as antMessage,
  Popover,
  Rate,
  Tag
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  SmileOutlined,
  PaperClipOutlined,
  CustomerServiceOutlined,
  MinusOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import './style.css';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: string[];
  agentInfo?: {
    name: string;
    avatar?: string;
    title?: string;
  };
}

interface LiveChatProps {
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  onClose?: () => void;
  userId?: string;
  metadata?: Record<string, any>;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  position = 'bottom-right',
  primaryColor = '#667eea',
  onClose,
  userId,
  metadata
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [agentTyping, setAgentTyping] = useState(false);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      connectToAgent();
    }
  }, [isOpen]);

  // Simulate connection to agent
  const connectToAgent = async () => {
    setIsConnecting(true);
    
    // Add system message
    addMessage({
      type: 'system',
      content: 'Destek ekibine bağlanıyorsunuz...'
    });

    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      
      // Add agent joined message
      addMessage({
        type: 'agent',
        content: 'Merhaba! Ben Ayşe, müşteri temsilcinizim. Size nasıl yardımcı olabilirim?',
        agentInfo: {
          name: 'Ayşe Y.',
          title: 'Müşteri Temsilcisi',
          avatar: 'https://i.pravatar.cc/150?img=1'
        }
      });
    }, 2000);
  };

  const addMessage = (messageData: Partial<Message>) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'sent',
      ...messageData
    } as Message;

    setMessages(prev => [...prev, newMessage]);

    // Update unread count if chat is minimized
    if (isMinimized && messageData.type === 'agent') {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: inputMessage,
      status: 'sending'
    });

    setInputMessage('');

    // Simulate agent typing
    setTimeout(() => {
      setAgentTyping(true);
    }, 1000);

    // Simulate agent response
    setTimeout(() => {
      setAgentTyping(false);
      addMessage({
        type: 'agent',
        content: getAutoResponse(inputMessage),
        agentInfo: {
          name: 'Ayşe Y.',
          title: 'Müşteri Temsilcisi',
          avatar: 'https://i.pravatar.cc/150?img=1'
        }
      });
    }, 3000);
  };

  const getAutoResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('fiyat') || lowerMessage.includes('ücret')) {
      return 'Fiyatlandırma hakkında detaylı bilgi için https://stocker.app/pricing sayfamızı ziyaret edebilirsiniz. Özel teklifler için satış ekibimizle iletişime geçebilirsiniz.';
    }
    
    if (lowerMessage.includes('demo')) {
      return 'Demo talebi için https://stocker.app/demo linkinden form doldurabilirsiniz. Satış ekibimiz en kısa sürede sizinle iletişime geçecektir.';
    }
    
    if (lowerMessage.includes('destek') || lowerMessage.includes('yardım')) {
      return 'Size yardımcı olmaktan mutluluk duyarım! Lütfen yaşadığınız sorunu detaylı bir şekilde açıklayın.';
    }
    
    return 'Mesajınız için teşekkürler. Size en iyi şekilde yardımcı olabilmem için biraz daha detay verebilir misiniz?';
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = (file: File) => {
    // Simulate file upload
    antMessage.success(`${file.name} yüklendi`);
    
    addMessage({
      type: 'user',
      content: `Dosya gönderildi: ${file.name}`,
      attachments: [file.name]
    });
    
    return false; // Prevent default upload
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setUnreadCount(0);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setUnreadCount(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    if (isSystem) {
      return (
        <div key={message.id} className="chat-message-system">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {message.content}
          </Text>
        </div>
      );
    }

    return (
      <motion.div
        key={message.id}
        className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-agent'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isUser && message.agentInfo && (
          <Avatar
            src={message.agentInfo.avatar}
            style={{ marginRight: 8 }}
          >
            {message.agentInfo.name[0]}
          </Avatar>
        )}
        
        <div className="chat-message-content">
          {!isUser && message.agentInfo && (
            <div className="chat-message-header">
              <Text strong>{message.agentInfo.name}</Text>
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                {message.agentInfo.title}
              </Text>
            </div>
          )}
          
          <div className={`chat-message-bubble ${isUser ? 'user-bubble' : 'agent-bubble'}`}>
            <Text>{message.content}</Text>
            
            {message.attachments && (
              <div className="chat-message-attachments">
                {message.attachments.map((file, index) => (
                  <Tag key={index} icon={<PaperClipOutlined />}>
                    {file}
                  </Tag>
                ))}
              </div>
            )}
          </div>
          
          <div className="chat-message-meta">
            <Text type="secondary" style={{ fontSize: 11 }}>
              {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            
            {isUser && message.status && (
              <span className="chat-message-status">
                {message.status === 'sending' && <ClockCircleOutlined />}
                {message.status === 'sent' && <CheckCircleOutlined />}
                {message.status === 'delivered' && (
                  <span style={{ color: primaryColor }}>
                    <CheckCircleOutlined />
                    <CheckCircleOutlined style={{ marginLeft: -8 }} />
                  </span>
                )}
                {message.status === 'read' && (
                  <span style={{ color: primaryColor }}>
                    <CheckCircleOutlined />
                    <CheckCircleOutlined style={{ marginLeft: -8 }} />
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className={`live-chat-button live-chat-${position}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            style={{ background: primaryColor }}
          >
            <Badge count={unreadCount} offset={[-5, 5]}>
              <MessageOutlined style={{ fontSize: 24, color: 'white' }} />
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`live-chat-window live-chat-${position} ${isMinimized ? 'minimized' : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div 
              className="chat-header"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` }}
            >
              <div className="chat-header-info">
                <Space>
                  <Badge status={isConnected ? 'success' : 'processing'} />
                  <div>
                    <Text strong style={{ color: 'white', display: 'block' }}>
                      Canlı Destek
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 11 }}>
                      {isConnected ? 'Çevrimiçi' : 'Bağlanıyor...'}
                    </Text>
                  </div>
                </Space>
              </div>
              
              <Space>
                <Tooltip title="Küçült">
                  <Button
                    type="text"
                    icon={<MinusOutlined />}
                    onClick={handleMinimize}
                    style={{ color: 'white' }}
                  />
                </Tooltip>
                <Tooltip title="Kapat">
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={handleClose}
                    style={{ color: 'white' }}
                  />
                </Tooltip>
              </Space>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="chat-messages">
                  {messages.map(renderMessage)}
                  
                  {agentTyping && (
                    <div className="chat-typing">
                      <Avatar size="small" src="https://i.pravatar.cc/150?img=1">
                        A
                      </Avatar>
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input">
                  {showEmoji && (
                    <div className="emoji-picker-wrapper">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                  
                  <div className="chat-input-actions">
                    <Space>
                      <Tooltip title="Emoji">
                        <Button
                          type="text"
                          icon={<SmileOutlined />}
                          onClick={() => setShowEmoji(!showEmoji)}
                        />
                      </Tooltip>
                      <Upload
                        beforeUpload={handleFileUpload}
                        showUploadList={false}
                      >
                        <Tooltip title="Dosya Ekle">
                          <Button
                            type="text"
                            icon={<PaperClipOutlined />}
                          />
                        </Tooltip>
                      </Upload>
                    </Space>
                  </div>
                  
                  <TextArea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Mesajınızı yazın..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    disabled={!isConnected}
                  />
                  
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !isConnected}
                    style={{ background: primaryColor }}
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Quick Actions Floating Button
export const QuickActions: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const actions = [
    { icon: <MessageOutlined />, label: 'Canlı Destek', onClick: () => {} },
    { icon: <PhoneOutlined />, label: 'Bizi Arayın', onClick: () => {} },
    { icon: <MailOutlined />, label: 'E-posta Gönder', onClick: () => {} },
    { icon: <VideoCameraOutlined />, label: 'Video Görüşme', onClick: () => {} }
  ];

  return (
    <Popover
      content={
        <List
          dataSource={actions}
          renderItem={(item) => (
            <List.Item onClick={item.onClick} style={{ cursor: 'pointer' }}>
              <Space>
                {item.icon}
                <Text>{item.label}</Text>
              </Space>
            </List.Item>
          )}
        />
      }
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      placement="topRight"
    >
      <motion.div
        className="quick-actions-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <CustomerServiceOutlined style={{ fontSize: 24 }} />
      </motion.div>
    </Popover>
  );
};