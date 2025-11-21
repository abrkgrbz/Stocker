'use client';

import React, { useMemo } from 'react';
import { Progress, Space, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { calculatePasswordStrength, type PasswordStrength } from '@/lib/auth/password-recovery';

const { Text } = Typography;

export interface PasswordStrengthMeterProps {
  password: string;
  showFeedback?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PasswordStrengthMeter({
  password,
  showFeedback = true,
  className,
  style,
}: PasswordStrengthMeterProps) {
  const strength: PasswordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  if (!password) {
    return null;
  }

  const strengthLabels = {
    'very-weak': 'Çok Zayıf',
    weak: 'Zayıf',
    medium: 'Orta',
    strong: 'Güçlü',
    'very-strong': 'Çok Güçlü',
  };

  const progressPercent = (strength.score / 4) * 100;

  return (
    <div className={className} style={style}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Progress Bar */}
        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Şifre Gücü: {strengthLabels[strength.strength]}
          </Text>
          <Progress
            percent={progressPercent}
            strokeColor={strength.color}
            showInfo={false}
            size="small"
            style={{ marginBottom: 0 }}
          />
        </div>

        {/* Feedback Messages */}
        {showFeedback && strength.feedback.length > 0 && (
          <Space direction="vertical" size={2}>
            {strength.feedback.map((message, index) => {
              const isPositive = message.includes('✓') || message.includes('Güçlü') || message.includes('İyi');
              const icon = isPositive ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : message.includes('ekleyin') || message.includes('olmalı') ? (
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              ) : (
                <InfoCircleOutlined style={{ color: '#faad14' }} />
              );

              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {icon}
                  <Text
                    style={{
                      fontSize: '12px',
                      color: isPositive ? '#52c41a' : '#595959',
                    }}
                  >
                    {message}
                  </Text>
                </div>
              );
            })}
          </Space>
        )}
      </Space>
    </div>
  );
}
