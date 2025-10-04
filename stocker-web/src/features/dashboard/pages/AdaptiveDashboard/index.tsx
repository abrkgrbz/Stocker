import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Typography, Space, Button, Spin, Alert, Tag } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  CalculatorOutlined,
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import userModulesService, { ModuleInfo, UserModulesResponse } from '@/services/userModules.service';
import './style.css';

const { Title, Text } = Typography;

export const AdaptiveDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userModules, setUserModules] = useState<UserModulesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserModules();
  }, []);

  const loadUserModules = async () => {
    try {
      setLoading(true);
      const data = await userModulesService.getActiveModules();
      setUserModules(data);
    } catch (err) {
      setError('Modüller yüklenirken bir hata oluştu');
      console.error('Error loading user modules:', err);
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (code: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      crm: <TeamOutlined style={{ fontSize: 24 }} />,
      sales: <ShoppingCartOutlined style={{ fontSize: 24 }} />,
      inventory: <InboxOutlined style={{ fontSize: 24 }} />,
      accounting: <CalculatorOutlined style={{ fontSize: 24 }} />,
      hr: <UserOutlined style={{ fontSize: 24 }} />
    };
    return icons[code] || <AppstoreOutlined style={{ fontSize: 24 }} />;
  };

  const getModuleColor = (code: string) => {
    const colors: { [key: string]: string } = {
      crm: '#3b82f6',
      sales: '#10b981',
      inventory: '#f59e0b',
      accounting: '#8b5cf6',
      hr: '#ec4899'
    };
    return colors[code] || '#667eea';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
      }}>
        <Spin size="large" tip="Dashboard yükleniyor..." />
      </div>
    );
  }

  if (error || !userModules) {
    return (
      <Alert
        message="Hata"
        description={error || 'Dashboard yüklenemedi'}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="adaptive-dashboard">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ marginBottom: 32 }}>
          <Space align="center" size="middle">
            <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
            <Tag color="blue">{userModules.packageName}</Tag>
            <Tag color={userModules.subscriptionStatus === 'Active' ? 'green' : 'orange'}>
              {userModules.subscriptionStatus}
            </Tag>
          </Space>
          <Text type="secondary">
            Hoş geldiniz! İşletmenizin genel durumunu buradan takip edebilirsiniz.
          </Text>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Toplam Satış"
                value={125650}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<RiseOutlined />}
                suffix="₺"
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Bu ay
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Aktif Müşteriler"
                value={342}
                valueStyle={{ color: '#1890ff' }}
                prefix={<TeamOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Toplam
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Ürün Sayısı"
                value={1248}
                valueStyle={{ color: '#faad14' }}
                prefix={<InboxOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Stokta
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Bekleyen İşler"
                value={23}
                valueStyle={{ color: '#cf1322' }}
                prefix={<FallOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Acil
              </Text>
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Active Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Title level={4} style={{ marginBottom: 16 }}>
          Aktif Modülleriniz
        </Title>
        <Row gutter={[16, 16]}>
          {userModules.modules.map((module, index) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={module.code}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  hoverable
                  className="module-card"
                  onClick={() => navigate(`/app/${module.code}`)}
                  style={{
                    borderLeft: `4px solid ${getModuleColor(module.code)}`,
                    height: '100%'
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        color: getModuleColor(module.code),
                        background: `${getModuleColor(module.code)}15`,
                        padding: 12,
                        borderRadius: 8
                      }}>
                        {getModuleIcon(module.code)}
                      </div>
                      <ArrowRightOutlined style={{ color: '#999' }} />
                    </div>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {module.name}
                      </Title>
                      {module.description && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {module.description}
                        </Text>
                      )}
                    </div>
                    {module.category && (
                      <Tag color={getModuleColor(module.code)} style={{ marginTop: 8 }}>
                        {module.category}
                      </Tag>
                    )}
                  </Space>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ marginTop: 32 }}
      >
        <Card title="Hızlı İşlemler" bordered={false}>
          <Space wrap size="middle">
            {userModules.modules.map(module => (
              <Button
                key={module.code}
                type="primary"
                icon={getModuleIcon(module.code)}
                onClick={() => navigate(`/app/${module.code}`)}
                style={{
                  background: getModuleColor(module.code),
                  borderColor: getModuleColor(module.code)
                }}
              >
                {module.name} Aç
              </Button>
            ))}
          </Space>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdaptiveDashboard;
