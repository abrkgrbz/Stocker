'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Select,
  Tabs,
  Progress,
  Typography,
  Tooltip,
  Badge,
  Alert,
  Spin,
  Empty,
  Descriptions,
} from 'antd';
import {
  BarChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  BulbOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DollarOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  AreaChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useAbcXyzAnalysis,
  useInventoryTurnoverAnalysis,
  useDeadStockAnalysis,
  useInventoryHealthScore,
  useCategories,
  useWarehouses,
  useBrands,
} from '@/lib/api/hooks/useInventory';
import type {
  AbcXyzAnalysisSummaryDto,
  ProductAbcXyzDto,
  AbcXyzMatrixCellDto,
  InventoryTurnoverDto,
  DeadStockItemDto,
  InventoryHealthScoreDto,
  AbcClass,
  XyzClass,
  AbcXyzClass,
} from '@/lib/api/services/inventory.types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// ABC/XYZ class color helpers
const getAbcColor = (abcClass: AbcClass) => {
  switch (abcClass) {
    case 'A': return '#52c41a';
    case 'B': return '#faad14';
    case 'C': return '#ff4d4f';
    default: return '#8c8c8c';
  }
};

const getXyzColor = (xyzClass: XyzClass) => {
  switch (xyzClass) {
    case 'X': return '#1890ff';
    case 'Y': return '#722ed1';
    case 'Z': return '#eb2f96';
    default: return '#8c8c8c';
  }
};

const getMatrixCellColor = (combinedClass: AbcXyzClass) => {
  const colorMap: Record<AbcXyzClass, string> = {
    AX: '#52c41a',
    AY: '#73d13d',
    AZ: '#95de64',
    BX: '#1890ff',
    BY: '#40a9ff',
    BZ: '#69c0ff',
    CX: '#faad14',
    CY: '#ffc53d',
    CZ: '#ffd666',
  };
  return colorMap[combinedClass] || '#8c8c8c';
};

const getPriorityBadge = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
    case 'yüksek':
    case 'high':
      return <Badge status="error" text={priority} />;
    case 'medium':
    case 'orta':
      return <Badge status="warning" text={priority} />;
    case 'low':
    case 'düşük':
      return <Badge status="success" text={priority} />;
    default:
      return <Badge status="default" text={priority} />;
  }
};

const getHealthScoreColor = (score: number) => {
  if (score >= 80) return '#52c41a';
  if (score >= 60) return '#faad14';
  if (score >= 40) return '#fa8c16';
  return '#ff4d4f';
};

const getTrendIcon = (trend: string) => {
  switch (trend?.toLowerCase()) {
    case 'improving':
    case 'up':
      return <RiseOutlined style={{ color: '#52c41a' }} />;
    case 'declining':
    case 'down':
      return <FallOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return <span style={{ color: '#8c8c8c' }}>→</span>;
  }
};

