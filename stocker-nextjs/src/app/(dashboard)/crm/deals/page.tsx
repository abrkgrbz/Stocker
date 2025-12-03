'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  showUpdateSuccess,
  showDeleteSuccess,
  showError,
  confirmDelete,
  confirmAction,
  showInfo,
} from '@/lib/utils/sweetalert';
import type { Deal } from '@/lib/api/services/crm.service';
import {
  useDeals,
  useDeleteDeal,
  useCloseDealWon,
  useCloseDealLost,
  usePipelines,
} from '@/lib/api/hooks/useCRM';
import { DealsStats } from '@/components/crm/deals/DealsStats';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Status colors
const statusColors: Record<Deal['status'], string> = {
  Open: 'blue',
  Won: 'green',
  Lost: 'red',
};

export default function DealsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // API Hooks
  const { data, isLoading, refetch } = useDeals({});
  const { data: pipelines = [] } = usePipelines();
  const deleteDeal = useDeleteDeal();
  const closeDealWon = useCloseDealWon();
  const closeDealLost = useCloseDealLost();

  // Handle both response formats: array or { items: [] }
  const deals = Array.isArray(data) ? data : (data?.items || []);

  // Get default pipeline's stages for kanban/list view
  const defaultPipeline = pipelines.find((p) => p.isDefault) || pipelines[0];
  const stages = defaultPipeline?.stages || [];

  // Calculate statistics
  const stats = {
    total: deals.filter((d) => d.status === 'Open').length,
    totalAmount: deals.filter((d) => d.status === 'Open').reduce((sum, d) => sum + d.amount, 0),
    won: deals.filter((d) => d.status === 'Won').length,
    wonAmount: deals.filter((d) => d.status === 'Won').reduce((sum, d) => sum + d.amount, 0),
  };

  const handleCreate = () => {
    router.push('/crm/deals/new');
  };

  const handleEdit = (deal: Deal) => {
    router.push(`/crm/deals/${deal.id}/edit`);
  };

  const handleDelete = async (id: string, deal: Deal) => {
    const confirmed = await confirmDelete('Fırsat', deal.title);

    if (confirmed) {
      try {
        await deleteDeal.mutateAsync(id);
        showDeleteSuccess('fırsat');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const handleCloseWon = async (deal: Deal) => {
    const confirmed = await confirmAction(
      'Fırsatı Kazanıldı Olarak İşaretle',
      `"${deal.title}" fırsatını kazanıldı olarak işaretlemek istediğinizden emin misiniz?`,
      'Kazanıldı İşaretle'
    );

    if (confirmed) {
      try {
        await closeDealWon.mutateAsync({
          id: deal.id.toString(),
          actualAmount: deal.amount,
          closedDate: new Date().toISOString(),
        });
        showUpdateSuccess('fırsat', '🎉 kazanıldı olarak işaretlendi!');
      } catch (error: any) {
        const apiError = error.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
        showError(errorMessage);
      }
    }
  };

  const handleCloseLost = async (deal: Deal) => {
    const confirmed = await confirmAction(
      'Fırsatı Kaybedildi Olarak İşaretle',
      `"${deal.title}" fırsatını kaybedildi olarak işaretlemek istediğinizden emin misiniz?`,
      'Kaybedildi İşaretle'
    );

    if (confirmed) {
      try {
        await closeDealLost.mutateAsync({
          id: deal.id.toString(),
          lostReason: 'Kullanıcı tarafından kapatıldı',
          closedDate: new Date().toISOString(),
        });
        showInfo('Fırsat İşaretlendi', 'Fırsat kaybedildi olarak işaretlendi');
      } catch (error: any) {
        const apiError = error.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
        showError(errorMessage);
      }
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
      // For "Kazanıldı" stage, show both Open deals in this stage AND all Won deals
      const isWonStage = stage.name.toLowerCase().includes('kazanıldı') || stage.name.toLowerCase().includes('kazanildi');

      if (isWonStage) {
        acc[stage.id] = filteredDeals.filter((d) =>
          (d.stageId === stage.id && d.status === 'Open') || d.status === 'Won'
        );
      } else {
        acc[stage.id] = filteredDeals.filter((d) => d.stageId === stage.id && d.status === 'Open');
      }
      return acc;
    },
    {} as Record<string, Deal[]>
  );

  // Get deals without a stage (for "Aşamasız" column)
  const dealsWithoutStage = filteredDeals.filter((d) => !d.stageId && d.status === 'Open');

  // Deal Card Component
  const DealCard = ({ deal }: { deal: Deal }) => {
    // Determine card styling based on status
    const cardClassName = deal.status === 'Won'
      ? "mb-3 hover:shadow-md transition-shadow cursor-pointer border-2 border-green-400 bg-green-50"
      : deal.status === 'Lost'
      ? "mb-3 hover:shadow-md transition-shadow cursor-pointer border-2 border-red-400 bg-red-50 opacity-75"
      : "mb-3 hover:shadow-md transition-shadow cursor-pointer border border-gray-200";

    return (
      <Card
        className={cardClassName}
        bodyStyle={{ padding: '12px' }}
        onClick={() => router.push(`/crm/deals/${deal.id}`)}
      >
        {/* Header: Title + Status */}
        <div className="flex justify-between items-start mb-2">
          <Text strong className="text-base flex-1">
            {deal.status === 'Lost' && <StopOutlined className="text-red-500 mr-1" />}
            {deal.status === 'Won' && <TrophyOutlined className="text-green-500 mr-1" />}
            {deal.title}
          </Text>
          <Tag color={statusColors[deal.status]} className="ml-2">
            {deal.status === 'Open' ? 'Açık' : deal.status === 'Won' ? '🎉 Kazanıldı' : '❌ Kaybedildi'}
          </Tag>
        </div>

      {/* Customer Name */}
      {deal.customerName && (
        <div className="text-sm text-gray-600 mb-3 flex items-center gap-1">
          <UserOutlined className="text-gray-400" />
          <span>{deal.customerName}</span>
        </div>
      )}

      {/* Deal Amount - Prominent */}
      <div className="text-2xl font-bold text-gray-900 mb-3">
        ₺{deal.amount.toLocaleString('tr-TR')}
      </div>

      {/* Metadata: Probability + Date */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
        <Tooltip title="Kazanma Olasılığı">
          <span className="font-medium">{deal.probability}% olasılık</span>
        </Tooltip>
        {deal.expectedCloseDate && (
          <Tooltip title="Tahmini Kapanış Tarihi">
            <span>{dayjs(deal.expectedCloseDate).format('DD/MM/YYYY')}</span>
          </Tooltip>
        )}
      </div>

      {/* Action Buttons - Only show for Open deals */}
      {deal.status === 'Open' && (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleCloseWon(deal);
            }}
            className="flex-1"
          >
            Kazanıldı
          </Button>
          <Button
            danger
            size="small"
            icon={<StopOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleCloseLost(deal);
            }}
            className="flex-1"
          >
            Kaybedildi
          </Button>
        </div>
      )}

      {/* Status Message for Closed Deals */}
      {deal.status === 'Won' && (
        <div className="text-center text-green-600 font-medium text-sm pt-2">
          <TrophyOutlined /> Başarıyla tamamlandı!
        </div>
      )}
      {deal.status === 'Lost' && (
        <div className="text-center text-red-600 font-medium text-sm pt-2">
          <CloseCircleOutlined /> Kaybedildi
        </div>
      )}
    </Card>
    );
  };

  // Get lost deals only (Won deals are shown in pipeline stages)
  const lostDeals = filteredDeals.filter((d) => d.status === 'Lost');
  const lostAmount = lostDeals.reduce((sum, d) => sum + d.amount, 0);

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

      {/* Aşamasız (No Stage) Column */}
      {dealsWithoutStage.length > 0 && (
        <div className="flex-shrink-0" style={{ width: 300 }}>
          <Card
            title={
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span>Aşamasız</span>
                  <Tag>{dealsWithoutStage.length}</Tag>
                </div>
                <div className="text-sm font-normal text-gray-500 mt-1">
                  ₺{dealsWithoutStage.reduce((sum, d) => sum + d.amount, 0).toLocaleString('tr-TR')}
                </div>
              </div>
            }
            className="h-full"
            bodyStyle={{ padding: '12px', maxHeight: '600px', overflowY: 'auto' }}
          >
            {dealsWithoutStage.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </Card>
        </div>
      )}

      {/* Kaybedildi (Lost) Column */}
      <div className="flex-shrink-0" style={{ width: 300 }}>
        <Card
          title={
            <div>
              <div className="flex items-center gap-2">
                <StopOutlined className="text-red-500" />
                <span>❌ Kaybedildi</span>
                <Tag color="red">{lostDeals.length}</Tag>
              </div>
              <div className="text-sm font-normal text-red-600 mt-1">
                ₺{lostAmount.toLocaleString('tr-TR')}
              </div>
            </div>
          }
          className="h-full border-2 border-red-400"
          bodyStyle={{ padding: '12px', maxHeight: '600px', overflowY: 'auto', backgroundColor: '#fff1f0' }}
        >
          {lostDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
          {lostDeals.length === 0 && (
            <div className="text-center text-gray-400 py-4">Kaybedilen fırsat yok</div>
          )}
        </Card>
      </div>
    </div>
  );

  // List View
  const ListView = () => (
    <Card>
      <div className="space-y-3">
        {filteredDeals.map((deal) => {
          // Determine card styling based on status
          const listCardClassName = deal.status === 'Won'
            ? "cursor-pointer hover:shadow-md border-2 border-green-400 bg-green-50"
            : deal.status === 'Lost'
            ? "cursor-pointer hover:shadow-md border-2 border-red-400 bg-red-50 opacity-75"
            : "cursor-pointer hover:shadow-md";

          return (
            <Card key={deal.id} className={listCardClassName} onClick={() => router.push(`/crm/deals/${deal.id}`)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {deal.status === 'Lost' && <StopOutlined className="text-red-500" />}
                    {deal.status === 'Won' && <TrophyOutlined className="text-green-500" />}
                    <Text strong className="text-lg">
                      {deal.title}
                    </Text>
                    <Tag color={stages.find((s) => s.id === deal.stageId)?.color}>
                      {stages.find((s) => s.id === deal.stageId)?.name}
                    </Tag>
                    <Tag color={statusColors[deal.status as Deal['status']]}>
                      {deal.status === 'Open' ? 'Açık' : deal.status === 'Won' ? '🎉 Kazanıldı' : '❌ Kaybedildi'}
                    </Tag>
                  </div>
                {deal.description && <Text type="secondary">{deal.description}</Text>}
                {deal.customerName && (
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <UserOutlined className="text-gray-400" />
                    <span>{deal.customerName}</span>
                  </div>
                )}
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
          );
        })}
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
            <div className="flex items-center gap-4">
              <Title level={2} className="!mb-0">
                Fırsatlar
              </Title>
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
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
                size="large"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
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

      {isLoading ? (
        <Card className="text-center py-16">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-500">Fırsatlar yükleniyor...</div>
        </Card>
      ) : viewMode === 'kanban' ? (
        <KanbanView />
      ) : (
        <ListView />
      )}
    </div>
  );
}
