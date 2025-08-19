import { useState } from 'react';
import { Row, Col, Card, Typography, Tag, Button, Space, Modal, List, Badge } from 'antd';
import { 
  TeamOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  ToolOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ExpandOutlined
} from '@ant-design/icons';
import { ModuleDetailModal } from '../ModuleDetailModal';
import './style.css';
import './corporate.css';

const { Title, Text, Paragraph } = Typography;

interface Module {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  benefits: string[];
  image?: string;
  status: 'active' | 'coming-soon' | 'beta';
  popular?: boolean;
}

const modules: Module[] = [
  {
    id: 'crm',
    name: 'CRM',
    title: 'Müşteri İlişkileri Yönetimi',
    description: 'Müşteri ilişkilerinizi güçlendirin, satış süreçlerinizi optimize edin ve müşteri memnuniyetini artırın.',
    icon: <TeamOutlined />,
    color: '#1890ff',
    status: 'active',
    popular: true,
    features: [
      'Müşteri profili yönetimi',
      'İletişim geçmişi takibi',
      'Satış fırsatı yönetimi',
      'Teklif ve sözleşme yönetimi',
      'Müşteri segmentasyonu',
      'Satış hunisi analizi',
      'Performans raporları',
      'E-posta entegrasyonu'
    ],
    benefits: [
      'Müşteri memnuniyetinde %35 artış',
      'Satış dönüşüm oranında %25 iyileşme',
      'Müşteri kaybında %40 azalma',
      'Satış ekibi verimliliğinde %50 artış'
    ]
  },
  {
    id: 'inventory',
    name: 'Envanter',
    title: 'Stok ve Envanter Yönetimi',
    description: 'Stoklarınızı anlık takip edin, envanter maliyetlerinizi düşürün ve tedarik zincirinizi optimize edin.',
    icon: <InboxOutlined />,
    color: '#52c41a',
    status: 'active',
    features: [
      'Gerçek zamanlı stok takibi',
      'Çoklu depo yönetimi',
      'Barkod ve QR kod desteği',
      'Otomatik stok uyarıları',
      'Transfer yönetimi',
      'Parti ve seri no takibi',
      'ABC analizi',
      'Stok değerleme raporları'
    ],
    benefits: [
      'Stok maliyetlerinde %30 azalma',
      'Stoksuz kalma durumunda %45 azalma',
      'Envanter doğruluğunda %99 başarı',
      'Depo verimliliğinde %40 artış'
    ]
  },
  {
    id: 'sales',
    name: 'Satış',
    title: 'Satış Yönetimi',
    description: 'Satış süreçlerinizi baştan sona yönetin, siparişleri takip edin ve satış performansınızı artırın.',
    icon: <ShoppingCartOutlined />,
    color: '#722ed1',
    status: 'active',
    popular: true,
    features: [
      'Sipariş yönetimi',
      'Teklif hazırlama',
      'Fiyatlama ve indirim yönetimi',
      'Satış ekibi performans takibi',
      'Komisyon hesaplama',
      'Satış tahminleme',
      'Kampanya yönetimi',
      'B2B ve B2C satış desteği'
    ],
    benefits: [
      'Satış hacminde %40 artış',
      'Sipariş işleme süresinde %60 azalma',
      'Müşteri başına gelirde %25 artış',
      'Satış tahmin doğruluğunda %85 başarı'
    ]
  },
  {
    id: 'finance',
    name: 'Finans',
    title: 'Finansal Yönetim',
    description: 'Finansal süreçlerinizi dijitalleştirin, nakit akışınızı kontrol altında tutun ve karlılığınızı artırın.',
    icon: <DollarOutlined />,
    color: '#fa8c16',
    status: 'active',
    features: [
      'Fatura yönetimi',
      'Gelir/Gider takibi',
      'Nakit akış yönetimi',
      'Bütçe planlama',
      'Finansal raporlama',
      'Vergi hesaplama',
      'Banka entegrasyonu',
      'Muhasebe entegrasyonu'
    ],
    benefits: [
      'Tahsilat süresinde %35 iyileşme',
      'Nakit akış görünürlüğünde %100 artış',
      'Finansal raporlama süresinde %70 azalma',
      'Bütçe sapmasında %25 azalma'
    ]
  },
  {
    id: 'hr',
    name: 'İK',
    title: 'İnsan Kaynakları Yönetimi',
    description: 'Çalışan deneyimini iyileştirin, İK süreçlerinizi otomatikleştirin ve yetenek yönetiminizi güçlendirin.',
    icon: <UserOutlined />,
    color: '#13c2c2',
    status: 'active',
    features: [
      'Personel bilgi yönetimi',
      'İzin ve devamsızlık takibi',
      'Performans değerlendirme',
      'İşe alım süreci yönetimi',
      'Eğitim planlama',
      'Bordro entegrasyonu',
      'Organizasyon şeması',
      'Çalışan self-servis portalı'
    ],
    benefits: [
      'İK süreçlerinde %50 zaman tasarrufu',
      'Çalışan memnuniyetinde %30 artış',
      'İşe alım süresinde %40 azalma',
      'İK maliyetlerinde %25 düşüş'
    ]
  },
  {
    id: 'production',
    name: 'Üretim',
    title: 'Üretim Yönetimi',
    description: 'Üretim süreçlerinizi optimize edin, verimliliği artırın ve kalite standartlarınızı yükseltin.',
    icon: <ToolOutlined />,
    color: '#eb2f96',
    status: 'beta',
    features: [
      'Üretim planlama',
      'İş emri yönetimi',
      'Makine ve ekipman takibi',
      'Kalite kontrol',
      'OEE hesaplama',
      'Bakım planlaması',
      'Gerçek zamanlı üretim takibi',
      'IoT sensör entegrasyonu'
    ],
    benefits: [
      'Üretim verimliliğinde %35 artış',
      'Kalite problemlerinde %50 azalma',
      'Makine duruş süresinde %40 azalma',
      'Üretim maliyetlerinde %20 düşüş'
    ]
  }
];