export default function InventoryAnalysisPage() {
  const [activeTab, setActiveTab] = useState('abcxyz');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>();
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>();
  const [analysisPeriodDays, setAnalysisPeriodDays] = useState(365);

  // Base data queries
  const { data: categories } = useCategories();
  const { data: warehouses } = useWarehouses();
  const { data: brands } = useBrands();

  // Analysis queries
  const abcXyzFilter = {
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
    brandId: selectedBrandId,
    analysisPeriodDays,
  };

  const { data: abcXyzData, isLoading: abcXyzLoading, refetch: refetchAbcXyz } = useAbcXyzAnalysis(abcXyzFilter);
  const { data: turnoverData, isLoading: turnoverLoading } = useInventoryTurnoverAnalysis({
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
    analysisPeriodDays,
  });
  const { data: deadStockData, isLoading: deadStockLoading } = useDeadStockAnalysis({
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
  });
  const { data: healthScore, isLoading: healthLoading, refetch: refetchHealth } = useInventoryHealthScore({
    warehouseId: selectedWarehouseId,
    categoryId: selectedCategoryId,
  });

  // ABC/XYZ Matrix Component
  const AbcXyzMatrix = ({ matrix }: { matrix: AbcXyzMatrixCellDto[] }) => {
    const matrixMap = useMemo(() => {
      const map: Record<string, AbcXyzMatrixCellDto> = {};
      matrix?.forEach((cell) => {
        map[cell.combinedClass] = cell;
      });
      return map;
    }, [matrix]);

    const renderCell = (abcClass: 'A' | 'B' | 'C', xyzClass: 'X' | 'Y' | 'Z') => {
      const combinedClass = `${abcClass}${xyzClass}` as AbcXyzClass;
      const cell = matrixMap[combinedClass];
      if (!cell) return null;

      return (
        <Tooltip
          title={
            <div>
              <p><strong>Strateji:</strong> {cell.recommendedStrategy}</p>
              <p><strong>Öncelik:</strong> {cell.managementPriority}</p>
              <p><strong>Toplam Gelir:</strong> {cell.totalRevenue?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
              <p><strong>Stok Değeri:</strong> {cell.totalStockValue?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
            </div>
          }
        >
          <div
            style={{
              backgroundColor: getMatrixCellColor(combinedClass),
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#fff',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
            }}
          >
            <Text strong style={{ color: '#fff', fontSize: '18px' }}>{combinedClass}</Text>
            <Text style={{ color: '#fff' }}>{cell.productCount} ürün</Text>
            <Text style={{ color: '#fff', fontSize: '12px' }}>%{cell.productPercentage?.toFixed(1)}</Text>
          </div>
        </Tooltip>
      );
    };

    return (
      <div style={{ padding: '16px' }}>
        <Row gutter={[8, 8]}>
          <Col span={6}></Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Tag color="blue" style={{ margin: 0 }}>X - Stabil</Tag>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Tag color="purple" style={{ margin: 0 }}>Y - Dalgalı</Tag>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Tag color="magenta" style={{ margin: 0 }}>Z - Düzensiz</Tag>
          </Col>
        </Row>
        <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
          <Col span={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag color="green" style={{ margin: 0 }}>A - Yüksek Değer</Tag>
          </Col>
          <Col span={6}>{renderCell('A', 'X')}</Col>
          <Col span={6}>{renderCell('A', 'Y')}</Col>
          <Col span={6}>{renderCell('A', 'Z')}</Col>
        </Row>
        <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
          <Col span={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag color="orange" style={{ margin: 0 }}>B - Orta Değer</Tag>
          </Col>
          <Col span={6}>{renderCell('B', 'X')}</Col>
          <Col span={6}>{renderCell('B', 'Y')}</Col>
          <Col span={6}>{renderCell('B', 'Z')}</Col>
        </Row>
        <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
          <Col span={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag color="red" style={{ margin: 0 }}>C - Düşük Değer</Tag>
          </Col>
          <Col span={6}>{renderCell('C', 'X')}</Col>
          <Col span={6}>{renderCell('C', 'Y')}</Col>
          <Col span={6}>{renderCell('C', 'Z')}</Col>
        </Row>
      </div>
    );
  };

  // Health Score Gauge
  const HealthScoreGauge = ({ score, trend }: { score: number; trend: string }) => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Progress
        type="dashboard"
        percent={score}
        strokeColor={getHealthScoreColor(score)}
        format={(percent) => (
          <div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: getHealthScoreColor(score) }}>
              {percent}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {getTrendIcon(trend)} {trend}
            </div>
          </div>
        )}
        size={180}
      />
    </div>
  );

  // Product ABC/XYZ columns
  const productColumns: ColumnsType<ProductAbcXyzDto> = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div>
          <Text strong>{record.productName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.productCode}</Text>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      width: 120,
    },
    {
      title: 'ABC',
      dataIndex: 'abcClass',
      width: 60,
      render: (abcClass: AbcClass) => (
        <Tag color={getAbcColor(abcClass)} style={{ fontWeight: 'bold' }}>
          {abcClass}
        </Tag>
      ),
    },
    {
      title: 'XYZ',
      dataIndex: 'xyzClass',
      width: 60,
      render: (xyzClass: XyzClass) => (
        <Tag color={getXyzColor(xyzClass)} style={{ fontWeight: 'bold' }}>
          {xyzClass}
        </Tag>
      ),
    },
    {
      title: 'Kombine',
      dataIndex: 'combinedClass',
      width: 80,
      render: (combinedClass: AbcXyzClass) => (
        <Tag style={{ backgroundColor: getMatrixCellColor(combinedClass), color: '#fff', fontWeight: 'bold' }}>
          {combinedClass}
        </Tag>
      ),
    },
    {
      title: 'Toplam Gelir',
      dataIndex: 'totalRevenue',
      width: 130,
      render: (val: number) => val?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: 'Gelir %',
      dataIndex: 'revenuePercentage',
      width: 90,
      render: (val: number) => `%${val?.toFixed(2)}`,
    },
    {
      title: 'CV',
      dataIndex: 'coefficientOfVariation',
      width: 80,
      render: (val: number) => `${(val * 100)?.toFixed(1)}%`,
      sorter: (a, b) => a.coefficientOfVariation - b.coefficientOfVariation,
    },
    {
      title: 'Stok Değeri',
      dataIndex: 'stockValue',
      width: 130,
      render: (val: number) => val?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
    },
    {
      title: 'Tahmini Gün',
      dataIndex: 'estimatedDaysOfStock',
      width: 100,
      render: (days: number) => (
        <Tag color={days < 7 ? 'red' : days < 14 ? 'orange' : 'green'}>
          {days?.toFixed(0)} gün
        </Tag>
      ),
    },
    {
      title: 'Strateji',
      dataIndex: 'managementStrategy',
      width: 200,
      ellipsis: true,
    },
  ];

  // Turnover columns
  const turnoverColumns: ColumnsType<InventoryTurnoverDto> = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div>
          <Text strong>{record.productName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.productCode}</Text>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      width: 120,
    },
    {
      title: 'Devir Hızı',
      dataIndex: 'inventoryTurnoverRatio',
      width: 100,
      render: (val: number) => val?.toFixed(2),
      sorter: (a, b) => a.inventoryTurnoverRatio - b.inventoryTurnoverRatio,
    },
    {
      title: 'Stok Günü',
      dataIndex: 'daysOfInventory',
      width: 100,
      render: (val: number) => `${val?.toFixed(0)} gün`,
    },
    {
      title: 'Kategori',
      dataIndex: 'turnoverCategory',
      width: 120,
      render: (category: string) => {
        const colorMap: Record<string, string> = {
          'Fast': 'green',
          'Hızlı': 'green',
          'Normal': 'blue',
          'Slow': 'orange',
          'Yavaş': 'orange',
          'Very Slow': 'red',
          'Çok Yavaş': 'red',
        };
        return <Tag color={colorMap[category] || 'default'}>{category}</Tag>;
      },
    },
    {
      title: 'SMM',
      dataIndex: 'costOfGoodsSold',
      width: 130,
      render: (val: number) => val?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
    },
    {
      title: 'Benchmark',
      dataIndex: 'industryBenchmark',
      width: 100,
      render: (val: number) => val?.toFixed(2),
    },
    {
      title: 'Performans',
      dataIndex: 'performanceVsBenchmark',
      width: 120,
      render: (val: number) => (
        <Tag color={val > 0 ? 'green' : val < 0 ? 'red' : 'default'}>
          {val > 0 ? '+' : ''}{val?.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (record.isOverstocked) return <Tag color="orange">Fazla Stok</Tag>;
        if (record.isUnderstocked) return <Tag color="red">Yetersiz Stok</Tag>;
        return <Tag color="green">Normal</Tag>;
      },
    },
  ];

  // Dead stock columns
  const deadStockColumns: ColumnsType<DeadStockItemDto> = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div>
          <Text strong>{record.productName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.productCode}</Text>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      width: 120,
    },
    {
      title: 'Mevcut Stok',
      dataIndex: 'currentStock',
      width: 100,
      render: (val: number) => val?.toLocaleString('tr-TR'),
    },
    {
      title: 'Stok Değeri',
      dataIndex: 'stockValue',
      width: 130,
      render: (val: number) => val?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
      sorter: (a, b) => a.stockValue - b.stockValue,
    },
    {
      title: 'Son Satıştan Bu Yana',
      dataIndex: 'daysSinceLastSale',
      width: 150,
      render: (val: number) => `${val} gün`,
      sorter: (a, b) => a.daysSinceLastSale - b.daysSinceLastSale,
    },
    {
      title: 'Yaşlanma',
      dataIndex: 'agingCategory',
      width: 120,
      render: (category: string) => {
        const colorMap: Record<string, string> = {
          '30-60 days': 'green',
          '60-90 days': 'orange',
          '90-180 days': 'volcano',
          '180+ days': 'red',
          '30-60 gün': 'green',
          '60-90 gün': 'orange',
          '90-180 gün': 'volcano',
          '180+ gün': 'red',
        };
        return <Tag color={colorMap[category] || 'default'}>{category}</Tag>;
      },
    },
    {
      title: 'Değer Kaybı',
      dataIndex: 'depreciationRate',
      width: 100,
      render: (val: number) => (
        <Tag color={val > 0.5 ? 'red' : val > 0.2 ? 'orange' : 'green'}>
          %{(val * 100)?.toFixed(0)}
        </Tag>
      ),
    },
    {
      title: 'Tahmini Kurtarma',
      dataIndex: 'estimatedRecoveryValue',
      width: 130,
      render: (val: number) => val?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
    },
    {
      title: 'Seçenekler',
      dataIndex: 'disposalOptions',
      width: 200,
      render: (options: string[]) => (
        <Space wrap>
          {options?.slice(0, 2).map((opt, idx) => (
            <Tag key={idx} style={{ fontSize: '12px' }}>{opt}</Tag>
          ))}
          {options?.length > 2 && <Tag style={{ fontSize: '12px' }}>+{options.length - 2}</Tag>}
        </Space>
      ),
    },
  ];

  const isLoading = abcXyzLoading || turnoverLoading || deadStockLoading || healthLoading;

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <AreaChartOutlined /> Envanter Analizi
          </Title>
          <Text type="secondary">ABC/XYZ Analizi, Devir Hızı ve Ölü Stok</Text>
        </Col>
        <Col>
          <Space>
            <Select
              allowClear
              placeholder="Kategori"
              style={{ width: 180 }}
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              options={categories?.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Select
              allowClear
              placeholder="Depo"
              style={{ width: 180 }}
              value={selectedWarehouseId}
              onChange={setSelectedWarehouseId}
              options={warehouses?.map((w) => ({ value: w.id, label: w.name }))}
            />
            <Select
              allowClear
              placeholder="Marka"
              style={{ width: 150 }}
              value={selectedBrandId}
              onChange={setSelectedBrandId}
              options={brands?.map((b) => ({ value: b.id, label: b.name }))}
            />
            <Select
              value={analysisPeriodDays}
              onChange={setAnalysisPeriodDays}
              style={{ width: 120 }}
              options={[
                { value: 90, label: '90 Gün' },
                { value: 180, label: '180 Gün' },
                { value: 365, label: '365 Gün' },
              ]}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                refetchAbcXyz();
                refetchHealth();
              }}
            >
              Yenile
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Health Score Summary */}
      {healthScore && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={8}>
            <Card>
              <HealthScoreGauge score={healthScore.overallScore} trend={healthScore.healthTrend} />
              <Title level={5} style={{ textAlign: 'center', marginTop: 8 }}>Envanter Sağlığı</Title>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title="Sağlık Puanları Detayı">
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Devir Hızı"
                    value={healthScore.turnoverScore}
                    suffix="/100"
                    valueStyle={{ color: getHealthScoreColor(healthScore.turnoverScore) }}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Stok Kesintisi"
                    value={healthScore.stockoutScore}
                    suffix="/100"
                    valueStyle={{ color: getHealthScoreColor(healthScore.stockoutScore) }}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Ölü Stok"
                    value={healthScore.deadStockScore}
                    suffix="/100"
                    valueStyle={{ color: getHealthScoreColor(healthScore.deadStockScore) }}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Doğruluk"
                    value={healthScore.accuracyScore}
                    suffix="/100"
                    valueStyle={{ color: getHealthScoreColor(healthScore.accuracyScore) }}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Denge"
                    value={healthScore.balanceScore}
                    suffix="/100"
                    valueStyle={{ color: getHealthScoreColor(healthScore.balanceScore) }}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Hizmet Seviyesi"
                    value={healthScore.serviceLevel}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: getHealthScoreColor(healthScore.serviceLevel) }}
                  />
                </Col>
              </Row>
              {healthScore.improvementAreas?.length > 0 && (
                <Alert
                  type="info"
                  showIcon
                  icon={<BulbOutlined />}
                  message="İyileştirme Alanları"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {healthScore.improvementAreas.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  }
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><PieChartOutlined /> ABC/XYZ Analizi</span>} key="abcxyz">
          {abcXyzLoading ? (
            <Card><Spin size="large" style={{ display: 'block', margin: '50px auto' }} /></Card>
          ) : abcXyzData ? (
            <>
              {/* Summary Stats */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={8} lg={4}>
                  <Card>
                    <Statistic
                      title="Toplam Ürün"
                      value={abcXyzData.totalProductsAnalyzed}
                      prefix={<DatabaseOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <Card>
                    <Statistic
                      title="Toplam Gelir"
                      value={abcXyzData.totalRevenue}
                      precision={0}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <Card>
                    <Statistic
                      title="Stok Değeri"
                      value={abcXyzData.totalStockValue}
                      precision={0}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <Card>
                    <Statistic
                      title="Ort. Devir Hızı"
                      value={abcXyzData.averageInventoryTurnover}
                      precision={2}
                      prefix={<ThunderboltOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <Card>
                    <Statistic
                      title="A Sınıfı Ürün"
                      value={abcXyzData.classA?.productCount || 0}
                      valueStyle={{ color: '#52c41a' }}
                      suffix={`(${abcXyzData.classA?.productPercentage?.toFixed(1) || 0}%)`}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <Card>
                    <Statistic
                      title="Yüksek Riskli"
                      value={abcXyzData.highRiskProducts?.length || 0}
                      valueStyle={{ color: '#ff4d4f' }}
                      prefix={<WarningOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* ABC/XYZ Matrix */}
              <Card title="ABC/XYZ Matrisi" style={{ marginBottom: 24 }}>
                <AbcXyzMatrix matrix={abcXyzData.matrix} />
              </Card>

              {/* ABC and XYZ Class Summaries */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                  <Card title="ABC Sınıfları (Değer Bazlı)">
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label={<Tag color="green">A Sınıfı</Tag>}>
                        {abcXyzData.classA?.productCount} ürün - Gelir: %{abcXyzData.classA?.revenuePercentage?.toFixed(1)} -
                        Stok: ₺{abcXyzData.classA?.totalStockValue?.toLocaleString('tr-TR')}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Tag color="orange">B Sınıfı</Tag>}>
                        {abcXyzData.classB?.productCount} ürün - Gelir: %{abcXyzData.classB?.revenuePercentage?.toFixed(1)} -
                        Stok: ₺{abcXyzData.classB?.totalStockValue?.toLocaleString('tr-TR')}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Tag color="red">C Sınıfı</Tag>}>
                        {abcXyzData.classC?.productCount} ürün - Gelir: %{abcXyzData.classC?.revenuePercentage?.toFixed(1)} -
                        Stok: ₺{abcXyzData.classC?.totalStockValue?.toLocaleString('tr-TR')}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="XYZ Sınıfları (Talep Değişkenliği)">
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label={<Tag color="blue">X Sınıfı</Tag>}>
                        {abcXyzData.classX?.productCount} ürün - {abcXyzData.classX?.demandPattern} -
                        Ort. CV: %{(abcXyzData.classX?.averageCoefficientOfVariation * 100)?.toFixed(1)}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Tag color="purple">Y Sınıfı</Tag>}>
                        {abcXyzData.classY?.productCount} ürün - {abcXyzData.classY?.demandPattern} -
                        Ort. CV: %{(abcXyzData.classY?.averageCoefficientOfVariation * 100)?.toFixed(1)}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Tag color="magenta">Z Sınıfı</Tag>}>
                        {abcXyzData.classZ?.productCount} ürün - {abcXyzData.classZ?.demandPattern} -
                        Ort. CV: %{(abcXyzData.classZ?.averageCoefficientOfVariation * 100)?.toFixed(1)}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              {/* Strategic Recommendations */}
              {abcXyzData.strategicRecommendations?.length > 0 && (
                <Card title="Stratejik Öneriler" style={{ marginBottom: 24 }}>
                  {abcXyzData.strategicRecommendations.map((rec, idx) => (
                    <Alert
                      key={idx}
                      type={rec.priority === 'High' || rec.priority === 'Yüksek' ? 'warning' : 'info'}
                      showIcon
                      message={
                        <Space>
                          <Text strong>{rec.category}</Text>
                          {getPriorityBadge(rec.priority)}
                        </Space>
                      }
                      description={
                        <div>
                          <p>{rec.recommendation}</p>
                          <Text type="secondary">Etki: {rec.impact}</Text>
                          {rec.estimatedSavings && (
                            <Tag color="green" style={{ marginLeft: 8 }}>
                              Tahmini Tasarruf: ₺{rec.estimatedSavings.toLocaleString('tr-TR')}
                            </Tag>
                          )}
                        </div>
                      }
                      style={{ marginBottom: 12 }}
                    />
                  ))}
                </Card>
              )}

              {/* Top A Products and High Risk Products */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                  <Card title="En Değerli Ürünler (A Sınıfı)" size="small">
                    <Table
                      dataSource={abcXyzData.topAProducts}
                      columns={[
                        {
                          title: 'Ürün',
                          key: 'product',
                          render: (_, r) => <Text>{r.productName}</Text>,
                        },
                        {
                          title: 'Gelir',
                          dataIndex: 'totalRevenue',
                          render: (v) => `₺${v?.toLocaleString('tr-TR')}`,
                        },
                        {
                          title: 'Sınıf',
                          dataIndex: 'combinedClass',
                          render: (c: AbcXyzClass) => <Tag style={{ backgroundColor: getMatrixCellColor(c), color: '#fff' }}>{c}</Tag>,
                        },
                      ]}
                      rowKey="productId"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title={<Text type="danger"><WarningOutlined /> Yüksek Riskli Ürünler</Text>} size="small">
                    <Table
                      dataSource={abcXyzData.highRiskProducts}
                      columns={[
                        {
                          title: 'Ürün',
                          key: 'product',
                          render: (_, r) => <Text>{r.productName}</Text>,
                        },
                        {
                          title: 'Stok Günü',
                          dataIndex: 'estimatedDaysOfStock',
                          render: (d) => <Tag color="red">{d?.toFixed(0)} gün</Tag>,
                        },
                        {
                          title: 'Sınıf',
                          dataIndex: 'combinedClass',
                          render: (c: AbcXyzClass) => <Tag style={{ backgroundColor: getMatrixCellColor(c), color: '#fff' }}>{c}</Tag>,
                        },
                      ]}
                      rowKey="productId"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
              </Row>

              {/* Full Product List */}
              <Card title="Tüm Ürünler - ABC/XYZ Sınıflandırması">
                <Table
                  dataSource={[...(abcXyzData.topAProducts || []), ...(abcXyzData.highRiskProducts || [])]}
                  columns={productColumns}
                  rowKey="productId"
                  scroll={{ x: 1500 }}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </>
          ) : (
            <Empty description="ABC/XYZ analiz verisi bulunamadı" />
          )}
        </TabPane>

        <TabPane tab={<span><BarChartOutlined /> Stok Devir Hızı</span>} key="turnover">
          {turnoverLoading ? (
            <Card><Spin size="large" style={{ display: 'block', margin: '50px auto' }} /></Card>
          ) : turnoverData?.length ? (
            <Card>
              <Table
                dataSource={turnoverData}
                columns={turnoverColumns}
                rowKey="productId"
                scroll={{ x: 1400 }}
                pagination={{ pageSize: 15 }}
              />
            </Card>
          ) : (
            <Empty description="Stok devir hızı verisi bulunamadı" />
          )}
        </TabPane>

        <TabPane tab={<span><ExclamationCircleOutlined /> Ölü Stok</span>} key="deadstock">
          {deadStockLoading ? (
            <Card><Spin size="large" style={{ display: 'block', margin: '50px auto' }} /></Card>
          ) : deadStockData ? (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="Toplam Ölü Stok"
                      value={deadStockData.totalDeadStockItems}
                      prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="Ölü Stok Değeri"
                      value={deadStockData.totalDeadStockValue}
                      precision={0}
                      prefix="₺"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="Ölü Stok Oranı"
                      value={deadStockData.deadStockPercentage}
                      suffix="%"
                      precision={1}
                      valueStyle={{ color: deadStockData.deadStockPercentage > 10 ? '#ff4d4f' : '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="Tahmini Kurtarma"
                      value={deadStockData.potentialRecoveryValue}
                      precision={0}
                      prefix="₺"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
              </Row>

              {deadStockData.recommendations?.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  icon={<BulbOutlined />}
                  message="Öneriler"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {deadStockData.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  }
                  style={{ marginBottom: 24 }}
                />
              )}

              <Card title="Ölü Stok Listesi">
                <Table
                  dataSource={deadStockData.items}
                  columns={deadStockColumns}
                  rowKey="productId"
                  scroll={{ x: 1600 }}
                  pagination={{ pageSize: 15 }}
                />
              </Card>
            </>
          ) : (
            <Empty description="Ölü stok verisi bulunamadı" />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
