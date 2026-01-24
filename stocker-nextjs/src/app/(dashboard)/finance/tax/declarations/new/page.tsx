'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Table,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Popconfirm,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useCreateTaxDeclaration } from '@/lib/api/hooks/useFinance';
import {
  TaxDeclarationType,
} from '@/lib/api/services/finance.types';
import type {
  CreateTaxDeclarationDto,
} from '@/lib/api/services/finance.types';

const { Title, Text } = Typography;
const { Option } = Select;

// Tax declaration types with Turkish labels
const TAX_TYPES: { value: TaxDeclarationType; label: string; period: 'monthly' | 'quarterly' | 'annual' }[] = [
  { value: TaxDeclarationType.Kdv, label: 'KDV Beyannamesi (1 No.lu)', period: 'monthly' },
  { value: TaxDeclarationType.Kdv2, label: 'KDV Beyannamesi (2 No.lu)', period: 'monthly' },
  { value: TaxDeclarationType.Muhtasar, label: 'Muhtasar ve Prim Hizmet Beyannamesi', period: 'monthly' },
  { value: TaxDeclarationType.MuhtasarPrimHizmet, label: 'Muhtasar (Sadece Vergi)', period: 'monthly' },
  { value: TaxDeclarationType.GeciciVergi, label: 'Geçici Vergi Beyannamesi', period: 'quarterly' },
  { value: TaxDeclarationType.KurumlarVergisi, label: 'Kurumlar Vergisi Beyannamesi', period: 'annual' },
  { value: TaxDeclarationType.GelirVergisi, label: 'Gelir Vergisi Beyannamesi', period: 'annual' },
  { value: TaxDeclarationType.DamgaVergisi, label: 'Damga Vergisi Beyannamesi', period: 'monthly' },
  { value: TaxDeclarationType.Otv, label: 'Özel Tüketim Vergisi', period: 'monthly' },
];

const MONTHS = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' },
];

const QUARTERS = [
  { value: 1, label: '1. Çeyrek (Ocak-Mart)' },
  { value: 2, label: '2. Çeyrek (Nisan-Haziran)' },
  { value: 3, label: '3. Çeyrek (Temmuz-Eylül)' },
  { value: 4, label: '4. Çeyrek (Ekim-Aralık)' },
];

interface DetailItem {
  key: string;
  taxCode: string;
  description: string;
  taxBase: number;
  taxRate: number;
  calculatedTax: number;
  deductibleTax: number;
  payableTax: number;
}

