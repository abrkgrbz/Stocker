import React, { useMemo } from 'react';
import { Progress, Space, Typography, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

const { Text } = Typography;

interface FormField {
  name: string;
  label: string;
  required?: boolean;
  value?: any;
}

interface FormProgressProps {
  fields: FormField[];
  currentStep?: number;
  totalSteps?: number;
  showDetails?: boolean;
  compact?: boolean;
}

export const FormProgress: React.FC<FormProgressProps> = ({
  fields,
  currentStep,
  totalSteps,
  showDetails = true,
  compact = false
}) => {
  const progress = useMemo(() => {
    const requiredFields = fields.filter(f => f.required !== false);
    const filledFields = requiredFields.filter(f => {
      const value = f.value;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    });

    const percentage = requiredFields.length > 0
      ? Math.round((filledFields.length / requiredFields.length) * 100)
      : 0;

    return {
      filled: filledFields.length,
      total: requiredFields.length,
      percentage,
      remaining: requiredFields.length - filledFields.length
    };
  }, [fields]);

  const getProgressColor = () => {
    if (progress.percentage < 30) return '#ff4d4f';
    if (progress.percentage < 60) return '#faad14';
    if (progress.percentage < 100) return '#52c41a';
    return '#52c41a';
  };

  const getProgressStatus = () => {
    if (progress.percentage === 100) return 'success';
    if (progress.percentage >= 60) return 'active';
    return 'normal';
  };

  if (compact) {
    return (
      <div className="form-progress-compact">
        <Tooltip
          title={
            <div>
              <div>Tamamlanan: {progress.filled}/{progress.total}</div>
              <div>Kalan: {progress.remaining} alan</div>
            </div>
          }
        >
          <Progress
            percent={progress.percentage}
            size="small"
            strokeColor={getProgressColor()}
            status={getProgressStatus()}
            format={(percent) => `${percent}%`}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <motion.div
      className="form-progress-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="progress-header">
        <Space>
          <InfoCircleOutlined style={{ color: '#667eea' }} />
          <Text strong>Form İlerleme Durumu</Text>
        </Space>
        {currentStep && totalSteps && (
          <Text type="secondary">
            Adım {currentStep}/{totalSteps}
          </Text>
        )}
      </div>

      <Progress
        percent={progress.percentage}
        strokeColor={{
          '0%': '#667eea',
          '100%': '#764ba2'
        }}
        status={getProgressStatus()}
        size="default"
      />

      {showDetails && (
        <div className="progress-details">
          <Space size="large">
            <div className="progress-stat">
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
              <Text>{progress.filled} alan tamamlandı</Text>
            </div>
            <div className="progress-stat">
              <ClockCircleOutlined style={{ color: '#faad14', marginRight: 4 }} />
              <Text>{progress.remaining} alan kaldı</Text>
            </div>
          </Space>

          {progress.percentage === 100 && (
            <motion.div
              className="progress-complete"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              <Text strong style={{ color: '#52c41a' }}>
                Tüm gerekli alanlar dolduruldu!
              </Text>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Minimalist progress bar
interface MiniProgressProps {
  value: number;
  max: number;
  label?: string;
}

export const MiniProgress: React.FC<MiniProgressProps> = ({ value, max, label }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="mini-progress">
      {label && <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>}
      <div className="mini-progress-bar">
        <motion.div
          className="mini-progress-fill"
          style={{
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <Text type="secondary" style={{ fontSize: 11 }}>
        {value}/{max}
      </Text>
    </div>
  );
};

// Circular progress for step forms
interface CircularProgressProps {
  current: number;
  total: number;
  size?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  current,
  total,
  size = 120
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="circular-progress-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          className="circular-progress-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            stroke: 'url(#gradient)',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%'
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="circular-progress-text">
        <div className="circular-progress-value">{current}</div>
        <div className="circular-progress-label">/ {total}</div>
      </div>
    </div>
  );
};