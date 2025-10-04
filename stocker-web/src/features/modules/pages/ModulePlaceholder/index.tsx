import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Typography, Space, Empty } from 'antd';
import { ArrowLeftOutlined, RocketOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

interface ModulePlaceholderProps {
  moduleName?: string;
  icon?: React.ReactNode;
  description?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  moduleName,
  icon,
  description
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const moduleCode = params.module || 'module';

  const defaultName = moduleName || moduleCode.toUpperCase();
  const defaultDescription = description || `${defaultName} modülü yakında kullanıma sunulacak.`;

  return (
    <div style={{
      padding: 24,
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          style={{
            maxWidth: 600,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {icon || <RocketOutlined style={{ fontSize: 64, color: '#667eea' }} />}
            </motion.div>

            <div>
              <Title level={2}>{defaultName}</Title>
              <Paragraph type="secondary" style={{ fontSize: 16 }}>
                {defaultDescription}
              </Paragraph>
            </div>

            <Empty
              description="Bu modül henüz aktif değil"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />

            <Space>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/app')}
                size="large"
              >
                Dashboard'a Dön
              </Button>
            </Space>

            <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
                💡 <strong>Yakında:</strong> Bu modül üzerinde çalışıyoruz.
                Güncellemeler için bildirimleri takip edin.
              </Paragraph>
            </div>
          </Space>
        </Card>
      </motion.div>
    </div>
  );
};

export default ModulePlaceholder;
