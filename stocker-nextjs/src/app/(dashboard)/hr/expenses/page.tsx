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
  WalletOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useExpenses,
  useDeleteExpense,
  useApproveExpense,
  useRejectExpense,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { ExpenseDto, ExpenseFilterDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function ExpensesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ExpenseFilterDto>({});

  // API Hooks
  const { data: expenses = [], isLoading } = useExpenses(filters);
  const { data: employees = [] } = useEmployees();
  const deleteExpense = useDeleteExpense();
  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();

  // Stats
  const totalExpenses = expenses.length;
  const pendingExpenses = expenses.filter((e) => e.status === 'Pending').length;
  const approvedExpenses = expenses.filter((e) => e.status === 'Approved').length;
  const totalAmount = expenses.filter((e) => e.status === 'Approved').reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleDelete = (expense: ExpenseDto) => {
    Modal.confirm({
      title: 'Harcama Kaydını Sil',
      content: 'Bu harcama kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteExpense.mutateAsync(expense.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async (expense: ExpenseDto) => {
    try {
      await approveExpense.mutateAsync(expense.id);
      message.success('Harcama onaylandı');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = async (expense: ExpenseDto) => {
    Modal.confirm({
      title: 'Harcamayı Reddet',
      content: 'Bu harcamayı reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await rejectExpense.mutateAsync({ id: expense.id });
          message.success('Harcama reddedildi');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const getStatusConfig = (status?: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      Pending: { color: 'orange', text: 'Beklemede' },
      Approved: { color: 'green', text: 'Onaylandı' },
      Rejected: { color: 'red', text: 'Reddedildi' },
      Paid: { color: 'blue', text: 'Ödendi' },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-' };
  };

  const columns: ColumnsType<ExpenseDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      render: (_, record: ExpenseDto) => (
        <Space>
          <UserOutlined style={{ color: '#8b5cf6' }} />
          <span>{record.employeeName || `Çalışan #${record.employeeId}`}</span>
        </Space>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Tarih',
      dataIndex: 'expenseDate',
      key: 'date',
      width: 120,
      sorter: (a, b) => dayjs(a.expenseDate).unix() - dayjs(b.expenseDate).unix(),
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (value: number) => <strong>{formatCurrency(value)}</strong>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: ExpenseDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/expenses/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/expenses/${record.id}/edit`),
                disabled: record.status !== 'Pending',
              },
              { type: 'divider' },
              ...(record.status === 'Pending'
                ? [
                    {
                      key: 'approve',
                      icon: <CheckCircleOutlined />,
                      label: 'Onayla',
                      onClick: () => handleApprove(record),
                    },
                    {
                      key: 'reject',
                      icon: <CloseCircleOutlined />,
                      label: 'Reddet',
                      onClick: () => handleReject(record),
                    },
                    { type: 'divider' as const },
                  ]
                : []),
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
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
          <WalletOutlined className="mr-2" />
          Harcama Yönetimi
        </Title>
        <Space>
          <Button onClick={() => router.push('/hr/payroll')}>Bordro</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/expenses/new')}>
            Yeni Harcama
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Harcama"
              value={totalExpenses}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Bekleyen"
              value={pendingExpenses}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Onaylanan"
              value={approvedExpenses}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Onaylanan Tutar"
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
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              options={[
                { value: 'Pending', label: 'Beklemede' },
                { value: 'Approved', label: 'Onaylanan' },
                { value: 'Rejected', label: 'Reddedilen' },
                { value: 'Paid', label: 'Ödenen' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={(dates) => {
                if (dates) {
                  setFilters((prev) => ({
                    ...prev,
                    startDate: dates[0]?.format('YYYY-MM-DD'),
                    endDate: dates[1]?.format('YYYY-MM-DD'),
                  }));
                } else {
                  setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
                }
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={expenses}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} harcama`,
          }}
        />
      </Card>
    </div>
  );
}
