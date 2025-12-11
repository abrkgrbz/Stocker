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
  Progress,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import {
  useCertifications,
  useDeleteCertification,
} from '@/lib/api/hooks/useHR';
import type { CertificationDto } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

// Certification type options
const certificationTypeOptions = [
  { value: 'Professional', label: 'Profesyonel' },
  { value: 'Technical', label: 'Teknik' },
  { value: 'Industry', label: 'Sektörel' },
  { value: 'Academic', label: 'Akademik' },
  { value: 'Government', label: 'Devlet' },
  { value: 'Vendor', label: 'Vendor/Ürün' },
  { value: 'Safety', label: 'Güvenlik' },
  { value: 'Quality', label: 'Kalite' },
  { value: 'Other', label: 'Diğer' },
];

export default function CertificationsPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
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
  const { data: certifications = [], isLoading, refetch } = useCertifications();
  const deleteCertification = useDeleteCertification();

  // Filter certifications
  const filteredCertifications = useMemo(() => {
    return certifications.filter((cert) => {
      const matchesSearch =
        !debouncedSearch ||
        cert.certificationName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        cert.employeeName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        cert.issuingAuthority?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesType = !selectedType || cert.certificationType === selectedType;

      let matchesStatus = true;
      if (selectedStatus === 'expired') {
        matchesStatus = cert.isExpired;
      } else if (selectedStatus === 'expiring') {
        matchesStatus = cert.isExpiringSoon && !cert.isExpired;
      } else if (selectedStatus === 'valid') {
        matchesStatus = !cert.isExpired && !cert.isExpiringSoon;
      }

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [certifications, debouncedSearch, selectedType, selectedStatus]);

  // Calculate stats
  const totalCertifications = certifications.length;
  const validCertifications = certifications.filter((c) => !c.isExpired && !c.isExpiringSoon).length;
  const expiringCertifications = certifications.filter((c) => c.isExpiringSoon && !c.isExpired).length;
  const expiredCertifications = certifications.filter((c) => c.isExpired).length;

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/certifications/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/certifications/${id}/edit`);
  };

  const handleDelete = (cert: CertificationDto) => {
    Modal.confirm({
      title: 'Sertifikayı Sil',
      content: `"${cert.certificationName}" sertifikasını silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteCertification.mutateAsync(cert.id);
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
  };

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD.MM.YYYY');
  };

  // Get status info
  const getStatusInfo = (cert: CertificationDto) => {
    if (cert.isExpired) {
      return { color: 'red', text: 'Süresi Doldu', icon: <ExclamationCircleOutlined /> };
    }
    if (cert.isExpiringSoon) {
      return { color: 'orange', text: 'Yakında Dolacak', icon: <WarningOutlined /> };
    }
    return { color: 'green', text: 'Geçerli', icon: <CheckCircleOutlined /> };
  };

  // Table columns
  const columns: ColumnsType<CertificationDto> = [
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employee',
      width: 150,
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Sertifika Adı',
      dataIndex: 'certificationName',
      key: 'name',
      width: 200,
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {record.certificationLevel && (
            <Tag className="text-xs">{record.certificationLevel}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Veren Kurum',
      dataIndex: 'issuingAuthority',
      key: 'authority',
      width: 150,
      render: (authority, record) => (
        <Space direction="vertical" size={0}>
          <Text>{authority}</Text>
          {record.issuingCountry && (
            <Text type="secondary" className="text-xs">{record.issuingCountry}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'certificationType',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeOption = certificationTypeOptions.find((t) => t.value === type);
        return <Tag>{typeOption?.label || type}</Tag>;
      },
    },
    {
      title: 'Verilme / Bitiş',
      key: 'dates',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text className="text-xs">{formatDate(record.issueDate)}</Text>
          {record.expiryDate && (
            <Text type="secondary" className="text-xs">→ {formatDate(record.expiryDate)}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Eğitim',
      key: 'training',
      width: 120,
      render: (_, record) => {
        if (!record.trainingRequired) return <Text type="secondary">-</Text>;
        const completed = record.completedTrainingHours || 0;
        const total = record.totalTrainingHours || 0;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return (
          <Tooltip title={`${completed}/${total} saat`}>
            <Progress percent={percent} size="small" />
          </Tooltip>
        );
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const status = getStatusInfo(record);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: 'Doğrulama',
      key: 'verification',
      width: 80,
      align: 'center',
      render: (_, record) => {
        if (!record.verificationUrl) return <Text type="secondary">-</Text>;
        return (
          <Tooltip title="Doğrulama Linki">
            <Button
              type="link"
              icon={<LinkOutlined />}
              href={record.verificationUrl}
              target="_blank"
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
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
            <SafetyCertificateOutlined className="mr-2" />
            Sertifikalar
          </Title>
          <Text type="secondary">Çalışan sertifikalarını görüntüle ve yönet</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/hr/certifications/new')}
          >
            Yeni Sertifika
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Sertifika"
              value={totalCertifications}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Geçerli"
              value={validCertifications}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Yakında Dolacak"
              value={expiringCertifications}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Süresi Dolmuş"
              value={expiredCertifications}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Sertifika, çalışan veya kurum ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Tip"
              allowClear
              style={{ width: '100%' }}
              value={selectedType}
              onChange={setSelectedType}
              options={certificationTypeOptions}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: 'valid', label: 'Geçerli' },
                { value: 'expiring', label: 'Yakında Dolacak' },
                { value: 'expired', label: 'Süresi Dolmuş' },
              ]}
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
          dataSource={filteredCertifications}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1300 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredCertifications.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sertifika`,
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
