import React from 'react';
import './style.css';

interface SectionDividerProps {
  type?: 'wave' | 'gradient' | 'dots' | 'line' | 'zigzag' | 'curve';
  color?: string;
  height?: number;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ 
  type = 'wave', 
  color = '#f0f2f5',
  height = 60 
}) => {
  switch (type) {
    case 'wave':
      return (
        <div className="section-divider wave-divider" style={{ height }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
              fill={color}
            />
          </svg>
        </div>
      );
      
    case 'gradient':
      return (
        <div 
          className="section-divider gradient-divider" 
          style={{ 
            height,
            background: `linear-gradient(180deg, transparent 0%, ${color} 50%, transparent 100%)`
          }}
        />
      );
      
    case 'dots':
      return (
        <div className="section-divider dots-divider" style={{ height }}>
          <div className="dots-pattern">
            {[...Array(20)].map((_, i) => (
              <span key={i} className="dot" style={{ background: color }} />
            ))}
          </div>
        </div>
      );
      
    case 'line':
      return (
        <div className="section-divider line-divider" style={{ height }}>
          <div className="line" style={{ background: color }} />
        </div>
      );
      
    case 'zigzag':
      return (
        <div className="section-divider zigzag-divider" style={{ height }}>
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
            <path 
              d="M0,20 L40,0 L80,20 L120,0 L160,20 L200,0 L240,20 L280,0 L320,20 L360,0 L400,20 L440,0 L480,20 L520,0 L560,20 L600,0 L640,20 L680,0 L720,20 L760,0 L800,20 L840,0 L880,20 L920,0 L960,20 L1000,0 L1040,20 L1080,0 L1120,20 L1160,0 L1200,20" 
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      );
      
    case 'curve':
      return (
        <div className="section-divider curve-divider" style={{ height }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,0 Q600,120 1200,0 L1200,120 L0,120 Z" 
              fill={color}
            />
          </svg>
        </div>
      );
      
    default:
      return null;
  }
};