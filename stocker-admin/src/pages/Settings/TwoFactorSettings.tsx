/**
 * Two-Factor Authentication Settings Page
 * Allows users to enable/disable 2FA and manage backup codes
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Alert,
  Divider,
  Input,
  Modal,
  message,
  Spin,
  Badge,
  List,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  SafetyOutlined,
  LockOutlined,
  MobileOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  CopyOutlined,
  DownloadOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { twoFactorService } from '../../services/twoFactorService';
import { useAuthStore } from '../../stores/authStore';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;

export const TwoFactorSettings: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      if (isMounted) {
        await check2FAStatus();
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run only once on mount

  const check2FAStatus = async () => {
    setLoading(true);
    try {
      const status = await twoFactorService.get2FAStatus();
      setIs2FAEnabled(status.enabled);
      setRemainingBackupCodes(status.backupCodesRemaining || 0);
    } catch (error) {
      message.error('2FA durumu kontrol edilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const setup = await twoFactorService.setupTwoFactor(user?.email || '');
      setSetupData(setup);
      setBackupCodes(setup.backupCodes);
      setShowSetupModal(true);
    } catch (error) {
      message.error('2FA kurulumu başlatılamadı');
    } finally {
      setLoading(false);
    }
  };

  const confirmEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      message.error('Lütfen 6 haneli doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      // Enable 2FA on the server - backend will verify the code
      const success = await twoFactorService.enable2FA(
        setupData.secret,
        verificationCode,
        setupData.backupCodes
      );

      if (success) {
        setIs2FAEnabled(true);
        setShowSetupModal(false);
        setVerificationCode('');

        await Swal.fire({
          icon: 'success',
          title: '2FA Etkinleştirildi!',
          text: 'İki faktörlü kimlik doğrulama başarıyla etkinleştirildi.',
          confirmButtonColor: '#10b981'
        });

        // Show backup codes
        showBackupCodesModal();
      } else {
        message.error('Geçersiz doğrulama kodu veya 2FA etkinleştirilemedi');
      }
    } catch (error) {
      message.error('2FA etkinleştirme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      message.error('Lütfen şifrenizi girin');
      return;
    }

    setLoading(true);
    try {
      const success = await twoFactorService.disable2FA(password);

      if (success) {
        setIs2FAEnabled(false);
        setShowDisableModal(false);
        setPassword('');

        await Swal.fire({
          icon: 'success',
          title: '2FA Devre Dışı!',
          text: 'İki faktörlü kimlik doğrulama devre dışı bırakıldı.',
          confirmButtonColor: '#ef4444'
        });
      } else {
        message.error('2FA devre dışı bırakılamadı');
      }
    } catch (error) {
      message.error('İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    const result = await Swal.fire({
      title: 'Yedek Kodları Yenile?',
      text: 'Mevcut yedek kodlarınız geçersiz olacak. Devam etmek istiyor musunuz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Evet, Yenile',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      const { value: password } = await Swal.fire({
        title: 'Şifrenizi Girin',
        input: 'password',
        inputLabel: 'Güvenlik için şifrenizi doğrulayın',
        inputPlaceholder: 'Şifreniz',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Şifre gerekli!';
          }
        }
      });

      if (password) {
        setLoading(true);
        try {
          const newCodes = await twoFactorService.regenerateBackupCodes(password);
          setBackupCodes(newCodes);
          showBackupCodesModal();
        } catch (error) {
          message.error('Yedek kodlar yenilenemedi');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const showBackupCodesModal = () => {
    Modal.info({
      title: 'Yedek Kodlarınız',
      width: 500,
      content: (
        <div>
          <Alert
            message="Önemli!"
            description="Bu kodları güvenli bir yerde saklayın. Her kod yalnızca bir kez kullanılabilir."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <List
            dataSource={backupCodes}
            renderItem={(code) => (
              <List.Item>
                <Text code copyable style={{ fontSize: 14 }}>
                  {code}
                </Text>
              </List.Item>
            )}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => downloadBackupCodes()}
            style={{ marginTop: 16 }}
            block
          >
            Kodları İndir
          </Button>
        </div>
      ),
      okText: 'Tamam',
      onOk() {
        setBackupCodes([]);
      }
    });
  };

  const downloadBackupCodes = () => {
    const content = `Stocker Admin - Yedek Kodlar\n\nTarih: ${new Date().toLocaleString('tr-TR')}\nKullanıcı: ${user?.email}\n\nYedek Kodlarınız:\n${backupCodes.join('\n')}\n\nNot: Her kod yalnızca bir kez kullanılabilir.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stocker-backup-codes-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !showSetupModal && !showDisableModal) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>
        <SafetyOutlined /> İki Faktörlü Kimlik Doğrulama
      </Title>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Badge
                  status={is2FAEnabled ? 'success' : 'default'}
                  text={
                    <Title level={4} style={{ margin: 0 }}>
                      2FA Durumu: {is2FAEnabled ? 'Aktif' : 'Devre Dışı'}
                    </Title>
                  }
                />
              </div>

              <Paragraph>
                İki faktörlü kimlik doğrulama (2FA), hesabınıza ekstra bir güvenlik katmanı ekler.
                Etkinleştirildiğinde, giriş yaparken şifrenizin yanı sıra telefonunuzdaki authenticator
                uygulamasından bir kod girmeniz gerekecektir.
              </Paragraph>

              <Alert
                message="Güvenlik Önerisi"
                description="2FA'yı etkinleştirerek hesabınızı yetkisiz erişimlere karşı koruyabilirsiniz."
                type="info"
                showIcon
                icon={<LockOutlined />}
              />

              <Divider />

              {!is2FAEnabled ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Title level={5}>2FA'yı Etkinleştir</Title>
                  <Paragraph>
                    Başlamak için aşağıdaki butona tıklayın ve telefonunuzdaki authenticator
                    uygulamasını kullanarak QR kodunu tarayın.
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleOutlined />}
                    onClick={handleEnable2FA}
                    loading={loading}
                  >
                    2FA'yı Etkinleştir
                  </Button>
                </Space>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Kalan Yedek Kod"
                        value={remainingBackupCodes}
                        suffix="/ 10"
                        prefix={<KeyOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Durum"
                        value="Korumalı"
                        valueStyle={{ color: '#10b981' }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <Space>
                    <Button
                      type="default"
                      icon={<ReloadOutlined />}
                      onClick={handleRegenerateBackupCodes}
                      loading={loading}
                    >
                      Yedek Kodları Yenile
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => setShowDisableModal(true)}
                      loading={loading}
                    >
                      2FA'yı Devre Dışı Bırak
                    </Button>
                  </Space>
                </Space>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Desteklenen Uygulamalar">
            <List
              dataSource={[
                { name: 'Google Authenticator', icon: <MobileOutlined /> },
                { name: 'Microsoft Authenticator', icon: <SafetyOutlined /> },
                { name: 'Authy', icon: <LockOutlined /> },
                { name: '1Password', icon: <KeyOutlined /> }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    {item.icon}
                    <Text>{item.name}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Setup 2FA Modal */}
      <Modal
        title="2FA Kurulumu"
        visible={showSetupModal}
        onOk={confirmEnable2FA}
        onCancel={() => {
          setShowSetupModal(false);
          setVerificationCode('');
        }}
        confirmLoading={loading}
        width={500}
        okText="Etkinleştir"
        cancelText="İptal"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ textAlign: 'center' }}>
            {setupData && (
              <img
                src={setupData.qrCodeUrl}
                alt="2FA QR Code"
                style={{ width: 200, height: 200 }}
              />
            )}
          </div>

          <Alert
            message="QR Kodu Tarayın"
            description="Authenticator uygulamanızla yukarıdaki QR kodunu tarayın."
            type="info"
            showIcon
          />

          <div>
            <Text strong>Manuel Giriş Kodu:</Text>
            <Input
              value={setupData?.manualEntryKey}
              readOnly
              addonAfter={
                <Tooltip title="Kopyala">
                  <CopyOutlined
                    onClick={() => {
                      navigator.clipboard.writeText(setupData?.secret);
                      message.success('Kod kopyalandı');
                    }}
                  />
                </Tooltip>
              }
            />
          </div>

          <div>
            <Text strong>Doğrulama Kodu:</Text>
            <Input
              placeholder="6 haneli kod"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              style={{ fontSize: 20, textAlign: 'center' }}
            />
          </div>
        </Space>
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        title="2FA'yı Devre Dışı Bırak"
        visible={showDisableModal}
        onOk={handleDisable2FA}
        onCancel={() => {
          setShowDisableModal(false);
          setPassword('');
        }}
        confirmLoading={loading}
        okText="Devre Dışı Bırak"
        cancelText="İptal"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="Uyarı"
            description="2FA'yı devre dışı bırakmak hesabınızın güvenliğini azaltacaktır."
            type="warning"
            showIcon
          />

          <div>
            <Text strong>Şifrenizi Girin:</Text>
            <Input.Password
              placeholder="Şifreniz"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};