'use client';

import React from 'react';
import { Button, Space, Card, Typography } from 'antd';
import logger from '@/lib/utils/logger';

const { Title, Paragraph, Text } = Typography;

/**
 * Example component demonstrating logger usage in React components
 */
const LoggerExample: React.FC = () => {
  const handleDebugLog = () => {
    logger.debug('Debug button clicked', {
      component: 'LoggerExample',
      action: 'debug-test',
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleInfoLog = () => {
    logger.info('Info button clicked', {
      component: 'LoggerExample',
      action: 'info-test',
      userId: 'current-user-id',
      metadata: {
        buttonType: 'info',
        clickCount: 1
      }
    });
  };

  const handleWarnLog = () => {
    logger.warn('Warning triggered', {
      component: 'LoggerExample',
      action: 'warn-test',
      metadata: {
        reason: 'User triggered warning test',
        severity: 'low'
      }
    });
  };

  const handleErrorLog = () => {
    try {
      throw new Error('Test error from component');
    } catch (error) {
      logger.error('Component error caught', error, {
        component: 'LoggerExample',
        action: 'error-test',
        metadata: {
          handled: true,
          userTriggered: true
        }
      });
    }
  };

  const handlePerformanceTest = async () => {
    await logger.measurePerformance('component-operation', async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 500));
      logger.info('Performance test completed');
    });
  };

  return (
    <Card title="Logger Example Component" style={{ maxWidth: 600 }}>
      <Title level={4}>Production Logging System Test</Title>
      <Paragraph>
        Click the buttons below to test different logging levels.
        Open your browser console to see the logs in development mode.
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button type="default" onClick={handleDebugLog} block>
          Test Debug Log (Dev Only)
        </Button>

        <Button type="primary" onClick={handleInfoLog} block>
          Test Info Log
        </Button>

        <Button type="default" onClick={handleWarnLog} style={{ backgroundColor: '#faad14', color: 'white' }} block>
          Test Warning Log
        </Button>

        <Button danger onClick={handleErrorLog} block>
          Test Error Log (with Stack Trace)
        </Button>

        <Button type="dashed" onClick={handlePerformanceTest} block>
          Test Performance Measurement
        </Button>
      </Space>

      <div style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
        <Text type="secondary">
          <strong>Current Environment:</strong> {process.env.NODE_ENV}
          <br />
          <strong>Log Level:</strong> {process.env.NEXT_PUBLIC_LOG_LEVEL || 'INFO'}
          <br />
          <strong>Sentry:</strong> {process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Configured' : 'Not Configured'}
        </Text>
      </div>
    </Card>
  );
};

export default LoggerExample;