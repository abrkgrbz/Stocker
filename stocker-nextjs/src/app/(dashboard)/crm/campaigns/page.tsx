'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Space, Tag, Typography, Row, Col, Modal, message, Statistic, Progress } from 'antd';
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
  PercentageOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Campaign } from '@/lib/api/services/crm.service';
import {
  useCampaigns,
  useDeleteCampaign,
  useStartCampaign,
  useCompleteCampaign,
  useAbortCampaign,
} from '@/hooks/useCRM';

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

  // API Hooks
  const { data: campaigns = [], isLoading, refetch } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const startCampaign = useStartCampaign();
  const completeCampaign = useCompleteCampaign();
  const abortCampaign = useAbortCampaign();

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

  const columns: ColumnsType<Campaign> = [
    {
      title: 'Kampanya Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          {record.description && <div className="text-xs text-gray-500">{record.description}</div>}
        </div>
      ),
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
      width: 200,
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            {record.status === 'Planned' && (
              <Button
                type="link"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record.id)}
                loading={startCampaign.isPending}
              >
                Başlat
              </Button>
            )}
            {record.status === 'InProgress' && (
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleComplete(record.id)}
                loading={completeCampaign.isPending}
              >
                Tamamla
              </Button>
            )}
            <Button type="link" size="small" icon={<EditOutlined />}>
              Düzenle
            </Button>
          </Space>
          <Space size="small">
            {(record.status === 'Planned' || record.status === 'InProgress') && (
              <Button
                type="link"
                danger
                size="small"
                onClick={() => handleAbort(record.id)}
                loading={abortCampaign.isPending}
              >
                İptal Et
              </Button>
            )}
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              loading={deleteCampaign.isPending}
            >
              Sil
            </Button>
          </Space>
        </Space>
      ),
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
              <Button type="primary" icon={<PlusOutlined />}>
                Yeni Kampanya
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Kampanya"
              value={stats.total}
              prefix={<MailOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Kampanya"
              value={stats.active}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Lead"
              value={stats.totalLeads}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ortalama ROI"
              value={stats.avgROI}
              prefix={<PercentageOutlined />}
              suffix="%"
              precision={1}
              valueStyle={{ color: stats.avgROI > 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

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
    </div>
  );
}
