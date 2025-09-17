import React, { useState } from 'react';
import { Button, Space, Divider, message, Spin } from 'antd';
import {
  GoogleOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  AppleOutlined,
  WindowsOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

interface SocialLoginProps {
  onSuccess?: (provider: string, data: any) => void;
  onError?: (provider: string, error: any) => void;
  providers?: string[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  size?: 'small' | 'middle' | 'large';
  showLabels?: boolean;
}

const defaultProviders = ['google', 'microsoft', 'linkedin'];

const providerConfig = {
  google: {
    name: 'Google',
    icon: <GoogleOutlined />,
    color: '#4285F4',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    scope: 'openid email profile'
  },
  microsoft: {
    name: 'Microsoft',
    icon: <WindowsOutlined />,
    color: '#00A4EF',
    clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID || '',
    scope: 'openid email profile'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: <LinkedinOutlined />,
    color: '#0077B5',
    clientId: process.env.REACT_APP_LINKEDIN_CLIENT_ID || '',
    scope: 'r_emailaddress r_liteprofile'
  },
  github: {
    name: 'GitHub',
    icon: <GithubOutlined />,
    color: '#333',
    clientId: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
    scope: 'user:email'
  },
  apple: {
    name: 'Apple',
    icon: <AppleOutlined />,
    color: '#000',
    clientId: process.env.REACT_APP_APPLE_CLIENT_ID || '',
    scope: 'name email'
  },
  twitter: {
    name: 'Twitter',
    icon: <TwitterOutlined />,
    color: '#1DA1F2',
    clientId: process.env.REACT_APP_TWITTER_CLIENT_ID || '',
    scope: 'users.read tweet.read'
  }
};

export const SocialLogin: React.FC<SocialLoginProps> = ({
  onSuccess,
  onError,
  providers = defaultProviders,
  layout = 'horizontal',
  size = 'large',
  showLabels = true
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: string) => {
    setLoading(provider);
    
    try {
      const config = providerConfig[provider as keyof typeof providerConfig];
      
      if (!config.clientId) {
        throw new Error(`${provider} client ID not configured`);
      }

      // OAuth flow implementation
      switch (provider) {
        case 'google':
          await handleGoogleLogin(config);
          break;
        case 'microsoft':
          await handleMicrosoftLogin(config);
          break;
        case 'linkedin':
          await handleLinkedInLogin(config);
          break;
        case 'github':
          await handleGitHubLogin(config);
          break;
        default:
          throw new Error(`${provider} login not implemented`);
      }
    } catch (error) {
      // Error handling removed for production
      message.error(`${provider} ile giriş başarısız`);
      if (onError) {
        onError(provider, error);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleLogin = async (config: any) => {
    // Load Google Sign-In SDK
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        const google = (window as any).google;
        
        google.accounts.id.initialize({
          client_id: config.clientId,
          callback: (response: any) => {
            if (response.credential) {
              // Decode JWT token
              const payload = JSON.parse(atob(response.credential.split('.')[1]));
              
              message.success('Google ile giriş başarılı!');
              if (onSuccess) {
                onSuccess('google', {
                  token: response.credential,
                  profile: payload
                });
              }
              resolve(payload);
            } else {
              reject(new Error('Google login failed'));
            }
          }
        });

        google.accounts.id.prompt();
      };
      
      script.onerror = () => reject(new Error('Failed to load Google SDK'));
      document.body.appendChild(script);
    });
  };

  const handleMicrosoftLogin = async (config: any) => {
    // Microsoft OAuth URL
    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', window.location.origin + '/auth/callback/microsoft');
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('state', generateState());
    
    // Open popup window
    const popup = window.open(
      authUrl.toString(),
      'microsoft-login',
      'width=500,height=600'
    );
    
    // Listen for callback
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        try {
          if (popup?.closed) {
            clearInterval(checkInterval);
            reject(new Error('Login cancelled'));
          }
        } catch (e) {
          // Cross-origin error, ignore
        }
      }, 1000);
      
      // Listen for message from popup
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'microsoft-auth-success') {
          clearInterval(checkInterval);
          popup?.close();
          
          message.success('Microsoft ile giriş başarılı!');
          if (onSuccess) {
            onSuccess('microsoft', event.data.payload);
          }
          resolve(event.data.payload);
        }
      });
    });
  };

  const handleLinkedInLogin = async (config: any) => {
    // LinkedIn OAuth URL
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', window.location.origin + '/auth/callback/linkedin');
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('state', generateState());
    
    window.location.href = authUrl.toString();
  };

  const handleGitHubLogin = async (config: any) => {
    // GitHub OAuth URL
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', window.location.origin + '/auth/callback/github');
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('state', generateState());
    
    window.location.href = authUrl.toString();
  };

  const generateState = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const renderButton = (provider: string) => {
    const config = providerConfig[provider as keyof typeof providerConfig];
    if (!config) return null;

    const isLoading = loading === provider;

    return (
      <motion.div
        key={provider}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          className={`social-login-btn social-login-${provider}`}
          size={size}
          icon={isLoading ? <Spin size="small" /> : config.icon}
          onClick={() => handleSocialLogin(provider)}
          disabled={loading !== null}
          block={layout === 'vertical'}
          style={{
            borderColor: config.color,
            color: loading === null ? config.color : undefined
          }}
        >
          {showLabels && `${config.name} ile ${isLoading ? 'Bağlanıyor...' : 'Devam Et'}`}
        </Button>
      </motion.div>
    );
  };

  const containerClass = `social-login-container social-login-${layout}`;

  return (
    <div className={containerClass}>
      {layout === 'grid' ? (
        <div className="social-login-grid">
          {providers.map(renderButton)}
        </div>
      ) : (
        <Space 
          direction={layout === 'vertical' ? 'vertical' : 'horizontal'}
          size="middle"
          style={{ width: layout === 'vertical' ? '100%' : 'auto' }}
        >
          {providers.map(renderButton)}
        </Space>
      )}
    </div>
  );
};

// Quick Social Login Bar
interface QuickSocialLoginProps {
  onLogin: (provider: string, data: any) => void;
}

export const QuickSocialLogin: React.FC<QuickSocialLoginProps> = ({ onLogin }) => {
  return (
    <div className="quick-social-login">
      <Divider>
        <span style={{ fontSize: 13, color: '#8b95a7' }}>veya hızlı giriş</span>
      </Divider>
      
      <SocialLogin
        providers={['google', 'microsoft', 'linkedin']}
        layout="horizontal"
        size="middle"
        showLabels={false}
        onSuccess={onLogin}
      />
    </div>
  );
};

// Social Account Link Component
interface SocialAccountLinkProps {
  linkedAccounts?: string[];
  onLink: (provider: string) => void;
  onUnlink: (provider: string) => void;
}

export const SocialAccountLink: React.FC<SocialAccountLinkProps> = ({
  linkedAccounts = [],
  onLink,
  onUnlink
}) => {
  const allProviders = Object.keys(providerConfig);

  return (
    <div className="social-account-link">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {allProviders.map(provider => {
          const config = providerConfig[provider as keyof typeof providerConfig];
          const isLinked = linkedAccounts.includes(provider);

          return (
            <div key={provider} className="social-account-item">
              <Space>
                {config.icon}
                <span>{config.name}</span>
              </Space>
              
              <Button
                size="small"
                type={isLinked ? 'default' : 'primary'}
                onClick={() => isLinked ? onUnlink(provider) : onLink(provider)}
              >
                {isLinked ? 'Bağlantıyı Kaldır' : 'Bağla'}
              </Button>
            </div>
          );
        })}
      </Space>
    </div>
  );
};