'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Spin,
  Row,
  Col,
  Statistic,
  Empty,
  Modal,
  message,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DollarOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  usePayroll,
  useDeletePayroll,
  useApprovePayroll,
  useProcessPayroll,
} from '@/lib/api/hooks/useHR';

const { Title, Text } = Typography;

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: payroll, isLoading, error } = usePayroll(id);
  const deletePayroll = useDeletePayroll();
  const approvePayroll = useApprovePayroll();
  const processPayroll = useProcessPayroll();

  const handleDelete = () => {
    if (!payroll) return;
    Modal.confirm({
      title: 'Bordro Kaydını Sil',
      content: 'Bu bordro kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deletePayroll.mutateAsync(id);
          router.push('/hr/payroll');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async () => {
    try {
      await approvePayroll.mutateAsync(id);
      message.success('Bordro onaylandı');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleProcess = async () => {
    try {
      await processPayroll.mutateAsync(id);
      message.success('Bordro ödendi olarak işaretlendi');
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const getStatusConfig = (status?: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      Draft: { color: 'default', text: 'Taslak' },
      Pending: { color: 'orange', text: 'Beklemede' },
      Approved: { color: 'blue', text: 'Onaylandı' },
      Processed: { color: 'green', text: 'Ödendi' },
      Cancelled: { color: 'red', text: 'İptal' },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-' };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !payroll) {
    return (
      <div className="p-6">
        <Empty description="Bordro kaydı bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/payroll')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(payroll.status);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/payroll')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Bordro Detayı
            </Title>
            <Space>
              <Text type="secondary">
                {payroll.employeeName || `Çalışan #${payroll.employeeId}`}
              </Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{payroll.month}/{payroll.year}</Text>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
            </Space>
          </div>
        </Space>
        <Space>
          {(payroll.status === 'Pending' || payroll.status === 'Draft') && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            >
              Onayla
            </Button>
          )}
          {payroll.status === 'Approved' && (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleProcess}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Öde
            </Button>
          )}
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/hr/payroll/${id}/edit`)}
            disabled={payroll.status === 'Processed'}
          >
            Düzenle
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            disabled={payroll.status === 'Processed'}
          >
            Sil
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Brüt Maaş"
                  value={payroll.grossSalary || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#7c3aed', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Toplam Kesinti"
                  value={payroll.totalDeductions || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#ff4d4f', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Net Maaş"
                  value={payroll.netSalary || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#52c41a', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Dönem"
                  value={`${payroll.month}/${payroll.year}`}
                  valueStyle={{ color: '#1890ff', fontSize: 20 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={12}>
          <Card title="Çalışan Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Çalışan">
                <Space>
                  <UserOutlined />
                  {payroll.employeeName || `Çalışan #${payroll.employeeId}`}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Dönem">
                {payroll.month}/{payroll.year}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Earnings */}
        <Col xs={24} lg={12}>
          <Card title="Kazançlar">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Temel Maaş">
                {formatCurrency(payroll.baseSalary)}
              </Descriptions.Item>
              <Descriptions.Item label="Fazla Mesai">
                {formatCurrency(payroll.overtimePay)}
              </Descriptions.Item>
              <Descriptions.Item label="Prim/Bonus">
                {formatCurrency(payroll.bonus)}
              </Descriptions.Item>
              <Descriptions.Item label="Yan Haklar">
                {formatCurrency(payroll.allowances)}
              </Descriptions.Item>
              <Descriptions.Item label="Brüt Maaş">
                <strong>{formatCurrency(payroll.grossSalary)}</strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Deductions */}
        <Col xs={24} lg={12}>
          <Card title="Kesintiler">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Vergi Kesintisi">
                {formatCurrency(payroll.taxDeduction)}
              </Descriptions.Item>
              <Descriptions.Item label="SGK Kesintisi">
                {formatCurrency(payroll.socialSecurityDeduction)}
              </Descriptions.Item>
              <Descriptions.Item label="Diğer Kesintiler">
                {formatCurrency(payroll.otherDeductions)}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Kesinti">
                <strong style={{ color: '#ff4d4f' }}>{formatCurrency(payroll.totalDeductions)}</strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Summary */}
        <Col xs={24} lg={12}>
          <Card title="Özet">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Brüt Maaş">
                {formatCurrency(payroll.grossSalary)}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Kesinti">
                <span style={{ color: '#ff4d4f' }}>- {formatCurrency(payroll.totalDeductions)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Net Maaş">
                <strong style={{ color: '#52c41a', fontSize: 16 }}>{formatCurrency(payroll.netSalary)}</strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Notes */}
        {payroll.notes && (
          <Col xs={24}>
            <Card title="Notlar">
              <Text>{payroll.notes}</Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
