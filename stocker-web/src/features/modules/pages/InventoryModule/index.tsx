import { useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress, Space, Button, Tabs, Table, Avatar, Badge, Typography, Alert } from 'antd';
import { 
  InboxOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  SyncOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const InventoryModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Stok Takibi',
      description: 'Ürün stoklarını anlık olarak takip edin ve yönetin',
      status: 'active'
    },
    {
      icon: <TruckOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: 'Transfer Yönetimi',
      description: 'Depolar arası transfer işlemlerini kolayca yönetin',
      status: 'active'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      title: 'Stok Analizi',
      description: 'Detaylı stok raporları ve analizler',
      status: 'active'
    },
    {
      icon: <SyncOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      title: 'Otomatik Sipariş',
      description: 'Minimum stok seviyesine göre otomatik sipariş oluşturma',
      status: 'coming-soon'
    }
  ];

  const statistics = [
    {
      title: 'Toplam Ürün',
      value: 2567,
      prefix: <InboxOutlined />,
      color: '#1890ff',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Toplam Stok Değeri',
      value: 1250000,
      prefix: '₺',
      color: '#52c41a',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'Kritik Stok',
      value: 23,
      prefix: <WarningOutlined />,
      color: '#ff4d4f',
      trend: '-5',
      trendUp: false
    },
    {
      title: 'Depo Doluluk',
      value: 78,
      suffix: '%',
      color: '#722ed1',
      trend: '+3%',
      trendUp: true
    }
  ];

  const stockAlerts = [
    {
      id: 1,
      product: 'Laptop Dell XPS 13',
      currentStock: 3,
      minStock: 10,
      status: 'critical',
      warehouse: 'Ana Depo'
    },
    {
      id: 2,
      product: 'Mouse Logitech MX',
      currentStock: 8,
      minStock: 15,
      status: 'low',
      warehouse: 'Şube Depo'
    },
    {
      id: 3,
      product: 'Klavye Mechanical',
      currentStock: 0,
      minStock: 5,
      status: 'out-of-stock',
      warehouse: 'Ana Depo'
    },
    {
      id: 4,
      product: 'Monitor 27" 4K',
      currentStock: 12,
      minStock: 20,
      status: 'low',
      warehouse: 'Şube Depo'
    }
  ];

  const inventoryColumns = [
    {
      title: 'Ürün',
      dataIndex: 'product',
      key: 'product',
      render: (text: string, record: any) => (
        <Space>
          <Avatar shape="square" size="small" style={{ backgroundColor: '#f0f0f0' }}>
            <InboxOutlined />
          </Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>SKU: {record.sku}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Stok',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{stock}</Text>
          <Progress 
            percent={Math.min((stock / record.maxStock) * 100, 100)} 
            size="small" 
            showInfo={false}
            strokeColor={stock < record.minStock ? '#ff4d4f' : '#52c41a'}
          />
        </Space>
      )
    },
    {
      title: 'Depo',
      dataIndex: 'warehouse',
      key: 'warehouse'
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => `₺${price.toLocaleString('tr-TR')}`
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'in-stock': { color: 'success', text: 'Stokta' },
          'low-stock': { color: 'warning', text: 'Az Stok' },
          'out-of-stock': { color: 'error', text: 'Stok Yok' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge status={config.color as any} text={config.text} />;
      }
    }
  ];

  const inventoryData = [
    {
      key: '1',
      product: 'Laptop Dell XPS 13',
      sku: 'LPT-001',
      category: 'Bilgisayar',
      stock: 15,
      minStock: 10,
      maxStock: 50,
      warehouse: 'Ana Depo',
      unitPrice: 25000,
      status: 'in-stock'
    },
    {
      key: '2',
      product: 'Mouse Logitech MX',
      sku: 'MS-002',
      category: 'Aksesuar',
      stock: 8,
      minStock: 15,
      maxStock: 100,
      warehouse: 'Şube Depo',
      unitPrice: 850,
      status: 'low-stock'
    },
    {
      key: '3',
      product: 'Monitor 27" 4K',
      sku: 'MNT-003',
      category: 'Monitör',
      stock: 0,
      minStock: 5,
      maxStock: 30,
      warehouse: 'Ana Depo',
      unitPrice: 8500,
      status: 'out-of-stock'
    }
  ];

  const warehouseData = [
    {
      name: 'Ana Depo',
      location: 'İstanbul',
      capacity: 5000,
      used: 3800,
      products: 1250,
      value: 850000
    },
    {
      name: 'Şube Depo',
      location: 'Ankara',
      capacity: 3000,
      used: 2100,
      products: 780,
      value: 400000
    },
    {
      name: 'Bölge Depo',
      location: 'İzmir',
      capacity: 2000,
      used: 1500,
      products: 537,
      value: 280000
    }
  ];

  const recentMovements = [
    {
      id: 1,
      type: 'in',
      product: 'Laptop Dell XPS 13',
      quantity: 20,
      from: 'Tedarikçi A',
      to: 'Ana Depo',
      date: '2024-01-10',
      status: 'completed'
    },
    {
      id: 2,
      type: 'out',
      product: 'Mouse Logitech MX',
      quantity: 15,
      from: 'Ana Depo',
      to: 'Müşteri B',
      date: '2024-01-09',
      status: 'completed'
    },
    {
      id: 3,
      type: 'transfer',
      product: 'Monitor 27" 4K',
      quantity: 5,
      from: 'Ana Depo',
      to: 'Şube Depo',
      date: '2024-01-08',
      status: 'in-progress'
    }
  ];

  const getAlertColor = (status: string) => {
    switch(status) {
      case 'critical': return 'error';
      case 'low': return 'warning';
      case 'out-of-stock': return 'error';
      default: return 'info';
    }
  };

  const getMovementIcon = (type: string) => {
    switch(type) {
      case 'in': return <ImportOutlined style={{ color: '#52c41a' }} />;
      case 'out': return <ExportOutlined style={{ color: '#ff4d4f' }} />;
      case 'transfer': return <SyncOutlined style={{ color: '#1890ff' }} />;
      default: return <DatabaseOutlined />;
    }
  };

  return (
    <div className="inventory-module-page">
      <PageHeader
        title="Envanter Modülü"
        subtitle="Stok yönetimi ve envanter kontrolü"
        actions={[
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            Yeni Ürün
          </Button>,
          <Button key="transfer" icon={<SyncOutlined />}>
            Transfer
          </Button>,
          <Button key="report" icon={<BarChartOutlined />}>
            Rapor
          </Button>
        ]}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="module-tabs">
        <TabPane tab="Genel Bakış" key="overview">
          <Row gutter={[16, 16]}>
            {statistics.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="stat-card" hoverable>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color }}
                  />
                  <div className="stat-trend">
                    <Tag color={stat.trendUp ? 'green' : 'red'}>
                      {stat.trend}
                    </Tag>
                    <Text type="secondary">Son 30 gün</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={8}>
              <Card 
                title="Stok Uyarıları" 
                className="alert-card"
                extra={<Badge count={stockAlerts.length} />}
              >
                <List
                  dataSource={stockAlerts}
                  renderItem={item => (
                    <Alert
                      message={item.product}
                      description={`Stok: ${item.currentStock} / Min: ${item.minStock} - ${item.warehouse}`}
                      type={getAlertColor(item.status) as any}
                      showIcon
                      style={{ marginBottom: 12 }}
                    />
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card 
                title="Depo Durumu" 
                className="warehouse-card"
              >
                <Row gutter={[16, 16]}>
                  {warehouseData.map((warehouse, index) => (
                    <Col span={8} key={index}>
                      <Card className="warehouse-item">
                        <Title level={5}>{warehouse.name}</Title>
                        <Text type="secondary">{warehouse.location}</Text>
                        <div style={{ marginTop: 16 }}>
                          <Text>Doluluk Oranı</Text>
                          <Progress 
                            percent={Math.round((warehouse.used / warehouse.capacity) * 100)}
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': '#87d068',
                            }}
                          />
                        </div>
                        <Row style={{ marginTop: 12 }}>
                          <Col span={12}>
                            <Statistic 
                              title="Ürün" 
                              value={warehouse.products}
                              valueStyle={{ fontSize: 14 }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic 
                              title="Değer" 
                              value={warehouse.value}
                              prefix="₺"
                              valueStyle={{ fontSize: 14 }}
                            />
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>

          <Card title="Son Hareketler" style={{ marginTop: 24 }}>
            <Table
              dataSource={recentMovements}
              columns={[
                {
                  title: 'Tür',
                  dataIndex: 'type',
                  key: 'type',
                  render: (type: string) => getMovementIcon(type)
                },
                {
                  title: 'Ürün',
                  dataIndex: 'product',
                  key: 'product'
                },
                {
                  title: 'Miktar',
                  dataIndex: 'quantity',
                  key: 'quantity'
                },
                {
                  title: 'Kaynak',
                  dataIndex: 'from',
                  key: 'from'
                },
                {
                  title: 'Hedef',
                  dataIndex: 'to',
                  key: 'to'
                },
                {
                  title: 'Tarih',
                  dataIndex: 'date',
                  key: 'date'
                },
                {
                  title: 'Durum',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'completed' ? 'success' : 'processing'}>
                      {status === 'completed' ? 'Tamamlandı' : 'İşlemde'}
                    </Tag>
                  )
                }
              ]}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="Stok Listesi" key="inventory">
          <Card className="inventory-card">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button icon={<SearchOutlined />}>Ara</Button>
                <Button icon={<FilterOutlined />}>Filtrele</Button>
                <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
              </Space>
            </div>
            <Table 
              columns={inventoryColumns} 
              dataSource={inventoryData}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Özellikler" key="features">
          <Row gutter={[16, 16]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  className="feature-card" 
                  hoverable
                  style={{ height: '100%' }}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <Title level={5}>{feature.title}</Title>
                  <Paragraph type="secondary">{feature.description}</Paragraph>
                  {feature.status === 'coming-soon' ? (
                    <Tag color="orange">Yakında</Tag>
                  ) : (
                    <Tag color="green">Aktif</Tag>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          <Card title="Modül Yetenekleri" style={{ marginTop: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <List
                  dataSource={[
                    'Çoklu depo yönetimi',
                    'Barkod okuma desteği',
                    'Stok sayım işlemleri',
                    'Parti ve seri no takibi',
                    'Min/Max stok kontrolü'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Col>
              <Col span={12}>
                <List
                  dataSource={[
                    'Otomatik stok uyarıları',
                    'Transfer yönetimi',
                    'Envanter raporları',
                    'ABC analizi',
                    'Entegre satınalma'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};