import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught error:', error);
    return { 
      hasError: true, 
      error,
      errorInfo: null 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary componentDidCatch:', {
      error: error.toString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '24px', background: '#fff', minHeight: '100vh' }}>
          <Alert
            message="Bir Hata Oluştu"
            description={
              <div>
                <p><strong>Hata Mesajı:</strong> {this.state.error?.message}</p>
                <details style={{ marginTop: 16 }}>
                  <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
                    Teknik Detaylar (Tıklayın)
                  </summary>
                  <div style={{ marginTop: 8 }}>
                    <p><strong>Error Stack:</strong></p>
                    <pre style={{ 
                      fontSize: 11, 
                      background: '#f5f5f5', 
                      padding: 12, 
                      borderRadius: 4,
                      overflow: 'auto',
                      maxHeight: 200
                    }}>
                      {this.state.error?.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <>
                        <p><strong>Component Stack:</strong></p>
                        <pre style={{ 
                          fontSize: 11, 
                          background: '#f5f5f5', 
                          padding: 12, 
                          borderRadius: 4,
                          overflow: 'auto',
                          maxHeight: 200
                        }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
                <Button 
                  type="primary" 
                  onClick={this.handleReset}
                  style={{ marginTop: 16 }}
                >
                  Tekrar Dene
                </Button>
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }

    return this.props.children;
  }
}