import React from 'react';
import { Card, Skeleton, Row, Col, Space } from 'antd';

interface SkeletonLoaderProps {
  type?: 'stats' | 'chart' | 'table' | 'list';
  rows?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'stats', rows = 4 }) => {
  switch (type) {
    case 'stats':
      return (
        <Row gutter={[32, 32]}>
          {[1, 2, 3, 4].map((key) => (
            <Col xs={24} sm={12} xl={6} key={key}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      );

    case 'chart':
      return (
        <Card>
          <Skeleton.Button active style={{ width: 200, marginBottom: 16 }} />
          <Skeleton.Image active style={{ width: '100%', height: 300 }} />
        </Card>
      );

    case 'table':
      return (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            {Array.from({ length: rows }).map((_, index) => (
              <Skeleton key={index} active paragraph={{ rows: 1 }} />
            ))}
          </Space>
        </Card>
      );

    case 'list':
      return (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            {Array.from({ length: rows }).map((_, index) => (
              <div key={index} style={{ display: 'flex', gap: 16 }}>
                <Skeleton.Avatar active />
                <Skeleton active paragraph={{ rows: 2 }} style={{ flex: 1 }} />
              </div>
            ))}
          </Space>
        </Card>
      );

    default:
      return <Skeleton active />;
  }
};

export default SkeletonLoader;