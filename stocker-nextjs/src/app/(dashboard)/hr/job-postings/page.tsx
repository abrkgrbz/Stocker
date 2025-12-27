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
  Tooltip,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  FireIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  StopCircleIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  useJobPostings,
  useDepartments,
  useDeleteJobPosting,
  usePublishJobPosting,
  useUnpublishJobPosting,
  useCloseJobPosting,
} from '@/lib/api/hooks/useHR';
import type { JobPostingDto } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

// Status options
const statusOptions = [
  { value: 'Draft', label: 'Taslak', color: 'default' },
  { value: 'Published', label: 'Yayında', color: 'green' },
  { value: 'Closed', label: 'Kapalı', color: 'red' },
  { value: 'OnHold', label: 'Beklemede', color: 'orange' },
  { value: 'Filled', label: 'Dolu', color: 'blue' },
];

export default function JobPostingsPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

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
  const { data: jobPostings = [], isLoading, refetch } = useJobPostings();
  const { data: departments = [] } = useDepartments();
  const deleteJobPosting = useDeleteJobPosting();
  const publishJobPosting = usePublishJobPosting();
  const unpublishJobPosting = useUnpublishJobPosting();
  const closeJobPosting = useCloseJobPosting();

  // Filter job postings
  const filteredJobPostings = useMemo(() => {
    return jobPostings.filter((jp) => {
      const matchesSearch =
        !debouncedSearch ||
        jp.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        jp.postingCode?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        jp.description?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesDepartment = !selectedDepartment || jp.departmentId === selectedDepartment;
      const matchesStatus = !selectedStatus || jp.status === selectedStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [jobPostings, debouncedSearch, selectedDepartment, selectedStatus]);

  // Calculate stats
  const totalPostings = jobPostings.length;
  const publishedPostings = jobPostings.filter((jp) => jp.status === 'Published').length;
  const totalApplications = jobPostings.reduce((sum, jp) => sum + (jp.totalApplications || 0), 0);
  const totalHired = jobPostings.reduce((sum, jp) => sum + (jp.hiredCount || 0), 0);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/job-postings/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/job-postings/${id}/edit`);
  };

  const handleDelete = (jp: JobPostingDto) => {
    Modal.confirm({
      title: 'İş İlanını Sil',
      content: `"${jp.title}" ilanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteJobPosting.mutateAsync(jp.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handlePublish = async (jp: JobPostingDto) => {
    try {
      await publishJobPosting.mutateAsync(jp.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUnpublish = async (jp: JobPostingDto) => {
    try {
      await unpublishJobPosting.mutateAsync(jp.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleClose = async (jp: JobPostingDto) => {
    Modal.confirm({
      title: 'İlanı Kapat',
      content: `"${jp.title}" ilanını kapatmak istediğinizden emin misiniz?`,
      okText: 'Kapat',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await closeJobPosting.mutateAsync(jp.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment(undefined);
    setSelectedStatus(undefined);
  };

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD.MM.YYYY');
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
  const columns: ColumnsType<JobPostingDto> = [
    {
      title: 'İlan Kodu',
      dataIndex: 'postingCode',
      key: 'code',
      width: 120,
      render: (code, record) => (
        <Space>
          <Text strong>{code}</Text>
          {record.isUrgent && (
            <Tooltip title="Acil">
              <FireIcon className="w-4 h-4" style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
          {record.isFeatured && (
            <Tooltip title="Öne Çıkan">
              <MapPinIcon className="w-4 h-4" style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'İlan Başlığı',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          {record.isInternal && (
            <Tag color="purple" className="ml-2">İç İlan</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Departman',
      dataIndex: 'departmentName',
      key: 'department',
      width: 150,
      render: (name) => name || <Text type="secondary">-</Text>,
    },
    {
      title: 'Konum',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.remoteWorkType === 'Remote' ? 'Uzaktan' : record.remoteWorkType === 'Hybrid' ? 'Hibrit' : 'Ofiste'}</Text>
          {record.city && <Text type="secondary" className="text-xs">{record.city}</Text>}
        </Space>
      ),
    },
    {
      title: 'Maaş Aralığı',
      key: 'salary',
      width: 180,
      render: (_, record) => {
        if (!record.showSalary || (!record.salaryMin && !record.salaryMax)) {
          return <Text type="secondary">Belirtilmedi</Text>;
        }
        return (
          <Text>
            {formatCurrency(record.salaryMin)} - {formatCurrency(record.salaryMax)}
          </Text>
        );
      },
    },
    {
      title: 'Başvuru',
      dataIndex: 'totalApplications',
      key: 'applications',
      width: 100,
      align: 'center',
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Son Başvuru',
      dataIndex: 'applicationDeadline',
      key: 'deadline',
      width: 120,
      render: (date) => {
        if (!date) return <Text type="secondary">-</Text>;
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <Text type={isExpired ? 'danger' : undefined}>
            {formatDate(date)}
          </Text>
        );
      },
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
          { type: 'divider' },
        ];

        // Status-based actions
        if (record.status === 'Draft') {
          menuItems.push({
            key: 'publish',
            icon: <PaperAirplaneIcon className="w-4 h-4" />,
            label: 'Yayınla',
            onClick: () => handlePublish(record),
          });
        } else if (record.status === 'Published') {
          menuItems.push({
            key: 'unpublish',
            icon: <EyeSlashIcon className="w-4 h-4" />,
            label: 'Yayından Kaldır',
            onClick: () => handleUnpublish(record),
          });
          menuItems.push({
            key: 'close',
            icon: <StopCircleIcon className="w-4 h-4" />,
            label: 'İlanı Kapat',
            onClick: () => handleClose(record),
          });
        }

        menuItems.push({ type: 'divider' });
        menuItems.push({
          key: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record),
        });

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
            <DocumentTextIcon className="w-4 h-4" className="mr-2" />
            İş İlanları
          </Title>
          <Text type="secondary">Tüm iş ilanlarını görüntüle ve yönet</Text>
        </div>
        <Space>
          <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/job-postings/new')}
          >
            Yeni İlan
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam İlan"
              value={totalPostings}
              prefix={<DocumentTextIcon className="w-4 h-4" />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Yayında"
              value={publishedPostings}
              prefix={<CheckCircleIcon className="w-4 h-4" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Başvuru"
              value={totalApplications}
              prefix={<UserGroupIcon className="w-4 h-4" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="İşe Alınan"
              value={totalHired}
              prefix={<CheckCircleIcon className="w-4 h-4" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="İlan başlığı, kod veya açıklama ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Departman"
              allowClear
              style={{ width: '100%' }}
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Col>
          <Col xs={12} md={5}>
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
          dataSource={filteredJobPostings}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1400 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredJobPostings.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} ilan`,
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
