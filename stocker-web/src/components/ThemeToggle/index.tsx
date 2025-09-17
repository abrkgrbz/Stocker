import React from 'react';

import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { motion } from 'framer-motion';

import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          type="text"
          icon={
            <motion.div
              initial={false}
              animate={{ rotate: themeMode === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {themeMode === 'light' ? (
                <MoonOutlined style={{ fontSize: 20 }} />
              ) : (
                <SunOutlined style={{ fontSize: 20 }} />
              )}
            </motion.div>
          }
          onClick={toggleTheme}
          className="theme-toggle-btn"
        />
      </motion.div>
    </Tooltip>
  );
};