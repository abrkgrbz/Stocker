'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Modal,
  message,
  Table,
} from 'antd';
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { DetailPageLayout } from '@/components/patterns';
import { Button } from '@/components/primitives';
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
      title: 'Bordro Kaydini Iptal Et',
      content: 'Bu bordro kaydini iptal etmek istediginizden emin misiniz?',
      okText: 'Iptal Et',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: async () => {
        try {
          await cancelPayroll.mutateAsync({ id, reason: 'Iptal edildi' });
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
      message.success('Bordro onaylandi');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaid.mutateAsync({ id });
      message.success('Bordro odendi olarak isaretlendi');
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const getStatusConfig = (status?: PayrollStatus) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      [PayrollStatus.Draft]: { color: 'default', text: 'Taslak' },
      [PayrollStatus.Calculated]: { color: 'processing', text: 'Hesaplandi' },
      [PayrollStatus.PendingApproval]: { color: 'orange', text: 'Onay Bekliyor' },
      [PayrollStatus.Approved]: { color: 'blue', text: 'Onaylandi' },
      [PayrollStatus.Paid]: { color: 'green', text: 'Odendi' },
      [PayrollStatus.Cancelled]: { color: 'red', text: 'Iptal' },
      [PayrollStatus.Rejected]: { color: 'volcano', text: 'Reddedildi' },
    };
    const defaultConfig = { color: 'default', text: '-' };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
  };

  // Separate items into earnings and deductions
  const earnings = payroll?.items?.filter((item) => !item.isDeduction) || [];
  const deductions = payroll?.items?.filter((item) => item.isDeduction && !item.isEmployerContribution) || [];
  const employerContributions = payroll?.items?.filter((item) => item.isEmployerContribution) || [];

  const itemColumns: ColumnsType<PayrollItemDto> = [
    {
      title: 'Aciklama',
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

  const statusConfig = getStatusConfig(payroll?.status);

  const renderActions = () => {
    if (!payroll) return null;
    return (
      <>
        {(payroll.status === PayrollStatus.PendingApproval || payroll.status === PayrollStatus.Draft || payroll.status === PayrollStatus.Calculated) && (
          <Button
            variant="primary"
            icon={<CheckCircleIcon className="w-4 h-4" />}
            onClick={handleApprove}
          >
            Onayla
          </Button>
        )}
        {payroll.status === PayrollStatus.Approved && (
          <Button
            variant="primary"
            icon={<PaperAirplaneIcon className="w-4 h-4" />}
            onClick={handleMarkPaid}
            className="!bg-emerald-600 hover:!bg-emerald-700"
          >
            Ode
          </Button>
        )}
        {payroll.status !== PayrollStatus.Paid && payroll.status !== PayrollStatus.Cancelled && (
          <Button
            variant="danger"
            icon={<XCircleIcon className="w-4 h-4" />}
            onClick={handleCancel}
          >
            Iptal Et
          </Button>
        )}
      </>
    );
  };

  return (
    <DetailPageLayout
      title="Bordro Detayi"
      subtitle={payroll ? `${payroll.employeeName || `Calisan #${payroll.employeeId}`} - ${payroll.month}/${payroll.year}` : undefined}
      backPath="/hr/payroll"
      icon={<CurrencyDollarIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-violet-600"
      isLoading={isLoading}
      isError={!!error || !payroll}
      errorMessage="Bordro Bulunamadi"
      errorDescription="Istenen bordro kaydi bulunamadi."
      statusBadge={payroll && <Tag color={statusConfig.color}>{statusConfig.text}</Tag>}
      actions={renderActions()}
    >
      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Temel Maas"
                  value={payroll?.baseSalary || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#7c3aed', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Toplam Kazanc"
                  value={payroll?.totalEarnings || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#52c41a', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Toplam Kesinti"
                  value={payroll?.totalDeductions || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#ff4d4f', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Net Maas"
                  value={payroll?.netSalary || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#1890ff', fontSize: 18 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Employee Info */}
        <Col xs={24} lg={12}>
          <Card title="Calisan Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Calisan">
                <span className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  {payroll?.employeeName || `Calisan #${payroll?.employeeId}`}
                </span>
              </Descriptions.Item>
              {payroll?.employeeCode && (
                <Descriptions.Item label="Sicil No">
                  {payroll.employeeCode}
                </Descriptions.Item>
              )}
              {payroll?.departmentName && (
                <Descriptions.Item label="Departman">
                  {payroll.departmentName}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Bordro No">
                {payroll?.payrollNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Donem">
                {payroll?.month}/{payroll?.year}
              </Descriptions.Item>
              <Descriptions.Item label="Donem Tarihleri">
                {dayjs(payroll?.periodStartDate).format('DD.MM.YYYY')} - {dayjs(payroll?.periodEndDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Summary */}
        <Col xs={24} lg={12}>
          <Card title="Ozet">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Temel Maas">
                {formatCurrency(payroll?.baseSalary)}
              </Descriptions.Item>
              <Descriptions.Item label="Brut Maas">
                {formatCurrency(payroll?.grossSalary)}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Kazanc">
                <span style={{ color: '#52c41a' }}>{formatCurrency(payroll?.totalEarnings)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Kesinti">
                <span style={{ color: '#ff4d4f' }}>- {formatCurrency(payroll?.totalDeductions)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Isveren Maliyeti">
                {formatCurrency(payroll?.totalEmployerCost)}
              </Descriptions.Item>
              <Descriptions.Item label="Net Maas">
                <strong style={{ color: '#1890ff', fontSize: 16 }}>{formatCurrency(payroll?.netSalary)}</strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Earnings Table */}
        {earnings.length > 0 && (
          <Col xs={24}>
            <Card title="Kazanclar" size="small">
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
            <Card title="Isveren Katkilari" size="small">
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
        {(payroll?.calculatedDate || payroll?.approvedDate || payroll?.paidDate) && (
          <Col xs={24} lg={12}>
            <Card title="Islem Gecmisi">
              <Descriptions column={1} bordered size="small">
                {payroll?.calculatedDate && (
                  <Descriptions.Item label="Hesaplama Tarihi">
                    {dayjs(payroll.calculatedDate).format('DD.MM.YYYY HH:mm')}
                    {payroll.calculatedByName && ` - ${payroll.calculatedByName}`}
                  </Descriptions.Item>
                )}
                {payroll?.approvedDate && (
                  <Descriptions.Item label="Onay Tarihi">
                    {dayjs(payroll.approvedDate).format('DD.MM.YYYY HH:mm')}
                    {payroll.approvedByName && ` - ${payroll.approvedByName}`}
                  </Descriptions.Item>
                )}
                {payroll?.paidDate && (
                  <Descriptions.Item label="Odeme Tarihi">
                    {dayjs(payroll.paidDate).format('DD.MM.YYYY HH:mm')}
                    {payroll.paymentReference && ` (Ref: ${payroll.paymentReference})`}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        )}

        {/* Notes */}
        {payroll?.notes && (
          <Col xs={24}>
            <Card title="Notlar">
              <p>{payroll.notes}</p>
            </Card>
          </Col>
        )}
      </Row>
    </DetailPageLayout>
  );
}
