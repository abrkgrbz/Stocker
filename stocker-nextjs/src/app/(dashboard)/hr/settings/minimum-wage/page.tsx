'use client';

/**
 * Minimum Wage Configuration Page (Asgari Ücret Yönetimi)
 * Turkish labor law compliant minimum wage configuration
 * Based on Turkish Labor Law (4857 sayılı İş Kanunu)
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Table, Button, Modal, Empty, Spin, Tag, Tooltip, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BanknotesIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
interface MinimumWageConfig {
  id: number;
  year: number;
  period: 'first_half' | 'second_half' | 'full_year';
  grossAmount: number;
  netAmount: number;
  sgkPremiumBase: number;
  sgkCeiling: number;
  effectiveDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface MinimumWageFormValues {
  year: number;
  period: 'first_half' | 'second_half' | 'full_year';
  grossAmount: number;
  netAmount: number;
  sgkPremiumBase: number;
  sgkCeiling: number;
  effectiveDate: Dayjs;
  endDate?: Dayjs;
  notes?: string;
}

// Period labels
const periodLabels: Record<string, string> = {
  first_half: '1. Dönem (Ocak - Haziran)',
  second_half: '2. Dönem (Temmuz - Aralık)',
  full_year: 'Tüm Yıl',
};

// Mock data - historical minimum wage data for Turkey
const mockMinimumWages: MinimumWageConfig[] = [
  {
    id: 1,
    year: 2025,
    period: 'first_half',
    grossAmount: 26005.50,
    netAmount: 22104.67,
    sgkPremiumBase: 26005.50,
    sgkCeiling: 195041.40,
    effectiveDate: '2025-01-01',
    endDate: '2025-06-30',
    isActive: true,
    notes: '2025 yılı 1. dönem asgari ücret',
    createdAt: '2024-12-25T00:00:00Z',
    updatedAt: '2024-12-25T00:00:00Z',
  },
  {
    id: 2,
    year: 2024,
    period: 'second_half',
    grossAmount: 20002.50,
    netAmount: 17002.12,
    sgkPremiumBase: 20002.50,
    sgkCeiling: 150018.90,
    effectiveDate: '2024-07-01',
    endDate: '2024-12-31',
    isActive: false,
    notes: '2024 yılı 2. dönem asgari ücret',
    createdAt: '2024-06-20T00:00:00Z',
    updatedAt: '2024-06-20T00:00:00Z',
  },
  {
    id: 3,
    year: 2024,
    period: 'first_half',
    grossAmount: 17002.12,
    netAmount: 14451.80,
    sgkPremiumBase: 17002.12,
    sgkCeiling: 127515.90,
    effectiveDate: '2024-01-01',
    endDate: '2024-06-30',
    isActive: false,
    notes: '2024 yılı 1. dönem asgari ücret',
    createdAt: '2023-12-20T00:00:00Z',
    updatedAt: '2023-12-20T00:00:00Z',
  },
  {
    id: 4,
    year: 2023,
    period: 'second_half',
    grossAmount: 13414.50,
    netAmount: 11402.32,
    sgkPremiumBase: 13414.50,
    sgkCeiling: 100608.90,
    effectiveDate: '2023-07-01',
    endDate: '2023-12-31',
    isActive: false,
    notes: '2023 yılı 2. dönem asgari ücret',
    createdAt: '2023-06-20T00:00:00Z',
    updatedAt: '2023-06-20T00:00:00Z',
  },
];

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

export default function MinimumWageConfigPage() {
  const [form] = Form.useForm<MinimumWageFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MinimumWageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<MinimumWageConfig[]>(mockMinimumWages);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Calculate net from gross (simplified formula)
  const calculateNetFromGross = (gross: number): number => {
    // SGK İşçi Payı: %14 + İşsizlik: %1 = %15
    const sgkDeduction = gross * 0.15;
    const sgkBase = gross - sgkDeduction;
    // Gelir vergisi: basit hesaplama için %15 varsayılan
    const incomeTax = sgkBase * 0.15;
    // Damga vergisi: %0.759
    const stampTax = gross * 0.00759;
    return gross - sgkDeduction - incomeTax - stampTax;
  };

  // Calculate SGK ceiling (7.5 times gross minimum wage)
  const calculateSgkCeiling = (gross: number): number => {
    return gross * 7.5;
  };

  const handleGrossChange = (value: number | null) => {
    if (value) {
      const netAmount = calculateNetFromGross(value);
      const sgkCeiling = calculateSgkCeiling(value);
      form.setFieldsValue({
        netAmount: Math.round(netAmount * 100) / 100,
        sgkPremiumBase: value,
        sgkCeiling: Math.round(sgkCeiling * 100) / 100,
      });
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    // Set defaults
    const currentYear = new Date().getFullYear();
    form.setFieldsValue({
      year: currentYear,
      period: 'first_half',
      effectiveDate: dayjs(`${currentYear}-01-01`),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: MinimumWageConfig) => {
    setEditingRecord(record);
    form.setFieldsValue({
      year: record.year,
      period: record.period,
      grossAmount: record.grossAmount,
      netAmount: record.netAmount,
      sgkPremiumBase: record.sgkPremiumBase,
      sgkCeiling: record.sgkCeiling,
      effectiveDate: dayjs(record.effectiveDate),
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
      notes: record.notes,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (record: MinimumWageConfig) => {
    Modal.confirm({
      title: 'Asgari Ücret Kaydını Sil',
      content: `${record.year} ${periodLabels[record.period]} kaydını silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: () => {
        setData(data.filter(item => item.id !== record.id));
      },
    });
  };

  const handleSubmit = async (values: MinimumWageFormValues) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingRecord) {
        // Update existing
        setData(data.map(item =>
          item.id === editingRecord.id
            ? {
                ...item,
                ...values,
                effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
                endDate: values.endDate?.format('YYYY-MM-DD'),
                updatedAt: new Date().toISOString(),
              }
            : item
        ));
      } else {
        // Add new
        const newRecord: MinimumWageConfig = {
          id: Math.max(...data.map(d => d.id)) + 1,
          year: values.year,
          period: values.period,
          grossAmount: values.grossAmount,
          netAmount: values.netAmount,
          sgkPremiumBase: values.sgkPremiumBase,
          sgkCeiling: values.sgkCeiling,
          effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
          endDate: values.endDate?.format('YYYY-MM-DD'),
          isActive: false,
          notes: values.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setData([newRecord, ...data]);
      }

      setIsModalOpen(false);
      form.resetFields();
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = (record: MinimumWageConfig) => {
    Modal.confirm({
      title: 'Asgari Ücret Kaydını Aktifleştir',
      content: `${record.year} ${periodLabels[record.period]} kaydını aktifleştirmek istediğinizden emin misiniz? Mevcut aktif kayıt pasifleştirilecektir.`,
      okText: 'Aktifleştir',
      cancelText: 'İptal',
      onOk: () => {
        setData(data.map(item => ({
          ...item,
          isActive: item.id === record.id,
        })));
      },
    });
  };

  // Get current active minimum wage
  const activeMinWage = data.find(d => d.isActive);

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear + 1 - i,
    label: `${currentYear + 1 - i}`,
  }));

  const columns: ColumnsType<MinimumWageConfig> = [
    {
      title: 'Dönem',
      key: 'period',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.year}</div>
          <div className="text-xs text-slate-500">{periodLabels[record.period]}</div>
        </div>
      ),
    },
    {
      title: 'Brüt Asgari Ücret',
      dataIndex: 'grossAmount',
      key: 'grossAmount',
      align: 'right',
      render: (amount) => (
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Net Asgari Ücret',
      dataIndex: 'netAmount',
      key: 'netAmount',
      align: 'right',
      render: (amount) => (
        <span className="text-sm text-slate-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'SGK Tavanı',
      dataIndex: 'sgkCeiling',
      key: 'sgkCeiling',
      align: 'right',
      render: (amount) => (
        <span className="text-sm text-slate-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Geçerlilik',
      key: 'dates',
      render: (_, record) => (
        <div className="text-xs text-slate-500">
          <div>{dayjs(record.effectiveDate).format('DD.MM.YYYY')}</div>
          <div>- {record.endDate ? dayjs(record.endDate).format('DD.MM.YYYY') : 'Devam'}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        record.isActive ? (
          <Tag color="green" className="m-0">Aktif</Tag>
        ) : (
          <Tag color="default" className="m-0">Pasif</Tag>
        )
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          {!record.isActive && (
            <Tooltip title="Aktifleştir">
              <button
                onClick={() => handleActivate(record)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
          <Tooltip title="Düzenle">
            <button
              onClick={() => handleEdit(record)}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          {!record.isActive && (
            <Tooltip title="Sil">
              <button
                onClick={() => handleDelete(record)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <BanknotesIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Asgari Ücret Yönetimi</h1>
              <p className="text-sm text-slate-500">Türkiye asgari ücret parametreleri yönetimi</p>
            </div>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={handleAdd}
              className="bg-slate-900 hover:bg-slate-800 border-slate-900"
            >
              Yeni Dönem Ekle
            </Button>
          </div>
        </div>
      </div>

      {/* Current Active Minimum Wage Card */}
      {activeMinWage && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">Güncel Asgari Ücret</h3>
              <p className="text-sm text-emerald-700">
                {activeMinWage.year} - {periodLabels[activeMinWage.period]}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">Brüt Ücret</p>
              <p className="text-2xl font-bold text-emerald-900">{formatCurrency(activeMinWage.grossAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">Net Ücret</p>
              <p className="text-2xl font-bold text-emerald-900">{formatCurrency(activeMinWage.netAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">SGK Tavanı</p>
              <p className="text-2xl font-bold text-emerald-900">{formatCurrency(activeMinWage.sgkCeiling)}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">Geçerlilik</p>
              <p className="text-sm font-medium text-emerald-800">
                {dayjs(activeMinWage.effectiveDate).format('DD.MM.YYYY')} - {activeMinWage.endDate ? dayjs(activeMinWage.endDate).format('DD.MM.YYYY') : 'Devam'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Alert */}
      <Alert
        message="Asgari Ücret Bilgisi"
        description={
          <div className="text-sm">
            <p>Türkiye&apos;de asgari ücret yılda iki kez (Ocak ve Temmuz) güncellenir. SGK prim tavanı, brüt asgari ücretin 7.5 katı olarak hesaplanır.</p>
            <p className="mt-2">
              <strong>SGK İşçi Kesintileri:</strong> %14 Sigorta + %1 İşsizlik = %15
              <br />
              <strong>SGK İşveren Kesintileri:</strong> %20.5 Sigorta + %2 İşsizlik = %22.5 (5 puanlık indirim sonrası: %17.5)
            </p>
          </div>
        }
        type="info"
        showIcon
        icon={<InformationCircleIcon className="w-5 h-5" />}
        className="mb-8"
      />

      {/* Minimum Wage History Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <ChartBarIcon className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Asgari Ücret Geçmişi</h3>
        </div>

        {data.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-slate-500">Henüz asgari ücret kaydı bulunmuyor</span>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayıt`,
            }}
            className={tableClassName}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-slate-600" />
            <span>{editingRecord ? 'Asgari Ücret Düzenle' : 'Yeni Asgari Ücret Ekle'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="year"
              label="Yıl"
              rules={[{ required: true, message: 'Yıl seçiniz' }]}
            >
              <Select options={yearOptions} placeholder="Yıl seçiniz" />
            </Form.Item>

            <Form.Item
              name="period"
              label="Dönem"
              rules={[{ required: true, message: 'Dönem seçiniz' }]}
            >
              <Select
                options={[
                  { value: 'first_half', label: '1. Dönem (Ocak - Haziran)' },
                  { value: 'second_half', label: '2. Dönem (Temmuz - Aralık)' },
                  { value: 'full_year', label: 'Tüm Yıl' },
                ]}
                placeholder="Dönem seçiniz"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="grossAmount"
              label="Brüt Asgari Ücret (₺)"
              rules={[{ required: true, message: 'Brüt ücret giriniz' }]}
            >
              <InputNumber
                className="w-full"
                min={0}
                step={0.01}
                onChange={handleGrossChange}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="netAmount"
              label="Net Asgari Ücret (₺)"
              rules={[{ required: true, message: 'Net ücret giriniz' }]}
            >
              <InputNumber
                className="w-full"
                min={0}
                step={0.01}
                placeholder="0.00"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="sgkPremiumBase"
              label="SGK Prim Matrahı (₺)"
              rules={[{ required: true, message: 'SGK matrah giriniz' }]}
            >
              <InputNumber
                className="w-full"
                min={0}
                step={0.01}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="sgkCeiling"
              label="SGK Tavanı (₺)"
              rules={[{ required: true, message: 'SGK tavanı giriniz' }]}
              tooltip="Brüt asgari ücretin 7.5 katı"
            >
              <InputNumber
                className="w-full"
                min={0}
                step={0.01}
                placeholder="0.00"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="effectiveDate"
              label="Geçerlilik Başlangıcı"
              rules={[{ required: true, message: 'Başlangıç tarihi seçiniz' }]}
            >
              <DatePicker className="w-full" format="DD.MM.YYYY" />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="Geçerlilik Bitişi"
            >
              <DatePicker className="w-full" format="DD.MM.YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <Input.TextArea rows={2} placeholder="Ek notlar (isteğe bağlı)" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="bg-slate-900 hover:bg-slate-800 border-slate-900"
            >
              {editingRecord ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
