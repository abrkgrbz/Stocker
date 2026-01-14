'use client';

/**
 * E-İrsaliye (E-Waybill) Management Page
 * GİB E-İrsaliye yönetimi - UBL-TR 1.2 formatı
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Select, Input, DatePicker, Spin, Empty, Tag, Modal, Form, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  TruckIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  FunnelIcon,
  EyeIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const { RangePicker } = DatePicker;

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
type WaybillDirection = 'outgoing' | 'incoming';
type WaybillType = 'sevk' | 'matbuSevk' | 'iade';
type WaybillStatus = 'draft' | 'waitingApproval' | 'approved' | 'sent' | 'delivered' | 'accepted' | 'rejected' | 'cancelled';

interface EWaybill {
  id: number;
  waybillNumber: string;
  uuid: string;
  direction: WaybillDirection;
  waybillType: WaybillType;
  issueDate: string;
  issueTime: string;
  partyName: string;
  partyVkn: string;
  shipmentDate: string;
  deliveryAddress: string;
  vehiclePlate: string;
  driverName: string;
  driverTckn: string;
  totalQuantity: number;
  totalPackages: number;
  relatedInvoice: string | null;
  gibStatus: WaybillStatus;
  gibResponseCode: string | null;
  gibResponseMessage: string | null;
}

// Status configurations
const statusConfig: Record<WaybillStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Taslak', color: 'default', icon: DocumentTextIcon },
  waitingApproval: { label: 'Onay Bekliyor', color: 'processing', icon: ClockIcon },
  approved: { label: 'Onaylandı', color: 'blue', icon: CheckCircleIcon },
  sent: { label: 'Gönderildi', color: 'cyan', icon: PaperAirplaneIcon },
  delivered: { label: 'Teslim Edildi', color: 'green', icon: TruckIcon },
  accepted: { label: 'Kabul Edildi', color: 'success', icon: CheckCircleIcon },
  rejected: { label: 'Reddedildi', color: 'error', icon: XCircleIcon },
  cancelled: { label: 'İptal Edildi', color: 'default', icon: XCircleIcon },
};

// Waybill type labels
const waybillTypeLabels: Record<WaybillType, string> = {
  sevk: 'Sevk İrsaliyesi',
  matbuSevk: 'Matbu Sevk İrsaliyesi',
  iade: 'İade İrsaliyesi',
};

// Mock data
const mockWaybills: EWaybill[] = [
  {
    id: 1,
    waybillNumber: 'IRS2025000001245',
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    direction: 'outgoing',
    waybillType: 'sevk',
    issueDate: '2025-01-13',
    issueTime: '09:30:00',
    partyName: 'ABC Ticaret Ltd. Şti.',
    partyVkn: '1234567890',
    shipmentDate: '2025-01-13',
    deliveryAddress: 'Atatürk Cad. No:123 Kadıköy/İstanbul',
    vehiclePlate: '34 ABC 123',
    driverName: 'Ahmet Yılmaz',
    driverTckn: '12345678901',
    totalQuantity: 150,
    totalPackages: 25,
    relatedInvoice: 'SLS-2025-001245',
    gibStatus: 'delivered',
    gibResponseCode: '1000',
    gibResponseMessage: 'İrsaliye başarıyla teslim edildi',
  },
  {
    id: 2,
    waybillNumber: 'IRS2025000001244',
    uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    direction: 'outgoing',
    waybillType: 'sevk',
    issueDate: '2025-01-12',
    issueTime: '14:15:00',
    partyName: 'XYZ Holding A.Ş.',
    partyVkn: '9876543210',
    shipmentDate: '2025-01-12',
    deliveryAddress: 'İstiklal Mah. Sanayi Sok. No:45 Nilüfer/Bursa',
    vehiclePlate: '16 XYZ 456',
    driverName: 'Mehmet Demir',
    driverTckn: '98765432109',
    totalQuantity: 320,
    totalPackages: 40,
    relatedInvoice: 'SLS-2025-001244',
    gibStatus: 'sent',
    gibResponseCode: null,
    gibResponseMessage: null,
  },
  {
    id: 3,
    waybillNumber: 'IRS2025000001243',
    uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    direction: 'incoming',
    waybillType: 'sevk',
    issueDate: '2025-01-11',
    issueTime: '10:45:00',
    partyName: 'Global Tedarik A.Ş.',
    partyVkn: '5678901234',
    shipmentDate: '2025-01-11',
    deliveryAddress: 'Merkez Ofis - Organize Sanayi Bölgesi',
    vehiclePlate: '06 TRK 789',
    driverName: 'Ali Kaya',
    driverTckn: '45678901234',
    totalQuantity: 500,
    totalPackages: 100,
    relatedInvoice: 'PUR-2025-000892',
    gibStatus: 'accepted',
    gibResponseCode: '1200',
    gibResponseMessage: 'Kabul edildi',
  },
  {
    id: 4,
    waybillNumber: 'IRS2025000001242',
    uuid: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    direction: 'outgoing',
    waybillType: 'iade',
    issueDate: '2025-01-10',
    issueTime: '16:30:00',
    partyName: 'Merkez Dağıtım Ltd.',
    partyVkn: '3456789012',
    shipmentDate: '2025-01-10',
    deliveryAddress: 'Depo Adresi - Tuzla/İstanbul',
    vehiclePlate: '34 IAD 321',
    driverName: 'Hasan Çelik',
    driverTckn: '67890123456',
    totalQuantity: 50,
    totalPackages: 5,
    relatedInvoice: null,
    gibStatus: 'rejected',
    gibResponseCode: '1300',
    gibResponseMessage: 'Geçersiz alıcı VKN',
  },
  {
    id: 5,
    waybillNumber: '',
    uuid: '',
    direction: 'outgoing',
    waybillType: 'sevk',
    issueDate: '2025-01-13',
    issueTime: '11:00:00',
    partyName: 'Deniz Lojistik',
    partyVkn: '7890123456',
    shipmentDate: '2025-01-14',
    deliveryAddress: 'Liman Cad. No:78 Mersin',
    vehiclePlate: '33 DNZ 654',
    driverName: 'Veli Şahin',
    driverTckn: '23456789012',
    totalQuantity: 200,
    totalPackages: 30,
    relatedInvoice: 'SLS-2025-001246',
    gibStatus: 'draft',
    gibResponseCode: null,
    gibResponseMessage: null,
  },
];

export default function EWaybillPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [directionFilter, setDirectionFilter] = useState<WaybillDirection | null>(null);
  const [statusFilter, setStatusFilter] = useState<WaybillStatus | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Calculate stats
  const stats = mockWaybills.reduce(
    (acc, wb) => {
      acc.total += 1;
      if (wb.direction === 'outgoing') acc.outgoing += 1;
      else acc.incoming += 1;
      if (wb.gibStatus === 'delivered' || wb.gibStatus === 'accepted') acc.completed += 1;
      if (wb.gibStatus === 'sent' || wb.gibStatus === 'waitingApproval') acc.pending += 1;
      if (wb.gibStatus === 'rejected') acc.rejected += 1;
      return acc;
    },
    { total: 0, outgoing: 0, incoming: 0, completed: 0, pending: 0, rejected: 0 }
  );

  const columns: ColumnsType<EWaybill> = [
    {
      title: 'İrsaliye',
      key: 'waybill',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">
            {record.waybillNumber || <span className="text-slate-400 italic">Taslak</span>}
          </div>
          <div className="text-xs text-slate-500">
            {dayjs(record.issueDate).format('DD.MM.YYYY')} {record.issueTime.slice(0, 5)}
          </div>
        </div>
      ),
    },
    {
      title: 'Yön',
      key: 'direction',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          {record.direction === 'outgoing' ? (
            <>
              <ArrowUpTrayIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-emerald-600">Giden</span>
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-600">Gelen</span>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Tür',
      key: 'type',
      width: 140,
      render: (_, record) => (
        <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
          {waybillTypeLabels[record.waybillType]}
        </span>
      ),
    },
    {
      title: 'Firma',
      key: 'party',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-900">{record.partyName}</div>
          <div className="text-xs text-slate-500">VKN: {record.partyVkn}</div>
        </div>
      ),
    },
    {
      title: 'Sevk Bilgileri',
      key: 'shipment',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="text-xs text-slate-600">{record.vehiclePlate}</div>
          <div className="text-xs text-slate-500">{record.driverName}</div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.totalQuantity}</div>
          <div className="text-xs text-slate-500">{record.totalPackages} koli</div>
        </div>
      ),
    },
    {
      title: 'İlgili Fatura',
      dataIndex: 'relatedInvoice',
      key: 'relatedInvoice',
      width: 140,
      render: (invoice) => (
        invoice ? (
          <Link href={`/finance/invoices`} className="text-xs text-blue-600 hover:underline">
            {invoice}
          </Link>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )
      ),
    },
    {
      title: 'GİB Durumu',
      key: 'gibStatus',
      width: 130,
      render: (_, record) => {
        const config = statusConfig[record.gibStatus];
        return (
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <EyeIcon className="w-4 h-4 text-slate-500" />
          </button>
          {record.gibStatus === 'draft' && (
            <button className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors">
              <PaperAirplaneIcon className="w-4 h-4 text-blue-500" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleCreateWaybill = () => {
    form.validateFields().then((values) => {
      console.log('Creating waybill:', values);
      setIsNewModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <TruckIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">E-İrsaliye Yönetimi</h1>
              <p className="text-sm text-slate-500">GİB E-İrsaliye işlemleri - UBL-TR 1.2</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Yeni E-İrsaliye</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Toplam</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-1 mb-1">
            <ArrowUpTrayIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-500">Giden</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.outgoing}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-1 mb-1">
            <ArrowDownTrayIcon className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">Gelen</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.incoming}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Tamamlanan</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Bekleyen</div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Reddedilen</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">Filtreler:</span>
          </div>
          <Input
            placeholder="İrsaliye no veya firma ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <Select
            placeholder="Yön"
            allowClear
            value={directionFilter}
            onChange={(value) => setDirectionFilter(value)}
            className="w-28"
            options={[
              { value: 'outgoing', label: 'Giden' },
              { value: 'incoming', label: 'Gelen' },
            ]}
          />
          <Select
            placeholder="Durum"
            allowClear
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-36"
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.label,
            }))}
          />
          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            className="w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">E-İrsaliye Listesi</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : mockWaybills.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-slate-500">E-İrsaliye bulunmuyor</span>}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={mockWaybills}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} irsaliye`,
            }}
            scroll={{ x: 1400 }}
            className={tableClassName}
          />
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">E-İrsaliye Hakkında</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-700">
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Sevk İrsaliyesi</h4>
            <p>
              Malların bir yerden başka bir yere taşınması sırasında düzenlenen belgedir.
              E-Fatura mükelleflerinden mal alan/satan firmalar için zorunludur.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Yasal Süre</h4>
            <p>
              Malın fiili sevkinden önce veya en geç sevk anında düzenlenmesi gerekir.
              Alıcı firma 8 gün içinde kabul/red işlemi yapmalıdır.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">İade İrsaliyesi</h4>
            <p>
              Satış iadelerinde kullanılır. Asıl irsaliye bilgilerine referans verilmesi
              ve iade nedeninin belirtilmesi zorunludur.
            </p>
          </div>
        </div>
      </div>

      {/* New Waybill Modal */}
      <Modal
        title="Yeni E-İrsaliye Oluştur"
        open={isNewModalOpen}
        onOk={handleCreateWaybill}
        onCancel={() => {
          setIsNewModalOpen(false);
          form.resetFields();
        }}
        okText="Oluştur"
        cancelText="İptal"
        width={700}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="waybillType"
              label="İrsaliye Türü"
              rules={[{ required: true, message: 'Tür seçiniz' }]}
            >
              <Select
                placeholder="Tür seçin"
                options={Object.entries(waybillTypeLabels).map(([key, label]) => ({
                  value: key,
                  label,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="shipmentDate"
              label="Sevk Tarihi"
              rules={[{ required: true, message: 'Tarih gerekli' }]}
            >
              <DatePicker className="w-full" format="DD.MM.YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            name="partyVkn"
            label="Alıcı VKN/TCKN"
            rules={[{ required: true, message: 'VKN gerekli' }]}
          >
            <Input placeholder="Vergi Kimlik Numarası" />
          </Form.Item>

          <Form.Item
            name="deliveryAddress"
            label="Teslimat Adresi"
            rules={[{ required: true, message: 'Adres gerekli' }]}
          >
            <Input.TextArea rows={2} placeholder="Teslimat adresi" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="vehiclePlate"
              label="Araç Plakası"
              rules={[{ required: true, message: 'Plaka gerekli' }]}
            >
              <Input placeholder="34 ABC 123" />
            </Form.Item>
            <Form.Item
              name="driverTckn"
              label="Şoför TCKN"
              rules={[{ required: true, message: 'TCKN gerekli' }]}
            >
              <Input placeholder="12345678901" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="totalQuantity"
              label="Toplam Miktar"
              rules={[{ required: true, message: 'Miktar gerekli' }]}
            >
              <InputNumber className="w-full" min={1} placeholder="0" />
            </Form.Item>
            <Form.Item
              name="totalPackages"
              label="Koli Sayısı"
              rules={[{ required: true, message: 'Koli sayısı gerekli' }]}
            >
              <InputNumber className="w-full" min={1} placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item
            name="relatedInvoice"
            label="İlgili Fatura (Opsiyonel)"
          >
            <Input placeholder="Fatura numarası" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
