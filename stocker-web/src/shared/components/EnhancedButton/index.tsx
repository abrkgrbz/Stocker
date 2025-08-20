import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonProps } from 'antd';
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import './style.css';

export interface EnhancedButtonProps extends ButtonProps {
  variant?: 'default' | 'gradient' | 'glass' | 'neon' | 'minimal';
  successMessage?: string;
  showSuccessFor?: number; // milliseconds
  rippleColor?: string;
  glowColor?: string;
  onSuccess?: () => void;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = 'default',
  successMessage = 'Başarılı!',
  showSuccessFor = 2000,
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  glowColor = '#667eea',
  onSuccess,
  children,
  onClick,
  ...props
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      id: rippleIdRef.current++,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    createRipple(event);

    if (onClick) {
      const result = onClick(event);
      
      // If onClick returns a promise, handle success state
      if (result && typeof result.then === 'function') {
        result
          .then(() => {
            setIsSuccess(true);
            onSuccess?.();
            setTimeout(() => setIsSuccess(false), showSuccessFor);
          })
          .catch(() => {
            // Handle error state if needed
          });
      }
    }
  };

  const getButtonClass = () => {
    let baseClass = 'enhanced-button';
    baseClass += ` enhanced-button--${variant}`;
    if (isSuccess) baseClass += ' enhanced-button--success';
    if (props.loading) baseClass += ' enhanced-button--loading';
    return baseClass;
  };

  const buttonContent = isSuccess ? (
    <>
      <CheckOutlined />
      {successMessage}
    </>
  ) : (
    children
  );

  return (
    <Button
      ref={buttonRef}
      {...props}
      className={`${getButtonClass()} ${props.className || ''}`}
      onClick={handleClick}
      style={{
        ...props.style,
        '--glow-color': glowColor,
        '--ripple-color': rippleColor,
      } as React.CSSProperties}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
          }}
        />
      ))}
      <span className="button-content">
        {buttonContent}
      </span>
    </Button>
  );
};