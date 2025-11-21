'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Modal,
  message,
  Statistic,
  Progress,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  StopOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  useOpportunities,
  useCreateOpportunity,
  useWinOpportunity,
  useLoseOpportunity,
  usePipelines,
} from '@/lib/api/hooks/useCRM';
import type { OpportunityDto, OpportunityStatus } from '@/lib/api/services/crm.types';
import { OpportunityModal } from '@/features/opportunities/components/OpportunityModal';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

// Opportunity status configuration
const statusConfig: Record<OpportunityStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Prospecting: { color: 'blue', label: 'Araştırma', icon: <BarChartOutlined /> },
  Qualification: { color: 'cyan', label: 'Nitelendirme', icon: <CheckCircleOutlined /> },
  NeedsAnalysis: { color: 'geekblue', label: 'İhtiyaç Analizi', icon: <BarChartOutlined /> },
  Proposal: { color: 'purple', label: 'Teklif', icon: <DollarOutlined /> },
  Negotiation: { color: 'orange', label: 'Müzakere', icon: <RiseOutlined /> },
  ClosedWon: { color: 'green', label: 'Kazanıldı', icon: <TrophyOutlined /> },
  ClosedLost: { color: 'red', label: 'Kaybedildi', icon: <StopOutlined /> },
};

