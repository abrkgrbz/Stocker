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
  Input,
  Select,
} from 'antd';
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { useDocuments, useDeleteDocument, useEmployees } from '@/lib/api/hooks/useHR';
import type { EmployeeDocumentDto } from '@/lib/api/services/hr.types';
import { DocumentType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;

// Document type labels in Turkish
const documentTypeLabels: Record<number, string> = {
  [DocumentType.IdentityCard]: 'Kimlik Kartı',
  [DocumentType.Passport]: 'Pasaport',
  [DocumentType.DrivingLicense]: 'Ehliyet',
  [DocumentType.Diploma]: 'Diploma',
  [DocumentType.Certificate]: 'Sertifika',
  [DocumentType.Resume]: 'Özgeçmiş',
  [DocumentType.EmploymentContract]: 'İş Sözleşmesi',
  [DocumentType.MedicalReport]: 'Sağlık Raporu',
  [DocumentType.CriminalRecord]: 'Sabıka Kaydı',
  [DocumentType.AddressProof]: 'Adres Belgesi',
  [DocumentType.ReferenceLetter]: 'Referans Mektubu',
  [DocumentType.SocialSecurityDocument]: 'SGK Belgesi',
  [DocumentType.BankInformation]: 'Banka Bilgileri',
  [DocumentType.FamilyRegister]: 'Aile Kayıt Belgesi',
  [DocumentType.MilitaryDocument]: 'Askerlik Belgesi',
  [DocumentType.Photo]: 'Fotoğraf',
  [DocumentType.Other]: 'Diğer',
};

export default function DocumentsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<number | undefined>();
  const [typeFilter, setTypeFilter] = useState<number | undefined>();

  // API Hooks
  const { data: documents = [], isLoading } = useDocuments(employeeFilter, typeFilter);
  const { data: employees = [] } = useEmployees();
  const deleteDocument = useDeleteDocument();

  // Filter documents by search text
  const filteredDocuments = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchText.toLowerCase()) ||
      d.employeeName.toLowerCase().includes(searchText.toLowerCase()) ||
      d.documentNumber.toLowerCase().includes(searchText.toLowerCase())
  );

  // Stats
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter((d) => d.isVerified).length;
  const expiredDocuments = documents.filter((d) => d.isExpired).length;
  const expiringSoonDocuments = documents.filter((d) => d.isExpiringSoon && !d.isExpired).length;

  const handleDelete = (document: EmployeeDocumentDto) => {
    Modal.confirm({
      title: 'Belgeyi Sil',
      content: `"${document.title}" belgesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteDocument.mutateAsync(document.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const columns: ColumnsType<EmployeeDocumentDto> = [
    {
      title: 'Belge Adı',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title: string, record: EmployeeDocumentDto) => (
        <Space>
          <DocumentIcon className="w-4 h-4" style={{ color: '#3b82f6' }} />
          <a onClick={() => router.push(`/hr/documents/${record.id}`)}>{title}</a>
        </Space>
      ),
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title: 'Belge No',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      width: 150,
    },
    {
      title: 'Tür',
      dataIndex: 'documentType',
      key: 'documentType',
      width: 150,
      render: (type: DocumentType) => (
        <Tag>{documentTypeLabels[type] || 'Bilinmiyor'}</Tag>
      ),
    },
    {
      title: 'Son Geçerlilik',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 130,
      sorter: (a, b) => {
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix();
      },
      render: (date: string | undefined, record: EmployeeDocumentDto) => {
        if (!date) return <span className="text-gray-400">-</span>;
        const color = record.isExpired ? 'red' : record.isExpiringSoon ? 'orange' : 'default';
        return <Tag color={color}>{dayjs(date).format('DD.MM.YYYY')}</Tag>;
      },
    },
    {
      title: 'Doğrulama',
      dataIndex: 'isVerified',
      key: 'isVerified',
      width: 100,
      render: (isVerified: boolean) => (
        <Tag color={isVerified ? 'green' : 'default'} icon={isVerified ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}>
          {isVerified ? 'Doğrulandı' : 'Bekliyor'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: EmployeeDocumentDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/documents/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/documents/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  // Document type options for filter
  const documentTypeOptions = Object.entries(documentTypeLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          <DocumentIcon className="w-4 h-4" className="mr-2" />
          Belgeler
        </Title>
        <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/hr/documents/new')}>
          Yeni Belge
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Belge"
              value={totalDocuments}
              prefix={<DocumentIcon className="w-4 h-4" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Doğrulanmış"
              value={verifiedDocuments}
              prefix={<ShieldCheckIcon className="w-4 h-4" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Süresi Dolacak"
              value={expiringSoonDocuments}
              prefix={<ClockIcon className="w-4 h-4" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Süresi Dolmuş"
              value={expiredDocuments}
              prefix={<ExclamationCircleIcon className="w-4 h-4" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Belge veya çalışan ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Çalışan seçin"
              style={{ width: '100%' }}
              value={employeeFilter}
              onChange={(value) => setEmployeeFilter(value)}
              allowClear
              showSearch
              optionFilterProp="label"
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Belge türü seçin"
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
              allowClear
              options={documentTypeOptions}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredDocuments}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} belge`,
          }}
        />
      </Card>
    </div>
  );
}
