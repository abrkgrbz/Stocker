import React from 'react';
import { Row, Col, Card, Statistic, Progress, Typography, Space, Button, Avatar, List, Tag, Timeline } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  TrophyOutlined,
  RiseOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MoreOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Text, Paragraph } = Typography;

const stats = [
  {
    title: 'Toplam Müşteri',
    value: 1893,
    prefix: <TeamOutlined />,
    suffix: '',
    change: 12.5,
    color: '#667eea'
  },
  {
    title: 'Aktif Fırsatlar',
    value: 24,
    prefix: <TrophyOutlined />,
    suffix: '',
    change: -5.2,
    color: '#f093fb'
  },
  {
    title: 'Bu Ayki Satışlar',
    value: 45600,
    prefix: '',
    suffix: '₺',
    change: 28.4,
    color: '#43e97b'
  },
  {
    title: 'Dönüşüm Oranı',
    value: 68,
    prefix: '',
    suffix: '%',
    change: 8.1,
    color: '#fa709a'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'call',
    customer: 'Ahmet Yılmaz',
    action: 'ile telefon görüşmesi yapıldı',
    time: '10 dakika önce',
    status: 'completed'
  },
  {
    id: 2,
    type: 'email',
    customer: 'ABC Şirketi',
    action: 'teklif e-postası gönderildi',
    time: '1 saat önce',
    status: 'pending'
  },
  {
    id: 3,
    type: 'meeting',
    customer: 'XYZ Ltd.',
    action: 'ile toplantı planlandı',
    time: '2 saat önce',
    status: 'scheduled'
  },
  {
    id: 4,
    type: 'deal',
    customer: 'Mehmet Öz',
    action: 'yeni satış fırsatı oluşturuldu',
    time: '3 saat önce',
    status: 'new'
  }
];

const topCustomers = [
  { name: 'ABC Teknoloji', revenue: 125000, deals: 8, avatar: 'A' },
  { name: 'XYZ Danışmanlık', revenue: 98000, deals: 6, avatar: 'X' },
  { name: 'Mega Holding', revenue: 87500, deals: 5, avatar: 'M' },
  { name: 'Global Ticaret', revenue: 76200, deals: 7, avatar: 'G' },
  { name: 'İnovasyon A.Ş.', revenue: 65400, deals: 4, avatar: 'İ' }
];

export const CRMDashboard: React.FC = () => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="crm-dashboard">
      {/* Header */}
      <div className="crm-header">
        <div>
          <Title level={2} style={{ margin: 0 }}>CRM Dashboard</Title>
          <Text type="secondary">Müşteri ilişkileri yönetimi özeti</Text>
        </div>
        <Space>
          <Button icon={<PlusOutlined />}>Yeni Müşteri</Button>
          <Button type="primary" icon={<PlusOutlined />}>Yeni Fırsat</Button>
        </Space>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Stats Grid */}
        <Row gutter={[16, 16]} className="stats-row">
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div variants={item}>
                <Card className="stat-card">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color }}
                  />
                  <div className="stat-footer">
                    <Space>
                      {stat.change > 0 ? (
                        <ArrowUpOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                      )}
                      <Text type={stat.change > 0 ? 'success' : 'danger'}>
                        {Math.abs(stat.change)}%
                      </Text>
                      <Text type="secondary">geçen aya göre</Text>
                    </Space>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Main Content */}
        <Row gutter={[16, 16]}>
          {/* Sales Pipeline */}
          <Col xs={24} lg={16}>
            <motion.div variants={item}>
              <Card 
                title="Satış Hunisi" 
                extra={<Button type="text" icon={<MoreOutlined />} />}
                className="pipeline-card"
              >
                <div className="pipeline-stages">
                  <div className="pipeline-stage">
                    <Text type="secondary">İlk Temas</Text>
                    <Title level={4}>45</Title>
                    <Progress percent={100} showInfo={false} strokeColor="#667eea" />
                  </div>
                  <div className="pipeline-stage">
                    <Text type="secondary">Toplantı</Text>
                    <Title level={4}>32</Title>
                    <Progress percent={71} showInfo={false} strokeColor="#764ba2" />
                  </div>
                  <div className="pipeline-stage">
                    <Text type="secondary">Teklif</Text>
                    <Title level={4}>18</Title>
                    <Progress percent={40} showInfo={false} strokeColor="#f093fb" />
                  </div>
                  <div className="pipeline-stage">
                    <Text type="secondary">Müzakere</Text>
                    <Title level={4}>12</Title>
                    <Progress percent={27} showInfo={false} strokeColor="#f5576c" />
                  </div>
                  <div className="pipeline-stage">
                    <Text type="secondary">Kazanılan</Text>
                    <Title level={4}>8</Title>
                    <Progress percent={18} showInfo={false} strokeColor="#43e97b" />
                  </div>
                </div>
                
                <div className="pipeline-summary">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Toplam Değer"
                        value={785600}
                        suffix="₺"
                        valueStyle={{ fontSize: 20 }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Ortalama Süre"
                        value={28}
                        suffix="gün"
                        valueStyle={{ fontSize: 20 }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Başarı Oranı"
                        value={68}
                        suffix="%"
                        valueStyle={{ fontSize: 20, color: '#52c41a' }}
                      />
                    </Col>
                  </Row>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Recent Activities */}
          <Col xs={24} lg={8}>
            <motion.div variants={item}>
              <Card 
                title="Son Aktiviteler" 
                extra={<Button type="link">Tümünü Gör</Button>}
                className="activities-card"
              >
                <Timeline mode="left">
                  {recentActivities.map((activity) => (
                    <Timeline.Item
                      key={activity.id}
                      dot={
                        activity.type === 'call' ? <PhoneOutlined /> :
                        activity.type === 'email' ? <MailOutlined /> :
                        activity.type === 'meeting' ? <CalendarOutlined /> :
                        <TrophyOutlined />
                      }
                      color={
                        activity.status === 'completed' ? 'green' :
                        activity.status === 'pending' ? 'orange' :
                        activity.status === 'scheduled' ? 'blue' :
                        'purple'
                      }
                    >
                      <div className="activity-item">
                        <Text strong>{activity.customer}</Text>
                        <Text> {activity.action}</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined /> {activity.time}
                          </Text>
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Top Customers */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <motion.div variants={item}>
              <Card 
                title="En İyi Müşteriler"
                extra={
                  <Space>
                    <Button type="text">Bu Ay</Button>
                    <Button type="link" icon={<MoreOutlined />} />
                  </Space>
                }
              >
                <List
                  itemLayout="horizontal"
                  dataSource={topCustomers}
                  renderItem={(customer, index) => (
                    <List.Item
                      actions={[
                        <Button type="link" icon={<PhoneOutlined />} />,
                        <Button type="link" icon={<MailOutlined />} />,
                        <Button type="link">Detay</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size={48} 
                            style={{ 
                              backgroundColor: ['#667eea', '#f093fb', '#43e97b', '#fa709a', '#30cfd0'][index],
                              fontSize: 20
                            }}
                          >
                            {customer.avatar}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <Text strong>{customer.name}</Text>
                            {index === 0 && <Tag color="gold">VIP</Tag>}
                          </Space>
                        }
                        description={
                          <Space>
                            <Text type="secondary">
                              <TrophyOutlined /> {customer.deals} anlaşma
                            </Text>
                            <Text>•</Text>
                            <Text strong style={{ color: '#52c41a' }}>
                              {customer.revenue.toLocaleString('tr-TR')} ₺
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};