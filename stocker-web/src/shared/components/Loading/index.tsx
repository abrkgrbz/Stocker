import React from 'react';
import { Spin, SpinProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './style.css';

interface LoadingProps extends SpinProps {
  fullScreen?: boolean;
  tip?: string;
  transparent?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  tip = 'Yükleniyor...',
  transparent = false,
  size = 'large',
  ...props
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  if (fullScreen) {
    return (
      <div className={`loading-fullscreen ${transparent ? 'loading-transparent' : ''}`}>
        <Spin indicator={antIcon} tip={tip} size={size} {...props} />
      </div>
    );
  }

  return (
    <div className="loading-container">
      <Spin indicator={antIcon} tip={tip} size={size} {...props} />
    </div>
  );
};

export default Loading;