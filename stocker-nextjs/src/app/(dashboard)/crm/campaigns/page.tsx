'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Space, Tag, Typography, Row, Col, Modal, message, Progress, Avatar, Dropdown } from 'antd';
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
  useUpdateCampaign,
} from '@/hooks/useCRM';
import { CampaignsStats } from '@/components/crm/campaigns/CampaignsStats';
import { CampaignModal } from '@/components/crm/campaigns/CampaignModal';

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
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API Hooks
  const { data: campaigns = [], isLoading, refetch } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const startCampaign = useStartCampaign();
  const completeCampaign = useCompleteCampaign();
  const abortCampaign = useAbortCampaign();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Kampanya Sil',
      content: 'Bu kampanyayı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteCampaign.mutateAsync(id);
        } catch (error) {
          message.error('Silme işlemi başarısız');
        }
      },
    });
  };

  const handleStart = async (id: string) => {
    try {
      await startCampaign.mutateAsync(id);
    } catch (error) {
      message.error('Başlatma işlemi başarısız');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeCampaign.mutateAsync(id);
    } catch (error) {
      message.error('Tamamlama işlemi başarısız');
    }
  };

  const handleAbort = async (id: string) => {
    try {
      await abortCampaign.mutateAsync(id);
    } catch (error) {
      message.error('İptal işlemi başarısız');
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (selectedCampaign) {
        await updateCampaign.mutateAsync({ id: selectedCampaign.id, ...values });
      } else {
        await createCampaign.mutateAsync(values);
      }
      setIsModalOpen(false);
      setSelectedCampaign(null);
    } catch (error) {
      message.error('İşlem başarısız');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCampaign(null);
    setIsModalOpen(true);
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
      width: 100,
      align: 'right',
      render: (roi) => (
        <Tag color={roi > 0 ? 'success' : roi < 0 ? 'error' : 'default'}>
          {roi > 0 ? '+' : ''}
          {roi.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: 'Bütçe',
      key: 'budget',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <div className="text-xs">
          <div>₺{record.actualCost.toLocaleString('tr-TR')}</div>
          <div className="text-gray-500">/ ₺{record.budgetedCost.toLocaleString('tr-TR')}</div>
        </div>
      ),
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
          onClick: () => handleDelete(record.id),
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

  // Calculate statistics
  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'InProgress').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budgetedCost, 0),
    totalLeads: campaigns.reduce((sum, c) => sum + c.actualLeads, 0),
    avgROI: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length : 0,
  };

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
        />
      </Card>

      {/* Campaign Modal */}
      <CampaignModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedCampaign(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedCampaign}
        loading={createCampaign.isPending || updateCampaign.isPending}
      />
    </div>
  );
}