export const ModuleShowcase = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedModule(null);
  };

  return (
    <div className="module-showcase">
      <div className="showcase-header">
        <Title level={2}>Güçlü Modüller ile İşinizi Büyütün</Title>
        <Paragraph className="showcase-subtitle">
          İşletmenizin ihtiyaçlarına özel tasarlanmış, entegre çalışan ve ölçeklenebilir modüller
        </Paragraph>
      </div>

      <Row gutter={[32, 32]}>
        {modules.map((module) => (
          <Col xs={24} sm={12} lg={8} key={module.id}>
            <Card 
              className={`module-card ${module.status}`}
              hoverable
              onClick={() => handleModuleClick(module)}
            >
              {module.popular && (
                <div className="popular-badge">
                  <Badge.Ribbon text="Popüler" color="red" />
                </div>
              )}
              
              <div className="module-card-header">
                <div className="module-icon" style={{ backgroundColor: `${module.color}20`, color: module.color }}>
                  {module.icon}
                </div>
                <div className="module-status">
                  {module.status === 'active' && <Tag color="success">Aktif</Tag>}
                  {module.status === 'beta' && <Tag color="processing">Beta</Tag>}
                  {module.status === 'coming-soon' && <Tag color="orange">Yakında</Tag>}
                </div>
              </div>

              <Title level={4} className="module-title">{module.title}</Title>
              <Paragraph className="module-description">{module.description}</Paragraph>

              <div className="module-features-preview">
                <Space direction="vertical" size={8}>
                  {module.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="feature-item">
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      <Text>{feature}</Text>
                    </div>
                  ))}
                </Space>
              </div>

              <div className="module-card-footer">
                <Button 
                  type="link" 
                  icon={<ExpandOutlined />}
                  className="detail-button"
                >
                  Detayları Görüntüle
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="showcase-cta">
        <Space direction="vertical" align="center" size={24}>
          <Title level={3}>Tüm Modüller Entegre Çalışır</Title>
          <Paragraph className="cta-description">
            Modüller arasında kusursuz veri akışı ve otomatik senkronizasyon ile 
            işletmenizin tüm süreçlerini tek platformdan yönetin.
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            icon={<RocketOutlined />}
            className="cta-button"
          >
            Hemen Başlayın
          </Button>
        </Space>
      </div>

      {selectedModule && (
        <ModuleDetailModal
          module={selectedModule}
          visible={modalVisible}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};