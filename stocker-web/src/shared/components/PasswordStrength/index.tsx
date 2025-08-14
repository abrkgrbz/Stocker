import React, { useState, useEffect } from 'react';
import { Progress, Space, Typography, Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';
import './style.css';

const { Text } = Typography;

interface PasswordStrengthProps {
  password: string;
  username?: string;
  email?: string;
  onStrengthChange?: (strength: PasswordStrengthData) => void;
  showRequirements?: boolean;
  showSuggestions?: boolean;
}

interface PasswordStrengthData {
  score: number;
  scoreLabel: string;
  entropy: number;
  feedback: string[];
  suggestions: string[];
  isAcceptable: boolean;
}

interface ValidationError {
  code: string;
  message: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  username,
  email,
  onStrengthChange,
  showRequirements = true,
  showSuggestions = true
}) => {
  const [strength, setStrength] = useState<PasswordStrengthData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Password requirements
  const requirements = [
    { 
      key: 'length',
      label: 'En az 8 karakter',
      test: (pwd: string) => pwd.length >= 8 
    },
    { 
      key: 'uppercase',
      label: 'En az 1 büyük harf',
      test: (pwd: string) => /[A-Z]/.test(pwd)
    },
    { 
      key: 'lowercase',
      label: 'En az 1 küçük harf',
      test: (pwd: string) => /[a-z]/.test(pwd)
    },
    { 
      key: 'digit',
      label: 'En az 1 rakam',
      test: (pwd: string) => /\d/.test(pwd)
    },
    { 
      key: 'special',
      label: 'En az 1 özel karakter (!@#$%^&*)',
      test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)
    }
  ];

  // Check password strength from API
  useEffect(() => {
    const checkStrength = async () => {
      if (!password) {
        setStrength(null);
        setValidationErrors([]);
        return;
      }

      try {
        // Check strength
        const strengthResponse = await apiClient.post('/api/public/password/check-strength', {
          password
        });

        if (strengthResponse.data?.success) {
          const strengthData = strengthResponse.data.data;
          setStrength(strengthData);
          onStrengthChange?.(strengthData);
        }

        // Validate against policy if username or email provided
        if (username || email) {
          const validateResponse = await apiClient.post('/api/public/password/validate', {
            password,
            username,
            email
          });

          if (!validateResponse.data?.success) {
            setValidationErrors(validateResponse.data?.errors || []);
          } else {
            setValidationErrors([]);
          }
        }
      } catch (error: any) {
        // If API fails, do client-side basic check
        const clientStrength = calculateClientStrength(password);
        setStrength(clientStrength);
        onStrengthChange?.(clientStrength);
      }
    };

    const timer = setTimeout(checkStrength, 300); // Debounce
    return () => clearTimeout(timer);
  }, [password, username, email]);

  // Client-side strength calculation (fallback)
  const calculateClientStrength = (pwd: string): PasswordStrengthData => {
    let score = 0;
    const feedback: string[] = [];
    const suggestions: string[] = [];

    // Length score
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;

    // Character diversity
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)) score++;

    // Normalize to 0-5
    score = Math.min(5, Math.floor(score * 5 / 10));

    // Generate feedback
    if (pwd.length < 8) {
      feedback.push('Şifre çok kısa');
      suggestions.push('En az 8 karakter kullanın');
    }
    if (!/[A-Z]/.test(pwd)) {
      suggestions.push('Büyük harf ekleyin');
    }
    if (!/[a-z]/.test(pwd)) {
      suggestions.push('Küçük harf ekleyin');
    }
    if (!/\d/.test(pwd)) {
      suggestions.push('Rakam ekleyin');
    }
    if (!/[!@#$%^&*]/.test(pwd)) {
      suggestions.push('Özel karakter ekleyin');
    }

    const labels = ['Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü', 'Mükemmel'];

    return {
      score,
      scoreLabel: labels[score] || 'Bilinmiyor',
      entropy: pwd.length * 4, // Simplified
      feedback,
      suggestions,
      isAcceptable: score >= 3
    };
  };

  // Get progress bar color
  const getProgressColor = (score: number) => {
    const colors = ['#ff4d4f', '#ff7a45', '#ffa940', '#52c41a', '#52c41a', '#389e0d'];
    return colors[score] || '#d9d9d9';
  };

  // Get strength icon
  const getStrengthIcon = (score: number) => {
    if (score <= 1) return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    if (score === 2) return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
  };

  if (!password) {
    return null;
  }

  return (
    <div className="password-strength-container">
      {/* Strength Meter */}
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="strength-meter">
          <Space>
            <Text type="secondary">Şifre Gücü:</Text>
            {strength && (
              <>
                {getStrengthIcon(strength.score)}
                <Text strong style={{ color: getProgressColor(strength.score) }}>
                  {strength.scoreLabel}
                </Text>
              </>
            )}
          </Space>
          <Progress
            percent={(strength?.score || 0) * 20}
            strokeColor={getProgressColor(strength?.score || 0)}
            showInfo={false}
            size="small"
          />
        </div>

        {/* Requirements Checklist */}
        {showRequirements && (
          <div className="requirements-list">
            <Space size={[8, 4]} wrap>
              {requirements.map(req => {
                const passed = req.test(password);
                return (
                  <Tag
                    key={req.key}
                    icon={passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={passed ? 'success' : 'default'}
                  >
                    {req.label}
                  </Tag>
                );
              })}
            </Space>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            {validationErrors.map((error, index) => (
              <Text key={index} type="danger" style={{ display: 'block' }}>
                <CloseCircleOutlined /> {error.message}
              </Text>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && strength?.suggestions && strength.suggestions.length > 0 && (
          <div className="suggestions">
            <Text type="secondary" style={{ fontSize: 12 }}>
              <InfoCircleOutlined /> Öneriler:
            </Text>
            <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
              {strength.suggestions.map((suggestion, index) => (
                <li key={index}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {suggestion}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feedback */}
        {strength?.feedback && strength.feedback.length > 0 && (
          <div className="feedback">
            {strength.feedback.map((item, index) => (
              <Text key={index} type="warning" style={{ display: 'block', fontSize: 12 }}>
                <ExclamationCircleOutlined /> {item}
              </Text>
            ))}
          </div>
        )}

        {/* Entropy Info (Optional) */}
        {strength && strength.entropy > 0 && (
          <Tooltip title="Entropi, şifrenizin tahmin edilme zorluğunu gösterir. Yüksek entropi = daha güvenli">
            <Text type="secondary" style={{ fontSize: 11 }}>
              Entropi: {Math.round(strength.entropy)} bit
            </Text>
          </Tooltip>
        )}
      </Space>
    </div>
  );
};

export default PasswordStrength;