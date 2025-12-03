'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Button, Table, Space, Tag, Typography, Row, Col, Progress, Avatar, Dropdown, Empty } from 'antd';
import {
  showCreateSuccess,
  showDeleteSuccess,
  showUpdateSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  DollarOutlined,
  UserAddOutlined,
  ReloadOutlined,
  TrophyOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Campaign } from '@/lib/api/services/crm.service';
import {
  useCampaigns,
  useDeleteCampaign,
  useStartCampaign,
  useCompleteCampaign,
  useAbortCampaign,
  useCreateCampaign,
} from '@/lib/api/hooks/useCRM';
import { CampaignsStats } from '@/components/crm/campaigns/CampaignsStats';

const { Title } = Typography;

const campaignTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  Email: { label: 'E-posta', icon: <MailOutlined />, color: 'blue' },
  SocialMedia: { label: 'Sosyal Medya', icon: <UserAddOutlined />, color: 'cyan' },
  Webinar: { label: 'Webinar', icon: <PlayCircleOutlined />, color: 'purple' },
  Event: { label: 'Etkinlik', icon: <CheckCircleOutlined />, color: 'green' },
  Conference: { label: 'Konferans', icon: <CheckCircleOutlined />, color: 'geekblue' },
  Advertisement: { label: 'Reklam', icon: <DollarOutlined />, color: 'orange' },
  Banner: { label: 'Banner', icon: <DollarOutlined />, color: 'gold' },
  Telemarketing: { label: 'Telefonla Pazarlama', icon: <MailOutlined />, color: 'magenta' },
  PublicRelations: { label: 'Halkla İlişkiler', icon: <UserAddOutlined />, color: 'volcano' },
};

const campaignStatusLabels: Record<string, { label: string; color: string }> = {
  Planned: { label: 'Planlandı', color: 'default' },
  InProgress: { label: 'Devam Ediyor', color: 'processing' },
  Completed: { label: 'Tamamlandı', color: 'success' },
  Aborted: { label: 'İptal Edildi', color: 'error' },
  OnHold: { label: 'Beklemede', color: 'warning' },
};

