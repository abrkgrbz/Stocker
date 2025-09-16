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
  const showDetailedErrors = true; // Always show error details for debugging

  // Extract more error information
  const errorName = error.name || 'UnknownError';
  const errorMessage = error.message || 'An unexpected error occurred';
  const errorStack = error.stack || 'No stack trace available';
  
  // Parse error for API response errors
  const isApiError = errorMessage.includes('401') || errorMessage.includes('403') || 
                      errorMessage.includes('404') || errorMessage.includes('500') ||
                      errorMessage.includes('502') || errorMessage.includes('503');
  
  // Get current URL and timestamp
  const currentUrl = window.location.href;
  const errorTime = new Date().toLocaleString('tr-TR');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#f0f2f5'
    }}>
      <Card style={{ maxWidth: 700, width: '100%' }}>
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
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                <Text strong>Error ID: </Text>
                <Text code>{eventId || 'Not available'}</Text>
              </Paragraph>

              <Paragraph>
                <Text strong>Time: </Text>
                <Text>{errorTime}</Text>
              </Paragraph>

              <Paragraph>
                <Text strong>Page: </Text>
                <Text code style={{ fontSize: 12 }}>{currentUrl}</Text>
              </Paragraph>
            </Space>

            <Collapse 
              ghost 
              defaultActiveKey={showDetailedErrors ? ['1'] : []}
              style={{ marginTop: 16 }}
            >
              <Panel
                header={
                  <Space>
                    <WarningOutlined style={{ color: '#ff4d4f' }} />
                    <Text type="danger">Error Details</Text>
                    {isApiError && <Text type="warning">(API Error)</Text>}
                  </Space>
                }
                key="1"
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Error Type: </Text>
                    <Text code>{errorName}</Text>
                  </div>

                  <div>
                    <Text strong>Error Message:</Text>
                    <Paragraph>
                      <Text code style={{ whiteSpace: 'pre-wrap', color: '#ff4d4f' }}>
                        {errorMessage}
                      </Text>
                    </Paragraph>
                  </div>

                  {isApiError && (
                    <div style={{ 
                      padding: 12, 
                      background: '#fff7e6', 
                      border: '1px solid #ffd591',
                      borderRadius: 4 
                    }}>
                      <Text type="warning">
                        <WarningOutlined /> This appears to be an API connection issue. 
                        Please check your internet connection and try again.
                      </Text>
                    </div>
                  )}

                  <div>
                    <Text strong>Stack Trace:</Text>
                    <div
                      style={{
                        marginTop: 8,
                        padding: 12,
                        background: '#f5f5f5',
                        border: '1px solid #d9d9d9',
                        borderRadius: 4,
                        maxHeight: 300,
                        overflow: 'auto'
                      }}
                    >
                      <Text
                        code
                        style={{
                          display: 'block',
                          whiteSpace: 'pre-wrap',
                          fontSize: 11,
                          lineHeight: 1.5,
                          color: '#595959'
                        }}
                      >
                        {errorStack}
                      </Text>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <Text strong>Browser: </Text>
                    <Text code>{navigator.userAgent}</Text>
                  </div>
                </Space>
              </Panel>
            </Collapse>

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