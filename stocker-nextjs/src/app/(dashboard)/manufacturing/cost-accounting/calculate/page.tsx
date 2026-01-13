'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Select, DatePicker, Card, Table, Empty, Statistic, Row, Col } from 'antd';
import { ArrowLeftIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { useProductionOrders } from '@/lib/api/hooks/useManufacturing';
import { ProductionOrderStatus } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface CostBreakdown {
  id: string;
  category: string;
  description: string;
  amount: number;
  percentage: number;
}

export default function CostCalculatePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [calculating, setCalculating] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);

  const { data: productionOrders = [], isLoading: ordersLoading } = useProductionOrders({ status: ProductionOrderStatus.Completed });

  const handleCalculate = async () => {
    const values = form.getFieldsValue();
    if (!values.productionOrderId) return;

    setCalculating(true);

    // Simulate cost calculation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock cost breakdown data
    const mockBreakdown: CostBreakdown[] = [
      { id: '1', category: 'Direkt Malzeme', description: 'Hammadde maliyetleri', amount: 15000, percentage: 45 },
      { id: '2', category: 'Direkt İşçilik', description: 'Üretim işçilik maliyetleri', amount: 8000, percentage: 24 },
      { id: '3', category: 'Genel Üretim Giderleri', description: 'Dolaylı üretim maliyetleri', amount: 5500, percentage: 17 },
      { id: '4', category: 'Enerji', description: 'Elektrik ve yakıt maliyetleri', amount: 2500, percentage: 8 },
      { id: '5', category: 'Amortisman', description: 'Makine amortisman payı', amount: 2000, percentage: 6 },
    ];

    setCostBreakdown(mockBreakdown);
    setCalculating(false);
  };

  const totalCost = costBreakdown.reduce((sum, item) => sum + item.amount, 0);

  const columns: ColumnsType<CostBreakdown> = [
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <span className="font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span className="text-slate-500">{text}</span>,
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) => (
        <span className="font-medium text-slate-900">
          ₺{amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Oran',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'right',
      width: 100,
      render: (pct) => <span className="text-slate-600">%{pct}</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 m-0">Maliyet Hesaplama</h1>
              <p className="text-sm text-slate-400 m-0">Üretim emri maliyet analizi</p>
            </div>
          </div>
          <Button onClick={() => router.push('/manufacturing/cost-accounting')}>
            Maliyet Kayıtları
          </Button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        <Card title="Hesaplama Parametreleri" className="mb-6">
          <Form form={form} layout="vertical">
            <div className="grid grid-cols-3 gap-6">
              <Form.Item
                name="productionOrderId"
                label="Üretim Emri"
                rules={[{ required: true, message: 'Üretim emri seçiniz' }]}
              >
                <Select
                  placeholder="Tamamlanmış üretim emri seçin"
                  loading={ordersLoading}
                  options={productionOrders.map(order => ({
                    value: order.id,
                    label: `${order.orderNumber} - ${order.productName}`,
                  }))}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item name="calculationDate" label="Hesaplama Tarihi" initialValue={dayjs()}>
                <DatePicker className="w-full" format="DD.MM.YYYY" />
              </Form.Item>
              <Form.Item label=" ">
                <Button
                  type="primary"
                  icon={<CalculatorIcon className="w-4 h-4" />}
                  onClick={handleCalculate}
                  loading={calculating}
                  className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900 w-full"
                >
                  Hesapla
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Card>

        {costBreakdown.length > 0 && (
          <>
            <Row gutter={24} className="mb-6">
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Toplam Maliyet"
                    value={totalCost}
                    precision={2}
                    prefix="₺"
                    valueStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Birim Maliyet"
                    value={totalCost / 100}
                    precision={2}
                    prefix="₺"
                    valueStyle={{ color: '#475569' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Maliyet Kalemleri"
                    value={costBreakdown.length}
                    valueStyle={{ color: '#64748b' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Maliyet Dağılımı">
              <Table
                columns={columns}
                dataSource={costBreakdown}
                rowKey="id"
                pagination={false}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="bg-slate-50">
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <span className="font-bold text-slate-900">TOPLAM</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <span className="font-bold text-slate-900">
                          ₺{totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <span className="font-bold text-slate-900">%100</span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase"
              />
            </Card>
          </>
        )}

        {costBreakdown.length === 0 && !calculating && (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Maliyet hesaplamak için üretim emri seçin"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
