import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({
  width = 120,
  height = 32,
  className = '',
  style = {}
}) => {
  return (
    <img
      src="/stoocker-logo.svg"
      alt="Stocker"
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
};
