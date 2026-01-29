'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Button,
  Table,
  Tooltip,
} from 'antd';
import {
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import type { CommissionCalculationType } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface CommissionTier {
  key: string;
  minAmount: number;
  maxAmount?: number;
  rate: number;
  flatAmount?: number;
}

interface CommissionPlan {
  id: string;
  name: string;
  description?: string;
  calculationType: CommissionCalculationType;
  baseRate: number;
  baseAmount: number;
  minCommission?: number;
  maxCommission?: number;
  isActive: boolean;
  validFrom: string;
  validTo?: string;
  applyToAllSalesReps: boolean;
  currency: string;
  tiers?: CommissionTier[];
  createdAt: string;
}

interface CommissionPlanFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CommissionPlan;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const calculationTypeOptions: { value: CommissionCalculationType; label: string; description: string }[] = [
  { value: 'Percentage', label: 'Yüzde', description: 'Satış tutarından yüzde hesaplanır' },
  { value: 'FixedAmount', label: 'Sabit Tutar', description: 'Satış başına sabit komisyon' },
  { value: 'Tiered', label: 'Kademeli', description: 'Satış tutarına göre kademeli oran' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export default function CommissionPlanForm({ form, initialValues, onFinish, loading }: CommissionPlanFormProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [calculationType, setCalculationType] = useState<CommissionCalculationType>('Percentage');
  const [tiers, setTiers] = useState<CommissionTier[]>([]);
  const [baseRate, setBaseRate] = useState(0);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        calculationType: initialValues.calculationType || 'Percentage',
        baseRate: initialValues.baseRate,
        baseAmount: initialValues.baseAmount,
        minCommission: initialValues.minCommission,
        maxCommission: initialValues.maxCommission,
        isActive: initialValues.isActive ?? true,
        validFrom: initialValues.validFrom ? dayjs(initialValues.validFrom) : dayjs(),
        validTo: initialValues.validTo ? dayjs(initialValues.validTo) : undefined,
        applyToAllSalesReps: initialValues.applyToAllSalesReps ?? true,
        currency: initialValues.currency || 'TRY',
      });
      setSelectedCurrency(initialValues.currency || 'TRY');
      setCalculationType(initialValues.calculationType || 'Percentage');
      setBaseRate(initialValues.baseRate || 0);

      if (initialValues.tiers) {
        setTiers(initialValues.tiers.map((tier, index) => ({
          ...tier,
          key: `tier-${index}`,
        })));
      }
    } else {
      form.setFieldsValue({
        calculationType: 'Percentage',
        baseRate: 5,
        baseAmount: 0,
        isActive: true,
        validFrom: dayjs(),
        applyToAllSalesReps: true,
        currency: 'TRY',
      });
      setBaseRate(5);
    }
  }, [form, initialValues]);

  const handleCalculationTypeChange = (type: CommissionCalculationType) => {
    setCalculationType(type);
    if (type === 'Tiered' && tiers.length === 0) {
      // Add initial tier
      setTiers([{
        key: 'tier-0',
        minAmount: 0,
        maxAmount: 10000,
        rate: 3,
      }]);
    }
  };

  const updateTier = (key: string, field: keyof CommissionTier, value: any) => {
    setTiers(prev => prev.map(tier =>
      tier.key === key ? { ...tier, [field]: value } : tier
    ));
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMinAmount = lastTier?.maxAmount || 0;
    const newKey = `tier-${Date.now()}`;
    setTiers(prev => [...prev, {
      key: newKey,
      minAmount: newMinAmount,
      maxAmount: newMinAmount + 10000,
      rate: (lastTier?.rate || 3) + 1,
    }]);
  };

  const removeTier = (key: string) => {
    if (tiers.length > 1) {
      setTiers(prev => prev.filter(tier => tier.key !== key));
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: selectedCurrency
    }).format(amount);

  // Calculate sample commission
  const sampleCalculation = useMemo(() => {
    const sampleAmount = 100000;
    let commission = 0;

    if (calculationType === 'Percentage') {
      commission = sampleAmount * (baseRate / 100);
    } else if (calculationType === 'FixedAmount') {
      commission = form.getFieldValue('baseAmount') || 0;
    } else if (calculationType === 'Tiered' && tiers.length > 0) {
      for (const tier of tiers) {
        const min = tier.minAmount || 0;
        const max = tier.maxAmount;

        if (sampleAmount > min) {
          const applicableAmount = max && sampleAmount > max
            ? max - min
            : sampleAmount - min;
          commission += applicableAmount * (tier.rate / 100);
        }
      }
    }

    return { sampleAmount, commission };
  }, [calculationType, baseRate, tiers, form]);

  const handleSubmit = () => {
    form.validateFields().then((values: any) => {
      const planData = {
        ...values,
        validFrom: values.validFrom?.toISOString(),
        validTo: values.validTo?.toISOString(),
        tiers: calculationType === 'Tiered' ? tiers.map((tier, index) => ({
          order: index + 1,
          minAmount: tier.minAmount,
          maxAmount: tier.maxAmount,
          rate: tier.rate,
          flatAmount: tier.flatAmount,
        })) : undefined,
      };
      onFinish(planData);
    });
  };

  // Trigger form submit from parent via form.submit()
  useEffect(() => {
    const originalSubmit = form.submit;
    form.submit = () => {
      handleSubmit();
    };
    return () => {
      form.submit = originalSubmit;
    };
  }, [form, tiers, calculationType]);

  const tierColumns = [
    {
      title: 'Min. Tutar',
      key: 'minAmount',
      width: 150,
      render: (_: any, record: CommissionTier) => (
        <InputNumber
          min={0}
          value={record.minAmount}
          onChange={(value) => updateTier(record.key, 'minAmount', value || 0)}
          size="small"
          prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Maks. Tutar',
      key: 'maxAmount',
      width: 150,
      render: (_: any, record: CommissionTier) => (
        <InputNumber
          min={record.minAmount}
          value={record.maxAmount}
          onChange={(value) => updateTier(record.key, 'maxAmount', value)}
          size="small"
          prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
          placeholder="Limitsiz"
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Komisyon Oranı (%)',
      key: 'rate',
      width: 130,
      render: (_: any, record: CommissionTier) => (
        <InputNumber
          min={0}
          max={100}
          precision={2}
          value={record.rate}
          onChange={(value) => updateTier(record.key, 'rate', value || 0)}
          size="small"
          prefix="%"
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Sabit Ek Tutar',
      key: 'flatAmount',
      width: 130,
      render: (_: any, record: CommissionTier) => (
        <InputNumber
          min={0}
          value={record.flatAmount}
          onChange={(value) => updateTier(record.key, 'flatAmount', value)}
          size="small"
          prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
          placeholder="Opsiyonel"
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: (_: any, record: CommissionTier) => (
        <Tooltip title="Kaldır">
          <Button
            type="text"
            danger
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={() => removeTier(record.key)}
            disabled={tiers.length === 1}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Title + Sample Calculation
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Commission Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Plan Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {initialValues ? `Plan: ${initialValues.name}` : 'Yeni Komisyon Planı'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {initialValues ? 'Komisyon planını düzenleyin' : 'Yeni satış komisyon planı oluşturun'}
              </p>
            </div>

            {/* Sample Calculation */}
            <div className="flex-shrink-0">
              <div className="bg-slate-100 px-6 py-3 rounded-xl text-center">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Örnek: {formatCurrency(sampleCalculation.sampleAmount)}
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(sampleCalculation.commission)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── TEMEL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Plan Adı <span className="text-red-500">*</span></label>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Plan adı zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Örn: Standart Satış Komisyonu"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={currencyOptions}
                    onChange={setSelectedCurrency}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hesaplama Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="calculationType"
                  rules={[{ required: true, message: 'Hesaplama türü zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    options={calculationTypeOptions}
                    onChange={handleCalculationTypeChange}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Komisyon planı hakkında açıklama..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KOMİSYON DEĞERLERİ ─────────────── */}
          {calculationType !== 'Tiered' && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Komisyon Değerleri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                {calculationType === 'Percentage' && (
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Komisyon Oranı (%) <span className="text-red-500">*</span></label>
                    <Form.Item
                      name="baseRate"
                      rules={[{ required: true, message: 'Komisyon oranı zorunludur' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        precision={2}
                        placeholder="5"
                        prefix="%"
                        onChange={(value) => setBaseRate(value || 0)}
                        className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                      />
                    </Form.Item>
                  </div>
                )}
                {calculationType === 'FixedAmount' && (
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Sabit Tutar <span className="text-red-500">*</span></label>
                    <Form.Item
                      name="baseAmount"
                      rules={[{ required: true, message: 'Sabit tutar zorunludur' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        min={0}
                        precision={2}
                        placeholder="100"
                        prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
                        className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                      />
                    </Form.Item>
                  </div>
                )}
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Komisyon</label>
                  <Form.Item name="minCommission" className="mb-0">
                    <InputNumber
                      min={0}
                      precision={2}
                      placeholder="Yok"
                      prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. Komisyon</label>
                  <Form.Item name="maxCommission" className="mb-0">
                    <InputNumber
                      min={0}
                      precision={2}
                      placeholder="Limitsiz"
                      prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── KADEMELİ KOMİSYON ─────────────── */}
          {calculationType === 'Tiered' && (
            <div className="mb-8">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Komisyon Kademeleri ({tiers.length})
                </h3>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={addTier}
                  className="!bg-slate-900 hover:!bg-slate-800"
                >
                  Kademe Ekle
                </Button>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table
                  columns={tierColumns}
                  dataSource={tiers}
                  rowKey="key"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Kademe ekleyin' }}
                  className="[&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600 [&_.ant-table-thead>tr>th]:!font-medium [&_.ant-table-thead>tr>th]:!border-slate-200"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Her kademe, belirtilen tutar aralığında geçerlidir. Satış tutarı üst limite ulaşınca bir sonraki kademe uygulanır.
              </p>
            </div>
          )}

          {/* ─────────────── GEÇERLİLİK SÜRESİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Geçerlilik Süresi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="validFrom"
                  rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş Tarihi</label>
                <Form.Item name="validTo" className="mb-0">
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Süresiz"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── AYARLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ayarlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Aktif</div>
                    <div className="text-xs text-slate-500">Plan kullanılabilir mi?</div>
                  </div>
                  <Form.Item name="isActive" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Tümüne Uygula</div>
                    <div className="text-xs text-slate-500">Tüm satış temsilcilerine uygulanır</div>
                  </div>
                  <Form.Item name="applyToAllSalesReps" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Mode Info */}
          {initialValues && (
            <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Plan Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Plan ID</div>
                    <div className="text-sm font-semibold text-slate-900 truncate">{initialValues.id}</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Durum</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {initialValues.isActive ? 'Aktif' : 'Pasif'}
                    </div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Oluşturulma</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {dayjs(initialValues.createdAt).format('DD.MM.YYYY')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <Button htmlType="submit" />
      </Form.Item>
    </Form>
  );
}
