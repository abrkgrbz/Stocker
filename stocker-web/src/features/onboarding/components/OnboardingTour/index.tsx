import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Progress,
  Space,
  Typography,
  Tooltip,
  Avatar,
  Badge,
  Steps,
  message
} from 'antd';
import {
  CloseOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  RedoOutlined,
  StepForwardOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  RocketOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import Joyride, { CallBackProps, STATUS, Step as JoyrideStep, Styles } from 'react-joyride';
import confetti from 'canvas-confetti';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
  styles?: Partial<Styles>;
  action?: () => void;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
  continuous?: boolean;
  autoStart?: boolean;
  userId?: string;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip,
  showProgress = true,
  continuous = true,
  autoStart = false,
  userId
}) => {
  const [run, setRun] = useState(autoStart);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourProgress, setTourProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Convert custom steps to Joyride format
  const joyrideSteps: JoyrideStep[] = steps.map(step => ({
    target: step.target,
    title: step.title,
    content: (
      <div className="tour-step-content">
        <Paragraph>{step.content}</Paragraph>
        {step.action && (
          <Button 
            type="primary" 
            size="small" 
            onClick={step.action}
            style={{ marginTop: 8 }}
          >
            Try it
          </Button>
        )}
      </div>
    ),
    placement: step.placement || 'bottom',
    disableBeacon: step.disableBeacon,
    spotlightClicks: step.spotlightClicks,
    styles: {
      options: {
        primaryColor: '#667eea',
        zIndex: 10000,
        ...step.styles?.options
      },
      ...step.styles
    }
  }));

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    if (type === 'step:after') {
      setStepIndex(index + 1);
      setTourProgress(((index + 1) / steps.length) * 100);
      
      // Check for achievements
      checkAchievements(index + 1);
    }

    if (status === STATUS.FINISHED) {
      handleTourComplete();
    } else if (status === STATUS.SKIPPED) {
      handleTourSkip();
    }
  };

  const checkAchievements = (completedSteps: number) => {
    const newAchievements = [];
    
    if (completedSteps === 1) {
      newAchievements.push('first_step');
      showAchievement('İlk Adım', 'Turu başlattınız!');
    }
    
    if (completedSteps === Math.floor(steps.length / 2)) {
      newAchievements.push('halfway');
      showAchievement('Yarı Yol', 'Turun yarısını tamamladınız!');
    }
    
    if (completedSteps === steps.length) {
      newAchievements.push('completed');
      showAchievement('Tur Tamamlandı', 'Tüm adımları bitirdiniz!');
    }
    
    setAchievements(prev => [...prev, ...newAchievements]);
  };

  const showAchievement = (title: string, description: string) => {
    message.success({
      content: (
        <Space>
          <TrophyOutlined style={{ color: '#faad14', fontSize: 20 }} />
          <div>
            <Text strong>{title}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{description}</Text>
          </div>
        </Space>
      ),
      duration: 3
    });
  };

  const handleTourComplete = () => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Save completion to localStorage
    const completionData = {
      userId,
      completedAt: new Date().toISOString(),
      steps: steps.length,
      achievements
    };
    localStorage.setItem('onboarding_completed', JSON.stringify(completionData));
    
    if (onComplete) {
      onComplete();
    }
    
    message.success('Tebrikler! Onboarding turu tamamlandı 🎉');
  };

  const handleTourSkip = () => {
    if (onSkip) {
      onSkip();
    }
    setRun(false);
    message.info('Tur atlandı. İstediğiniz zaman tekrar başlatabilirsiniz.');
  };

  const startTour = () => {
    setRun(true);
    setStepIndex(0);
    setTourProgress(0);
  };

  const pauseTour = () => {
    setIsPaused(true);
    setRun(false);
  };

  const resumeTour = () => {
    setIsPaused(false);
    setRun(true);
  };

  const restartTour = () => {
    setStepIndex(0);
    setTourProgress(0);
    setRun(true);
    setIsPaused(false);
  };

  return (
    <>
      <Joyride
        steps={joyrideSteps}
        run={run}
        stepIndex={stepIndex}
        continuous={continuous}
        showProgress={false}
        showSkipButton
        callback={handleJoyrideCallback}
        locale={{
          back: 'Geri',
          close: 'Kapat',
          last: 'Bitir',
          next: 'İleri',
          open: 'Aç',
          skip: 'Atla'
        }}
        styles={{
          options: {
            primaryColor: '#667eea',
            zIndex: 10000
          }
        }}
      />

      {/* Floating Control Panel */}
      {showProgress && run && (
        <motion.div
          className="tour-control-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <Card size="small" className="tour-control-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="tour-header">
                <Space>
                  <RocketOutlined style={{ color: '#667eea' }} />
                  <Text strong>Onboarding Turu</Text>
                </Space>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={handleTourSkip}
                />
              </div>
              
              <Progress
                percent={tourProgress}
                strokeColor={{
                  '0%': '#667eea',
                  '100%': '#764ba2'
                }}
                size="small"
              />
              
              <div className="tour-info">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Adım {stepIndex + 1} / {steps.length}
                </Text>
              </div>
              
              <Space>
                {isPaused ? (
                  <Tooltip title="Devam Et">
                    <Button
                      icon={<PlayCircleOutlined />}
                      size="small"
                      onClick={resumeTour}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Duraklat">
                    <Button
                      icon={<PauseCircleOutlined />}
                      size="small"
                      onClick={pauseTour}
                    />
                  </Tooltip>
                )}
                <Tooltip title="Baştan Başla">
                  <Button
                    icon={<RedoOutlined />}
                    size="small"
                    onClick={restartTour}
                  />
                </Tooltip>
                <Tooltip title="Turu Atla">
                  <Button
                    icon={<StepForwardOutlined />}
                    size="small"
                    onClick={handleTourSkip}
                  />
                </Tooltip>
              </Space>
            </Space>
          </Card>
        </motion.div>
      )}

      {/* Start Tour Button (when tour is not running) */}
      {!run && (
        <motion.div
          className="tour-start-button"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Tooltip title="Tur Başlat">
            <Button
              type="primary"
              shape="circle"
              icon={<BulbOutlined />}
              size="large"
              onClick={startTour}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            />
          </Tooltip>
        </motion.div>
      )}
    </>
  );
};

