import React from 'react';

import { MailOutlined } from '@ant-design/icons';
import { Result, Button } from 'antd';

export default function EmailTemplateManagement() {
  return (
    <Result
      icon={<MailOutlined />}
      title="Email Templates"
      subTitle="This feature is being migrated from Material-UI to Ant Design"
      extra={
        <Button type="primary" disabled>
          Coming Soon
        </Button>
      }
    />
  );
}

// Export both the old and new versions
export { default as ProfessionalEmailTemplates } from './ProfessionalEmailTemplates';