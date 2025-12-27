'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Progress, Steps, Typography, Space, Spin, Result, Button } from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleStackIcon,
  TableCellsIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useSetupProgress, SetupStep } from '@/lib/hooks/use-setup-progress';

const { Title, Text, Paragraph } = Typography;

interface SetupProgressModalProps {
  visible: boolean;
  tenantId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
}

interface StepConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const stepConfigs: Record<SetupStep, StepConfig> = {
  initializing: {
    title: 'Başlatılıyor',
    description: 'Kurulum hazırlanıyor...',
    icon: <ArrowPathIcon className="w-5 h-5 animate-spin" />,
  },
  'creating-database': {
    title: 'Veritabanı',
    description: 'Veritabanı oluşturuluyor...',
    icon: <CircleStackIcon className="w-5 h-5" />,
  },
  'running-migrations': {
    title: 'Tablolar',
    description: 'Tablolar oluşturuluyor...',
    icon: <TableCellsIcon className="w-5 h-5" />,
  },
  'seeding-data': {
    title: 'Veriler',
    description: 'Temel veriler yükleniyor...',
    icon: <CloudArrowUpIcon className="w-5 h-5" />,
  },
  'configuring-modules': {
    title: 'Modüller',
    description: 'Modüller yapılandırılıyor...',
    icon: <Cog6ToothIcon className="w-5 h-5" />,
  },
  'creating-storage': {
    title: 'Depolama',
    description: 'Depolama alanı hazırlanıyor...',
    icon: <ShieldCheckIcon className="w-5 h-5" />,
  },
  'activating-tenant': {
    title: 'Aktivasyon',
    description: 'Hesap aktifleştiriliyor...',
    icon: <RocketLaunchIcon className="w-5 h-5" />,
  },
  completed: {
    title: 'Tamamlandı',
    description: 'Kurulum başarıyla tamamlandı!',
    icon: <CheckCircleIcon className="w-5 h-5" />,
  },
  failed: {
    title: 'Hata',
    description: 'Kurulum sırasında bir hata oluştu',
    icon: <XCircleIcon className="w-5 h-5" />,
  },
};

const stepOrder: SetupStep[] = [
  'initializing',
  'creating-database',
  'running-migrations',
  'seeding-data',
  'configuring-modules',
  'activating-tenant',
  'completed',
];

export const SetupProgressModal: React.FC<SetupProgressModalProps> = ({
  visible,
  tenantId,
  onComplete,
  onError,
  redirectUrl = '/dashboard',
}) => {
  const [hasConnected, setHasConnected] = useState(false);

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      // Default: redirect to dashboard
      window.location.href = redirectUrl;
    }
  };

  const {
    progress,
    currentStep,
    isConnected,
    isCompleted,
    hasError,
    errorMessage,
    connect,
  } = useSetupProgress({
    tenantId,
    onComplete: handleComplete,
    onError,
    autoRedirectDelay: 2000,
  });

  // Connect when modal becomes visible
  useEffect(() => {
    if (visible && tenantId && !hasConnected) {
      connect()
        .then(() => setHasConnected(true))
        .catch((err) => {
          console.error('Failed to connect to setup progress:', err);
        });
    }
  }, [visible, tenantId, hasConnected, connect]);

  const getCurrentStepIndex = () => {
    const index = stepOrder.indexOf(currentStep);
    return index >= 0 ? index : 0;
  };

  const renderContent = () => {
    if (hasError) {
      return (
        <Result
          status="error"
          title="Kurulum Başarısız"
          subTitle={errorMessage || 'Kurulum sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.'}
          extra={[
            <Button key="retry" type="primary" onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>,
            <Button key="support" onClick={() => window.open('mailto:destek@stoocker.app')}>
              Destek Al
            </Button>,
          ]}
        />
      );
    }

    if (isCompleted) {
      return (
        <Result
          status="success"
          title="Kurulum Tamamlandı!"
          subTitle="Hesabınız başarıyla oluşturuldu. Yönlendiriliyorsunuz..."
          icon={<CheckCircleIcon className="w-12 h-12" style={{ color: '#52c41a' }} />}
        />
      );
    }

    const currentConfig = stepConfigs[currentStep];
    const progressPercent = progress?.progressPercentage || 0;

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Spin indicator={<ArrowPathIcon className="w-12 h-12 animate-spin" style={{ color: '#1890ff' }} />} />
          <Title level={3} style={{ marginTop: 24, marginBottom: 8 }}>
            Hesabınız Hazırlanıyor
          </Title>
          <Text type="secondary">
            Bu işlem birkaç dakika sürebilir, lütfen bekleyin...
          </Text>
        </div>

        {/* Progress Bar */}
        <Progress
          percent={progressPercent}
          status={hasError ? 'exception' : isCompleted ? 'success' : 'active'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          style={{ marginBottom: 24 }}
        />

        {/* Current Step Info */}
        <div
          style={{
            textAlign: 'center',
            padding: '16px 24px',
            background: '#f5f5f5',
            borderRadius: 8,
          }}
        >
          <Space>
            <span style={{ fontSize: 24, color: '#1890ff' }}>{currentConfig.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <Text strong>{currentConfig.title}</Text>
              <br />
              <Text type="secondary">{progress?.message || currentConfig.description}</Text>
            </div>
          </Space>
        </div>

        {/* Steps */}
        <Steps
          current={getCurrentStepIndex()}
          size="small"
          direction="vertical"
          items={stepOrder.slice(0, -1).map((step, index) => {
            const config = stepConfigs[step];
            const currentIndex = getCurrentStepIndex();
            let status: 'wait' | 'process' | 'finish' | 'error' = 'wait';

            if (index < currentIndex) {
              status = 'finish';
            } else if (index === currentIndex) {
              status = hasError ? 'error' : 'process';
            }

            return {
              title: config.title,
              description: config.description,
              status,
              icon:
                index === currentIndex ? (
                  <Spin indicator={<ArrowPathIcon className="w-4 h-4 animate-spin" />} />
                ) : undefined,
            };
          })}
        />

        {/* Connection Status */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isConnected ? (
              <Space>
                <span style={{ color: '#52c41a' }}>●</span>
                Bağlantı aktif
              </Space>
            ) : (
              <Space>
                <span style={{ color: '#faad14' }}>●</span>
                Bağlanıyor...
              </Space>
            )}
          </Text>
        </div>
      </Space>
    );
  };

  return (
    <Modal
      open={visible}
      title={null}
      footer={null}
      closable={false}
      maskClosable={false}
      width={600}
      centered
      styles={{
        body: { padding: 32 },
      }}
    >
      {renderContent()}
    </Modal>
  );
};

export default SetupProgressModal;
