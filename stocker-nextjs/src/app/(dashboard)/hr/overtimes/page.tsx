'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Card,
  Input,
  Row,
  Col,
  Statistic,
  Modal,
  Dropdown,
  Select,
  DatePicker,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useOvertimes,
  useDeleteOvertime,
  useApproveOvertime,
  useRejectOvertime,
} from '@/lib/api/hooks/useHR';
import type { OvertimeDto } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

// Overtime type options
const overtimeTypeOptions = [
  { value: 'Regular', label: 'Normal Mesai' },
  { value: 'Weekend', label: 'Hafta Sonu' },
  { value: 'Holiday', label: 'Tatil Günü' },
  { value: 'Night', label: 'Gece Mesaisi' },
  { value: 'Emergency', label: 'Acil Durum' },
  { value: 'Project', label: 'Proje Bazlı' },
];

// Status options
const statusOptions = [
  { value: 'Pending', label: 'Beklemede', color: 'orange' },
  { value: 'Approved', label: 'Onaylandı', color: 'green' },
  { value: 'Rejected', label: 'Reddedildi', color: 'red' },
  { value: 'Completed', label: 'Tamamlandı', color: 'blue' },
  { value: 'Cancelled', label: 'İptal Edildi', color: 'default' },
];

export default function OvertimesPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data: overtimes = [], isLoading, refetch } = useOvertimes();
  const deleteOvertime = useDeleteOvertime();
  const approveOvertime = useApproveOvertime();
  const rejectOvertime = useRejectOvertime();

  // Filter overtimes
  const filteredOvertimes = useMemo(() => {
    return overtimes.filter((ot) => {
      const matchesSearch =
        !debouncedSearch ||
        ot.employeeName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        ot.reason.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesType = !selectedType || ot.overtimeType === selectedType;
      const matchesStatus = !selectedStatus || ot.status === selectedStatus;

      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const otDate = dayjs(ot.date);
        matchesDate = otDate.isAfter(dateRange[0].subtract(1, 'day')) &&
                      otDate.isBefore(dateRange[1].add(1, 'day'));
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [overtimes, debouncedSearch, selectedType, selectedStatus, dateRange]);

  // Calculate stats
  const totalOvertimes = overtimes.length;
  const pendingOvertimes = overtimes.filter((ot) => ot.status === 'Pending').length;
  const totalHours = overtimes.reduce((sum, ot) => sum + (ot.actualHours || ot.plannedHours || 0), 0);
  const totalAmount = overtimes
    .filter((ot) => ot.status === 'Approved' || ot.status === 'Completed')
    .reduce((sum, ot) => sum + (ot.calculatedAmount || 0), 0);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/overtimes/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/overtimes/${id}/edit`);
  };

  const handleDelete = (ot: OvertimeDto) => {
    Modal.confirm({
      title: 'Mesai Kaydını Sil',
      content: `Bu mesai kaydını silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteOvertime.mutateAsync(ot.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async (ot: OvertimeDto) => {
    try {
      await approveOvertime.mutateAsync({ id: ot.id });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = (ot: OvertimeDto) => {
    Modal.confirm({
      title: 'Mesai Talebini Reddet',
      content: 'Bu talebi reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await rejectOvertime.mutateAsync({ id: ot.id, reason: 'Talep reddedildi' });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedType(undefined);
    setSelectedStatus(undefined);
    setDateRange(null);
  };

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD.MM.YYYY');
  };

  // Format time
  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  // Get status tag
  const getStatusTag = (status: string) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return (
      <Tag color={statusOption?.color || 'default'}>
        {statusOption?.label || status}
      </Tag>
    );
  };

  // Table columns
  const columns: ColumnsType<OvertimeDto> = [
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employee',
      width: 150,
      render: (name, record) => (
        <Space>
          <Text strong>{name}</Text>
          {record.isEmergency && (
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
          )}
        </Space>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (date) => formatDate(date),
    },
    {
      title: 'Saat',
      key: 'time',
      width: 120,
      render: (_, record) => (
        <Text>
          {formatTime(record.startTime)} - {formatTime(record.endTime)}
        </Text>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'overtimeType',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeOption = overtimeTypeOptions.find((t) => t.value === type);
        return <Tag>{typeOption?.label || type}</Tag>;
      },
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Saat',
      key: 'hours',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={0} className="text-center">
          <Text strong>{record.actualHours || record.plannedHours} saat</Text>
          <Text type="secondary" className="text-xs">
            x{record.payMultiplier}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'calculatedAmount',
      key: 'amount',
      width: 120,
      render: (amount, record) => {
        if (record.isCompensatoryTimeOff) {
          return <Tag color="purple">Telafi İzni</Tag>;
        }
        return <Text>{formatCurrency(amount)}</Text>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: any[] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
          },
        ];

        // Approval actions for pending items
        if (record.status === 'Pending') {
          menuItems.push(
            { type: 'divider' },
            {
              key: 'approve',
              icon: <CheckCircleIcon className="w-4 h-4" />,
              label: 'Onayla',
              onClick: () => handleApprove(record),
            },
            {
              key: 'reject',
              icon: <XCircleIcon className="w-4 h-4" />,
              label: 'Reddet',
              danger: true,
              onClick: () => handleReject(record),
            }
          );
        }

        menuItems.push(
          { type: 'divider' },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          }
        );

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <ClockIcon className="w-4 h-4 mr-2" />
            Fazla Mesailer
          </Title>
          <Text type="secondary">Fazla mesai taleplerini görüntüle ve yönet</Text>
        </div>
        <Space>
          <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/overtimes/new')}
          >
            Yeni Mesai Talebi
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Talep"
              value={totalOvertimes}
              prefix={<ClockIcon className="w-4 h-4" />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Bekleyen"
              value={pendingOvertimes}
              prefix={<ExclamationCircleIcon className="w-4 h-4" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Saat"
              value={totalHours.toFixed(1)}
              prefix={<ClockIcon className="w-4 h-4" />}
              suffix="saat"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Tutar"
              value={totalAmount}
              prefix={<CurrencyDollarIcon className="w-4 h-4" />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Search
              placeholder="Çalışan veya sebep ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Tip"
              allowClear
              style={{ width: '100%' }}
              value={selectedType}
              onChange={setSelectedType}
              options={overtimeTypeOptions}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button block onClick={clearFilters}>
              Temizle
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredOvertimes}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1300 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredOvertimes.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>
    </div>
  );
}
