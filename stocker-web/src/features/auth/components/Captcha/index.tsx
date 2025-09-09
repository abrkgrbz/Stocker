import React, { useEffect, useRef } from 'react';
import { message } from 'antd';

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad?: () => void;
  }
}

interface CaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'invisible';
  badge?: 'bottomright' | 'bottomleft' | 'inline';
}

export const Captcha: React.FC<CaptchaProps> = ({
  siteKey,
  onVerify,
  onExpire,
  onError,
  theme = 'light',
  size = 'normal',
  badge = 'bottomright'
}) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Load reCAPTCHA script
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
      script.async = true;
      script.defer = true;
      
      window.onRecaptchaLoad = () => {
        renderCaptcha();
      };
      
      document.body.appendChild(script);
    } else {
      renderCaptcha();
    }

    return () => {
      // Cleanup
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (error) {
          console.error('Error resetting captcha:', error);
        }
      }
    };
  }, []);

  const renderCaptcha = () => {
    if (window.grecaptcha && captchaRef.current && widgetIdRef.current === null) {
      try {
        widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
          sitekey: siteKey,
          theme: theme,
          size: size,
          badge: badge,
          callback: (token: string) => {
            onVerify(token);
          },
          'expired-callback': () => {
            if (onExpire) onExpire();
            message.warning('CAPTCHA süresi doldu, lütfen tekrar deneyin');
          },
          'error-callback': () => {
            if (onError) onError();
            message.error('CAPTCHA yüklenemedi, lütfen sayfayı yenileyin');
          }
        });
      } catch (error) {
        console.error('Error rendering captcha:', error);
      }
    }
  };

  const reset = () => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
    }
  };

  const execute = () => {
    if (widgetIdRef.current !== null && window.grecaptcha && size === 'invisible') {
      window.grecaptcha.execute(widgetIdRef.current);
    }
  };

  return (
    <div 
      ref={captchaRef} 
      className="captcha-container"
      style={{ 
        display: size === 'invisible' ? 'none' : 'block',
        marginTop: '16px',
        marginBottom: '16px'
      }}
    />
  );
};

// reCAPTCHA v3 Component
interface CaptchaV3Props {
  siteKey: string;
  action: string;
  onVerify: (token: string) => void;
}

export const CaptchaV3: React.FC<CaptchaV3Props> = ({
  siteKey,
  action,
  onVerify
}) => {
  useEffect(() => {
    // Load reCAPTCHA v3 script
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      
      script.onload = () => {
        executeV3();
      };
      
      document.body.appendChild(script);
    } else {
      executeV3();
    }
  }, []);

  const executeV3 = () => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(siteKey, { action }).then((token: string) => {
          onVerify(token);
        });
      });
    }
  };

  return null; // v3 is invisible
};