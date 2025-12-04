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
  Typography,
  Tooltip,
  Modal,
  Descriptions,
  Spin,
  Empty,
  Form,
  InputNumber,
  DatePicker,
  Progress,
  Divider,
} from 'antd';
import {
  DollarOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CalculatorOutlined,
  SwapOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  useInventoryValuation,
  useTotalInventoryValue,
  useProductCostingSummaries,
  useCostVarianceAnalysis,
  useCOGSReport,
  useCostLayers,
  useCostingMethods,
  useCategories,
  useWarehouses,
  useCalculateCOGS,
} from '@/lib/api/hooks/useInventory';
import type {
  ProductCostingSummaryDto,
  CostVarianceAnalysisDto,
  CostLayerDto,
  ProductValuationDto,
  CategoryValuationDto,
  MonthlyCOGSDto,
  CostingMethod,
  CostCalculationRequestDto,
  InventoryValuationFilterDto,
  COGSReportFilterDto,
} from '@/lib/api/services/inventory.types';
import { CostingMethod as CostingMethodEnum } from '@/lib/api/services/inventory.types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Helper functions
const formatCurrency = (value: number, currency: string = 'TRY') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number, decimals: number = 2) => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const getCostingMethodLabel = (method: CostingMethod) => {
  switch (method) {
    case CostingMethodEnum.FIFO:
      return 'FIFO (İlk Giren İlk Çıkar)';
    case CostingMethodEnum.LIFO:
      return 'LIFO (Son Giren İlk Çıkar)';
    case CostingMethodEnum.WeightedAverageCost:
      return 'Ağırlıklı Ortalama Maliyet';
    case CostingMethodEnum.SpecificIdentification:
      return 'Özel Tanımlama';
    case CostingMethodEnum.StandardCost:
      return 'Standart Maliyet';
    default:
      return method;
  }
};

const getCostingMethodColor = (method: CostingMethod) => {
  switch (method) {
    case CostingMethodEnum.FIFO:
      return 'blue';
    case CostingMethodEnum.LIFO:
      return 'purple';
    case CostingMethodEnum.WeightedAverageCost:
      return 'green';
    case CostingMethodEnum.StandardCost:
      return 'orange';
    default:
      return 'default';
  }
};

const getVarianceTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'favorable':
      return 'success';
    case 'unfavorable':
      return 'error';
    default:
      return 'default';
  }
};

