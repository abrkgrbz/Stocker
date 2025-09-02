import React from 'react';
import { Collapse, Typography, Tag } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import './style.css';

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

const faqData = [
  {
    key: '1',
    question: 'Stocker ERP yazılımı nedir ve nasıl çalışır?',
    answer: 'Stocker, işletmenizin tüm süreçlerini tek bir platformda yönetmenizi sağlayan bulut tabanlı bir ERP çözümüdür. Satış, stok, finans, İK, CRM ve daha fazla modülü entegre şekilde kullanarak verimliliğinizi artırabilirsiniz.'
  },
  {
    key: '2',
    question: 'Hangi sektörler için uygun?',
    answer: 'Stocker, perakende, e-ticaret, üretim, hizmet, dağıtım ve toptan satış dahil olmak üzere tüm sektörlere uygun esnek bir çözümdür. Her sektörün ihtiyaçlarına göre özelleştirilebilir modüler yapısı sayesinde kolayca adapte olabilirsiniz.'
  },
  {
    key: '3',
    question: '14 günlük deneme sürümünde hangi özellikler kullanılabilir?',
    answer: 'Deneme sürümünde tüm modüllere ve özelliklere sınırsız erişim sağlanır. Kredi kartı bilgisi gerekmez ve deneme süresi sonunda otomatik ödeme alınmaz. İstediğiniz zaman ücretli plana geçebilir veya kullanımı sonlandırabilirsiniz.'
  },
  {
    key: '4',
    question: 'Kurulum ve eğitim süreci nasıl işliyor?',
    answer: 'Stocker bulut tabanlı olduğu için kurulum gerektirmez. Kayıt olduktan sonra hemen kullanmaya başlayabilirsiniz. Ücretsiz video eğitimler, canlı webinarlar ve 7/24 destek hizmetimizle her adımda yanınızdayız.'
  },
  {
    key: '5',
    question: 'Mevcut verilerimi Stocker\'a nasıl aktarabilirim?',
    answer: 'Excel, CSV veya API aracılığıyla verilerinizi kolayca aktarabilirsiniz. Destek ekibimiz veri aktarım sürecinde size yardımcı olur. Ayrıca popüler muhasebe ve e-ticaret platformlarıyla hazır entegrasyonlarımız mevcuttur.'
  },
  {
    key: '6',
    question: 'Güvenlik ve veri gizliliği nasıl sağlanıyor?',
    answer: 'Verileriniz SSL şifreleme ile korunur ve Türkiye\'deki veri merkezlerinde saklanır. KVKK uyumlu olarak çalışır, düzenli yedekleme yapılır ve ISO 27001 sertifikasına sahiptir. Verilerinize sadece yetkilendirdiğiniz kişiler erişebilir.'
  },
  {
    key: '7',
    question: 'Fiyatlandırma nasıl çalışıyor?',
    answer: 'Kullanıcı sayısı ve seçtiğiniz modüllere göre esnek fiyatlandırma sunuyoruz. Aylık veya yıllık ödeme seçenekleri mevcuttur. Yıllık ödemede %20\'ye varan indirimlerden yararlanabilirsiniz. Kurulum ücreti yoktur.'
  },
  {
    key: '8',
    question: 'Mobil uygulama var mı?',
    answer: 'Evet, iOS ve Android için native mobil uygulamalarımız mevcuttur. Mobil uygulamadan satış yapabilir, stok kontrolü sağlayabilir, raporları görüntüleyebilir ve tüm kritik işlemlerinizi gerçekleştirebilirsiniz.'
  },
  {
    key: '9',
    question: 'Teknik destek nasıl alabilirim?',
    answer: '7/24 canlı destek, telefon desteği ve uzaktan bağlantı ile teknik destek sağlıyoruz. Ayrıca kapsamlı dokümantasyon, video eğitimler ve topluluk forumumuzdan da yardım alabilirsiniz.'
  },
  {
    key: '10',
    question: 'İptal ve para iadesi politikası nedir?',
    answer: 'Aylık aboneliklerde istediğiniz zaman iptal edebilirsiniz. Yıllık ödemelerde ilk 30 gün içinde tam iade garantisi sunuyoruz. İptal işlemi sonrası verilerinizi 90 gün boyunca saklarız.'
  }
];

export const FAQSection: React.FC = () => {
  return (
    <section className="faq-section" id="faq">
      <div className="section-container">
        <div className="section-header">
          <Tag color="purple" style={{ marginBottom: 16 }}>
            <QuestionCircleOutlined /> Sıkça Sorulan Sorular
          </Tag>
          <Title level={2}>Merak Edilenler</Title>
          <Paragraph>
            Stocker hakkında en çok sorulan soruları yanıtladık
          </Paragraph>
        </div>
        
        <div className="faq-content">
          <Collapse 
            defaultActiveKey={['1']} 
            expandIconPosition="end"
            className="faq-collapse"
          >
            {faqData.map(item => (
              <Panel 
                header={<span className="faq-question">{item.question}</span>} 
                key={item.key}
                className="faq-panel"
              >
                <Paragraph className="faq-answer">
                  {item.answer}
                </Paragraph>
              </Panel>
            ))}
          </Collapse>
        </div>
        
        <div className="faq-footer">
          <Paragraph>
            Başka sorularınız mı var? 
            <a href="#contact" style={{ marginLeft: 8 }}>Bizimle iletişime geçin</a>
          </Paragraph>
        </div>
      </div>
    </section>
  );
};