import React from 'react';
import { 
  ContactsOutlined, 
  BankOutlined, 
  CalculatorOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined
} from '@ant-design/icons';

export interface Module {
  id: string;
  name: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
  benefits: string[];
}

export const mainModules: Module[] = [
  {
    id: 'crm',
    name: 'CRM',
    title: 'Müşteri İlişkileri Yönetimi',
    icon: <ContactsOutlined style={{ fontSize: 48 }} />,
    color: '#1890ff',
    description: 'Müşteri ilişkilerinizi güçlendirin, satışlarınızı artırın',
    features: [
      'Müşteri ve firma yönetimi',
      'Fırsat ve teklif takibi',
      'Satış hunisi ve pipeline yönetimi',
      'Aktivite ve görev yönetimi',
      'E-posta ve SMS entegrasyonu',
      'Müşteri segmentasyonu',
      'Satış raporları ve analizler',
      'Mobil CRM uygulaması'
    ],
    benefits: [
      'Satış verimliliğini %40 artırır',
      'Müşteri memnuniyetini yükseltir',
      'Satış süreçlerini otomatikleştirir'
    ]
  },
  {
    id: 'erp',
    name: 'ERP',
    title: 'Kurumsal Kaynak Planlama',
    icon: <BankOutlined style={{ fontSize: 48 }} />,
    color: '#52c41a',
    description: 'Tüm iş süreçlerinizi entegre edin ve optimize edin',
    features: [
      'Üretim planlama ve kontrol',
      'Tedarik zinciri yönetimi',
      'Proje yönetimi',
      'Kalite kontrol',
      'Bakım ve onarım yönetimi',
      'Kaynak planlama',
      'Maliyet analizi',
      'Performans göstergeleri (KPI)'
    ],
    benefits: [
      'Operasyonel verimliliği artırır',
      'Maliyetleri %30 azaltır',
      'Karar alma süreçlerini hızlandırır'
    ]
  },
  {
    id: 'accounting',
    name: 'Muhasebe',
    title: 'Finansal Yönetim ve Muhasebe',
    icon: <CalculatorOutlined style={{ fontSize: 48 }} />,
    color: '#fa8c16',
    description: 'Finansal süreçlerinizi dijitalleştirin, vergi uyumluluğunu sağlayın',
    features: [
      'Genel muhasebe ve defterler',
      'Fatura ve tahsilat yönetimi',
      'E-fatura, e-arşiv entegrasyonu',
      'Banka ve kasa yönetimi',
      'KDV, stopaj hesaplamaları',
      'Mizan ve mali tablolar',
      'Bütçe planlama ve takibi',
      'Vergi beyanname hazırlığı'
    ],
    benefits: [
      'Muhasebe hatalarını %95 azaltır',
      'Vergi uyumluluğunu garanti eder',
      'Mali süreçleri otomatikleştirir'
    ]
  },
  {
    id: 'inventory',
    name: 'Stok',
    title: 'Stok ve Depo Yönetimi',
    icon: <ShoppingCartOutlined style={{ fontSize: 48 }} />,
    color: '#722ed1',
    description: 'Stoklarınızı akıllıca yönetin, kayıpları önleyin',
    features: [
      'Çoklu depo yönetimi',
      'Barkod ve QR kod desteği',
      'Stok hareket takibi',
      'Minimum-maksimum stok uyarıları',
      'Sayım ve envanter yönetimi',
      'Seri ve lot takibi',
      'Transfer ve sevkiyat yönetimi',
      'Stok değerleme raporları'
    ],
    benefits: [
      'Stok maliyetlerini %25 düşürür',
      'Stoksuz kalma riskini ortadan kaldırır',
      'Depo verimliliğini artırır'
    ]
  },
  {
    id: 'hr',
    name: 'İK',
    title: 'İnsan Kaynakları Yönetimi',
    icon: <TeamOutlined style={{ fontSize: 48 }} />,
    color: '#eb2f96',
    description: 'Personel süreçlerinizi dijitalleştirin, verimliliği artırın',
    features: [
      'Personel özlük yönetimi',
      'İzin ve devamsızlık takibi',
      'Bordro ve maaş yönetimi',
      'Performans değerlendirme',
      'İşe alım ve başvuru takibi',
      'Eğitim yönetimi',
      'Vardiya planlama',
      'Organizasyon şeması'
    ],
    benefits: [
      'İK süreçlerini %60 hızlandırır',
      'Personel memnuniyetini artırır',
      'İK maliyetlerini düşürür'
    ]
  },
  {
    id: 'bi',
    name: 'BI',
    title: 'İş Zekası ve Analitik',
    icon: <BarChartOutlined style={{ fontSize: 48 }} />,
    color: '#13c2c2',
    description: 'Verilerinizi anlamlı içgörülere dönüştürün',
    features: [
      'Gerçek zamanlı dashboard\'lar',
      'Özelleştirilebilir raporlar',
      'Veri görselleştirme',
      'Tahminleme ve trend analizi',
      'KPI takibi',
      'Drill-down analiz',
      'Otomatik rapor gönderimi',
      'Veri entegrasyonu'
    ],
    benefits: [
      'Karar verme sürecini %50 hızlandırır',
      'Veri tabanlı içgörüler sağlar',
      'İş performansını optimize eder'
    ]
  }
];