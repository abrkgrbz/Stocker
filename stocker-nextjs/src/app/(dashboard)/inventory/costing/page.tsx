'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Select,
  Tabs,
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
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  ChartPieIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
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
  CostingMethod,
  CostCalculationRequestDto,
  InventoryValuationFilterDto,
  COGSReportFilterDto,
} from '@/lib/api/services/inventory.types';
import { CostingMethod as CostingMethodEnum } from '@/lib/api/services/inventory.types';

const { RangePicker } = DatePicker;

// Monochrome color palette
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

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
        <span className="font-medium text-slate-900">{formatCurrency(value, record.currency)}</span>
      ),
    },
    {
      title: 'Katman',
      dataIndex: 'activeLayerCount',
      key: 'activeLayerCount',
      width: 80,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">{value}</span>
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
          icon={<InformationCircleIcon className="w-4 h-4" />}
          className="!text-slate-600 hover:!text-slate-900"
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
        <span className={value < 0 ? 'text-slate-900 font-medium' : value > 0 ? 'text-slate-500' : 'text-slate-700'}>
          {formatCurrency(value, record.currency)}
        </span>
      ),
    },
    {
      title: 'Fark %',
      dataIndex: 'variancePercentage',
      key: 'variancePercentage',
      width: 100,
      align: 'right',
      render: (value) => (
        <span className={value < 0 ? 'text-slate-900 font-medium' : value > 0 ? 'text-slate-500' : 'text-slate-700'}>
          {formatNumber(value, 1)}%
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'varianceType',
      key: 'varianceType',
      width: 120,
      align: 'center',
      render: (type) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type === 'Favorable' ? 'bg-slate-900 text-white' : type === 'Unfavorable' ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-500'}`}>
          {type === 'Favorable' ? 'Olumlu' : type === 'Unfavorable' ? 'Olumsuz' : 'Nötr'}
        </span>
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
        <span className={`font-medium ${value < 0 ? 'text-slate-900 font-medium' : value > 0 ? 'text-slate-500' : 'text-slate-700'}`}>
          {formatCurrency(value, record.currency)}
        </span>
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
          <span className="font-medium text-slate-900">{record.productCode}</span>
          <br />
          <span className="text-xs text-slate-500">{record.productName}</span>
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
      render: (value) => (
        <span className={value === 0 ? 'text-slate-400' : 'text-slate-700'}>
          {formatNumber(value)}
        </span>
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
        <span className="font-medium text-slate-900">{formatCurrency(value, record.currency)}</span>
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'layerOrder',
      key: 'layerOrder',
      width: 70,
      align: 'center',
      render: (value) => <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{value}</span>,
    },
  ];

  // Tab items
  const tabItems = [
    {
      key: 'valuation',
      label: (
        <span className="flex items-center gap-2">
          <ChartPieIcon className="w-4 h-4" />
          Envanter Değerleme
        </span>
      ),
      children: (
        <>
          {valuationLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : productSummaries?.length ? (
            <>
              <Table
                dataSource={productSummaries}
                columns={productColumns}
                rowKey="productId"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 1000 }}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
              {/* Category Distribution */}
              {valuation?.byCategory?.length ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Kategori Dağılımı</h3>
                  <div className="grid grid-cols-12 gap-6">
                    {valuation.byCategory.slice(0, 6).map((category) => {
                      const total = valuation.byCategory!.reduce((sum, c) => sum + c.totalValue, 0);
                      return (
                        <div key={category.categoryId} className="col-span-12 sm:col-span-6 lg:col-span-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-700">{category.categoryName}</span>
                            <span className="font-medium text-slate-900">{formatCurrency(category.totalValue)}</span>
                          </div>
                          <Progress
                            percent={Math.round((category.totalValue / total) * 100)}
                            strokeColor={MONOCHROME_COLORS[0]}
                            size="small"
                            showInfo={false}
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            {category.productCount} ürün, {formatNumber(category.totalQuantity)} adet
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <Empty description="Veri bulunamadı" />
          )}
        </>
      ),
    },
    {
      key: 'cogs',
      label: (
        <span className="flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4" />
          SMM Raporu
        </span>
      ),
      children: (
        <>
          {cogsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : cogsReport ? (
            <>
              {/* COGS Summary Cards */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <p className="text-xs text-slate-500 mb-1">Toplam SMM</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(cogsReport.totalCOGS)}</p>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <p className="text-xs text-slate-500 mb-1">Satılan Miktar</p>
                    <p className="text-2xl font-bold text-slate-900">{formatNumber(cogsReport.totalQuantitySold, 0)}</p>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <p className="text-xs text-slate-500 mb-1">Başlangıç Envanter</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(cogsReport.beginningInventoryValue)}</p>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <p className="text-xs text-slate-500 mb-1">Bitiş Envanter</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(cogsReport.endingInventoryValue)}</p>
                  </div>
                </div>
              </div>
              {/* Monthly COGS Breakdown */}
              {cogsReport.monthlyBreakdown?.length ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Aylık SMM Dağılımı</h3>
                  <Table
                    dataSource={cogsReport.monthlyBreakdown}
                    rowKey={(record) => `${record.year}-${record.month}`}
                    pagination={false}
                    size="small"
                    className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
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
                </div>
              ) : null}
            </>
          ) : (
            <Empty description="Veri bulunamadı" />
          )}
        </>
      ),
    },
    {
      key: 'variance',
      label: (
        <span className="flex items-center gap-2">
          <ArrowsRightLeftIcon className="w-4 h-4" />
          Maliyet Sapması
        </span>
      ),
      children: (
        <>
          {varianceLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : varianceAnalysis?.length ? (
            <Table
              dataSource={varianceAnalysis}
              columns={varianceColumns}
              rowKey="productId"
              pagination={{ pageSize: 20 }}
              scroll={{ x: 1200 }}
              size="small"
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
            />
          ) : (
            <Empty description="Standart maliyeti tanımlı ürün bulunamadı" />
          )}
        </>
      ),
    },
    {
      key: 'layers',
      label: (
        <span className="flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4" />
          Maliyet Katmanları
        </span>
      ),
      children: (
        <>
          {layersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : costLayers?.items?.length ? (
            <>
              {/* Layer Summary Cards */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <p className="text-xs text-slate-500 mb-1">Toplam Katman</p>
                    <p className="text-2xl font-bold text-slate-900">{costLayers.totalCount}</p>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <p className="text-xs text-slate-500 mb-1">Toplam Miktar</p>
                    <p className="text-2xl font-bold text-slate-900">{formatNumber(costLayers.totalQuantity)}</p>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <p className="text-xs text-slate-500 mb-1">Toplam Değer</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(costLayers.totalValue)}</p>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <p className="text-xs text-slate-500 mb-1">Ağırlıklı Ort. Maliyet</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(costLayers.weightedAverageCost)}</p>
                  </div>
                </div>
              </div>
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
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            </>
          ) : (
            <Empty description="Maliyet katmanı bulunamadı" />
          )}
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <CurrencyDollarIcon className="w-4 h-4" />
            Envanter Maliyetlendirme
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            FIFO, LIFO, Ağırlıklı Ortalama Maliyet yöntemleri ile envanter değerleme
          </p>
        </div>
        <Space size="middle">
          <Button
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            onClick={() => setCogsModalVisible(true)}
          >
            SMM Hesapla
          </Button>
          <Button
            icon={<Cog6ToothIcon className="w-4 h-4" />}
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
          >
            Ayarlar
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-1">Toplam Envanter Değeri</p>
            {totalValueLoading ? (
              <Spin size="small" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalValue?.totalValue || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">{getCostingMethodLabel(selectedMethod)}</p>
              </>
            )}
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ChartPieIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-1">Toplam Ürün Sayısı</p>
            {valuationLoading ? (
              <Spin size="small" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-900">{valuation?.productCount || 0}</p>
                <p className="text-xs text-slate-400 mt-1">Stokta olan ürünler</p>
              </>
            )}
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-1">Dönem SMM</p>
            {cogsLoading ? (
              <Spin size="small" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(cogsReport?.totalCOGS || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {dayjs(dateRange[0]).format('DD.MM')} - {dayjs(dateRange[1]).format('DD.MM.YYYY')}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                varianceAnalysis && varianceAnalysis.reduce((sum, v) => sum + v.totalVarianceImpact, 0) < 0
                  ? 'bg-slate-900'
                  : 'bg-slate-200'
              }`}>
                {varianceAnalysis && varianceAnalysis.reduce((sum, v) => sum + v.totalVarianceImpact, 0) < 0 ? (
                  <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                ) : (
                  <ExclamationCircleIcon className="w-5 h-5 text-slate-600" />
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-1">Maliyet Sapması</p>
            {varianceLoading ? (
              <Spin size="small" />
            ) : (
              <>
                <p className={`text-2xl font-bold ${
                  varianceAnalysis && varianceAnalysis.reduce((sum, v) => sum + v.totalVarianceImpact, 0) < 0
                    ? 'text-slate-900'
                    : 'text-slate-500'
                }`}>
                  {formatCurrency(varianceAnalysis?.reduce((sum, v) => sum + v.totalVarianceImpact, 0) || 0)}
                </p>
                <p className="text-xs text-slate-400 mt-1">Standart vs Gerçek</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-700">Filtreler:</span>
          </div>
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
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            onClick={() => refetchValuation()}
          >
            Yenile
          </Button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="[&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />
      </div>

      {/* Product Detail Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold text-slate-900">
            Ürün Maliyet Detayı - {productDetailModal?.productCode}
          </span>
        }
        open={!!productDetailModal}
        onCancel={() => setProductDetailModal(null)}
        footer={null}
        width={700}
      >
        {productDetailModal && (
          <div>
            <Descriptions bordered size="small" column={2} className="mb-4">
              <Descriptions.Item label="Ürün Kodu">{productDetailModal.productCode}</Descriptions.Item>
              <Descriptions.Item label="Ürün Adı">{productDetailModal.productName}</Descriptions.Item>
              <Descriptions.Item label="Kategori">{productDetailModal.categoryName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Maliyetlendirme Yöntemi">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">{getCostingMethodLabel(productDetailModal.costingMethod)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Miktar">
                <span className="font-medium">{formatNumber(productDetailModal.totalQuantity)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Değer">
                <span className="font-medium text-slate-900">{formatCurrency(productDetailModal.totalValue, productDetailModal.currency)}</span>
              </Descriptions.Item>
            </Descriptions>

            <Divider className="!my-4">Maliyet Karşılaştırması</Divider>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">FIFO Maliyet</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(productDetailModal.fifoUnitCost || 0, productDetailModal.currency)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">LIFO Maliyet</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(productDetailModal.lifoUnitCost || 0, productDetailModal.currency)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Ağırlıklı Ortalama</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(productDetailModal.weightedAverageCost, productDetailModal.currency)}</p>
              </div>
            </div>

            {productDetailModal.standardCost && (
              <>
                <Divider className="!my-4">Standart Maliyet Karşılaştırması</Divider>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-600 mb-1">Standart Maliyet</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(productDetailModal.standardCost, productDetailModal.currency)}</p>
                  </div>
                  <div className={`rounded-xl p-4 ${
                    productDetailModal.weightedAverageCost < productDetailModal.standardCost
                      ? 'bg-slate-900'
                      : 'bg-slate-200'
                  }`}>
                    <p className={`text-xs mb-1 ${
                      productDetailModal.weightedAverageCost < productDetailModal.standardCost
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}>
                      Fark (Gerçek - Standart)
                    </p>
                    <p className={`text-xl font-bold flex items-center gap-2 ${
                      productDetailModal.weightedAverageCost < productDetailModal.standardCost
                        ? 'text-white'
                        : 'text-slate-700'
                    }`}>
                      {productDetailModal.weightedAverageCost < productDetailModal.standardCost
                        ? <CheckCircleIcon className="w-4 h-4" />
                        : <ExclamationTriangleIcon className="w-4 h-4" />}
                      {formatCurrency(productDetailModal.weightedAverageCost - productDetailModal.standardCost, productDetailModal.currency)}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Divider className="!my-4">Katman Bilgileri</Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Aktif Katman Sayısı">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{productDetailModal.activeLayerCount}</span>
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

      {/* COGS Calculation Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold text-slate-900">SMM Hesapla</span>
        }
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
              <Button
                type="primary"
                htmlType="submit"
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                loading={calculateCOGS.isPending}
              >
                Hesapla
              </Button>
              <Button
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                onClick={() => {
                  setCogsModalVisible(false);
                  cogsForm.resetFields();
                }}
              >
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
