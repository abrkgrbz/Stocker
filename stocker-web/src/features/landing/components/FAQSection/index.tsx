import React, { useState } from 'react';
import { Typography, Tag, Card, Row, Col, Button, Space } from 'antd';
import { 
  QuestionCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  RocketOutlined,
  SafetyOutlined,
  DollarOutlined,
  MobileOutlined,
  CustomerServiceOutlined,
  CloudOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './style.css';

const { Title, Paragraph, Text } = Typography;

const faqCategories = [
  {
    key: 'general',
    title: 'Genel Bilgiler',
    icon: <RocketOutlined />,
    color: '#667eea',
    questions: [
      {
        id: '1',
        question: 'Stocker ERP nedir ve kimler için uygundur?',
        answer: 'Stocker, küçük ve orta ölçekli işletmeler için tasarlanmış bulut tabanlı, modüler bir ERP çözümüdür. CRM, Stok, Satış, Finans, İK ve Üretim modülleriyle işletmenizin tüm süreçlerini tek platformda yönetebilirsiniz. Perakende, üretim, hizmet ve dağıtım sektörlerindeki 10-500 çalışanlı işletmeler için idealdir.',
        highlights: ['6 Ana Modül', 'Bulut Tabanlı', 'Sektörel Çözümler', 'Ölçeklenebilir']
      },
      {
        id: '2',
        question: 'Diğer ERP sistemlerinden farkı nedir?',
        answer: 'Stocker, kullanıcı dostu arayüzü, hızlı kurulumu ve uygun fiyatlandırmasıyla öne çıkar. Karmaşık ERP sistemlerinin aksine, 5 dakikada kurulum yapabilir ve aynı gün kullanmaya başlayabilirsiniz. Türkiye\'ye özel e-fatura, e-arşiv entegrasyonları ve yerel destek hizmetimiz bulunur.',
        highlights: ['Kolay Kullanım', 'Hızlı Kurulum', 'Yerel Destek', 'Uygun Fiyat']
      },
      {
        id: '3',
        question: 'Hangi sektörler için özel çözümler sunuyorsunuz?',
        answer: 'Perakende, E-ticaret, Üretim, Dağıtım, Toptan Satış, Hizmet ve Restoran sektörleri için özelleştirilmiş çözümlerimiz mevcuttur. Her sektörün kendine özgü iş süreçlerine uygun hazır şablonlar, raporlar ve otomasyonlar sunuyoruz.',
        highlights: ['7+ Sektör', 'Hazır Şablonlar', 'Sektörel Raporlar', 'Özel İş Akışları']
      }
    ]
  },
  {
    key: 'pricing',
    title: 'Fiyatlandırma & Deneme',
    icon: <DollarOutlined />,
    color: '#f093fb',
    questions: [
      {
        id: '4',
        question: '14 günlük ücretsiz deneme nasıl çalışır?',
        answer: 'Kayıt olduktan sonra tüm özelliklere 14 gün boyunca ücretsiz erişim sağlarsınız. Kredi kartı bilgisi istenmez, otomatik ödeme alınmaz. Deneme süresince tüm modülleri test edebilir, veri girişi yapabilir ve destek alabilirsiniz. Süre sonunda dilediğiniz paketi seçerek devam edebilirsiniz.',
        highlights: ['Kredi Kartı Gerekmez', 'Tüm Özellikler Açık', 'Otomatik Ödeme Yok', 'Veri Kaybı Yok']
      },
      {
        id: '5',
        question: 'Fiyatlandırma modeli nasıl işliyor?',
        answer: 'Kullanıcı sayısı ve seçtiğiniz modüllere göre esnek fiyatlandırma sunuyoruz. Başlangıç paketimiz 5 kullanıcı ve 3 modül ile aylık 499 TL\'den başlar. İhtiyacınıza göre modül ve kullanıcı ekleyebilirsiniz. Yıllık ödemede %20, 2 yıllık ödemede %30 indirim uygulanır.',
        highlights: ['Modüler Fiyatlama', 'Aylık/Yıllık Ödeme', '%30\'a Varan İndirim', 'Şeffaf Fiyatlar']
      },
      {
        id: '6',
        question: 'Gizli ücretler var mı?',
        answer: 'Hayır, fiyatlarımız tamamen şeffaftır. Kurulum ücreti, güncelleme ücreti veya gizli ücret yoktur. Sadece seçtiğiniz paket ücretini ödersiniz. Ek kullanıcı, modül veya depolama alanı ihtiyacınız olursa, bunların fiyatları web sitemizde açıkça belirtilmiştir.',
        highlights: ['Kurulum Ücreti Yok', 'Güncelleme Ücretsiz', 'Şeffaf Fiyatlama', 'Sürpriz Yok']
      }
    ]
  },
  {
    key: 'security',
    title: 'Güvenlik & Veri',
    icon: <SafetyOutlined />,
    color: '#764ba2',
    questions: [
      {
        id: '7',
        question: 'Verilerim güvende mi?',
        answer: 'Evet, verileriniz en yüksek güvenlik standartlarıyla korunur. 256-bit SSL şifreleme, ISO 27001 sertifikası, KVKK uyumluluğu ve günlük otomatik yedekleme ile verilerinizin güvenliğini garanti altına alırız. Verileriniz Türkiye\'deki Tier 3 veri merkezlerinde saklanır.',
        highlights: ['SSL Şifreleme', 'ISO 27001', 'KVKK Uyumlu', 'Günlük Yedekleme']
      },
      {
        id: '8',
        question: 'Veri kaybı durumunda ne olur?',
        answer: 'Verileriniz günlük olarak otomatik yedeklenir ve 30 gün geriye dönük yedekler saklanır. Herhangi bir veri kaybı durumunda, son yedekten geri yükleme yapılır. Ayrıca, kritik verilerinizi istediğiniz zaman Excel/PDF olarak dışa aktarabilirsiniz.',
        highlights: ['Günlük Yedekleme', '30 Gün Saklama', 'Anında Geri Yükleme', 'Veri Dışa Aktarım']
      },
      {
        id: '9',
        question: 'Verilerimi nasıl dışa aktarabilirim?',
        answer: 'Tüm verilerinizi Excel, CSV veya PDF formatında dışa aktarabilirsiniz. API erişimi ile verilerinizi programatik olarak çekebilirsiniz. Aboneliğinizi iptal ederseniz, 90 gün içinde tüm verilerinizi indirebilirsiniz.',
        highlights: ['Excel/CSV/PDF', 'API Erişimi', '90 Gün Saklama', 'Toplu İndirme']
      }
    ]
  },
  {
    key: 'technical',
    title: 'Teknik & Kurulum',
    icon: <CloudOutlined />,
    color: '#43e97b',
    questions: [
      {
        id: '10',
        question: 'Kurulum için teknik bilgi gerekli mi?',
        answer: 'Hayır, hiçbir teknik bilgi gerekmez. Stocker bulut tabanlı SaaS bir çözümdür. Web tarayıcınızdan giriş yaparak hemen kullanmaya başlayabilirsiniz. Sunucu kurulumu, veritabanı yapılandırması gibi teknik işlemlerle uğraşmanıza gerek yoktur.',
        highlights: ['Kurulum Gerektirmez', 'Tarayıcı Tabanlı', 'Otomatik Güncellemeler', 'IT Desteği Gerekmez']
      },
      {
        id: '11',
        question: 'Mevcut sistemimden veri aktarımı yapabilir miyim?',
        answer: 'Evet, Excel, CSV formatındaki verilerinizi kolayca aktarabilirsiniz. Logo, Mikro, SAP, Netsis gibi popüler sistemlerden veri aktarımı için hazır şablonlarımız var. Destek ekibimiz veri aktarım sürecinde ücretsiz yardım sağlar.',
        highlights: ['Excel/CSV Desteği', 'Hazır Şablonlar', 'Ücretsiz Destek', 'Popüler Sistemlerle Uyumlu']
      },
      {
        id: '12',
        question: 'Hangi cihazlardan erişebilirim?',
        answer: 'Web tarayıcısı olan her cihazdan (PC, Mac, tablet) erişebilirsiniz. iOS ve Android için özel mobil uygulamalarımız mevcuttur. Responsive tasarım sayesinde tüm ekran boyutlarında sorunsuz çalışır. İnternet bağlantınız olduğu her yerden güvenli erişim sağlayabilirsiniz.',
        highlights: ['Web + Mobil', 'iOS & Android', 'Responsive Tasarım', 'Her Yerden Erişim']
      }
    ]
  },
  {
    key: 'support',
    title: 'Destek & Eğitim',
    icon: <CustomerServiceOutlined />,
    color: '#4facfe',
    questions: [
      {
        id: '13',
        question: 'Ne tür destek hizmetleri sunuyorsunuz?',
        answer: '7/24 canlı destek, telefon desteği, e-posta desteği ve uzaktan bağlantı desteği sunuyoruz. Ayrıca kapsamlı dokümantasyon, video eğitimler ve canlı webinarlarımız mevcuttur. Premium paketlerde özel hesap yöneticisi atanır.',
        highlights: ['7/24 Canlı Destek', 'Telefon & E-posta', 'Uzaktan Bağlantı', 'Özel Hesap Yöneticisi']
      },
      {
        id: '14',
        question: 'Eğitim ve adaptasyon süreci nasıl işliyor?',
        answer: 'İlk kayıt sonrası ücretsiz tanışma görüşmesi yapılır. Temel eğitim videoları ve canlı webinarlarla hızlı başlangıç sağlanır. İlk 30 gün boyunca yoğunlaştırılmış destek verilir. Kurumsal paketlerde yerinde eğitim seçeneği sunulur.',
        highlights: ['Ücretsiz Eğitim', 'Canlı Webinarlar', '30 Gün Özel Destek', 'Yerinde Eğitim']
      },
      {
        id: '15',
        question: 'Özelleştirme ve entegrasyon desteği var mı?',
        answer: 'Evet, işletmenize özel rapor, form ve iş akışları oluşturabilirsiniz. E-ticaret, muhasebe, kargo ve ödeme sistemleriyle hazır entegrasyonlarımız var. API ile özel entegrasyonlar yapabilir veya profesyonel hizmet alabilirsiniz.',
        highlights: ['Özel Raporlar', 'Hazır Entegrasyonlar', 'API Desteği', 'Profesyonel Hizmet']
      }
    ]
  }
];

export const FAQSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [expandedItems, setExpandedItems] = useState<string[]>(['1']);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const currentCategory = faqCategories.find(cat => cat.key === selectedCategory);

  return (
    <section className="faq-section" id="faq" style={{ padding: '100px 0', background: 'linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <Tag color="purple" style={{ marginBottom: 16, padding: '6px 16px', fontSize: '14px' }}>
            <QuestionCircleOutlined /> SSS
          </Tag>
          <Title level={2} style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>
            Sıkça Sorulan Sorular
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#718096', maxWidth: '600px', margin: '0 auto' }}>
            Stocker ERP hakkında merak ettiğiniz her şey
          </Paragraph>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '48px' }}
        >
          <Row gutter={[16, 16]} justify="center">
            {faqCategories.map((category) => (
              <Col key={category.key}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    hoverable
                    onClick={() => setSelectedCategory(category.key)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '12px',
                      border: selectedCategory === category.key 
                        ? `2px solid ${category.color}`
                        : '2px solid transparent',
                      background: selectedCategory === category.key
                        ? `linear-gradient(135deg, ${category.color}10, ${category.color}05)`
                        : 'white',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: selectedCategory === category.key
                        ? `0 8px 24px ${category.color}20`
                        : '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    bodyStyle={{ padding: '20px 24px' }}
                  >
                    <Space align="center" size={12}>
                      <div style={{ 
                        fontSize: '24px', 
                        color: category.color,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {category.icon}
                      </div>
                      <Text strong style={{ 
                        fontSize: '16px',
                        color: selectedCategory === category.key ? category.color : '#2d3748'
                      }}>
                        {category.title}
                      </Text>
                    </Space>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>

        {/* Questions */}
        <Row gutter={[32, 32]}>
          <Col xs={24}>
            <AnimatePresence mode="wait">
              {currentCategory && (
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {currentCategory.questions.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ marginBottom: '16px' }}
                      >
                        <Card
                          style={{
                            borderRadius: '16px',
                            border: expandedItems.includes(item.id)
                              ? `2px solid ${currentCategory.color}20`
                              : '1px solid #e2e8f0',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflow: 'hidden',
                            boxShadow: expandedItems.includes(item.id)
                              ? '0 8px 32px rgba(0,0,0,0.08)'
                              : '0 2px 8px rgba(0,0,0,0.04)'
                          }}
                          bodyStyle={{ padding: 0 }}
                        >
                          <div
                            onClick={() => toggleExpand(item.id)}
                            style={{
                              padding: '24px 28px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: expandedItems.includes(item.id)
                                ? `linear-gradient(135deg, ${currentCategory.color}05, transparent)`
                                : 'transparent',
                              transition: 'background 0.3s'
                            }}
                          >
                            <Text strong style={{ 
                              fontSize: '16px', 
                              color: '#2d3748',
                              flex: 1,
                              paddingRight: '20px'
                            }}>
                              {item.question}
                            </Text>
                            <Button
                              type="text"
                              icon={expandedItems.includes(item.id) ? <MinusOutlined /> : <PlusOutlined />}
                              style={{
                                color: currentCategory.color,
                                borderRadius: '8px',
                                background: `${currentCategory.color}10`
                              }}
                            />
                          </div>
                          
                          <AnimatePresence>
                            {expandedItems.includes(item.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                  borderTop: `1px solid ${currentCategory.color}10`,
                                  background: 'white'
                                }}
                              >
                                <div style={{ padding: '24px 28px' }}>
                                  <Paragraph style={{ 
                                    fontSize: '15px', 
                                    color: '#4a5568',
                                    marginBottom: '20px',
                                    lineHeight: '1.7'
                                  }}>
                                    {item.answer}
                                  </Paragraph>
                                  
                                  {item.highlights && (
                                    <Row gutter={[12, 12]}>
                                      {item.highlights.map((highlight, idx) => (
                                        <Col key={idx} xs={12} sm={6}>
                                          <div style={{
                                            padding: '8px 12px',
                                            background: `linear-gradient(135deg, ${currentCategory.color}10, ${currentCategory.color}05)`,
                                            borderRadius: '8px',
                                            border: `1px solid ${currentCategory.color}20`,
                                            textAlign: 'center'
                                          }}>
                                            <Text style={{ 
                                              fontSize: '13px', 
                                              color: currentCategory.color,
                                              fontWeight: '500'
                                            }}>
                                              {highlight}
                                            </Text>
                                          </div>
                                        </Col>
                                      ))}
                                    </Row>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Col>
        </Row>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: '60px', textAlign: 'center' }}
        >
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea15, #764ba210)',
              border: 'none',
              borderRadius: '16px',
              padding: '32px'
            }}
          >
            <Title level={4} style={{ marginBottom: '12px' }}>Sorunuz mu var?</Title>
            <Paragraph style={{ fontSize: '16px', color: '#718096', marginBottom: '24px' }}>
              Aradığınız cevabı bulamadıysanız, destek ekibimiz size yardımcı olmaktan mutluluk duyar.
            </Paragraph>
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                icon={<CustomerServiceOutlined />}
                style={{ 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  borderRadius: '8px'
                }}
                onClick={() => window.location.href = 'mailto:destek@stocker.app'}
              >
                Destek Talebi Oluştur
              </Button>
              <Button 
                size="large"
                icon={<MobileOutlined />}
                style={{
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  borderRadius: '8px'
                }}
                onClick={() => window.location.href = 'tel:+908502001234'}
              >
                0850 200 12 34
              </Button>
            </Space>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};