// Interactive Walkthrough Component
interface InteractiveWalkthroughProps {
  title: string;
  description: string;
  steps: Array<{
    title: string;
    description: string;
    action?: () => void;
    completed?: boolean;
  }>;
  onComplete?: () => void;
}

export const InteractiveWalkthrough: React.FC<InteractiveWalkthroughProps> = ({
  title,
  description,
  steps,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepComplete = (index: number) => {
    setCompletedSteps(prev => [...prev, index]);
    
    if (index < steps.length - 1) {
      setCurrentStep(index + 1);
    } else {
      if (onComplete) {
        onComplete();
      }
      message.success('Walkthrough tamamlandı!');
    }
  };

  return (
    <Card className="interactive-walkthrough">
      <Title level={4}>{title}</Title>
      <Paragraph>{description}</Paragraph>
      
      <Steps current={currentStep} style={{ marginTop: 24 }}>
        {steps.map((step, index) => (
          <Step
            key={index}
            title={step.title}
            status={
              completedSteps.includes(index) 
                ? 'finish' 
                : index === currentStep 
                ? 'process' 
                : 'wait'
            }
            icon={
              completedSteps.includes(index) 
                ? <CheckCircleOutlined /> 
                : undefined
            }
          />
        ))}
      </Steps>
      
      <Card
        style={{ marginTop: 24 }}
        className="walkthrough-step-card"
      >
        <Title level={5}>{steps[currentStep]?.title}</Title>
        <Paragraph>{steps[currentStep]?.description}</Paragraph>
        
        <Space>
          <Button
            type="primary"
            onClick={() => {
              if (steps[currentStep]?.action) {
                steps[currentStep].action!();
              }
              handleStepComplete(currentStep);
            }}
          >
            {currentStep === steps.length - 1 ? 'Tamamla' : 'Devam'}
          </Button>
          
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)}>
              Geri
            </Button>
          )}
        </Space>
      </Card>
    </Card>
  );
};

// Checklist Component
interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  required?: boolean;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  onItemComplete?: (itemId: string) => void;
  title?: string;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  items,
  onItemComplete,
  title = 'Başlangıç Kontrol Listesi'
}) => {
  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <Card className="onboarding-checklist">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="checklist-header">
          <Title level={4}>{title}</Title>
          <Badge
            count={`${completedCount}/${items.length}`}
            style={{ backgroundColor: progress === 100 ? '#52c41a' : '#667eea' }}
          />
        </div>
        
        <Progress
          percent={progress}
          strokeColor={{
            '0%': '#667eea',
            '100%': '#764ba2'
          }}
          status={progress === 100 ? 'success' : 'active'}
        />
        
        <div className="checklist-items">
          {items.map(item => (
            <motion.div
              key={item.id}
              className={`checklist-item ${item.completed ? 'completed' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !item.completed && onItemComplete && onItemComplete(item.id)}
            >
              <Space>
                {item.completed ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                ) : (
                  <div className="checklist-checkbox" />
                )}
                <div>
                  <Text strong={!item.completed} delete={item.completed}>
                    {item.title}
                  </Text>
                  {item.required && !item.completed && (
                    <Badge status="error" text="Zorunlu" style={{ marginLeft: 8 }} />
                  )}
                  {item.description && (
                    <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                      {item.description}
                    </Text>
                  )}
                </div>
              </Space>
            </motion.div>
          ))}
        </div>
        
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="checklist-complete"
          >
            <TrophyOutlined style={{ fontSize: 32, color: '#faad14' }} />
            <Title level={5}>Tebrikler!</Title>
            <Text>Tüm görevleri tamamladınız!</Text>
          </motion.div>
        )}
      </Space>
    </Card>
  );
};