'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  DatePicker,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
  Tabs,
  Statistic,
} from 'antd';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import {
  useSalesCommissions,
  useCommissionPlans,
  useApproveCommission,
  useRejectCommission,
  useMarkCommissionAsPaid,
  useCommissionSummary,
} from '@/lib/api/hooks/useSales';
import type {
  SalesCommissionListItem,
  SalesCommissionStatus,
  CommissionPlanListItem,
  GetSalesCommissionsParams,
} from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusColors: Record<SalesCommissionStatus, string> = {
  Pending: 'processing',
  Approved: 'cyan',
  Rejected: 'error',
  Paid: 'success',
  Cancelled: 'default',
};

const statusLabels: Record<SalesCommissionStatus, string> = {
  Pending: 'Beklemede',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Paid: 'Ödendi',
  Cancelled: 'İptal',
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

export default function CommissionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('commissions');
  const [filters, setFilters] = useState<GetSalesCommissionsParams>({
    page: 1,
    pageSize: 10,
  });
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'reject' | 'pay' | null>(null);
  const [actionValue, setActionValue] = useState('');
  const [selectedCommission, setSelectedCommission] = useState<SalesCommissionListItem | null>(null);

  const { data: commissionsData, isLoading: commissionsLoading, refetch } = useSalesCommissions(filters);
  const { data: plansData, isLoading: plansLoading } = useCommissionPlans({ pageSize: 100 });
  const { data: summaryData } = useCommissionSummary();

  const approveMutation = useApproveCommission();
  const rejectMutation = useRejectCommission();
  const markPaidMutation = useMarkCommissionAsPaid();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('Komisyon onaylandı');
    } catch {
      message.error('Komisyon onaylanamadı');
    }
  };

  const handleRejectClick = (commission: SalesCommissionListItem) => {
    setSelectedCommission(commission);
    setActionType('reject');
    setActionValue('');
    setActionModalOpen(true);
  };

  const handlePayClick = (commission: SalesCommissionListItem) => {
    setSelectedCommission(commission);
    setActionType('pay');
    setActionValue('');
    setActionModalOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedCommission) return;

    if (actionType === 'reject' && !actionValue.trim()) {
      message.error('Red sebebi girilmelidir');
      return;
    }

    try {
      if (actionType === 'reject') {
        await rejectMutation.mutateAsync({ id: selectedCommission.id, reason: actionValue });
        message.success('Komisyon reddedildi');
      } else if (actionType === 'pay') {
        await markPaidMutation.mutateAsync({ id: selectedCommission.id, paymentReference: actionValue });
        message.success('Komisyon ödendi olarak işaretlendi');
      }
      setActionModalOpen(false);
      setSelectedCommission(null);
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  const commissions = commissionsData?.items ?? [];
  const plans = plansData?.items ?? [];

  const getActionMenu = (record: SalesCommissionListItem): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/commissions/${record.id}`),
      },
    ];

    if (record.status === 'Pending') {
      items.push(
        {
          key: 'approve',
          icon: <CheckIcon className="w-4 h-4" />,
          label: 'Onayla',
          onClick: () => handleApprove(record.id),
        },
        {
          key: 'reject',
          icon: <XMarkIcon className="w-4 h-4" />,
          label: 'Reddet',
          danger: true,
          onClick: () => handleRejectClick(record),
        }
      );
    }

    if (record.status === 'Approved') {
      items.push({
        key: 'pay',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Ödendi İşaretle',
        onClick: () => handlePayClick(record),
      });
    }

    return items;
  };

  const commissionColumns: ColumnsType<SalesCommissionListItem> = [
    {
      title: 'Referans',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (text: string, record) => (
        <a onClick={() => router.push(`/sales/commissions/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Satış Temsilcisi',
      dataIndex: 'salesPersonName',
      key: 'salesPersonName',
    },
    {
      title: 'Sipariş',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string, record) => (
        <a onClick={() => router.push(`/sales/orders/${record.orderId}`)}>{text}</a>
      ),
    },
    {
      title: 'Sipariş Tutarı',
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      render: (amount: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount),
      align: 'right',
    },
    {
      title: 'Komisyon',
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      render: (amount: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount),
      align: 'right',
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: true,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: SalesCommissionStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button type="text" icon={<EllipsisVerticalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  const planColumns: ColumnsType<CommissionPlanListItem> = [
    {
      title: 'Plan Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <a onClick={() => router.push(`/sales/commissions/plans/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeLabels: Record<string, string> = {
          Percentage: 'Yüzde',
          FixedAmount: 'Sabit Tutar',
          Tiered: 'Kademeli',
          Target: 'Hedef Bazlı',
        };
        return typeLabels[type] || type;
      },
    },
    {
      title: 'Temel Oran',
      dataIndex: 'baseRate',
      key: 'baseRate',
      render: (rate: number) => `%${rate}`,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
      ),
    },
  ];

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: tableFilters.status?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Komisyonlar</Title>
          <Text type="secondary">Satış komisyonlarını yönetin</Text>
        </div>
        <Space>
          <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            icon={<Cog6ToothIcon className="w-4 h-4" />}
            onClick={() => router.push('/sales/commissions/plans/new')}
          >
            Yeni Plan
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Komisyon"
              value={summaryData?.totalCommission || 0}
              prefix="₺"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Bekleyen"
              value={summaryData?.pendingCount || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Onaylanan"
              value={summaryData?.approvedCount || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ödenen"
              value={summaryData?.paidAmount || 0}
              prefix="₺"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'commissions',
            label: 'Komisyonlar',
            children: (
              <>
                {/* Filters */}
                <Card style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Input
                        placeholder="Ara..."
                        prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
                        allowClear
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))
                        }
                      />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder="Durum"
                        allowClear
                        style={{ width: '100%' }}
                        options={statusOptions}
                        onChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <RangePicker
                        style={{ width: '100%' }}
                        placeholder={['Başlangıç', 'Bitiş']}
                        onChange={(dates) =>
                          setFilters((prev) => ({
                            ...prev,
                            fromDate: dates?.[0]?.toISOString(),
                            toDate: dates?.[1]?.toISOString(),
                            page: 1,
                          }))
                        }
                      />
                    </Col>
                  </Row>
                </Card>

                {/* Commissions Table */}
                <Card>
                  <Table
                    columns={commissionColumns}
                    dataSource={commissions}
                    rowKey="id"
                    loading={commissionsLoading}
                    onChange={handleTableChange}
                    pagination={{
                      current: filters.page,
                      pageSize: filters.pageSize,
                      total: commissionsData?.totalCount ?? 0,
                      showSizeChanger: true,
                      showTotal: (total) => `Toplam ${total} komisyon`,
                    }}
                  />
                </Card>
              </>
            ),
          },
          {
            key: 'plans',
            label: 'Komisyon Planları',
            children: (
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => router.push('/sales/commissions/plans/new')}
                  >
                    Yeni Plan
                  </Button>
                </div>
                <Table
                  columns={planColumns}
                  dataSource={plans}
                  rowKey="id"
                  loading={plansLoading}
                  pagination={false}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Action Modal */}
      <Modal
        title={actionType === 'reject' ? 'Komisyonu Reddet' : 'Ödeme Bilgisi'}
        open={actionModalOpen}
        onOk={handleActionConfirm}
        onCancel={() => setActionModalOpen(false)}
        okText={actionType === 'reject' ? 'Reddet' : 'Onayla'}
        okType={actionType === 'reject' ? 'danger' : 'primary'}
        cancelText="Vazgeç"
        confirmLoading={rejectMutation.isPending || markPaidMutation.isPending}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>
            <strong>{selectedCommission?.salesPersonName}</strong> için{' '}
            <strong>
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
                selectedCommission?.commissionAmount || 0
              )}
            </strong>{' '}
            komisyon
          </Text>
        </div>
        <Input.TextArea
          placeholder={actionType === 'reject' ? 'Red sebebini giriniz...' : 'Ödeme referansı (opsiyonel)...'}
          rows={3}
          value={actionValue}
          onChange={(e) => setActionValue(e.target.value)}
        />
      </Modal>
    </div>
  );
}
