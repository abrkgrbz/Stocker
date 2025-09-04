import React, { useState } from 'react';
import { Card, Row, Col, Button, Badge, Avatar, Space, Tag, Progress, Empty, Statistic } from 'antd';
import { PlusOutlined, DollarOutlined, CalendarOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface PipelineStage {
  id: string;
  name: string;
  items: PipelineItem[];
  color: string;
  totalValue: number;
}

interface PipelineItem {
  id: string;
  name: string;
  amount: number;
  probability: number;
  expectedCloseDate: string;
  customerName: string;
  owner: string;
  daysInStage: number;
}

const mockStages: PipelineStage[] = [
  {
    id: 'lead',
    name: 'Potansiyel',
    color: '#1890ff',
    totalValue: 250000,
    items: [
      {
        id: '1',
        name: 'Yazılım Lisansı Satışı',
        amount: 75000,
        probability: 20,
        expectedCloseDate: '2024-02-28',
        customerName: 'ABC Teknoloji',
        owner: 'Ahmet Yılmaz',
        daysInStage: 5,
      },
      {
        id: '2',
        name: 'Danışmanlık Hizmeti',
        amount: 45000,
        probability: 30,
        expectedCloseDate: '2024-03-15',
        customerName: 'XYZ Holding',
        owner: 'Mehmet Demir',
        daysInStage: 3,
      },
    ],
  },
  {
    id: 'qualified',
    name: 'Nitelikli',
    color: '#52c41a',
    totalValue: 380000,
    items: [
      {
        id: '3',
        name: 'ERP Entegrasyonu',
        amount: 150000,
        probability: 50,
        expectedCloseDate: '2024-02-20',
        customerName: 'Mega AŞ',
        owner: 'Ayşe Kaya',
        daysInStage: 10,
      },
      {
        id: '4',
        name: 'Bulut Çözümü',
        amount: 95000,
        probability: 60,
        expectedCloseDate: '2024-03-01',
        customerName: 'Global Corp',
        owner: 'Fatma Öz',
        daysInStage: 7,
      },
    ],
  },
  {
    id: 'proposal',
    name: 'Teklif',
    color: '#fa8c16',
    totalValue: 520000,
    items: [
      {
        id: '5',
        name: 'CRM Sistemi',
        amount: 120000,
        probability: 75,
        expectedCloseDate: '2024-02-15',
        customerName: 'Satış AŞ',
        owner: 'Ali Veli',
        daysInStage: 15,
      },
    ],
  },
  {
    id: 'negotiation',
    name: 'Müzakere',
    color: '#722ed1',
    totalValue: 280000,
    items: [
      {
        id: '6',
        name: 'Güvenlik Yazılımı',
        amount: 85000,
        probability: 85,
        expectedCloseDate: '2024-02-10',
        customerName: 'Güvenlik Ltd',
        owner: 'Zeynep Ak',
        daysInStage: 20,
      },
    ],
  },
  {
    id: 'won',
    name: 'Kazanıldı',
    color: '#52c41a',
    totalValue: 450000,
    items: [
      {
        id: '7',
        name: 'Muhasebe Yazılımı',
        amount: 65000,
        probability: 100,
        expectedCloseDate: '2024-01-30',
        customerName: 'Finans AŞ',
        owner: 'Can Özkan',
        daysInStage: 0,
      },
    ],
  },
];

export const PipelinePage: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>(mockStages);

  const totalPipelineValue = stages.reduce((sum, stage) => sum + stage.totalValue, 0);
  const totalDeals = stages.reduce((sum, stage) => sum + stage.items.length, 0);
  const averageDealSize = totalDeals > 0 ? Math.round(totalPipelineValue / totalDeals) : 0;
  const winRate = 23; // Mock win rate

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Pipeline Değeri"
              value={totalPipelineValue}
              prefix="₺"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Fırsat"
              value={totalDeals}
              suffix="adet"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ortalama Anlaşma Boyutu"
              value={averageDealSize}
              prefix="₺"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Kazanma Oranı"
              value={winRate}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Satış Hattı" 
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Yeni Fırsat
          </Button>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Row gutter={16} style={{ minWidth: 1200 }}>
            {stages.map((stage) => (
              <Col key={stage.id} span={4} style={{ minWidth: 280 }}>
                <div style={{ marginBottom: 16 }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Badge color={stage.color} text={<strong>{stage.name}</strong>} />
                    <Tag color={stage.color}>
                      ₺{stage.totalValue.toLocaleString('tr-TR')}
                    </Tag>
                  </Space>
                  <Progress 
                    percent={stage.items.length * 20} 
                    strokeColor={stage.color} 
                    showInfo={false}
                    size="small"
                    style={{ marginTop: 8 }}
                  />
                </div>

                <div style={{ minHeight: 400 }}>
                  {stage.items.length === 0 ? (
                    <Empty 
                      description="Fırsat yok"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ marginTop: 50 }}
                    />
                  ) : (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {stage.items.map((item) => (
                        <Card 
                          key={item.id}
                          size="small"
                          hoverable
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{ marginBottom: 8 }}>
                            <strong>{item.name}</strong>
                          </div>
                          
                          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                            {item.customerName}
                          </div>

                          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                            ₺{item.amount.toLocaleString('tr-TR')}
                          </div>

                          <Space size="small" style={{ fontSize: 12 }}>
                            <span style={{ color: '#8c8c8c' }}>
                              <CalendarOutlined /> {dayjs(item.expectedCloseDate).format('DD MMM')}
                            </span>
                            <span style={{ color: '#8c8c8c' }}>
                              <UserOutlined /> {item.owner}
                            </span>
                          </Space>

                          <div style={{ marginTop: 8 }}>
                            <Space size="small">
                              <Tag color="blue">%{item.probability}</Tag>
                              {item.daysInStage > 14 && (
                                <Tag color="orange">{item.daysInStage} gün</Tag>
                              )}
                            </Space>
                          </div>
                        </Card>
                      ))}
                    </Space>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginTop: 24, padding: '16px', background: '#fafafa', borderRadius: 8 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Space>
                <ArrowRightOutlined style={{ color: '#52c41a' }} />
                <span>Ortalama Dönüşüm Süresi: <strong>28 gün</strong></span>
              </Space>
            </Col>
            <Col span={8}>
              <Space>
                <DollarOutlined style={{ color: '#1890ff' }} />
                <span>Bu Ay Kapanan: <strong>₺320,000</strong></span>
              </Space>
            </Col>
            <Col span={8}>
              <Space>
                <CalendarOutlined style={{ color: '#fa8c16' }} />
                <span>Sonraki Kapanış: <strong>10 Şubat</strong></span>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};