/**
 * Sentry Error Boundary Component
 * Catches and reports React errors to Sentry
 */

import React from 'react';
import * as Sentry from '@sentry/react';
import { Result, Button, Card, Typography, Space, Collapse } from 'antd';
import {
  BugOutlined,
  ReloadOutlined,
  HomeOutlined,
  QuestionCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface FallbackProps {
  error: Error;
  resetError: () => void;
  eventId: string | null;
}

/**
 * Custom fallback component for error boundary
 */
const ErrorFallback: React.FC<FallbackProps> = ({ error, resetError, eventId }) => {
  const handleReport = () => {
    if (eventId) {
      Sentry.showReportDialog({ eventId });
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const isDevelopment = !import.meta.env.PROD;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#f0f2f5'
    }}>
      <Card style={{ maxWidth: 600, width: '100%' }}>
        <Result
          status="error"
          title="Oops! Something went wrong"
          subTitle="We're sorry for the inconvenience. The error has been reported to our team."
          extra={[
            <Button
              type="primary"
              key="retry"
              icon={<ReloadOutlined />}
              onClick={resetError}
            >
              Try Again
            </Button>,
            <Button
              key="home"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
            >
              Go to Home
            </Button>,
            eventId && (
              <Button
                key="report"
                icon={<BugOutlined />}
                onClick={handleReport}
              >
                Report Issue
              </Button>
            )
          ].filter(Boolean)}
        >
          <div style={{ marginTop: 24 }}>
            <Paragraph>
              <Text strong>Error ID: </Text>
              <Text code>{eventId || 'Not available'}</Text>
            </Paragraph>

            {isDevelopment && (
              <Collapse ghost>
                <Panel
                  header={
                    <Space>
                      <WarningOutlined />
                      <Text type="danger">Error Details (Development Only)</Text>
                    </Space>
                  }
                  key="1"
                >
                  <Paragraph>
                    <Text strong>Error Message:</Text>
                  </Paragraph>
                  <Paragraph>
                    <Text code style={{ whiteSpace: 'pre-wrap' }}>
                      {error.message}
                    </Text>
                  </Paragraph>

                  <Paragraph>
                    <Text strong>Stack Trace:</Text>
                  </Paragraph>
                  <Paragraph>
                    <Text
                      code
                      style={{
                        display: 'block',
                        whiteSpace: 'pre-wrap',
                        fontSize: 12,
                        maxHeight: 200,
                        overflow: 'auto',
                        background: '#f5f5f5',
                        padding: 8,
                        borderRadius: 4
                      }}
                    >
                      {error.stack}
                    </Text>
                  </Paragraph>
                </Panel>
              </Collapse>
            )}

            <Paragraph type="secondary" style={{ marginTop: 16 }}>
              <QuestionCircleOutlined /> If this problem persists, please contact support.
            </Paragraph>
          </div>
        </Result>
      </Card>
    </div>
  );
};

/**
 * Sentry Error Boundary wrapper
 */
export const SentryErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={ErrorFallback}
      showDialog={false}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryOptions?: Sentry.ErrorBoundaryOptions
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <Sentry.ErrorBoundary
      fallback={ErrorFallback}
      {...errorBoundaryOptions}
    >
      <Component {...props} />
    </Sentry.ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}