export default function CostingPage() {
  const [activeTab, setActiveTab] = useState('valuation');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>();
  const [selectedMethod, setSelectedMethod] = useState<CostingMethod>(CostingMethodEnum.WeightedAverageCost);
  const [cogsModalVisible, setCogsModalVisible] = useState(false);
  const [productDetailModal, setProductDetailModal] = useState<ProductCostingSummaryDto | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  // Form for COGS calculation
  const [cogsForm] = Form.useForm();

  // Queries
  const { data: categories } = useCategories();
  const { data: warehouses } = useWarehouses();
  const { data: costingMethods } = useCostingMethods();

  const valuationFilter: InventoryValuationFilterDto = useMemo(() => ({
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
    method: selectedMethod,
    includeZeroQuantity: false,
  }), [selectedCategoryId, selectedWarehouseId, selectedMethod]);

  const cogsFilter: COGSReportFilterDto = useMemo(() => ({
    startDate: dateRange[0].toISOString(),
    endDate: dateRange[1].toISOString(),
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
    method: selectedMethod,
  }), [dateRange, selectedCategoryId, selectedWarehouseId, selectedMethod]);

  const { data: valuation, isLoading: valuationLoading, refetch: refetchValuation } = useInventoryValuation(valuationFilter);
  const { data: totalValue, isLoading: totalValueLoading } = useTotalInventoryValue(selectedMethod, selectedWarehouseId);
  const { data: productSummaries, isLoading: summariesLoading } = useProductCostingSummaries(selectedCategoryId, selectedWarehouseId);
  const { data: varianceAnalysis, isLoading: varianceLoading } = useCostVarianceAnalysis(selectedCategoryId);
  const { data: cogsReport, isLoading: cogsLoading } = useCOGSReport(cogsFilter);
  const { data: costLayers, isLoading: layersLoading } = useCostLayers({
    productId: undefined,
    warehouseId: selectedWarehouseId,
    pageNumber: 1,
    pageSize: 50,
  });

  const calculateCOGS = useCalculateCOGS();

  // Handle COGS calculation
  const handleCalculateCOGS = async (values: { productId: number; quantity: number; method: CostingMethod }) => {
    const request: CostCalculationRequestDto = {
      productId: values.productId,
      quantity: values.quantity,
      method: values.method,
      warehouseId: selectedWarehouseId,
    };
    await calculateCOGS.mutateAsync(request);
    setCogsModalVisible(false);
    cogsForm.resetFields();
  };

  // Table columns
  const productColumns: ColumnsType<ProductCostingSummaryDto> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      sorter: (a, b) => a.productCode.localeCompare(b.productCode),
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 150,
      filters: categories?.map((c) => ({ text: c.name, value: c.name })),
      onFilter: (value, record) => record.categoryName === value,
    },
    {
      title: 'Miktar',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
      render: (value) => formatNumber(value),
    },
    {
      title: 'Ort. Maliyet',
      dataIndex: 'weightedAverageCost',
      key: 'weightedAverageCost',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.weightedAverageCost - b.weightedAverageCost,
      render: (value, record) => formatCurrency(value, record.currency),
    },
    {
      title: 'Toplam Değer',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 150,
      align: 'right',
      sorter: (a, b) => a.totalValue - b.totalValue,
      render: (value, record) => (
        <Text strong>{formatCurrency(value, record.currency)}</Text>
      ),
    },
    {
      title: 'Katman',
      dataIndex: 'activeLayerCount',
      key: 'activeLayerCount',
      width: 80,
      align: 'center',
      render: (value) => (
        <Tag color={value > 3 ? 'orange' : 'blue'}>{value}</Tag>
      ),
    },
    {
      title: 'İşlem',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<InfoCircleOutlined />}
          onClick={() => setProductDetailModal(record)}
        >
          Detay
        </Button>
      ),
    },
  ];

  const varianceColumns: ColumnsType<CostVarianceAnalysisDto> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: 'Standart Maliyet',
      dataIndex: 'standardCost',
      key: 'standardCost',
      width: 140,
      align: 'right',
      render: (value, record) => formatCurrency(value, record.currency),
    },
    {
      title: 'Gerçek Maliyet',
      dataIndex: 'actualCost',
      key: 'actualCost',
      width: 140,
      align: 'right',
      render: (value, record) => formatCurrency(value, record.currency),
    },
    {
      title: 'Fark',
      dataIndex: 'varianceAmount',
      key: 'varianceAmount',
      width: 130,
      align: 'right',
      sorter: (a, b) => Math.abs(a.varianceAmount) - Math.abs(b.varianceAmount),
      render: (value, record) => (
        <Text type={value < 0 ? 'success' : value > 0 ? 'danger' : undefined}>
          {formatCurrency(value, record.currency)}
        </Text>
      ),
    },
    {
      title: 'Fark %',
      dataIndex: 'variancePercentage',
      key: 'variancePercentage',
      width: 100,
      align: 'right',
      render: (value) => (
        <Text type={value < 0 ? 'success' : value > 0 ? 'danger' : undefined}>
          {formatNumber(value, 1)}%
        </Text>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'varianceType',
      key: 'varianceType',
      width: 120,
      align: 'center',
      render: (type) => (
        <Tag color={getVarianceTypeColor(type)}>
          {type === 'Favorable' ? 'Olumlu' : type === 'Unfavorable' ? 'Olumsuz' : 'Nötr'}
        </Tag>
      ),
    },
    {
      title: 'Toplam Etki',
      dataIndex: 'totalVarianceImpact',
      key: 'totalVarianceImpact',
      width: 150,
      align: 'right',
      sorter: (a, b) => Math.abs(a.totalVarianceImpact) - Math.abs(b.totalVarianceImpact),
      render: (value, record) => (
        <Text strong type={value < 0 ? 'success' : value > 0 ? 'danger' : undefined}>
          {formatCurrency(value, record.currency)}
        </Text>
      ),
    },
  ];

  const layerColumns: ColumnsType<CostLayerDto> = [
    {
      title: 'Tarih',
      dataIndex: 'layerDate',
      key: 'layerDate',
      width: 110,
      render: (value) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <Text strong>{record.productCode}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.productName}</Text>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
    },
    {
      title: 'Referans',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 120,
    },
    {
      title: 'Orijinal Miktar',
      dataIndex: 'originalQuantity',
      key: 'originalQuantity',
      width: 120,
      align: 'right',
      render: (value) => formatNumber(value),
    },
    {
      title: 'Kalan Miktar',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 120,
      align: 'right',
      render: (value, record) => (
        <Text type={value === 0 ? 'secondary' : undefined}>
          {formatNumber(value)}
        </Text>
      ),
    },
    {
      title: 'Birim Maliyet',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 130,
      align: 'right',
      render: (value, record) => formatCurrency(value, record.currency),
    },
    {
      title: 'Toplam Maliyet',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 150,
      align: 'right',
      render: (value, record) => (
        <Text strong>{formatCurrency(value, record.currency)}</Text>
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'layerOrder',
      key: 'layerOrder',
      width: 70,
      align: 'center',
      render: (value) => <Tag>{value}</Tag>,
    },
  ];

  // Render stats cards
  const renderStatsCards = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={totalValueLoading}>
          <Statistic
            title="Toplam Envanter Değeri"
            value={totalValue?.totalValue || 0}
            precision={2}
            prefix={<DollarOutlined />}
            suffix="TRY"
            valueStyle={{ color: '#1890ff' }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getCostingMethodLabel(selectedMethod)}
          </Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={valuationLoading}>
          <Statistic
            title="Toplam Ürün Sayısı"
            value={valuation?.productCount || 0}
            prefix={<PieChartOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Stokta olan ürünler
          </Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={cogsLoading}>
          <Statistic
            title="Dönem SMM"
            value={cogsReport?.totalCOGS || 0}
            precision={2}
            prefix={<BarChartOutlined />}
            suffix="TRY"
            valueStyle={{ color: '#fa8c16' }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(dateRange[0]).format('DD.MM')} - {dayjs(dateRange[1]).format('DD.MM.YYYY')}
          </Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={varianceLoading}>
          <Statistic
            title="Maliyet Sapması"
            value={varianceAnalysis?.reduce((sum, v) => sum + v.totalVarianceImpact, 0) || 0}
            precision={2}
            prefix={varianceAnalysis && varianceAnalysis.reduce((sum, v) => sum + v.totalVarianceImpact, 0) < 0
              ? <CheckCircleOutlined />
              : <ExclamationCircleOutlined />}
            suffix="TRY"
            valueStyle={{
              color: varianceAnalysis && varianceAnalysis.reduce((sum, v) => sum + v.totalVarianceImpact, 0) < 0
                ? '#52c41a'
                : '#f5222d'
            }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Standart vs Gerçek
          </Text>
        </Card>
      </Col>
    </Row>
  );

  // Render filters
  const renderFilters = () => (
    <Card style={{ marginTop: 16, marginBottom: 16 }}>
      <Space wrap size="middle">
        <Space>
          <FilterOutlined />
          <Text strong>Filtreler:</Text>
        </Space>
        <Select
          placeholder="Kategori"
          allowClear
          style={{ width: 180 }}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          options={categories?.map((c) => ({ label: c.name, value: c.id }))}
        />
        <Select
          placeholder="Depo"
          allowClear
          style={{ width: 180 }}
          value={selectedWarehouseId}
          onChange={setSelectedWarehouseId}
          options={warehouses?.map((w) => ({ label: w.name, value: w.id }))}
        />
        <Select
          placeholder="Maliyetlendirme Yöntemi"
          style={{ width: 240 }}
          value={selectedMethod}
          onChange={setSelectedMethod}
          options={[
            { label: 'FIFO (İlk Giren İlk Çıkar)', value: CostingMethodEnum.FIFO },
            { label: 'LIFO (Son Giren İlk Çıkar)', value: CostingMethodEnum.LIFO },
            { label: 'Ağırlıklı Ortalama Maliyet', value: CostingMethodEnum.WeightedAverageCost },
            { label: 'Standart Maliyet', value: CostingMethodEnum.StandardCost },
          ]}
        />
        <RangePicker
          value={dateRange}
          onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
          format="DD.MM.YYYY"
        />
        <Button icon={<ReloadOutlined />} onClick={() => refetchValuation()}>
          Yenile
        </Button>
      </Space>
    </Card>
  );

  // Render category distribution
  const renderCategoryDistribution = () => {
    if (!valuation?.byCategory?.length) return null;

    const total = valuation.byCategory.reduce((sum, c) => sum + c.totalValue, 0);

    return (
      <Card title="Kategori Dağılımı" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          {valuation.byCategory.slice(0, 6).map((category) => (
            <Col xs={24} sm={12} lg={8} key={category.categoryId}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>{category.categoryName}</Text>
                  <Text strong>{formatCurrency(category.totalValue)}</Text>
                </div>
                <Progress
                  percent={Math.round((category.totalValue / total) * 100)}
                  strokeColor="#1890ff"
                  size="small"
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {category.productCount} ürün, {formatNumber(category.totalQuantity)} adet
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  // Render COGS monthly breakdown
  const renderCOGSBreakdown = () => {
    if (!cogsReport?.monthlyBreakdown?.length) return null;

    return (
      <Card title="Aylık SMM Dağılımı" style={{ marginTop: 16 }}>
        <Table
          dataSource={cogsReport.monthlyBreakdown}
          rowKey={(record) => `${record.year}-${record.month}`}
          pagination={false}
          size="small"
          columns={[
            {
              title: 'Dönem',
              dataIndex: 'monthName',
              key: 'monthName',
            },
            {
              title: 'SMM',
              dataIndex: 'cogs',
              key: 'cogs',
              align: 'right',
              render: (value) => formatCurrency(value),
            },
            {
              title: 'Satılan Miktar',
              dataIndex: 'quantitySold',
              key: 'quantitySold',
              align: 'right',
              render: (value) => formatNumber(value),
            },
            {
              title: 'Ort. Birim Maliyet',
              dataIndex: 'averageUnitCost',
              key: 'averageUnitCost',
              align: 'right',
              render: (value) => formatCurrency(value),
            },
          ]}
        />
      </Card>
    );
  };

  // Render product detail modal
  const renderProductDetailModal = () => (
    <Modal
      title={`Ürün Maliyet Detayı - ${productDetailModal?.productCode}`}
      open={!!productDetailModal}
      onCancel={() => setProductDetailModal(null)}
      footer={null}
      width={700}
    >
      {productDetailModal && (
        <div>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Ürün Kodu">{productDetailModal.productCode}</Descriptions.Item>
            <Descriptions.Item label="Ürün Adı">{productDetailModal.productName}</Descriptions.Item>
            <Descriptions.Item label="Kategori">{productDetailModal.categoryName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Maliyetlendirme Yöntemi">
              <Tag color={getCostingMethodColor(productDetailModal.costingMethod)}>
                {getCostingMethodLabel(productDetailModal.costingMethod)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Toplam Miktar">
              <Text strong>{formatNumber(productDetailModal.totalQuantity)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Toplam Değer">
              <Text strong type="success">{formatCurrency(productDetailModal.totalValue, productDetailModal.currency)}</Text>
            </Descriptions.Item>
          </Descriptions>

          <Divider>Maliyet Karşılaştırması</Divider>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="FIFO Maliyet"
                  value={productDetailModal.fifoUnitCost || 0}
                  precision={2}
                  suffix={productDetailModal.currency}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="LIFO Maliyet"
                  value={productDetailModal.lifoUnitCost || 0}
                  precision={2}
                  suffix={productDetailModal.currency}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="Ağırlıklı Ortalama"
                  value={productDetailModal.weightedAverageCost}
                  precision={2}
                  suffix={productDetailModal.currency}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {productDetailModal.standardCost && (
            <>
              <Divider>Standart Maliyet Karşılaştırması</Divider>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small">
                    <Statistic
                      title="Standart Maliyet"
                      value={productDetailModal.standardCost}
                      precision={2}
                      suffix={productDetailModal.currency}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small">
                    <Statistic
                      title="Fark (Gerçek - Standart)"
                      value={productDetailModal.weightedAverageCost - productDetailModal.standardCost}
                      precision={2}
                      suffix={productDetailModal.currency}
                      valueStyle={{
                        color: productDetailModal.weightedAverageCost < productDetailModal.standardCost
                          ? '#52c41a'
                          : '#f5222d'
                      }}
                      prefix={productDetailModal.weightedAverageCost < productDetailModal.standardCost
                        ? <CheckCircleOutlined />
                        : <WarningOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}

          <Divider>Katman Bilgileri</Divider>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Aktif Katman Sayısı">
              <Tag color="blue">{productDetailModal.activeLayerCount}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Son Hesaplama">
              {productDetailModal.lastCalculatedAt
                ? dayjs(productDetailModal.lastCalculatedAt).format('DD.MM.YYYY HH:mm')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="En Eski Katman">
              {productDetailModal.oldestLayerDate
                ? dayjs(productDetailModal.oldestLayerDate).format('DD.MM.YYYY')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="En Yeni Katman">
              {productDetailModal.newestLayerDate
                ? dayjs(productDetailModal.newestLayerDate).format('DD.MM.YYYY')
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );

  // Render COGS calculation modal
  const renderCOGSModal = () => (
    <Modal
      title="SMM Hesapla"
      open={cogsModalVisible}
      onCancel={() => {
        setCogsModalVisible(false);
        cogsForm.resetFields();
      }}
      footer={null}
    >
      <Form
        form={cogsForm}
        layout="vertical"
        onFinish={handleCalculateCOGS}
      >
        <Form.Item
          name="productId"
          label="Ürün"
          rules={[{ required: true, message: 'Ürün seçiniz' }]}
        >
          <Select
            showSearch
            placeholder="Ürün seçiniz"
            optionFilterProp="children"
            options={productSummaries?.map((p) => ({
              label: `${p.productCode} - ${p.productName}`,
              value: p.productId,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="quantity"
          label="Miktar"
          rules={[{ required: true, message: 'Miktar giriniz' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0.01}
            precision={2}
            placeholder="Miktar"
          />
        </Form.Item>
        <Form.Item
          name="method"
          label="Maliyetlendirme Yöntemi"
          initialValue={CostingMethodEnum.WeightedAverageCost}
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: 'FIFO (İlk Giren İlk Çıkar)', value: CostingMethodEnum.FIFO },
              { label: 'LIFO (Son Giren İlk Çıkar)', value: CostingMethodEnum.LIFO },
              { label: 'Ağırlıklı Ortalama Maliyet', value: CostingMethodEnum.WeightedAverageCost },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={calculateCOGS.isPending}>
              Hesapla
            </Button>
            <Button onClick={() => {
              setCogsModalVisible(false);
              cogsForm.resetFields();
            }}>
              İptal
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <DollarOutlined /> Envanter Maliyetlendirme
          </Title>
          <Text type="secondary">
            FIFO, LIFO, Ağırlıklı Ortalama Maliyet yöntemleri ile envanter değerleme
          </Text>
        </div>
        <Space>
          <Button
            icon={<CalculatorOutlined />}
            onClick={() => setCogsModalVisible(true)}
          >
            SMM Hesapla
          </Button>
          <Button icon={<SettingOutlined />}>
            Ayarlar
          </Button>
        </Space>
      </div>

      {renderStatsCards()}
      {renderFilters()}

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          tab={<span><PieChartOutlined /> Envanter Değerleme</span>}
          key="valuation"
        >
          {valuationLoading ? (
            <Spin tip="Yükleniyor..." />
          ) : productSummaries?.length ? (
            <>
              <Table
                dataSource={productSummaries}
                columns={productColumns}
                rowKey="productId"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 1000 }}
                size="small"
              />
              {renderCategoryDistribution()}
            </>
          ) : (
            <Empty description="Veri bulunamadı" />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={<span><BarChartOutlined /> SMM Raporu</span>}
          key="cogs"
        >
          {cogsLoading ? (
            <Spin tip="Yükleniyor..." />
          ) : cogsReport ? (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Toplam SMM"
                      value={cogsReport.totalCOGS}
                      precision={2}
                      suffix="TRY"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Satılan Miktar"
                      value={cogsReport.totalQuantitySold}
                      precision={0}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Başlangıç Envanter"
                      value={cogsReport.beginningInventoryValue}
                      precision={2}
                      suffix="TRY"
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Bitiş Envanter"
                      value={cogsReport.endingInventoryValue}
                      precision={2}
                      suffix="TRY"
                    />
                  </Card>
                </Col>
              </Row>
              {renderCOGSBreakdown()}
            </>
          ) : (
            <Empty description="Veri bulunamadı" />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={<span><SwapOutlined /> Maliyet Sapması</span>}
          key="variance"
        >
          {varianceLoading ? (
            <Spin tip="Yükleniyor..." />
          ) : varianceAnalysis?.length ? (
            <Table
              dataSource={varianceAnalysis}
              columns={varianceColumns}
              rowKey="productId"
              pagination={{ pageSize: 20 }}
              scroll={{ x: 1200 }}
              size="small"
            />
          ) : (
            <Empty description="Standart maliyeti tanımlı ürün bulunamadı" />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={<span><LineChartOutlined /> Maliyet Katmanları</span>}
          key="layers"
        >
          {layersLoading ? (
            <Spin tip="Yükleniyor..." />
          ) : costLayers?.items?.length ? (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Toplam Katman"
                      value={costLayers.totalCount}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Toplam Miktar"
                      value={costLayers.totalQuantity}
                      precision={2}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Toplam Değer"
                      value={costLayers.totalValue}
                      precision={2}
                      suffix="TRY"
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Ağırlıklı Ort. Maliyet"
                      value={costLayers.weightedAverageCost}
                      precision={2}
                      suffix="TRY"
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Card>
                </Col>
              </Row>
              <Table
                dataSource={costLayers.items}
                columns={layerColumns}
                rowKey="id"
                pagination={{
                  total: costLayers.totalCount,
                  pageSize: 50,
                  showSizeChanger: true,
                  showTotal: (total) => `Toplam ${total} katman`,
                }}
                scroll={{ x: 1200 }}
                size="small"
              />
            </>
          ) : (
            <Empty description="Maliyet katmanı bulunamadı" />
          )}
        </Tabs.TabPane>
      </Tabs>

      {renderProductDetailModal()}
      {renderCOGSModal()}
    </div>
  );
}
