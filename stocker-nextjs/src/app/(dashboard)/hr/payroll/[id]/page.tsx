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
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  usePayroll,
  useCancelPayroll,
  useApprovePayroll,
  useMarkPayrollPaid,
} from '@/lib/api/hooks/useHR';
import { PayrollStatus } from '@/lib/api/services/hr.types';
import type { PayrollItemDto } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: payroll, isLoading, error } = usePayroll(id);
  const cancelPayroll = useCancelPayroll();
  const approvePayroll = useApprovePayroll();
  const markPaid = useMarkPayrollPaid();

  const handleCancel = () => {
    if (!payroll) return;
    Modal.confirm({
      title: 'Bordro Kaydını İptal Et',
      content: 'Bu bordro kaydını iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelPayroll.mutateAsync({ id, reason: 'İptal edildi' });
          router.push('/hr/payroll');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async () => {
    try {
      await approvePayroll.mutateAsync({ id });
      message.success('Bordro onaylandı');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaid.mutateAsync({ id });
      message.success('Bordro ödendi olarak işaretlendi');
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const getStatusConfig = (status?: PayrollStatus) => {
    const statusMap: Record<PayrollStatus, { color: string; text: string }> = {
      [PayrollStatus.Draft]: { color: 'default', text: 'Taslak' },
      [PayrollStatus.Calculated]: { color: 'processing', text: 'Hesaplandı' },
      [PayrollStatus.PendingApproval]: { color: 'orange', text: 'Onay Bekliyor' },
      [PayrollStatus.Approved]: { color: 'blue', text: 'Onaylandı' },
      [PayrollStatus.Paid]: { color: 'green', text: 'Ödendi' },
      [PayrollStatus.Cancelled]: { color: 'red', text: 'İptal' },
      [PayrollStatus.Rejected]: { color: 'volcano', text: 'Reddedildi' },
    };
    return status !== undefined ? statusMap[status] : { color: 'default', text: '-' };
  };

  // Separate items into earnings and deductions
  const earnings = payroll?.items?.filter((item) => !item.isDeduction) || [];
  const deductions = payroll?.items?.filter((item) => item.isDeduction && !item.isEmployerContribution) || [];
  const employerContributions = payroll?.items?.filter((item) => item.isEmployerContribution) || [];

  const itemColumns: ColumnsType<PayrollItemDto> = [
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Kod',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 100,
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (val) => val || '-',
    },
    {
      title: 'Oran',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      render: (val) => (val ? formatCurrency(val) : '-'),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (val) => formatCurrency(val),
    },
  ];

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
          {(payroll.status === PayrollStatus.PendingApproval || payroll.status === PayrollStatus.Draft || payroll.status === PayrollStatus.Calculated) && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            >
              Onayla
            </Button>
          )}
          {payroll.status === PayrollStatus.Approved && (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleMarkPaid}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Öde
            </Button>
          )}
          {payroll.status !== PayrollStatus.Paid && payroll.status !== PayrollStatus.Cancelled && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleCancel}
            >
              İptal Et
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Temel Maaş"
                  value={payroll.baseSalary || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#7c3aed', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Toplam Kazanç"
                  value={payroll.totalEarnings || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#52c41a', fontSize: 18 }}
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
                  valueStyle={{ color: '#1890ff', fontSize: 18 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Employee Info */}
        <Col xs={24} lg={12}>
          <Card title="Çalışan Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Çalışan">
                <Space>
                  <UserOutlined />
                  {payroll.employeeName || `Çalışan #${payroll.employeeId}`}
                </Space>
              </Descriptions.Item>
              {payroll.employeeCode && (
                <Descriptions.Item label="Sicil No">
                  {payroll.employeeCode}
                </Descriptions.Item>
              )}
              {payroll.departmentName && (
                <Descriptions.Item label="Departman">
                  {payroll.departmentName}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Bordro No">
                {payroll.payrollNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Dönem">
                {payroll.month}/{payroll.year}
              </Descriptions.Item>
              <Descriptions.Item label="Dönem Tarihleri">
                {dayjs(payroll.periodStartDate).format('DD.MM.YYYY')} - {dayjs(payroll.periodEndDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Summary */}
        <Col xs={24} lg={12}>
          <Card title="Özet">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Temel Maaş">
                {formatCurrency(payroll.baseSalary)}
              </Descriptions.Item>
              <Descriptions.Item label="Brüt Maaş">
                {formatCurrency(payroll.grossSalary)}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Kazanç">
                <span style={{ color: '#52c41a' }}>{formatCurrency(payroll.totalEarnings)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Kesinti">
                <span style={{ color: '#ff4d4f' }}>- {formatCurrency(payroll.totalDeductions)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="İşveren Maliyeti">
                {formatCurrency(payroll.totalEmployerCost)}
              </Descriptions.Item>
              <Descriptions.Item label="Net Maaş">
                <strong style={{ color: '#1890ff', fontSize: 16 }}>{formatCurrency(payroll.netSalary)}</strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Earnings Table */}
        {earnings.length > 0 && (
          <Col xs={24}>
            <Card title="Kazançlar" size="small">
              <Table
                columns={itemColumns}
                dataSource={earnings}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        )}

        {/* Deductions Table */}
        {deductions.length > 0 && (
          <Col xs={24}>
            <Card title="Kesintiler" size="small">
              <Table
                columns={itemColumns}
                dataSource={deductions}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        )}

        {/* Employer Contributions Table */}
        {employerContributions.length > 0 && (
          <Col xs={24}>
            <Card title="İşveren Katkıları" size="small">
              <Table
                columns={itemColumns}
                dataSource={employerContributions}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        )}

        {/* Approval Info */}
        {(payroll.calculatedDate || payroll.approvedDate || payroll.paidDate) && (
          <Col xs={24} lg={12}>
            <Card title="İşlem Geçmişi">
              <Descriptions column={1} bordered size="small">
                {payroll.calculatedDate && (
                  <Descriptions.Item label="Hesaplama Tarihi">
                    {dayjs(payroll.calculatedDate).format('DD.MM.YYYY HH:mm')}
                    {payroll.calculatedByName && ` - ${payroll.calculatedByName}`}
                  </Descriptions.Item>
                )}
                {payroll.approvedDate && (
                  <Descriptions.Item label="Onay Tarihi">
                    {dayjs(payroll.approvedDate).format('DD.MM.YYYY HH:mm')}
                    {payroll.approvedByName && ` - ${payroll.approvedByName}`}
                  </Descriptions.Item>
                )}
                {payroll.paidDate && (
                  <Descriptions.Item label="Ödeme Tarihi">
                    {dayjs(payroll.paidDate).format('DD.MM.YYYY HH:mm')}
                    {payroll.paymentReference && ` (Ref: ${payroll.paymentReference})`}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        )}

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
