import React from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

interface LoadingProps {
  fullScreen?: boolean;
  tip?: string;
  transparent?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  tip,
  transparent = false,
  size = 'large',
  className,
  style
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  if (fullScreen) {
    return (
      <div className={`loading-fullscreen ${transparent ? 'loading-transparent' : ''} ${className || ''}`} style={style}>
        <Spin indicator={antIcon} size={size}>
          {tip && <div style={{ marginTop: 8, color: 'inherit' }}>{tip}</div>}
        </Spin>
      </div>
    );
  }

  return (
    <div className={`loading-container ${className || ''}`} style={style}>
      <Spin indicator={antIcon} size={size} />
    </div>
  );
};

export default Loading;