export default function CampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // API Hooks
  const { data: campaigns = [], isLoading, refetch } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const startCampaign = useStartCampaign();
  const completeCampaign = useCompleteCampaign();
  const abortCampaign = useAbortCampaign();
  const createCampaign = useCreateCampaign();

  // Handle query parameters for segment integration
  useEffect(() => {
    const createNew = searchParams.get('createNew');
    const targetSegmentId = searchParams.get('targetSegmentId');
    const targetSegmentName = searchParams.get('targetSegmentName');

    if (createNew === 'true' && targetSegmentId) {
      // Redirect to new campaign page with segment params
      router.push(`/crm/campaigns/new?targetSegmentId=${targetSegmentId}&targetSegmentName=${encodeURIComponent(targetSegmentName || '')}`);
    }
  }, [searchParams, router]);

  const handleDelete = async (id: string, campaign: Campaign) => {
    const confirmed = await confirmDelete('Kampanya', campaign.name);

    if (confirmed) {
      try {
        await deleteCampaign.mutateAsync(id);
        showDeleteSuccess('kampanya');
      } catch (error: any) {
        const apiError = error.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Silme işlemi başarısız';
        showError(errorMessage);
      }
    }
  };

  const handleStart = async (id: string) => {
    try {
      await startCampaign.mutateAsync(id);
      showUpdateSuccess('kampanya', 'başlatıldı');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
      showError(errorMessage);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeCampaign.mutateAsync(id);
      showUpdateSuccess('kampanya', 'tamamlandı');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
      showError(errorMessage);
    }
  };

  const handleAbort = async (id: string) => {
    try {
      await abortCampaign.mutateAsync(id);
      showUpdateSuccess('kampanya', 'iptal edildi');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
      showError(errorMessage);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    router.push(`/crm/campaigns/${campaign.id}/edit`);
  };

  const handleCreate = () => {
    router.push('/crm/campaigns/new');
  };

  const handleClone = async (campaign: Campaign) => {
    try {
      const clonedData = {
        name: `${campaign.name} (Kopya)`,
        description: campaign.description,
        type: campaign.type,
        status: 'Planned' as const, // Cloned campaigns start as Planned
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budgetedCost: campaign.budgetedCost,
        targetLeads: campaign.targetLeads,
      };
      await createCampaign.mutateAsync(clonedData as any);
      showCreateSuccess('kampanya', 'başarıyla kopyalandı');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Kopyalama işlemi başarısız';
      showError(errorMessage);
    }
  };

  const columns: ColumnsType<Campaign> = [
    {
      title: 'Kampanya',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const typeConfig = campaignTypeLabels[record.type] || { icon: <TrophyOutlined />, color: 'blue' };
        return (
          <div className="flex items-center gap-3">
            <Avatar
              size={40}
              className="bg-gradient-to-br flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, var(--ant-${typeConfig.color}-6), var(--ant-${typeConfig.color}-5))`,
              }}
              icon={typeConfig.icon}
            >
              {text.charAt(0)}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{text}</div>
              {record.description && (
                <div className="text-xs text-gray-500 truncate">{record.description}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => {
        const config = campaignTypeLabels[type] || { label: type, icon: null, color: 'default' };
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        const config = campaignStatusLabels[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Tarih Aralığı',
      key: 'dateRange',
      width: 180,
      render: (_, record) => (
        <div className="text-xs">
          <div>{new Date(record.startDate).toLocaleDateString('tr-TR')}</div>
          <div className="text-gray-500">{new Date(record.endDate).toLocaleDateString('tr-TR')}</div>
        </div>
      ),
    },
    {
      title: 'Performans',
      key: 'performance',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-xs mb-1">
            Leads: {record.actualLeads}/{record.targetLeads}
          </div>
          <Progress
            percent={record.targetLeads > 0 ? Math.round((record.actualLeads / record.targetLeads) * 100) : 0}
            size="small"
            status={record.conversionRate > 15 ? 'success' : record.conversionRate > 5 ? 'normal' : 'exception'}
          />
          <div className="text-xs text-gray-500 mt-1">Dönüşüm: %{record.conversionRate.toFixed(1)}</div>
        </div>
      ),
    },
    {
      title: 'ROI',
      dataIndex: 'roi',
      key: 'roi',
      width: 120,
      align: 'right',
      render: (roi) => (
        <div className="flex items-center justify-end gap-1">
          {roi > 0 ? (
            <ArrowUpOutlined className="text-green-500 text-xs" />
          ) : roi < 0 ? (
            <ArrowDownOutlined className="text-red-500 text-xs" />
          ) : null}
          <Tag color={roi > 0 ? 'success' : roi < 0 ? 'error' : 'default'}>
            {roi > 0 ? '+' : ''}
            {roi.toFixed(1)}%
          </Tag>
        </div>
      ),
    },
    {
      title: 'Bütçe',
      key: 'budget',
      width: 180,
      render: (_, record) => {
        const budgetPercent = record.budgetedCost > 0
          ? Math.round((record.actualCost / record.budgetedCost) * 100)
          : 0;
        const isOverBudget = record.actualCost > record.budgetedCost;

        return (
          <div>
            <div className="text-xs mb-1 flex justify-between">
              <span>₺{record.actualCost.toLocaleString('tr-TR')}</span>
              <span className="text-gray-500">/ ₺{record.budgetedCost.toLocaleString('tr-TR')}</span>
            </div>
            <Progress
              percent={budgetPercent}
              size="small"
              status={isOverBudget ? 'exception' : budgetPercent > 80 ? 'normal' : 'active'}
              strokeColor={isOverBudget ? '#ef4444' : budgetPercent > 80 ? '#f59e0b' : '#10b981'}
            />
            <div className="text-xs mt-1" style={{ color: isOverBudget ? '#ef4444' : '#6b7280' }}>
              {budgetPercent}% Kullanıldı
            </div>
          </div>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_, record) => {
        const menuItems = [];

        // Start action
        if (record.status === 'Planned') {
          menuItems.push({
            key: 'start',
            label: 'Başlat',
            icon: <PlayCircleOutlined />,
            onClick: () => handleStart(record.id),
            disabled: startCampaign.isPending,
          });
        }

        // Complete action
        if (record.status === 'InProgress') {
          menuItems.push({
            key: 'complete',
            label: 'Tamamla',
            icon: <CheckCircleOutlined />,
            onClick: () => handleComplete(record.id),
            disabled: completeCampaign.isPending,
          });
        }

        // Edit action
        menuItems.push({
          key: 'edit',
          label: 'Düzenle',
          icon: <EditOutlined />,
          onClick: () => handleEdit(record),
        });

        // Clone action
        menuItems.push({
          key: 'clone',
          label: 'Kopyala',
          icon: <CopyOutlined />,
          onClick: () => handleClone(record),
          disabled: createCampaign.isPending,
        });

        // Separator
        if (record.status === 'Planned' || record.status === 'InProgress') {
          menuItems.push({ type: 'divider' as const });
        }

        // Abort action
        if (record.status === 'Planned' || record.status === 'InProgress') {
          menuItems.push({
            key: 'abort',
            label: 'İptal Et',
            icon: <CloseCircleOutlined />,
            danger: true,
            onClick: () => handleAbort(record.id),
            disabled: abortCampaign.isPending,
          });
        }

        // Delete action
        menuItems.push({ type: 'divider' as const });
        menuItems.push({
          key: 'delete',
          label: 'Sil',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => handleDelete(record.id, record),
          disabled: deleteCampaign.isPending,
        });

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];


  return (
    <div className="p-6">
      {/* Header */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <div className="flex justify-between items-center">
            <Title level={2} className="!mb-0">
              <MailOutlined className="mr-2" />
              Pazarlama Kampanyaları
            </Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                Yenile
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Yeni Kampanya
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      {/* Statistics */}
      <div className="mb-6">
        <CampaignsStats campaigns={campaigns} loading={isLoading} />
      </div>

      {/* Campaigns Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={campaigns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kampanya`,
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: (
              <Empty
                image={<TrophyOutlined style={{ fontSize: 80, color: '#d9d9d9' }} />}
                imageStyle={{ height: 100 }}
                description={
                  <div className="py-8">
                    <div className="text-2xl font-bold text-gray-800 mb-4">
                      Pazarlama Kampanyalarınızı Yönetin
                    </div>
                    <div className="text-base text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                      Kampanyalar, hedef kitlenize ulaşmanın en etkili yoludur.
                      E-posta, sosyal medya veya etkinlik kampanyaları oluşturun ve performanslarını takip edin.
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                      className="h-12 px-8 text-base font-semibold"
                    >
                      İlk Kampanyanızı Oluşturun
                    </Button>
                  </div>
                }
              />
            ),
          }}
        />
      </Card>

    </div>
  );
}
