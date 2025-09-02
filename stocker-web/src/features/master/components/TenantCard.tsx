import React, { memo, useMemo } from 'react';
import {
  Card,
  Tag,
  Avatar,
  Space,
  Button,
  Dropdown,
  Progress,
  Typography,
  Tooltip,
  Badge,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  LoginOutlined,
  LockOutlined,
  UnlockOutlined,
  MoreOutlined,
  DatabaseOutlined,
  ApiOutlined,
  GlobalOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const { Text, Title } = Typography;
const { Meta } = Card;

interface TenantCardProps {
  tenant: {
    id: string;
    name: string;
    domain: string;
    email: string;
    plan: string;
    status: string;
    userCount: number;
    maxUsers: number;
    storageUsed: number;
    maxStorage: number;
    revenue: number;
    growth: number;
    modules: string[];
  };
  onEdit: (tenant: any) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onLoginAs: (tenant: any) => void;
  onViewDetails: (tenant: any) => void;
}

export const TenantCard: React.FC<TenantCardProps> = memo(({
  tenant,
  onEdit,
  onDelete,
  onToggleStatus,
  onLoginAs,
  onViewDetails,
}) => {
  // Memoize expensive calculations
  const storagePercentage = useMemo(() => 
    Math.round((tenant.storageUsed / tenant.maxStorage) * 100),
    [tenant.storageUsed, tenant.maxStorage]
  );

  const userPercentage = useMemo(() => 
    Math.round((tenant.userCount / tenant.maxUsers) * 100),
    [tenant.userCount, tenant.maxUsers]
  );

  const statusColor = useMemo(() => {
    const colors: Record<string, string> = {
      active: 'success',
      suspended: 'error',
      pending: 'warning',
      expired: 'default',
    };
    return colors[tenant.status] || 'default';
  }, [tenant.status]);

  const planColor = useMemo(() => {
    const colors: Record<string, string> = {
      Enterprise: 'purple',
      Professional: 'blue',
      Starter: 'green',
      Free: 'default',
    };
    return colors[tenant.plan] || 'default';
  }, [tenant.plan]);

  const menuItems = useMemo(() => [
    {
      key: 'view',
      label: 'Detayları Görüntüle',
      icon: <UserOutlined />,
      onClick: () => onViewDetails(tenant),
    },
    {
      key: 'login',
      label: 'Tenant Olarak Giriş',
      icon: <LoginOutlined />,
      onClick: () => onLoginAs(tenant),
    },
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <EditOutlined />,
      onClick: () => onEdit(tenant),
    },
    {
      key: 'toggle',
      label: tenant.status === 'active' ? 'Askıya Al' : 'Aktifleştir',
      icon: tenant.status === 'active' ? <LockOutlined /> : <UnlockOutlined />,
      onClick: () => onToggleStatus(tenant.id),
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: 'Sil',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(tenant.id),
    },
  ], [tenant, onViewDetails, onLoginAs, onEdit, onToggleStatus, onDelete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
    >
      <Card
        className="tenant-card"
        actions={[
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(tenant)}>
            Düzenle
          </Button>,
          <Button type="text" icon={<LoginOutlined />} onClick={() => onLoginAs(tenant)}>
            Giriş
          </Button>,
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>,
        ]}
      >
        <Meta
          avatar={
            <Avatar 
              size={64} 
              style={{ backgroundColor: '#667eea' }}
              icon={<UserOutlined />}
            >
              {tenant.name.substring(0, 2).toUpperCase()}
            </Avatar>
          }
          title={
            <Space direction="vertical" size={0}>
              <Title level={5} style={{ margin: 0 }}>{tenant.name}</Title>
              <Space size="small">
                <Tag color={statusColor}>
                  {tenant.status === 'active' ? 'Aktif' : 
                   tenant.status === 'suspended' ? 'Askıda' :
                   tenant.status === 'pending' ? 'Beklemede' : 'Süresi Dolmuş'}
                </Tag>
                <Tag color={planColor}>{tenant.plan}</Tag>
              </Space>
            </Space>
          }
          description={
            <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
              <Text type="secondary">
                <GlobalOutlined /> {tenant.domain}
              </Text>
              
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">
                    <UserOutlined /> Kullanıcılar
                  </Text>
                  <Text>{tenant.userCount} / {tenant.maxUsers}</Text>
                </div>
                <Progress 
                  percent={userPercentage} 
                  strokeColor={userPercentage > 80 ? '#ff4d4f' : '#667eea'}
                  showInfo={false}
                  size="small"
                />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">
                    <DatabaseOutlined /> Depolama
                  </Text>
                  <Text>{tenant.storageUsed} / {tenant.maxStorage} GB</Text>
                </div>
                <Progress 
                  percent={storagePercentage} 
                  strokeColor={storagePercentage > 80 ? '#faad14' : '#52c41a'}
                  showInfo={false}
                  size="small"
                />
              </div>

              <div style={{ 
                marginTop: 16, 
                padding: '12px', 
                background: '#fafafa', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <Text type="secondary">Aylık Gelir</Text>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#595959' }}>
                    ₺<CountUp end={tenant.revenue} separator="," duration={2} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {tenant.growth > 0 ? (
                    <Badge 
                      count={
                        <span style={{ color: '#52c41a' }}>
                          <RiseOutlined /> {tenant.growth}%
                        </span>
                      }
                    />
                  ) : (
                    <Badge 
                      count={
                        <span style={{ color: '#ff4d4f' }}>
                          <FallOutlined /> {Math.abs(tenant.growth)}%
                        </span>
                      }
                    />
                  )}
                </div>
              </div>

              {tenant.modules && tenant.modules.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Space size={[4, 4]} wrap>
                    {tenant.modules.map(module => (
                      <Tag key={module} color="blue" style={{ fontSize: 11 }}>
                        {module}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          }
        />
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.tenant.id === nextProps.tenant.id &&
    prevProps.tenant.status === nextProps.tenant.status &&
    prevProps.tenant.userCount === nextProps.tenant.userCount &&
    prevProps.tenant.storageUsed === nextProps.tenant.storageUsed &&
    prevProps.tenant.revenue === nextProps.tenant.revenue &&
    prevProps.tenant.growth === nextProps.tenant.growth
  );
});

TenantCard.displayName = 'TenantCard';

export default TenantCard;