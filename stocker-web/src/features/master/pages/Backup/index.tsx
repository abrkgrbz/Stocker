import React from 'react';

import { DatabaseOutlined } from '@ant-design/icons';
import { Result, Button } from 'antd';

export default function BackupRestore() {
  return (
    <Result
      icon={<DatabaseOutlined />}
      title="Backup & Restore"
      subTitle="This feature is being migrated from Material-UI to Ant Design"
      extra={
        <Button type="primary" disabled>
          Coming Soon
        </Button>
      }
    />
  );
}