'use client';

import {
  Drawer,
  Descriptions,
  Tag,
  Space,
  Typography,
  Divider,
  Avatar,
  List,
  Card,
  Badge,
  Timeline,
  Empty,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { formatDate, getRoleLabel, type User } from '@/lib/api/users';

const { Title, Text } = Typography;

interface UserDetailsDrawerProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

export function UserDetailsDrawer({ user, open, onClose }: UserDetailsDrawerProps) {
  if (!user) return null;

  const getUserInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getStatusColor = () => {
    return user.isActive ? '#52c41a' : '#ff4d4f';
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar
            size={48}
            style={{
              background: getStatusColor(),
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {getUserInitials()}
          </Avatar>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user.firstName} {user.lastName}
              {!user.isActive && (
                <Tag color="error" style={{ marginLeft: 8 }}>
                  Pasif
                </Tag>
              )}
            </Title>
            <Text type="secondary">@{user.username}</Text>
          </div>
        </div>
      }
      width={720}
      open={open}
      onClose={onClose}
    >
      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: (
              <span>
                <UserOutlined /> Genel Bilgiler
              </span>
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Contact Information */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <MailOutlined />
                      İletişim Bilgileri
                    </Space>
                  }
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="E-posta">
                      {user.email}
                      {user.emailConfirmed && (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                      )}
                    </Descriptions.Item>
                    {user.phoneNumber && (
                      <Descriptions.Item label="Telefon">
                        {user.phoneNumber}
                        {user.phoneNumberConfirmed && (
                          <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                        )}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                {/* Organization Information */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <TeamOutlined />
                      Organizasyon
                    </Space>
                  }
                >
                  <Descriptions column={1} size="small">
                    {user.title && <Descriptions.Item label="Ünvan">{user.title}</Descriptions.Item>}
                    {user.department && (
                      <Descriptions.Item label="Departman">{user.department.name}</Descriptions.Item>
                    )}
                    {user.branch && <Descriptions.Item label="Şube">{user.branch.name}</Descriptions.Item>}
                  </Descriptions>
                </Card>

                {/* Account Status */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <SafetyOutlined />
                      Hesap Durumu
                    </Space>
                  }
                >
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Durum">
                      <Badge
                        status={user.isActive ? 'success' : 'error'}
                        text={user.isActive ? 'Aktif' : 'Pasif'}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="İki Faktörlü">
                      {user.twoFactorEnabled ? (
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          Aktif
                        </Tag>
                      ) : (
                        <Tag icon={<CloseCircleOutlined />}>Pasif</Tag>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="E-posta Onayı">
                      {user.emailConfirmed ? (
                        <Tag color="success">Onaylı</Tag>
                      ) : (
                        <Tag color="warning">Onay Bekliyor</Tag>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Telefon Onayı">
                      {user.phoneNumberConfirmed ? (
                        <Tag color="success">Onaylı</Tag>
                      ) : (
                        <Tag color="warning">Onay Bekliyor</Tag>
                      )}
                    </Descriptions.Item>
                    {user.lockoutEnabled && user.lockoutEnd && (
                      <Descriptions.Item label="Kilit Durumu" span={2}>
                        <Tag color="error" icon={<LockOutlined />}>
                          {new Date(user.lockoutEnd) > new Date()
                            ? `Kilitli - ${formatDate(user.lockoutEnd)}`
                            : 'Kilidi Açık'}
                        </Tag>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Başarısız Giriş">{user.accessFailedCount}</Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Account Dates */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <ClockCircleOutlined />
                      Tarihler
                    </Space>
                  }
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Oluşturulma">{formatDate(user.createdDate)}</Descriptions.Item>
                    {user.modifiedDate && (
                      <Descriptions.Item label="Son Güncelleme">{formatDate(user.modifiedDate)}</Descriptions.Item>
                    )}
                    {user.lastLoginDate && (
                      <Descriptions.Item label="Son Giriş">{formatDate(user.lastLoginDate)}</Descriptions.Item>
                    )}
                    {user.lastPasswordChangeDate && (
                      <Descriptions.Item label="Son Şifre Değişikliği">
                        {formatDate(user.lastPasswordChangeDate)}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                {user.bio && (
                  <Card size="small" title="Biyografi">
                    <Text>{user.bio}</Text>
                  </Card>
                )}
              </Space>
            ),
          },
          {
            key: 'roles',
            label: (
              <span>
                <SafetyOutlined /> Roller ve Yetkiler
              </span>
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Roles */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <SafetyOutlined />
                      Roller ({user.roles.length})
                    </Space>
                  }
                >
                  {user.roles.length > 0 ? (
                    <Space wrap>
                      {user.roles.map((role) => (
                        <Tag key={role.id} color="blue">
                          {getRoleLabel(role.name)}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <Empty description="Henüz rol atanmamış" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Card>

                {/* Permissions */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <LockOutlined />
                      Yetkiler ({user.permissions.length})
                    </Space>
                  }
                >
                  {user.permissions.length > 0 ? (
                    <Space wrap>
                      {user.permissions.map((permission, index) => (
                        <Tag key={index} color="green">
                          {permission}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <Empty description="Henüz yetki atanmamış" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Card>
              </Space>
            ),
          },
          {
            key: 'history',
            label: (
              <span>
                <HistoryOutlined /> Giriş Geçmişi
              </span>
            ),
            children: (
              <Card
                size="small"
                title={
                  <Space>
                    <HistoryOutlined />
                    Son Giriş Aktiviteleri
                  </Space>
                }
              >
                {user.loginHistory.length > 0 ? (
                  <Timeline
                    items={user.loginHistory.map((login, index) => ({
                      key: index,
                      color: login.status === 'Success' ? 'green' : 'red',
                      children: (
                        <div>
                          <Text strong>{formatDate(login.date)}</Text>
                          <br />
                          <Text type="secondary">
                            {login.ipAddress && `IP: ${login.ipAddress}`}
                            {login.device && ` • ${login.device}`}
                            {login.status && (
                              <Tag
                                color={login.status === 'Success' ? 'success' : 'error'}
                                style={{ marginLeft: 8 }}
                              >
                                {login.status}
                              </Tag>
                            )}
                          </Text>
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <Empty description="Giriş geçmişi bulunamadı" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            ),
          },
          {
            key: 'settings',
            label: (
              <span>
                <SettingOutlined /> Ayarlar
              </span>
            ),
            children: (
              <Card
                size="small"
                title={
                  <Space>
                    <SettingOutlined />
                    Kullanıcı Tercihleri
                  </Space>
                }
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tema">
                    <Tag color={user.settings.theme === 'dark' ? 'default' : 'blue'}>
                      {user.settings.theme === 'dark' ? 'Karanlık' : 'Aydınlık'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Dil">
                    <Tag>{user.settings.language === 'tr' ? 'Türkçe' : user.settings.language}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Bildirimler">
                    {user.settings.notificationsEnabled ? (
                      <Tag color="success">Açık</Tag>
                    ) : (
                      <Tag>Kapalı</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="E-posta Bildirimleri">
                    {user.settings.emailNotifications ? (
                      <Tag color="success">Açık</Tag>
                    ) : (
                      <Tag>Kapalı</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="SMS Bildirimleri">
                    {user.settings.smsNotifications ? (
                      <Tag color="success">Açık</Tag>
                    ) : (
                      <Tag>Kapalı</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
