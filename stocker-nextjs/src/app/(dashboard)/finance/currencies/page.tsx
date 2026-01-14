'use client';

/**
 * Exchange Rates Page (Döviz Kurları)
 * TCMB günlük kur verileri ve döviz yönetimi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Table, Select, DatePicker, Spin, Empty, Input, Modal, Form, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  CalendarIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
interface ExchangeRate {
  id: number;
  currencyCode: string;
  currencyName: string;
  unit: number;
  buyingRate: number;
  sellingRate: number;
  effectiveRate: number;
  previousRate: number;
  changePercent: number;
  date: string;
  source: 'TCMB' | 'Manual';
}

// Mock data
const mockRates: ExchangeRate[] = [
  {
    id: 1,
    currencyCode: 'USD',
    currencyName: 'ABD Doları',
    unit: 1,
    buyingRate: 35.2145,
    sellingRate: 35.3678,
    effectiveRate: 35.2912,
    previousRate: 35.1234,
    changePercent: 0.48,
    date: '2025-01-13',
    source: 'TCMB',
  },
  {
    id: 2,
    currencyCode: 'EUR',
    currencyName: 'Euro',
    unit: 1,
    buyingRate: 36.1234,
    sellingRate: 36.2891,
    effectiveRate: 36.2063,
    previousRate: 36.3456,
    changePercent: -0.38,
    date: '2025-01-13',
    source: 'TCMB',
  },
  {
    id: 3,
    currencyCode: 'GBP',
    currencyName: 'İngiliz Sterlini',
    unit: 1,
    buyingRate: 43.5678,
    sellingRate: 43.7891,
    effectiveRate: 43.6785,
    previousRate: 43.4567,
    changePercent: 0.51,
    date: '2025-01-13',
    source: 'TCMB',
  },
  {
    id: 4,
    currencyCode: 'CHF',
    currencyName: 'İsviçre Frangı',
    unit: 1,
    buyingRate: 38.2345,
    sellingRate: 38.3891,
    effectiveRate: 38.3118,
    previousRate: 38.1234,
    changePercent: 0.49,
    date: '2025-01-13',
    source: 'TCMB',
  },
  {
    id: 5,
    currencyCode: 'JPY',
    currencyName: 'Japon Yeni',
    unit: 100,
    buyingRate: 22.1234,
    sellingRate: 22.2567,
    effectiveRate: 22.1901,
    previousRate: 22.0123,
    changePercent: 0.81,
    date: '2025-01-13',
    source: 'TCMB',
  },
  {
    id: 6,
    currencyCode: 'SAR',
    currencyName: 'Suudi Arabistan Riyali',
    unit: 1,
    buyingRate: 9.3567,
    sellingRate: 9.4123,
    effectiveRate: 9.3845,
    previousRate: 9.3234,
    changePercent: 0.66,
    date: '2025-01-13',
    source: 'TCMB',
  },
  {
    id: 7,
    currencyCode: 'AED',
    currencyName: 'BAE Dirhemi',
    unit: 1,
    buyingRate: 9.5891,
    sellingRate: 9.6456,
    effectiveRate: 9.6174,
    previousRate: 9.5678,
    changePercent: 0.52,
    date: '2025-01-13',
    source: 'TCMB',
  },
  {
    id: 8,
    currencyCode: 'CNY',
    currencyName: 'Çin Yuanı',
    unit: 1,
    buyingRate: 4.8234,
    sellingRate: 4.8678,
    effectiveRate: 4.8456,
    previousRate: 4.8123,
    changePercent: 0.69,
    date: '2025-01-13',
    source: 'TCMB',
  },
];

export default function CurrenciesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const formatRate = (rate: number) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(rate);
  };

  const columns: ColumnsType<ExchangeRate> = [
    {
      title: 'Döviz',
      key: 'currency',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-700">{record.currencyCode}</span>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{record.currencyCode}</div>
            <div className="text-xs text-slate-500">{record.currencyName}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center',
      render: (unit) => (
        <span className="text-sm text-slate-600">{unit}</span>
      ),
    },
    {
      title: 'Alış',
      dataIndex: 'buyingRate',
      key: 'buyingRate',
      width: 120,
      align: 'right',
      render: (rate) => (
        <span className="text-sm text-slate-600">{formatRate(rate)}</span>
      ),
    },
    {
      title: 'Satış',
      dataIndex: 'sellingRate',
      key: 'sellingRate',
      width: 120,
      align: 'right',
      render: (rate) => (
        <span className="text-sm text-slate-600">{formatRate(rate)}</span>
      ),
    },
    {
      title: 'Efektif',
      dataIndex: 'effectiveRate',
      key: 'effectiveRate',
      width: 120,
      align: 'right',
      render: (rate) => (
        <span className="text-sm font-semibold text-slate-900">{formatRate(rate)}</span>
      ),
    },
    {
      title: 'Değişim',
      key: 'change',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          {record.changePercent >= 0 ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${record.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            %{Math.abs(record.changePercent).toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source) => (
        <span className={`px-2 py-1 text-xs font-medium rounded ${
          source === 'TCMB'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {source}
        </span>
      ),
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleAddManualRate = () => {
    form.validateFields().then((values) => {
      console.log('Manual rate:', values);
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  // Summary stats
  const usdRate = mockRates.find(r => r.currencyCode === 'USD');
  const eurRate = mockRates.find(r => r.currencyCode === 'EUR');
  const gbpRate = mockRates.find(r => r.currencyCode === 'GBP');

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CurrencyDollarIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Döviz Kurları</h1>
              <p className="text-sm text-slate-500">TCMB günlük kur verileri ve döviz yönetimi</p>
            </div>
            <div className="flex items-center gap-2">
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                format="DD.MM.YYYY"
                size="large"
                className="[&_.ant-picker]:!border-slate-300 [&_.ant-picker]:!rounded-lg"
              />
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Manuel Kur</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TCMB Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <BuildingLibraryIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              TCMB Döviz Kurları - {selectedDate.format('DD MMMM YYYY')}
            </h3>
            <p className="text-xs text-blue-700">
              Son güncelleme: {dayjs().format('DD.MM.YYYY HH:mm')} • Kaynak: Türkiye Cumhuriyet Merkez Bankası
            </p>
          </div>
        </div>
      </div>

      {/* Quick Rates */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {usdRate && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">USD/TRY</span>
              <div className={`flex items-center gap-1 ${usdRate.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {usdRate.changePercent >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">%{Math.abs(usdRate.changePercent).toFixed(2)}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatRate(usdRate.effectiveRate)}</div>
            <div className="text-xs text-slate-500 mt-1">Efektif Kur</div>
          </div>
        )}
        {eurRate && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">EUR/TRY</span>
              <div className={`flex items-center gap-1 ${eurRate.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {eurRate.changePercent >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">%{Math.abs(eurRate.changePercent).toFixed(2)}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatRate(eurRate.effectiveRate)}</div>
            <div className="text-xs text-slate-500 mt-1">Efektif Kur</div>
          </div>
        )}
        {gbpRate && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">GBP/TRY</span>
              <div className={`flex items-center gap-1 ${gbpRate.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {gbpRate.changePercent >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">%{Math.abs(gbpRate.changePercent).toFixed(2)}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatRate(gbpRate.effectiveRate)}</div>
            <div className="text-xs text-slate-500 mt-1">Efektif Kur</div>
          </div>
        )}
      </div>

      {/* Rates Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Tüm Döviz Kurları</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : mockRates.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-slate-500">Döviz kuru bulunmuyor</span>}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={mockRates}
            rowKey="id"
            pagination={false}
            className={tableClassName}
          />
        )}
      </div>

      {/* Manual Rate Modal */}
      <Modal
        title="Manuel Kur Girişi"
        open={isModalOpen}
        onOk={handleAddManualRate}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="currencyCode"
            label="Döviz Kodu"
            rules={[{ required: true, message: 'Döviz kodu gerekli' }]}
          >
            <Select
              placeholder="Döviz seçin"
              options={[
                { value: 'USD', label: 'USD - ABD Doları' },
                { value: 'EUR', label: 'EUR - Euro' },
                { value: 'GBP', label: 'GBP - İngiliz Sterlini' },
                { value: 'CHF', label: 'CHF - İsviçre Frangı' },
              ]}
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="buyingRate"
              label="Alış Kuru"
              rules={[{ required: true, message: 'Alış kuru gerekli' }]}
            >
              <InputNumber
                className="w-full"
                placeholder="0.0000"
                precision={4}
                min={0}
              />
            </Form.Item>
            <Form.Item
              name="sellingRate"
              label="Satış Kuru"
              rules={[{ required: true, message: 'Satış kuru gerekli' }]}
            >
              <InputNumber
                className="w-full"
                placeholder="0.0000"
                precision={4}
                min={0}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="date"
            label="Geçerlilik Tarihi"
            rules={[{ required: true, message: 'Tarih gerekli' }]}
          >
            <DatePicker className="w-full" format="DD.MM.YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
