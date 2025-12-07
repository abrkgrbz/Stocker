'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Dropdown,
  Modal,
  Select,
  DatePicker,
  message,
} from 'antd';
import {
  PlusOutlined,
  DollarOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  usePayrolls,
  useCancelPayroll,
  useApprovePayroll,
  useMarkPayrollPaid,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { PayrollDto, PayrollFilterDto } from '@/lib/api/services/hr.types';
import { PayrollStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function PayrollPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PayrollFilterDto>({});

  // API Hooks
  const { data: payrolls = [], isLoading } = usePayrolls(filters);
  const { data: employees = [] } = useEmployees();
  const cancelPayroll = useCancelPayroll();
  const approvePayroll = useApprovePayroll();
  const markPaid = useMarkPayrollPaid();

  // Stats
  const totalPayrolls = payrolls.length;
  const pendingPayrolls = payrolls.filter((p) => p.status === PayrollStatus.PendingApproval || p.status === PayrollStatus.Draft || p.status === PayrollStatus.Calculated).length;
  const approvedPayrolls = payrolls.filter((p) => p.status === PayrollStatus.Approved).length;
  const totalAmount = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  const handleCancel = (payroll: PayrollDto) => {
    Modal.confirm({
      title: 'Bordro Kaydını İptal Et',
      content: 'Bu bordro kaydını iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelPayroll.mutateAsync({ id: payroll.id, reason: 'İptal edildi' });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async (payroll: PayrollDto) => {
    try {
      await approvePayroll.mutateAsync({ id: payroll.id });
      message.success('Bordro onaylandı');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleMarkPaid = async (payroll: PayrollDto) => {
    try {
      await markPaid.mutateAsync({ id: payroll.id });
      message.success('Bordro ödendi olarak işaretlendi');
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const getStatusConfig = (status?: PayrollStatus) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      [PayrollStatus.Draft]: { color: 'default', text: 'Taslak' },
      [PayrollStatus.Calculated]: { color: 'processing', text: 'Hesaplandı' },
      [PayrollStatus.PendingApproval]: { color: 'orange', text: 'Onay Bekliyor' },
      [PayrollStatus.Approved]: { color: 'blue', text: 'Onaylandı' },
      [PayrollStatus.Paid]: { color: 'green', text: 'Ödendi' },
      [PayrollStatus.Cancelled]: { color: 'red', text: 'İptal' },
      [PayrollStatus.Rejected]: { color: 'volcano', text: 'Reddedildi' },
    };
    const defaultConfig = { color: 'default', text: '-' };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
  };

  const columns: ColumnsType<PayrollDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      render: (_, record: PayrollDto) => (
        <Space>
          <UserOutlined style={{ color: '#8b5cf6' }} />
          <span>{record.employeeName || `Çalışan #${record.employeeId}`}</span>
        </Space>
      ),
    },
    {
      title: 'Dönem',
      key: 'period',
      width: 120,
      render: (_, record: PayrollDto) => `${record.month}/${record.year}`,
    },
    {
      title: 'Brüt Maaş',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      width: 140,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Kesintiler',
      dataIndex: 'totalDeductions',
      key: 'deductions',
      width: 120,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Net Maaş',
      dataIndex: 'netSalary',
      key: 'netSalary',
      width: 140,
      render: (value: number) => <strong>{formatCurrency(value)}</strong>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: PayrollStatus) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: PayrollDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/payroll/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/payroll/${record.id}/edit`),
                disabled: record.status === PayrollStatus.Paid,
              },
              { type: 'divider' },
              ...(record.status === PayrollStatus.PendingApproval || record.status === PayrollStatus.Draft || record.status === PayrollStatus.Calculated
                ? [
                    {
                      key: 'approve',
                      icon: <CheckCircleOutlined />,
                      label: 'Onayla',
                      onClick: () => handleApprove(record),
                    },
                  ]
                : []),
              ...(record.status === PayrollStatus.Approved
                ? [
                    {
                      key: 'markPaid',
                      icon: <SendOutlined />,
                      label: 'Öde',
                      onClick: () => handleMarkPaid(record),
                    },
                  ]
                : []),
              { type: 'divider' as const },
              {
                key: 'cancel',
                icon: <CloseCircleOutlined />,
                label: 'İptal Et',
                danger: true,
                onClick: () => handleCancel(record),
                disabled: record.status === PayrollStatus.Paid || record.status === PayrollStatus.Cancelled,
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          <DollarOutlined className="mr-2" />
          Bordro Yönetimi
        </Title>
        <Space>
          <Button onClick={() => router.push('/hr/expenses')}>Harcamalar</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/payroll/new')}>
            Yeni Bordro
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Bordro"
              value={totalPayrolls}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Bekleyen"
              value={pendingPayrolls}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Onaylanan"
              value={approvedPayrolls}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Net"
              value={totalAmount}
              formatter={(val) => formatCurrency(Number(val))}
              valueStyle={{ color: '#1890ff', fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Çalışan seçin"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DatePicker
              picker="month"
              format="MM/YYYY"
              placeholder="Dönem seçin"
              style={{ width: '100%' }}
              onChange={(date) => {
                if (date) {
                  setFilters((prev) => ({
                    ...prev,
                    month: date.month() + 1,
                    year: date.year(),
                  }));
                } else {
                  setFilters((prev) => ({ ...prev, month: undefined, year: undefined }));
                }
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              options={[
                { value: PayrollStatus.Draft, label: 'Taslak' },
                { value: PayrollStatus.Calculated, label: 'Hesaplandı' },
                { value: PayrollStatus.PendingApproval, label: 'Onay Bekliyor' },
                { value: PayrollStatus.Approved, label: 'Onaylanan' },
                { value: PayrollStatus.Paid, label: 'Ödenen' },
                { value: PayrollStatus.Cancelled, label: 'İptal' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={payrolls}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} bordro`,
          }}
        />
      </Card>
    </div>
  );
}
