import React, { useState } from 'react';

import { WhatsAppOutlined, PhoneOutlined, MessageOutlined, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: <WhatsAppOutlined />, label: 'WhatsApp', color: '#25D366', link: 'https://wa.me/905555555555' },
    { icon: <PhoneOutlined />, label: 'Telefon', color: '#667eea', link: 'tel:+905555555555' },
    { icon: <MessageOutlined />, label: 'Mesaj', color: '#1890ff', onClick: () => {} },
    { icon: <QuestionCircleOutlined />, label: 'Yardım', color: '#764ba2', onClick: () => {} }
  ];

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'absolute',
              bottom: 70,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {actions.map((action, index) => (
              <motion.a
                key={index}
                href={action.link}
                onClick={action.onClick}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  background: 'white',
                  borderRadius: 25,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  textDecoration: 'none',
                  color: '#333',
                  cursor: 'pointer',
                  minWidth: 150
                }}
              >
                <div 
                  style={{ 
                    fontSize: 20, 
                    color: action.color,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {action.icon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{action.label}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: 'white',
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {isOpen ? <CloseOutlined /> : <MessageOutlined />}
      </motion.button>
    </div>
  );
};