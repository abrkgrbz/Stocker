'use client';

import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Modal,
  message,
  Avatar,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DollarOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { Deal } from '@/lib/api/services/crm.service';
import {
  useDeals,
  useCreateDeal,
  useUpdateDeal,
  useDeleteDeal,
  useMoveDealStage,
  useCloseDealWon,
  useCloseDealLost,
} from '@/lib/api/hooks/useCRM';
import { DealsStats } from '@/components/crm/deals/DealsStats';
import { DealModal } from '@/features/deals/components';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Pipeline stages
const stages = [
  { id: 1, name: 'Yeni', color: '#1890ff' },
  { id: 2, name: 'İletişim', color: '#13c2c2' },
  { id: 3, name: 'Teklif', color: '#52c41a' },
  { id: 4, name: 'Müzakere', color: '#faad14' },
  { id: 5, name: 'Kapalı', color: '#722ed1' },
];

// Status colors
const statusColors: Record<Deal['status'], string> = {
  Open: 'blue',
  Won: 'green',
  Lost: 'red',
};

export default function DealsPage() {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // API Hooks
  const { data, isLoading, refetch } = useDeals({});
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const moveDealStage = useMoveDealStage();
  const closeDealWon = useCloseDealWon();
  const closeDealLost = useCloseDealLost();

  const deals = data?.items || [];

  // Calculate statistics
  const stats = {
    total: deals.filter((d) => d.status === 'Open').length,
    totalAmount: deals.filter((d) => d.status === 'Open').reduce((sum, d) => sum + d.amount, 0),
    won: deals.filter((d) => d.status === 'Won').length,
    wonAmount: deals.filter((d) => d.status === 'Won').reduce((sum, d) => sum + d.amount, 0),
  };

  const handleCreate = () => {
    setSelectedDeal(null);
    setModalOpen(true);
  };

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Fırsatı Sil',
      content: 'Bu fırsatı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteDeal.mutateAsync(id);
          message.success('Fırsat silindi');
        } catch (error) {
          message.error('Silme işlemi başarısız');
        }
      },
    });
  };

  const handleMoveStage = async (dealId: number, newStageId: number) => {
    try {
      await moveDealStage.mutateAsync({
        id: dealId.toString(),
        newStageId: newStageId.toString(),
      });
      message.success('Fırsat aşaması değiştirildi');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Aşama değiştirme başarısız';
      message.error(errorMessage);
    }
  };

  const handleCloseWon = async (deal: Deal) => {
    Modal.confirm({
      title: 'Fırsatı Kazanıldı Olarak İşaretle',
      content: `"${deal.title}" fırsatını kazanıldı olarak işaretlemek istediğinizden emin misiniz?`,
      okText: 'Kazanıldı İşaretle',
      okType: 'primary',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await closeDealWon.mutateAsync({
            id: deal.id.toString(),
            actualAmount: deal.amount,
            closedDate: new Date().toISOString(),
          });
          message.success('🎉 Fırsat kazanıldı olarak işaretlendi!');
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleCloseLost = async (deal: Deal) => {
    Modal.confirm({
      title: 'Fırsatı Kaybedildi Olarak İşaretle',
      content: `"${deal.title}" fırsatını kaybedildi olarak işaretlemek istediğinizden emin misiniz?`,
      okText: 'Kaybedildi İşaretle',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await closeDealLost.mutateAsync({
            id: deal.id.toString(),
            lostReason: 'Kullanıcı tarafından kapatıldı',
            closedDate: new Date().toISOString(),
          });
          message.info('Fırsat kaybedildi olarak işaretlendi');
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
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

      const dealData: any = {
        title: values.title,
        customerId: values.customerId,
        amount: values.amount,
        probability: values.probability || 50,
        expectedCloseDate: values.expectedCloseDate.toISOString(),
        status: values.status || 'Open',
        priority: values.priority || 'Medium',
      };

      // Add optional fields only if they have values (avoid sending undefined)
      if (values.description) dealData.description = values.description;
      if (values.pipelineId) dealData.pipelineId = values.pipelineId;
      if (values.stageId) dealData.currentStageId = values.stageId;

      if (selectedDeal) {
        await updateDeal.mutateAsync({ id: selectedDeal.id, data: dealData });
        message.success('Fırsat güncellendi');
      } else {
        await createDeal.mutateAsync(dealData);
        message.success('Fırsat oluşturuldu');
      }
      setModalOpen(false);
    } catch (error: any) {
      // Extract API error details
      const apiError = error.response?.data;
      let errorMessage = 'İşlem başarısız';

      if (apiError) {
        errorMessage = apiError.detail ||
                      apiError.errors?.[0]?.message ||
                      apiError.title ||
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    }
  };

  const handleDragEnd = async (dealId: number, newStageId: number) => {
    try {
      await updateDeal.mutateAsync({ id: dealId, data: { stageId: newStageId } });
      message.success('Fırsat aşaması güncellendi');
    } catch (error: any) {
      // Extract API error details
      const apiError = error.response?.data;
      let errorMessage = 'Güncelleme başarısız';

      if (apiError) {
        errorMessage = apiError.detail ||
                      apiError.errors?.[0]?.message ||
                      apiError.title ||
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    }
  };

  // Filter deals based on search
  const filteredDeals = deals.filter((deal) => {
    const searchLower = searchText.toLowerCase();
    return deal.title.toLowerCase().includes(searchLower) || deal.description?.toLowerCase().includes(searchLower) || '';
  });

  // Group deals by stage for Kanban view
  const dealsByStage = stages.reduce(
    (acc, stage) => {
      acc[stage.id] = filteredDeals.filter((d) => d.stageId === stage.id && d.status === 'Open');
      return acc;
    },
    {} as Record<number, Deal[]>
  );

  // Deal Card Component
  const DealCard = ({ deal }: { deal: Deal }) => (
    <Card
      className="mb-3 hover:shadow-md transition-shadow"
      bodyStyle={{ padding: '12px' }}
    >
      <div className="flex justify-between items-start mb-2">
        <Text strong className="text-sm cursor-pointer" onClick={() => handleEdit(deal)}>
          {deal.title}
        </Text>
        <Tag color={statusColors[deal.status]}>{deal.status}</Tag>
      </div>

      <div className="text-lg font-semibold text-green-600 mb-2">
        ₺{deal.amount.toLocaleString('tr-TR')}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <Tooltip title="Olasılık">
          <span>{deal.probability}%</span>
        </Tooltip>
        {deal.expectedCloseDate && (
          <Tooltip title="Tahmini Kapanış">
            <span>{dayjs(deal.expectedCloseDate).format('DD/MM/YYYY')}</span>
          </Tooltip>
        )}
      </div>

      {/* Action Buttons - Only show for Open deals */}
      {deal.status === 'Open' && (
        <Space size="small" className="w-full" direction="vertical">
          <Space size="small" className="w-full">
            <Tooltip title="Kazanıldı">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseWon(deal);
                }}
                block
              >
                Kazanıldı
              </Button>
            </Tooltip>
            <Tooltip title="Kaybedildi">
              <Button
                danger
                size="small"
                icon={<StopOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseLost(deal);
                }}
                block
              >
                Kaybedildi
              </Button>
            </Tooltip>
          </Space>
        </Space>
      )}
    </Card>
  );

  // Kanban View
  const KanbanView = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageDeals = dealsByStage[stage.id] || [];
        const stageAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);

        return (
          <div key={stage.id} className="flex-shrink-0" style={{ width: 300 }}>
            <Card
              title={
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span>{stage.name}</span>
                    <Tag>{stageDeals.length}</Tag>
                  </div>
                  <div className="text-sm font-normal text-gray-500 mt-1">
                    ₺{stageAmount.toLocaleString('tr-TR')}
                  </div>
                </div>
              }
              className="h-full"
              bodyStyle={{ padding: '12px', maxHeight: '600px', overflowY: 'auto' }}
            >
              {stageDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
              {stageDeals.length === 0 && (
                <div className="text-center text-gray-400 py-4">Fırsat yok</div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );

  // List View
  const ListView = () => (
    <Card>
      <div className="space-y-3">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className="cursor-pointer hover:shadow-md" onClick={() => handleEdit(deal)}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Text strong className="text-lg">
                    {deal.title}
                  </Text>
                  <Tag color={stages.find((s) => s.id === deal.stageId)?.color}>
                    {stages.find((s) => s.id === deal.stageId)?.name}
                  </Tag>
                  <Tag color={statusColors[deal.status]}>{deal.status}</Tag>
                </div>
                {deal.description && <Text type="secondary">{deal.description}</Text>}
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-green-600">
                  ₺{deal.amount.toLocaleString('tr-TR')}
                </div>
                <div className="text-sm text-gray-500">Olasılık: {deal.probability}%</div>
                {deal.expectedCloseDate && (
                  <div className="text-sm text-gray-500">
                    {dayjs(deal.expectedCloseDate).format('DD/MM/YYYY')}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filteredDeals.length === 0 && (
          <div className="text-center text-gray-400 py-8">Fırsat bulunamadı</div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="p-6">
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <div className="flex justify-between items-center">
            <Title level={2} className="!mb-0">
              Fırsatlar
            </Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                Yenile
              </Button>
              <Button.Group>
                <Button
                  type={viewMode === 'kanban' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('kanban')}
                >
                  Kanban
                </Button>
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode('list')}
                >
                  Liste
                </Button>
              </Button.Group>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Yeni Fırsat
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      <div className="mb-6">
        <DealsStats
          totalDeals={stats.total}
          totalAmount={stats.totalAmount}
          wonDeals={stats.won}
          wonAmount={stats.wonAmount}
          loading={isLoading}
        />
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col flex="auto">
          <Input
            placeholder="Fırsat ara..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
            allowClear
          />
        </Col>
      </Row>

      {viewMode === 'kanban' ? <KanbanView /> : <ListView />}

      {/* Create/Edit Modal */}
      <DealModal
        open={modalOpen}
        deal={selectedDeal}
        loading={createDeal.isPending || updateDeal.isPending}
        stages={stages}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}