export default function OpportunitiesPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityDto | null>(null);

  // API Hooks
  const { data, isLoading, refetch } = useOpportunities();
  const { data: pipelines = [], isLoading: pipelinesLoading } = usePipelines();
  const createOpportunity = useCreateOpportunity();
  const winOpportunity = useWinOpportunity();
  const loseOpportunity = useLoseOpportunity();

  const opportunities = data?.items || [];

  // Calculate statistics
  const stats = {
    total: opportunities.length,
    totalValue: opportunities.reduce((sum: number, o: OpportunityDto) => sum + o.amount, 0),
    avgProbability: opportunities.length > 0
      ? opportunities.reduce((sum: number, o: OpportunityDto) => sum + o.probability, 0) / opportunities.length
      : 0,
    won: opportunities.filter((o: OpportunityDto) => o.status === 'ClosedWon').length,
    wonValue: opportunities.filter((o: OpportunityDto) => o.status === 'ClosedWon').reduce((sum: number, o: OpportunityDto) => sum + o.amount, 0),
    active: opportunities.filter((o: OpportunityDto) => o.status !== 'ClosedWon' && o.status !== 'ClosedLost').length,
  };

  const handleCreate = () => {
    setSelectedOpportunity(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedOpportunity) {
        // Update logic - if needed in the future
        message.info('Güncelleme özelliği yakında eklenecek');
      } else {
        // Validation: CustomerId is required by backend
        if (!values.customerId) {
          message.error('Müşteri seçimi zorunludur');
          return;
        }

        // Validation: ExpectedCloseDate is required and must be in future
        if (!values.expectedCloseDate) {
          message.error('Tahmini kapanış tarihi zorunludur');
          return;
        }

        // Validation: Pipeline and stage are required by backend
        if (!values.pipelineId) {
          message.error('Pipeline seçimi zorunludur');
          return;
        }
        if (!values.stageId) {
          message.error('Aşama seçimi zorunludur');
          return;
        }

        const payload = {
          name: values.name,
          customerId: values.customerId,
          pipelineId: values.pipelineId,
          stageId: values.stageId,
          amount: values.amount,
          probability: values.probability,
          expectedCloseDate: values.expectedCloseDate?.toISOString(),
          description: values.description,
        };

        await createOpportunity.mutateAsync(payload as any);
      }
      setModalOpen(false);
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || 'İşlem başarısız';
      message.error(errorMessage);
      console.error('❌ Opportunity creation error:', error);
    }
  };

  const handleWin = async (opportunity: OpportunityDto) => {
    Modal.confirm({
      title: 'Fırsatı Kazanıldı Olarak İşaretle',
      content: `"${opportunity.name}" fırsatını kazanıldı olarak işaretlemek istediğinizden emin misiniz?`,
      okText: 'Kazanıldı İşaretle',
      okType: 'primary',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await winOpportunity.mutateAsync({
            id: opportunity.id,
            actualAmount: opportunity.amount,
            closedDate: new Date().toISOString(),
          });
          message.success('🎉 Fırsat kazanıldı!');
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || 'İşlem başarısız';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleLose = async (opportunity: OpportunityDto) => {
    Modal.confirm({
      title: 'Fırsatı Kaybedildi Olarak İşaretle',
      content: `"${opportunity.name}" fırsatını kaybedildi olarak işaretlemek istediğinizden emin misiniz?`,
      okText: 'Kaybedildi İşaretle',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await loseOpportunity.mutateAsync({
            id: opportunity.id,
            lostReason: 'Kullanıcı tarafından kapatıldı',
            closedDate: new Date().toISOString(),
          });
          message.info('Fırsat kaybedildi olarak işaretlendi');
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || 'İşlem başarısız';
          message.error(errorMessage);
        }
      },
    });
  };

  // OpportunityCard Component
  const OpportunityCard = ({ opportunity }: { opportunity: OpportunityDto }) => {
    const config = statusConfig[opportunity.status];
    const isActive = opportunity.status !== 'ClosedWon' && opportunity.status !== 'ClosedLost';

    return (
      <Card
        className="hover:shadow-lg transition-all duration-300 cursor-pointer"
        bodyStyle={{ padding: '20px' }}
        onClick={() => router.push(`/crm/opportunities/${opportunity.id}`)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Text strong className="text-base block mb-1">
              {opportunity.name}
            </Text>
            {opportunity.description && (
              <Text className="text-xs text-gray-500 block mb-2">
                {opportunity.description}
              </Text>
            )}
          </div>
          <Tag color={config.color} className="ml-2">
            {config.icon} {config.label}
          </Tag>
        </div>

        <div className="mb-3">
          <div className="text-2xl font-bold text-green-600 mb-1">
            ₺{opportunity.amount.toLocaleString('tr-TR')}
          </div>
          <div className="flex items-center gap-2">
            <Text className="text-xs text-gray-500">Olasılık:</Text>
            <Progress
              percent={opportunity.probability}
              size="small"
              className="flex-1"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>
        </div>

        {opportunity.customerName && (
          <div className="mb-2 text-xs text-gray-600 flex items-center gap-1">
            <UserOutlined className="text-gray-400" />
            <span>{opportunity.customerName}</span>
          </div>
        )}

        {opportunity.expectedCloseDate && (
          <div className="mb-3 text-xs text-gray-500">
            📅 Tahmini Kapanış: {dayjs(opportunity.expectedCloseDate).format('DD MMMM YYYY')}
          </div>
        )}

        {isActive && (
          <Space size="small" className="w-full">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleWin(opportunity);
              }}
              block
            >
              Kazanıldı
            </Button>
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleLose(opportunity);
              }}
              block
            >
              Kaybedildi
            </Button>
          </Space>
        )}
      </Card>
    );
  };

  // Group opportunities by status
  const opportunitiesByStatus = Object.keys(statusConfig).reduce((acc, status) => {
    acc[status as OpportunityStatus] = opportunities.filter(
      (o: OpportunityDto) => o.status === status
    );
    return acc;
  }, {} as Record<OpportunityStatus, OpportunityDto[]>);

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-2 !text-gray-800">
              Fırsatlar
            </Title>
            <Text className="text-gray-500 text-base">
              Satış fırsatlarınızı yönetin ve takip edin
            </Text>
          </div>
          <Space size="middle">
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              Yenile
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Yeni Fırsat
            </Button>
          </Space>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <Statistic
                title="Toplam Fırsat"
                value={stats.total}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <Statistic
                title="Toplam Değer"
                value={stats.totalValue}
                prefix="₺"
                precision={0}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <Statistic
                title="Kazanılan"
                value={stats.won}
                suffix={`/ ₺${stats.wonValue.toLocaleString('tr-TR')}`}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <Statistic
                title="Ortalama Olasılık"
                value={stats.avgProbability}
                suffix="%"
                precision={0}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Opportunities Grid by Status */}
      <div className="space-y-6">
        {Object.entries(opportunitiesByStatus).map(([status, opps]) => {
          if (opps.length === 0) return null;
          const config = statusConfig[status as OpportunityStatus];

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                title={
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span>{config.label}</span>
                    <Tag color={config.color}>{opps.length}</Tag>
                  </div>
                }
              >
                <Row gutter={[16, 16]}>
                  {opps.map(opportunity => (
                    <Col key={opportunity.id} xs={24} sm={12} lg={8} xl={6}>
                      <OpportunityCard opportunity={opportunity} />
                    </Col>
                  ))}
                </Row>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {opportunities.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            <BarChartOutlined style={{ fontSize: 48 }} />
          </div>
          <Text className="text-gray-500">Henüz fırsat yok</Text>
          <div className="mt-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              İlk Fırsatı Oluştur
            </Button>
          </div>
        </Card>
      )}

      {/* Opportunity Modal */}
      <OpportunityModal
        open={modalOpen}
        opportunity={selectedOpportunity}
        loading={createOpportunity.isPending || pipelinesLoading}
        pipelines={pipelines}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
