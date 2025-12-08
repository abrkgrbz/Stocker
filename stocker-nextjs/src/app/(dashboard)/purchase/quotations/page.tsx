'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Tooltip,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import { useQuotations, useDeleteQuotation, useCancelQuotation } from '@/lib/api/hooks/usePurchase';
import type { QuotationListDto, QuotationStatus } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusConfig: Record<QuotationStatus, { color: string; text: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', text: 'Taslak', icon: <FileTextOutlined /> },
  Sent: { color: 'blue', text: 'Gönderildi', icon: <SendOutlined /> },
  PartiallyResponded: { color: 'orange', text: 'Kısmi Yanıt', icon: <ClockCircleOutlined /> },
  FullyResponded: { color: 'cyan', text: 'Tam Yanıt', icon: <CheckCircleOutlined /> },
  UnderReview: { color: 'purple', text: 'İnceleniyor', icon: <ClockCircleOutlined /> },
  Evaluated: { color: 'purple', text: 'Değerlendirildi', icon: <CheckCircleOutlined /> },
  SupplierSelected: { color: 'green', text: 'Tedarikçi Seçildi', icon: <CheckCircleOutlined /> },
  Awarded: { color: 'green', text: 'Kazanan Belirlendi', icon: <CheckCircleOutlined /> },
  Converted: { color: 'geekblue', text: 'Siparişe Dönüştü', icon: <CheckCircleOutlined /> },
  Cancelled: { color: 'red', text: 'İptal', icon: <CloseCircleOutlined /> },
  Closed: { color: 'gray', text: 'Kapatıldı', icon: <CloseCircleOutlined /> },
  Expired: { color: 'volcano', text: 'Süresi Doldu', icon: <ExclamationCircleOutlined /> },
};

export default function QuotationsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = useQuotations({
    page: currentPage,
    pageSize,
    searchTerm: searchText || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeleteQuotation();
  const cancelMutation = useCancelQuotation();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Teklif Talebi Silinecek',
      icon: <ExclamationCircleOutlined />,
      content: 'Bu teklif talebini silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const handleCancel = (id: string) => {
    Modal.confirm({
      title: 'Teklif Talebi İptal Edilecek',
      icon: <ExclamationCircleOutlined />,
      content: 'Bu teklif talebini iptal etmek istediğinize emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelMutation.mutateAsync({ id, reason: 'Kullanıcı tarafından iptal edildi' }),
    });
  };

  const columns: ColumnsType<QuotationListDto> = [
    {
      title: 'Teklif No',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
      width: 140,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => router.push(`/purchase/quotations/${record.id}`)}
          className="p-0 font-medium"
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text strong>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: QuotationStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Tedarikçi Sayısı',
      dataIndex: 'supplierCount',
      key: 'supplierCount',
      width: 130,
      align: 'center',
      render: (count) => (
        <Tag color="blue">{count} Tedarikçi</Tag>
      ),
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <Tag color="purple">{count} Ürün</Tag>
      ),
    },
    {
      title: 'Son Teklif Tarihi',
      dataIndex: 'responseDeadline',
      key: 'responseDeadline',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString('tr-TR') : '-',
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Görüntüle',
                icon: <EyeOutlined />,
                onClick: () => router.push(`/purchase/quotations/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                disabled: record.status !== 'Draft',
                onClick: () => router.push(`/purchase/quotations/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'cancel',
                label: 'İptal Et',
                icon: <CloseCircleOutlined />,
                danger: true,
                disabled: record.status === 'Cancelled' || record.status === 'Closed',
                onClick: () => handleCancel(record.id),
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                disabled: record.status !== 'Draft',
                onClick: () => handleDelete(record.id),
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

  // Calculate stats from data
  const stats = {
    total: data?.totalCount || 0,
    draft: data?.items?.filter(i => i.status === 'Draft').length || 0,
    sent: data?.items?.filter(i => i.status === 'Sent').length || 0,
    awarded: data?.items?.filter(i => i.status === 'Awarded').length || 0,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="mb-1">Teklif Talepleri (RFQ)</Title>
          <Text type="secondary">Tedarikçilerden teklif isteklerini yönetin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => router.push('/purchase/quotations/new')}
        >
          Yeni Teklif Talebi
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Toplam Talep"
              value={stats.total}
              prefix={<FileTextOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Taslak"
              value={stats.draft}
              prefix={<EditOutlined className="text-gray-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Gönderildi"
              value={stats.sent}
              prefix={<SendOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Kazanan Belirlendi"
              value={stats.awarded}
              prefix={<CheckCircleOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card bordered={false} className="shadow-sm mb-6">
        <Space wrap size="middle">
          <Input
            placeholder="Teklif no veya başlık ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Durum"
            style={{ width: 180 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.text,
            }))}
          />
          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            format="DD.MM.YYYY"
          />
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} className="shadow-sm">
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
