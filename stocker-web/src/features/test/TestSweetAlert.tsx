import React from 'react';

import { Button, Space } from 'antd';
import Swal from 'sweetalert2';

import { showApiResponse } from '@/shared/utils/sweetAlert';

const TestSweetAlert: React.FC = () => {
  const testSuccess = () => {
    showApiResponse.success('İşlem başarıyla tamamlandı!', 'Başarılı');
  };

  const testError = () => {
    showApiResponse.error(
      {
        response: {
          data: {
            message: 'E-posta adresi zaten kullanımda',
            errors: {
              email: ['Bu e-posta adresi başka bir hesap tarafından kullanılıyor'],
              password: ['Şifre en az 8 karakter olmalı', 'Şifre en az bir büyük harf içermeli']
            }
          },
          status: 400
        }
      },
      'Kayıt işlemi başarısız'
    );
  };

  const testWarning = () => {
    showApiResponse.warning('Dikkat! Bu işlem geri alınamaz.', 'Uyarı');
  };

  const testInfo = () => {
    showApiResponse.info('Hesabınız 24 saat içinde aktif olacaktır.', 'Bilgilendirme');
  };

  const testLoading = () => {
    showApiResponse.loading('İşleminiz gerçekleştiriliyor...');
    setTimeout(() => {
      Swal.close();
      showApiResponse.success('İşlem tamamlandı!');
    }, 3000);
  };

  const testToast = () => {
    showApiResponse.toast.success('Ayarlar kaydedildi');
    setTimeout(() => {
      showApiResponse.toast.error('Bağlantı hatası');
    }, 1000);
    setTimeout(() => {
      showApiResponse.toast.warning('Disk alanı azalıyor');
    }, 2000);
    setTimeout(() => {
      showApiResponse.toast.info('Yeni güncelleme mevcut');
    }, 3000);
  };

  const testConfirm = async () => {
    const result = await showApiResponse.confirm(
      'Bu hesabı silmek istediğinizden emin misiniz?',
      'Hesap Silme',
      'Evet, Sil',
      'İptal'
    );
    
    if (result) {
      showApiResponse.success('Hesap başarıyla silindi');
    } else {
      showApiResponse.info('İşlem iptal edildi');
    }
  };

  const testPrompt = async () => {
    const result = await showApiResponse.prompt(
      'Yeni Kategori Oluştur',
      'Kategori Adı:',
      'Örn: Elektronik',
      ''
    );
    
    if (result) {
      showApiResponse.success(`"${result}" kategorisi oluşturuldu`);
    }
  };

  return (
    <div style={{ padding: '50px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1>SweetAlert2 Test Sayfası</h1>
      
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <div>
          <h3>Temel Alert Tipleri</h3>
          <Space wrap>
            <Button type="primary" onClick={testSuccess}>Başarı Mesajı</Button>
            <Button danger onClick={testError}>Hata Mesajı (Detaylı)</Button>
            <Button onClick={testWarning}>Uyarı Mesajı</Button>
            <Button onClick={testInfo}>Bilgi Mesajı</Button>
            <Button onClick={testLoading}>Loading Mesajı</Button>
          </Space>
        </div>

        <div>
          <h3>Toast Bildirimleri</h3>
          <Button onClick={testToast}>Toast Mesajları (Sıralı)</Button>
        </div>

        <div>
          <h3>Etkileşimli Dialog'lar</h3>
          <Space wrap>
            <Button onClick={testConfirm}>Onay Dialog'u</Button>
            <Button onClick={testPrompt}>Input Dialog'u</Button>
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default TestSweetAlert;