export default function NewTaxDeclarationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [details, setDetails] = useState<DetailItem[]>([]);
  const [selectedType, setSelectedType] = useState<TaxDeclarationType | null>(null);

  const createMutation = useCreateTaxDeclaration();

  const selectedTypeInfo = TAX_TYPES.find(t => t.value === selectedType);
  const periodType = selectedTypeInfo?.period || 'monthly';

  // Calculate totals from details
  const totals = details.reduce(
    (acc, item) => ({
      taxBase: acc.taxBase + (item.taxBase || 0),
      calculatedTax: acc.calculatedTax + (item.calculatedTax || 0),
      deductibleTax: acc.deductibleTax + (item.deductibleTax || 0),
      payableTax: acc.payableTax + (item.payableTax || 0),
    }),
    { taxBase: 0, calculatedTax: 0, deductibleTax: 0, payableTax: 0 }
  );

  const handleAddDetail = () => {
    const newDetail: DetailItem = {
      key: `detail-${Date.now()}`,
      taxCode: '',
      description: '',
      taxBase: 0,
      taxRate: 0,
      calculatedTax: 0,
      deductibleTax: 0,
      payableTax: 0,
    };
    setDetails([...details, newDetail]);
  };

  const handleRemoveDetail = (key: string) => {
    setDetails(details.filter(d => d.key !== key));
  };

  const handleDetailChange = (key: string, field: keyof DetailItem, value: string | number) => {
    setDetails(prev =>
      prev.map(item => {
        if (item.key !== key) return item;

        const updated = { ...item, [field]: value };

        // Auto-calculate payable tax
        if (field === 'taxBase' || field === 'taxRate') {
          const taxBase = field === 'taxBase' ? (value as number) : item.taxBase;
          const taxRate = field === 'taxRate' ? (value as number) : item.taxRate;
          updated.calculatedTax = taxBase * (taxRate / 100);
          updated.payableTax = updated.calculatedTax - updated.deductibleTax;
        }

        if (field === 'calculatedTax' || field === 'deductibleTax') {
          const calculatedTax = field === 'calculatedTax' ? (value as number) : item.calculatedTax;
          const deductibleTax = field === 'deductibleTax' ? (value as number) : item.deductibleTax;
          updated.payableTax = calculatedTax - deductibleTax;
        }

        return updated;
      })
    );
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!selectedType) {
      message.error('Beyanname türü seçiniz');
      return;
    }

    const dueDate = values.dueDate as dayjs.Dayjs;

    const data: CreateTaxDeclarationDto = {
      declarationType: selectedType,
      taxYear: values.taxYear as number,
      taxMonth: periodType === 'monthly' ? (values.taxMonth as number) : undefined,
      taxQuarter: periodType === 'quarterly' ? (values.taxQuarter as number) : undefined,
      taxOfficeCode: values.taxOfficeCode as string,
      taxOfficeName: values.taxOfficeName as string,
      taxBase: totals.taxBase,
      calculatedTax: totals.calculatedTax,
      deductibleTax: totals.deductibleTax,
      notes: values.notes as string,
      details: details.map(d => ({
        code: d.taxCode,
        description: d.description,
        taxBase: d.taxBase,
        taxRate: d.taxRate,
        taxAmount: d.calculatedTax,
        notes: '',
      })),
    };

    try {
      await createMutation.mutateAsync(data);
      message.success('Vergi beyannamesi başarıyla oluşturuldu');
      router.push('/finance/tax/declarations');
    } catch (error) {
      message.error('Beyanname oluşturulurken hata oluştu');
    }
  };

  const detailColumns = [
    {
      title: 'Vergi Kodu',
      dataIndex: 'taxCode',
      key: 'taxCode',
      width: 120,
      render: (_: unknown, record: DetailItem) => (
        <Input
          value={record.taxCode}
          onChange={e => handleDetailChange(record.key, 'taxCode', e.target.value)}
          placeholder="Kod"
        />
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (_: unknown, record: DetailItem) => (
        <Input
          value={record.description}
          onChange={e => handleDetailChange(record.key, 'description', e.target.value)}
          placeholder="Açıklama giriniz"
        />
      ),
    },
    {
      title: 'Matrah',
      dataIndex: 'taxBase',
      key: 'taxBase',
      width: 150,
      render: (_: unknown, record: DetailItem) => (
        <InputNumber<number>
          value={record.taxBase}
          onChange={value => handleDetailChange(record.key, 'taxBase', value || 0)}
          formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => parseFloat(value?.replace(/₺\s?|(,*)/g, '') || '0')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Oran %',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 100,
      render: (_: unknown, record: DetailItem) => (
        <InputNumber
          value={record.taxRate}
          onChange={value => handleDetailChange(record.key, 'taxRate', value || 0)}
          min={0}
          max={100}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Hesaplanan Vergi',
      dataIndex: 'calculatedTax',
      key: 'calculatedTax',
      width: 150,
      render: (_: unknown, record: DetailItem) => (
        <InputNumber<number>
          value={record.calculatedTax}
          onChange={value => handleDetailChange(record.key, 'calculatedTax', value || 0)}
          formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => parseFloat(value?.replace(/₺\s?|(,*)/g, '') || '0')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'İndirilecek Vergi',
      dataIndex: 'deductibleTax',
      key: 'deductibleTax',
      width: 150,
      render: (_: unknown, record: DetailItem) => (
        <InputNumber<number>
          value={record.deductibleTax}
          onChange={value => handleDetailChange(record.key, 'deductibleTax', value || 0)}
          formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => parseFloat(value?.replace(/₺\s?|(,*)/g, '') || '0')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Ödenecek Vergi',
      dataIndex: 'payableTax',
      key: 'payableTax',
      width: 150,
      render: (_: unknown, record: DetailItem) => (
        <Text strong style={{ color: record.payableTax > 0 ? '#cf1322' : '#3f8600' }}>
          ₺{record.payableTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: unknown, record: DetailItem) => (
        <Popconfirm
          title="Bu satırı silmek istediğinize emin misiniz?"
          onConfirm={() => handleRemoveDetail(record.key)}
          okText="Evet"
          cancelText="Hayır"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/finance/tax/declarations')}
          >
            Geri
          </Button>
          <Title level={3} style={{ margin: 0 }}>Yeni Vergi Beyannamesi</Title>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          taxYear: dayjs().year(),
          taxMonth: dayjs().month() + 1,
          taxQuarter: Math.ceil((dayjs().month() + 1) / 3),
          dueDate: dayjs().add(1, 'month').date(26),
        }}
      >
        <Row gutter={24}>
          {/* Left Column - Declaration Info */}
          <Col xs={24} lg={12}>
            <Card title="Beyanname Bilgileri" style={{ marginBottom: '24px' }}>
              <Form.Item
                name="declarationType"
                label="Beyanname Türü"
                rules={[{ required: true, message: 'Beyanname türü seçiniz' }]}
              >
                <Select
                  placeholder="Beyanname türü seçiniz"
                  onChange={(value) => setSelectedType(value)}
                  showSearch
                  optionFilterProp="children"
                >
                  {TAX_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="taxYear"
                    label="Vergi Yılı"
                    rules={[{ required: true, message: 'Yıl seçiniz' }]}
                  >
                    <Select>
                      {[0, 1, 2].map(offset => {
                        const year = dayjs().year() - offset;
                        return (
                          <Option key={year} value={year}>
                            {year}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>

                {periodType === 'monthly' && (
                  <Col span={8}>
                    <Form.Item
                      name="taxMonth"
                      label="Dönem (Ay)"
                      rules={[{ required: true, message: 'Ay seçiniz' }]}
                    >
                      <Select>
                        {MONTHS.map(month => (
                          <Option key={month.value} value={month.value}>
                            {month.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}

                {periodType === 'quarterly' && (
                  <Col span={8}>
                    <Form.Item
                      name="taxQuarter"
                      label="Dönem (Çeyrek)"
                      rules={[{ required: true, message: 'Çeyrek seçiniz' }]}
                    >
                      <Select>
                        {QUARTERS.map(q => (
                          <Option key={q.value} value={q.value}>
                            {q.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}

                <Col span={8}>
                  <Form.Item
                    name="dueDate"
                    label="Son Ödeme Tarihi"
                    rules={[{ required: true, message: 'Tarih seçiniz' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Vergi Dairesi Bilgileri" style={{ marginBottom: '24px' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="taxOfficeCode"
                    label="Vergi Dairesi Kodu"
                    rules={[{ required: true, message: 'Vergi dairesi kodu giriniz' }]}
                  >
                    <Input placeholder="Örn: 034256" />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item
                    name="taxOfficeName"
                    label="Vergi Dairesi Adı"
                    rules={[{ required: true, message: 'Vergi dairesi adı giriniz' }]}
                  >
                    <Input placeholder="Örn: Kadıköy Vergi Dairesi" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Right Column - Tax Summary */}
          <Col xs={24} lg={12}>
            <Card title="Vergi Özeti" style={{ marginBottom: '24px' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Toplam Matrah</Text>
                  <Title level={4} style={{ margin: '4px 0' }}>
                    ₺{totals.taxBase.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Title>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Hesaplanan Vergi</Text>
                  <Title level={4} style={{ margin: '4px 0' }}>
                    ₺{totals.calculatedTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Title>
                </Col>
                <Col span={12}>
                  <Text type="secondary">İndirilecek Vergi</Text>
                  <Title level={4} style={{ margin: '4px 0', color: '#3f8600' }}>
                    ₺{totals.deductibleTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Title>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Ödenecek Vergi</Text>
                  <Title level={4} style={{ margin: '4px 0', color: totals.payableTax > 0 ? '#cf1322' : '#3f8600' }}>
                    ₺{totals.payableTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Title>
                </Col>
              </Row>
            </Card>

            <Card title="Notlar" style={{ marginBottom: '24px' }}>
              <Form.Item name="notes" noStyle>
                <Input.TextArea
                  rows={4}
                  placeholder="Beyanname ile ilgili notlarınız..."
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Details Section */}
        <Card
          title="Beyanname Detayları"
          extra={
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddDetail}
            >
              Satır Ekle
            </Button>
          }
          style={{ marginBottom: '24px' }}
        >
          <Table
            columns={detailColumns}
            dataSource={details}
            pagination={false}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Text type="secondary">
                    Henüz detay eklenmedi. "Satır Ekle" butonuna tıklayarak vergi kalemlerini ekleyebilirsiniz.
                  </Text>
                </div>
              ),
            }}
            summary={() => (
              details.length > 0 ? (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <Text strong>TOPLAM</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong>₺{totals.taxBase.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} />
                    <Table.Summary.Cell index={4}>
                      <Text strong>₺{totals.calculatedTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5}>
                      <Text strong style={{ color: '#3f8600' }}>
                        ₺{totals.deductibleTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>
                      <Text strong style={{ color: totals.payableTax > 0 ? '#cf1322' : '#3f8600' }}>
                        ₺{totals.payableTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} />
                  </Table.Summary.Row>
                </Table.Summary>
              ) : null
            )}
          />
        </Card>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={() => router.push('/finance/tax/declarations')}>
            İptal
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={createMutation.isPending}
          >
            Kaydet
          </Button>
        </div>
      </Form>
    </div>
  );
}
