import React from 'react';

import { BellOutlined } from '@ant-design/icons';
import { Result, Button } from 'antd';

export default function ProfessionalNotificationSettings() {
  return (
    <Result
      icon={<BellOutlined />}
      title="Notification Settings"
      subTitle="This feature is being migrated from Material-UI to Ant Design"
      extra={
        <Button type="primary" disabled>
          Coming Soon
        </Button>
      }
    />
  );
}