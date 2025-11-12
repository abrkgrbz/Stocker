'use client';

import React from 'react';
import { Button, Space, Card, Typography, Alert, Divider } from 'antd';
import { ThunderboltOutlined, BugOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import logger from '@/lib/utils/logger';

const { Title, Paragraph, Text } = Typography;

export default function TestSentryPage() {
  // Test different error types
  const triggerUncaughtError = () => {
    // This will be caught by Sentry's global error handler
    throw new Error('Test Uncaught Error - This should appear in Sentry!');
  };

  const triggerLoggerError = () => {
    const testError = new Error('Test Logger Error - Logged through our logging system');
    testError.stack = new Error().stack; // Ensure we have a stack trace

    logger.error('Intentional test error triggered', testError, {
      userId: 'test-user-123',
      component: 'TestSentryPage',
      action: 'test-error-button',
      metadata: {
        timestamp: new Date().toISOString(),
        testType: 'manual',
        environment: process.env.NODE_ENV
      }
    });

    alert('Error logged! Check Sentry dashboard and console.');
  };

  const triggerFatalError = () => {
    const fatalError = new Error('Test Fatal Error - Critical system failure simulation');

    logger.fatal('Critical error occurred in test', fatalError, {
      userId: 'test-user-123',
      component: 'TestSentryPage',
      action: 'test-fatal-button',
      metadata: {
        severity: 'critical',
        requiresImmediateAction: true
      }
    });

    alert('Fatal error logged! This should trigger immediate alerts in Sentry.');
  };

  const triggerWarning = () => {
    logger.warn('Test warning message', {
      component: 'TestSentryPage',
      action: 'test-warning',
      metadata: {
        warningType: 'test',
        threshold: '80%',
        current: '85%'
      }
    });

    alert('Warning logged! Check console and Sentry breadcrumbs.');
  };

  const triggerAsyncError = async () => {
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Async operation failed - Testing async error handling'));
        }, 1000);
      });
    } catch (error) {
      logger.error('Async operation failed in test', error as Error, {
        component: 'TestSentryPage',
        action: 'test-async-error',
        metadata: {
          operationType: 'promise-rejection',
          delayed: true
        }
      });
      alert('Async error logged!');
    }
  };

  const testPerformanceMonitoring = async () => {
    await logger.measurePerformance('test-heavy-operation', async () => {
      // Simulate heavy operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      logger.info('Heavy operation completed', {
        component: 'TestSentryPage',
        metadata: {
          result: 'success',
          duration: '2000ms'
        }
      });
    });
    alert('Performance measurement completed! Check console for timing.');
  };

  const testBreadcrumbs = () => {
    // Create a trail of breadcrumbs
    logger.info('User started test flow', { step: 1 });
    logger.info('User clicked button', { step: 2, button: 'test' });
    logger.debug('Processing request', { step: 3 });
    logger.info('Request processed', { step: 4 });

    // Then trigger an error to see the breadcrumb trail
    setTimeout(() => {
      const error = new Error('Error after breadcrumb trail');
      logger.error('Error at end of flow', error, {
        component: 'TestSentryPage',
        metadata: {
          breadcrumbCount: 4
        }
      });
    }, 1000);

    alert('Breadcrumb trail created! Error will be triggered in 1 second.');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>
          <BugOutlined /> Sentry Integration Test
        </Title>

        <Alert
          message="Sentry Configuration Status"
          description={
            <div>
              <Text><strong>DSN Configured:</strong> {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Yes' : '❌ No'}</Text><br />
              <Text><strong>Environment:</strong> {process.env.NEXT_PUBLIC_ENVIRONMENT || 'Not set'}</Text><br />
              <Text><strong>Log Level:</strong> {process.env.NEXT_PUBLIC_LOG_LEVEL || 'INFO'}</Text><br />
              <Text><strong>Sentry URL:</strong> https://o4510349217431552.ingest.de.sentry.io</Text>
            </div>
          }
          type={process.env.NEXT_PUBLIC_SENTRY_DSN ? 'success' : 'warning'}
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Paragraph>
          Click the buttons below to test different error scenarios.
          Each error will be sent to Sentry and you can view them in your Sentry dashboard.
        </Paragraph>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={4}>Error Tests</Title>

          <Button
            danger
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={triggerUncaughtError}
            block
          >
            Trigger Uncaught Error (Will crash the page)
          </Button>

          <Button
            danger
            icon={<BugOutlined />}
            onClick={triggerLoggerError}
            block
          >
            Trigger Logger Error (Handled)
          </Button>

          <Button
            danger
            type="dashed"
            onClick={triggerFatalError}
            block
          >
            Trigger Fatal Error
          </Button>

          <Button
            style={{ backgroundColor: '#faad14', color: 'white', borderColor: '#faad14' }}
            icon={<WarningOutlined />}
            onClick={triggerWarning}
            block
          >
            Trigger Warning
          </Button>

          <Button
            type="default"
            onClick={triggerAsyncError}
            block
          >
            Trigger Async Error
          </Button>

          <Divider />

          <Title level={4}>Advanced Tests</Title>

          <Button
            type="primary"
            ghost
            icon={<InfoCircleOutlined />}
            onClick={testBreadcrumbs}
            block
          >
            Test Breadcrumb Trail
          </Button>

          <Button
            type="dashed"
            onClick={testPerformanceMonitoring}
            block
          >
            Test Performance Monitoring (2s operation)
          </Button>
        </Space>

        <Divider />

        <Alert
          message="How to View in Sentry"
          description={
            <ol style={{ paddingLeft: 20 }}>
              <li>Go to your Sentry dashboard</li>
              <li>Navigate to Issues to see errors</li>
              <li>Click on an issue to see details, stack traces, and breadcrumbs</li>
              <li>Check Performance tab for performance monitoring</li>
              <li>View User Feedback for user reports</li>
            </ol>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
}