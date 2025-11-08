'use client';

import React from 'react';
import { Card, CardProps } from 'antd';
import { motion } from 'framer-motion';

interface AnimatedCardProps extends CardProps {
  delay?: number;
  children: React.ReactNode;
}

export function AnimatedCard({ children, delay = 0, ...cardProps }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        {...cardProps}
        bordered={false}
        className={`shadow-md hover:shadow-xl transition-all duration-300 rounded-lg ${cardProps.className || ''}`}
        style={{
          border: '1px solid #f0f0f0',
          ...cardProps.style
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
}
