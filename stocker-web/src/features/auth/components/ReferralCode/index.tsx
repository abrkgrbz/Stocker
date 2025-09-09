import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Space,
  Tag,
  Alert,
  Typography,
  Tooltip,
  message,
  Card,
  Divider,
  Progress,
  Modal
} from 'antd';
import {
  GiftOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  TrophyOutlined,
  PercentageOutlined,
  ShareAltOutlined,
  QrcodeOutlined,
  TeamOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import './style.css';

const { Text, Title, Paragraph } = Typography;

interface ReferralInputProps {
  value?: string;
  onChange?: (code: string) => void;
  onValidate?: (code: string) => Promise<ReferralInfo | null>;
  placeholder?: string;
  autoCheck?: boolean;
}

interface ReferralInfo {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  referrerName?: string;
  expiresAt?: Date;
  usageLimit?: number;
  usageCount?: number;
  benefits?: string[];
}

export const ReferralInput: React.FC<ReferralInputProps> = ({
  value = '',
  onChange,
  onValidate,
  placeholder = 'Referans kodunuz varsa girin',
  autoCheck = true
}) => {
  const [code, setCode] = useState(value);
  const [checking, setChecking] = useState(false);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoCheck && code.length >= 4) {
      checkReferralCode();
    }
  }, [code]);

  const checkReferralCode = async () => {
    if (!code || code.length < 4) return;

    setChecking(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (code.toUpperCase() === 'WELCOME20' || code.toUpperCase() === 'FRIEND50') {
        const info: ReferralInfo = {
          code: code.toUpperCase(),
          discount: code.toUpperCase() === 'WELCOME20' ? 20 : 50,
          discountType: 'percentage',
          referrerName: 'John Doe',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          usageLimit: 100,
          usageCount: 45,
          benefits: [
            'İlk ay %' + (code.toUpperCase() === 'WELCOME20' ? '20' : '50') + ' indirim',
            'Ücretsiz premium destek',
            '2x depolama alanı'
          ]
        };
        
        setReferralInfo(info);
        message.success('Referans kodu geçerli! İndirim uygulandı.');
        
        if (onValidate) {
          const result = await onValidate(code);
          if (result) {
            setReferralInfo(result);
          }
        }
      } else {
        setError('Geçersiz referans kodu');
        setReferralInfo(null);
      }
    } catch (err) {
      setError('Referans kodu kontrol edilemedi');
    } finally {
      setChecking(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };

  return (
    <div className="referral-input-container">
      <div className="referral-input-wrapper">
        <Input
          size="large"
          placeholder={placeholder}
          prefix={<GiftOutlined style={{ color: '#667eea' }} />}
          value={code}
          onChange={handleCodeChange}
          maxLength={20}
          suffix={
            checking ? (
              <span style={{ color: '#667eea' }}>Kontrol ediliyor...</span>
            ) : referralInfo ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : null
          }
        />
        
        {!autoCheck && (
          <Button
            type="primary"
            loading={checking}
            onClick={checkReferralCode}
            disabled={code.length < 4}
          >
            Uygula
          </Button>
        )}
      </div>

      <AnimatePresence>
        {referralInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              message={
                <Space>
                  <TrophyOutlined />
                  <span>Tebrikler! {referralInfo.referrerName && `${referralInfo.referrerName} tarafından davet edildiniz.`}</span>
                </Space>
              }
              description={
                <div>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Tag color="green" icon={<PercentageOutlined />}>
                        {referralInfo.discountType === 'percentage' 
                          ? `%${referralInfo.discount} İndirim` 
                          : `${referralInfo.discount}₺ İndirim`}
                      </Tag>
                      {referralInfo.expiresAt && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(referralInfo.expiresAt).toLocaleDateString('tr-TR')} tarihine kadar geçerli
                        </Text>
                      )}
                    </div>
                    
                    {referralInfo.benefits && (
                      <div className="referral-benefits">
                        {referralInfo.benefits.map((benefit, index) => (
                          <div key={index} className="benefit-item">
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <Text>{benefit}</Text>
                          </div>
                        ))}
                      </div>
                    )}
                  </Space>
                </div>
              }
              type="success"
              showIcon
              closable
              style={{ marginTop: 12 }}
            />
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ marginTop: 12 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Referral Share Component
interface ReferralShareProps {
  referralCode: string;
  referralUrl?: string;
  rewards?: {
    referrer: string;
    referred: string;
  };
}

export const ReferralShare: React.FC<ReferralShareProps> = ({
  referralCode,
  referralUrl = `${window.location.origin}/register?ref=${referralCode}`,
  rewards = {
    referrer: '1 ay ücretsiz kullanım',
    referred: '%20 indirim'
  }
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success('Kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform: string) => {
    const text = `Stocker'a katıl ve ${rewards.referred} kazan! Referans kodum: ${referralCode}`;
    const url = referralUrl;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=Stocker Davetiyesi&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }
  };

  return (
    <Card className="referral-share-card">
      <div className="referral-share-header">
        <Title level={4}>
          <GiftOutlined /> Arkadaşlarını Davet Et, Kazan!
        </Title>
        <Paragraph>
          Her başarılı davet için <Tag color="green">{rewards.referrer}</Tag> kazan.
          Arkadaşların da <Tag color="blue">{rewards.referred}</Tag> kazansın!
        </Paragraph>
      </div>

      <Divider />

      <div className="referral-code-display">
        <Text strong>Referans Kodun:</Text>
        <div className="code-box">
          <Text code className="referral-code">{referralCode}</Text>
          <Button
            icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
            onClick={() => copyToClipboard(referralCode)}
            type={copied ? 'primary' : 'default'}
          >
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </Button>
        </div>
      </div>

      <div className="referral-url-display">
        <Text strong>Davet Linki:</Text>
        <div className="url-box">
          <Text ellipsis className="referral-url">{referralUrl}</Text>
          <Space>
            <Tooltip title="QR Kod">
              <Button
                icon={<QrcodeOutlined />}
                onClick={() => setShowQR(true)}
              />
            </Tooltip>
            <Button
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(referralUrl)}
            />
          </Space>
        </div>
      </div>

      <Divider />

      <div className="share-buttons">
        <Text strong style={{ display: 'block', marginBottom: 12 }}>Paylaş:</Text>
        <Space wrap>
          <Button
            onClick={() => shareVia('whatsapp')}
            style={{ background: '#25D366', color: 'white', border: 'none' }}
          >
            WhatsApp
          </Button>
          <Button
            onClick={() => shareVia('twitter')}
            style={{ background: '#1DA1F2', color: 'white', border: 'none' }}
          >
            Twitter
          </Button>
          <Button
            onClick={() => shareVia('linkedin')}
            style={{ background: '#0077B5', color: 'white', border: 'none' }}
          >
            LinkedIn
          </Button>
          <Button
            onClick={() => shareVia('email')}
            icon={<MailOutlined />}
          >
            E-posta
          </Button>
        </Space>
      </div>

      <Modal
        title="QR Kod"
        open={showQR}
        onCancel={() => setShowQR(false)}
        footer={null}
        width={320}
        centered
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <QRCodeSVG value={referralUrl} size={200} />
          <Paragraph style={{ marginTop: 16 }}>
            Bu QR kodu paylaşarak arkadaşlarını davet edebilirsin
          </Paragraph>
        </div>
      </Modal>
    </Card>
  );
};

// Referral Stats Component
interface ReferralStatsProps {
  stats: {
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalEarnings: number;
    nextReward: string;
    nextRewardProgress: number;
  };
}

export const ReferralStats: React.FC<ReferralStatsProps> = ({ stats }) => {
  return (
    <Card className="referral-stats-card">
      <Title level={4}>
        <TrophyOutlined /> Referans İstatistiklerin
      </Title>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">
            <TeamOutlined />
          </div>
          <div className="stat-content">
            <Text type="secondary">Toplam Davet</Text>
            <Title level={3}>{stats.totalReferrals}</Title>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon success">
            <CheckCircleOutlined />
          </div>
          <div className="stat-content">
            <Text type="secondary">Başarılı</Text>
            <Title level={3}>{stats.successfulReferrals}</Title>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon warning">
            <ClockCircleOutlined />
          </div>
          <div className="stat-content">
            <Text type="secondary">Beklemede</Text>
            <Title level={3}>{stats.pendingReferrals}</Title>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon primary">
            <DollarOutlined />
          </div>
          <div className="stat-content">
            <Text type="secondary">Kazancın</Text>
            <Title level={3}>₺{stats.totalEarnings}</Title>
          </div>
        </div>
      </div>

      <Divider />

      <div className="next-reward">
        <Text strong>Sonraki Ödül: {stats.nextReward}</Text>
        <Progress
          percent={stats.nextRewardProgress}
          strokeColor={{
            '0%': '#667eea',
            '100%': '#764ba2'
          }}
          status="active"
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {100 - stats.nextRewardProgress}% kaldı
        </Text>
      </div>
    </Card>
  );
};