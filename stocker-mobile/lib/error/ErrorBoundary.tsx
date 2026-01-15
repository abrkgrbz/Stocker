import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react-native';
import { errorLogger } from './errorLogger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'screen' | 'component';
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStack: boolean;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log to error service
    errorLogger.captureException(error, {
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component',
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
    });
  };

  toggleStack = (): void => {
    this.setState((prev) => ({ showStack: !prev.showStack }));
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, showStack } = this.state;
    const { children, fallback, level = 'component', showDetails = __DEV__ } = this.props;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    // Screen-level error: full screen error UI
    if (level === 'screen') {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={48} color="#ef4444" />
            </View>

            <Text style={styles.title}>Bir şeyler ters gitti</Text>
            <Text style={styles.message}>
              Uygulama beklenmeyen bir hatayla karşılaştı. Lütfen tekrar deneyin.
            </Text>

            {showDetails && error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} numberOfLines={3}>
                  {error.message}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Pressable style={styles.primaryButton} onPress={this.handleRetry}>
                <RefreshCw size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Tekrar Dene</Text>
              </Pressable>
            </View>

            {showDetails && errorInfo?.componentStack && (
              <View style={styles.detailsContainer}>
                <Pressable style={styles.detailsToggle} onPress={this.toggleStack}>
                  <Text style={styles.detailsToggleText}>
                    Teknik Detaylar
                  </Text>
                  {showStack ? (
                    <ChevronUp size={18} color="#64748b" />
                  ) : (
                    <ChevronDown size={18} color="#64748b" />
                  )}
                </Pressable>

                {showStack && (
                  <ScrollView style={styles.stackContainer}>
                    <Text style={styles.stackText}>
                      {errorInfo.componentStack}
                    </Text>
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        </SafeAreaView>
      );
    }

    // Component-level error: minimal inline error UI
    return (
      <View style={styles.componentError}>
        <View style={styles.componentErrorContent}>
          <AlertTriangle size={24} color="#ef4444" />
          <View style={styles.componentErrorText}>
            <Text style={styles.componentErrorTitle}>Hata oluştu</Text>
            {showDetails && error && (
              <Text style={styles.componentErrorMessage} numberOfLines={2}>
                {error.message}
              </Text>
            )}
          </View>
        </View>
        <Pressable style={styles.retryButton} onPress={this.handleRetry}>
          <RefreshCw size={16} color="#3b82f6" />
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </Pressable>
      </View>
    );
  }
}

/**
 * Screen-level error boundary wrapper
 * Use this at the top level of screens for full-page error handling
 */
export function ScreenErrorBoundary({
  children,
  onError,
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}): React.ReactElement {
  return (
    <ErrorBoundary level="screen" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-level error boundary wrapper
 * Use this around specific components for isolated error handling
 */
export function ComponentErrorBoundary({
  children,
  fallback,
  onError,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}): React.ReactElement {
  return (
    <ErrorBoundary level="component" fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * HOC to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    level?: 'screen' | 'component';
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary
      level={options?.level}
      fallback={options?.fallback}
      onError={options?.onError}
    >
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorBoundary;
}

const styles = StyleSheet.create({
  // Screen-level styles
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    maxWidth: 320,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
    maxWidth: 320,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  detailsToggleText: {
    fontSize: 14,
    color: '#64748b',
  },
  stackContainer: {
    maxHeight: 200,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  stackText: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },

  // Component-level styles
  componentError: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  componentErrorContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  componentErrorText: {
    flex: 1,
  },
  componentErrorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  componentErrorMessage: {
    fontSize: 12,
    color: '#b91c1c',
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
