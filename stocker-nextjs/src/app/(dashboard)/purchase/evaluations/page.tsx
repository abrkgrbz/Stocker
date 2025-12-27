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
  Select,
  Modal,
  Rate,
  Progress,
} from 'antd';
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import { useSupplierEvaluations, useDeleteSupplierEvaluation } from '@/lib/api/hooks/usePurchase';
import type { SupplierEvaluationListDto, EvaluationStatus } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;

const statusConfig: Record<EvaluationStatus, { color: string; text: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', text: 'Taslak', icon: <PencilIcon className="w-4 h-4" /> },
  Submitted: { color: 'blue', text: 'Gönderildi', icon: <ClockIcon className="w-4 h-4" /> },
  Approved: { color: 'green', text: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { color: 'red', text: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#52c41a';
  if (score >= 60) return '#1890ff';
  if (score >= 40) return '#faad14';
  return '#ff4d4f';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Mükemmel';
  if (score >= 60) return 'İyi';
  if (score >= 40) return 'Orta';
  return 'Düşük';
};

export default function SupplierEvaluationsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useSupplierEvaluations({
    page: currentPage,
    pageSize,
    search: searchText || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeleteSupplierEvaluation();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Değerlendirme Silinecek',
      icon: <ExclamationCircleIcon className="w-4 h-4" />,
      content: 'Bu değerlendirmeyi silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const columns: ColumnsType<SupplierEvaluationListDto> = [
    {
      title: 'Değerlendirme No',
      dataIndex: 'evaluationNumber',
      key: 'evaluationNumber',
      width: 150,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => router.push(`/purchase/evaluations/${record.id}`)}
          className="p-0 font-medium"
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text, record) => (
        <Space>
          <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-400">{record.supplierCode}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Dönem',
      dataIndex: 'evaluationPeriod',
      key: 'evaluationPeriod',
      width: 120,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: EvaluationStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Toplam Puan',
      dataIndex: 'overallScore',
      key: 'overallScore',
      width: 180,
      render: (score: number) => (
        <div>
          <div className="flex items-center gap-2">
            <Progress
              percent={score}
              size="small"
              strokeColor={getScoreColor(score)}
              format={() => `${score.toFixed(0)}`}
              style={{ width: 100 }}
            />
          </div>
          <div className="text-xs" style={{ color: getScoreColor(score) }}>
            {getScoreLabel(score)}
          </div>
        </div>
      ),
    },
    {
      title: 'Sıralama',
      dataIndex: 'rank',
      key: 'rank',
      width: 100,
      align: 'center',
      render: (rank: number | null) =>
        rank ? (
          <Tag color={rank <= 3 ? 'gold' : 'default'} icon={rank <= 3 ? <TrophyIcon className="w-4 h-4" /> : null}>
            #{rank}
          </Tag>
        ) : '-',
    },
    {
      title: 'Değerlendiren',
      dataIndex: 'evaluatorName',
      key: 'evaluatorName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Tarih',
      dataIndex: 'evaluationDate',
      key: 'evaluationDate',
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
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => router.push(`/purchase/evaluations/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                disabled: record.status !== 'Draft',
                onClick: () => router.push(`/purchase/evaluations/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                disabled: record.status !== 'Draft',
                onClick: () => handleDelete(record.id),
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

  // Calculate stats
  const avgScore = data?.items?.length
    ? data.items.reduce((sum, item) => sum + item.overallScore, 0) / data.items.length
    : 0;
  const topPerformers = data?.items?.filter(i => i.overallScore >= 80).length || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="mb-1">Tedarikçi Değerlendirmeleri</Title>
          <Text type="secondary">Tedarikçi performanslarını değerlendirin ve karşılaştırın</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          size="large"
          onClick={() => router.push('/purchase/evaluations/new')}
        >
          Yeni Değerlendirme
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Toplam Değerlendirme"
              value={data?.totalCount || 0}
              prefix={<StarIcon className="w-4 h-4 text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Ortalama Puan"
              value={avgScore}
              precision={1}
              prefix={<StarIcon className="w-4 h-4 text-yellow-500" />}
              suffix="/ 100"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Üst Performans"
              value={topPerformers}
              prefix={<TrophyIcon className="w-4 h-4 text-green-500" />}
              suffix="tedarikçi"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Onay Bekleyen"
              value={data?.items?.filter(i => i.status === 'Submitted').length || 0}
              prefix={<ClockIcon className="w-4 h-4 text-orange-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card bordered={false} className="shadow-sm mb-6">
        <Space wrap size="middle">
          <Input
            placeholder="Tedarikçi veya değerlendirme no ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Durum"
            style={{ width: 150 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.text,
            }))}
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
