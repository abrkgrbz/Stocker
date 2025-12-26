'use client';

/**
 * Delivery Notes Page
 * Official documents sent with shipments
 * Document grid view with print preview modal
 */

import React, { useState } from 'react';
import { Modal, message } from 'antd';
import {
  FileText,
  Truck,
  Search,
  Printer,
  Download,
  Eye,
  Calendar,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  X,
  Building2,
  Phone,
  Hash,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  Badge,
  EmptyState,
} from '@/components/patterns';
import { Select } from '@/components/primitives';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
type DeliveryStatus = 'Preparing' | 'InTransit' | 'Delivered' | 'Returned';

interface DeliveryNoteItem {
  productName: string;
  productSku: string;
  quantity: number;
  unit: string;
}

interface DeliveryNote {
  id: string;
  documentNumber: string;
  orderNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  shipDate: string;
  deliveryDate: string | null;
  carrierName: string;
  carrierTrackingNumber: string | null;
  status: DeliveryStatus;
  items: DeliveryNoteItem[];
  totalPackages: number;
  totalWeight: number;
  notes?: string;
  preparedBy: string;
  deliveredTo?: string;
}

// Mock data
const mockDeliveryNotes: DeliveryNote[] = [
  {
    id: '1',
    documentNumber: 'DN-2024-001450',
    orderNumber: 'SIP-2024-001234',
    orderId: 'ord1',
    customerId: 'c1',
    customerName: 'MediaMarkt Turkey',
    customerAddress: 'Atatürk Mah. İstanbul Cad. No:123 Ataşehir/İstanbul',
    customerPhone: '+90 212 555 1234',
    shipDate: '2024-12-24T10:00:00',
    deliveryDate: null,
    carrierName: 'Aras Kargo',
    carrierTrackingNumber: 'ARK123456789',
    status: 'InTransit',
    items: [
      { productName: 'iPhone 15 Pro Max 256GB', productSku: 'APL-IP15PM-256', quantity: 5, unit: 'Adet' },
      { productName: 'AirPods Pro 2', productSku: 'APL-APP2', quantity: 10, unit: 'Adet' },
    ],
    totalPackages: 3,
    totalWeight: 4.5,
    preparedBy: 'Ahmet Yılmaz',
  },
  {
    id: '2',
    documentNumber: 'DN-2024-001449',
    orderNumber: 'SIP-2024-001230',
    orderId: 'ord2',
    customerId: 'c2',
    customerName: 'Teknosa A.Ş.',
    customerAddress: 'Maslak Mah. Büyükdere Cad. No:45 Sarıyer/İstanbul',
    customerPhone: '+90 212 444 5678',
    shipDate: '2024-12-23T14:00:00',
    deliveryDate: '2024-12-24T11:30:00',
    carrierName: 'MNG Kargo',
    carrierTrackingNumber: 'MNG987654321',
    status: 'Delivered',
    items: [
      { productName: 'MacBook Pro 14" M3', productSku: 'APL-MBP14-M3', quantity: 3, unit: 'Adet' },
    ],
    totalPackages: 3,
    totalWeight: 7.2,
    preparedBy: 'Zeynep Kaya',
    deliveredTo: 'Ali Veli - Depo Sorumlusu',
  },
  {
    id: '3',
    documentNumber: 'DN-2024-001448',
    orderNumber: 'SIP-2024-001225',
    orderId: 'ord3',
    customerId: 'c3',
    customerName: 'Hepsiburada',
    customerAddress: 'Sarıgazi Mah. Bağdat Cad. No:789 Sancaktepe/İstanbul',
    customerPhone: '+90 216 333 9876',
    shipDate: '2024-12-22T09:00:00',
    deliveryDate: '2024-12-23T16:45:00',
    carrierName: 'Yurtiçi Kargo',
    carrierTrackingNumber: 'YK456789123',
    status: 'Delivered',
    items: [
      { productName: 'Samsung Galaxy S24 Ultra', productSku: 'SAM-S24U-512', quantity: 10, unit: 'Adet' },
      { productName: 'Samsung Galaxy Watch 6', productSku: 'SAM-GW6', quantity: 15, unit: 'Adet' },
      { productName: 'Samsung Galaxy Buds 2 Pro', productSku: 'SAM-GB2P', quantity: 20, unit: 'Adet' },
    ],
    totalPackages: 5,
    totalWeight: 8.8,
    preparedBy: 'Mehmet Demir',
    deliveredTo: 'Ayşe Hanım - Giriş Kontrol',
  },
  {
    id: '4',
    documentNumber: 'DN-2024-001447',
    orderNumber: 'SIP-2024-001220',
    orderId: 'ord4',
    customerId: 'c4',
    customerName: 'Vatan Bilgisayar',
    customerAddress: 'Barbaros Mah. Halk Cad. No:56 Beşiktaş/İstanbul',
    customerPhone: '+90 212 222 3456',
    shipDate: '2024-12-24T08:00:00',
    deliveryDate: null,
    carrierName: 'PTT Kargo',
    carrierTrackingNumber: null,
    status: 'Preparing',
    items: [
      { productName: 'Dell XPS 15', productSku: 'DEL-XPS15-I7', quantity: 2, unit: 'Adet' },
    ],
    totalPackages: 2,
    totalWeight: 5.4,
    preparedBy: 'Can Arslan',
  },
  {
    id: '5',
    documentNumber: 'DN-2024-001446',
    orderNumber: 'SIP-2024-001215',
    orderId: 'ord5',
    customerId: 'c5',
    customerName: 'n11.com',
    customerAddress: 'Kozyatağı Mah. Değirmen Sok. No:12 Kadıköy/İstanbul',
    customerPhone: '+90 216 111 2222',
    shipDate: '2024-12-21T11:00:00',
    deliveryDate: null,
    carrierName: 'Sürat Kargo',
    carrierTrackingNumber: 'SRT741852963',
    status: 'InTransit',
    items: [
      { productName: 'Sony WH-1000XM5', productSku: 'SNY-WH1000XM5', quantity: 20, unit: 'Adet' },
      { productName: 'Sony WF-1000XM5', productSku: 'SNY-WF1000XM5', quantity: 30, unit: 'Adet' },
    ],
    totalPackages: 4,
    totalWeight: 6.2,
    preparedBy: 'Elif Özcan',
  },
  {
    id: '6',
    documentNumber: 'DN-2024-001445',
    orderNumber: 'SIP-2024-001210',
    orderId: 'ord6',
    customerId: 'c6',
    customerName: 'Trendyol',
    customerAddress: 'Altunizade Mah. Ordu Cad. No:88 Üsküdar/İstanbul',
    customerPhone: '+90 216 777 8888',
    shipDate: '2024-12-20T15:00:00',
    deliveryDate: null,
    carrierName: 'Aras Kargo',
    carrierTrackingNumber: 'ARK369258147',
    status: 'Returned',
    items: [
      { productName: 'iPad Pro 12.9" M2', productSku: 'APL-IPADP-129', quantity: 8, unit: 'Adet' },
    ],
    totalPackages: 2,
    totalWeight: 3.8,
    preparedBy: 'Deniz Yıldız',
    notes: 'Teslimat adresi yanlış, iade edildi',
  },
];

export default function DeliveryNotesPage() {
  const [deliveryNotes] = useState<DeliveryNote[]>(mockDeliveryNotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'All'>('All');
  const [previewNote, setPreviewNote] = useState<DeliveryNote | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getStatusConfig = (status: DeliveryStatus) => {
    const configs = {
      Preparing: {
        label: 'Hazırlanıyor',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        icon: Clock,
      },
      InTransit: {
        label: 'Yolda',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        icon: Truck,
      },
      Delivered: {
        label: 'Teslim Edildi',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: CheckCircle,
      },
      Returned: {
        label: 'İade Edildi',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: X,
      },
    };
    return configs[status];
  };

  const handlePrintPreview = (note: DeliveryNote) => {
    setPreviewNote(note);
    setPreviewOpen(true);
  };

  const handlePrint = () => {
    window.print();
    message.success('Yazdırma iletişim kutusu açıldı');
  };

  // Filter
  const filteredNotes = deliveryNotes.filter((note) => {
    const matchesSearch =
      note.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.carrierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || note.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const inTransitCount = deliveryNotes.filter((n) => n.status === 'InTransit').length;
  const deliveredCount = deliveryNotes.filter((n) => n.status === 'Delivered').length;

  return (
    <PageContainer maxWidth="7xl">
      <ListPageHeader
        icon={<DocumentTextIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="İrsaliyeler"
        description="Sevkiyat ile gönderilen resmi belgeler"
        itemCount={deliveryNotes.length}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam İrsaliye</span>
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {deliveryNotes.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Yolda</span>
            <Truck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-blue-600">{inTransitCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Teslim Edildi</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-green-600">{deliveredCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam Koli</span>
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {deliveryNotes.reduce((sum, n) => sum + n.totalPackages, 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Belge no, sipariş no, müşteri veya kargo ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Durum"
            value={statusFilter === 'All' ? '' : statusFilter}
            onChange={(e) => setStatusFilter((e.target.value as DeliveryStatus) || 'All')}
            className="w-40"
          >
            <option value="">Tümü</option>
            <option value="Preparing">Hazırlanıyor</option>
            <option value="InTransit">Yolda</option>
            <option value="Delivered">Teslim Edildi</option>
            <option value="Returned">İade Edildi</option>
          </Select>
        </div>
      </Card>

      {/* Document Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="İrsaliye bulunamadı"
            description="Arama kriterlerinize uygun irsaliye yok"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const statusConfig = getStatusConfig(note.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={note.id}
                onClick={() => handlePrintPreview(note)}
                className={`
                  bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all
                  hover:shadow-lg hover:border-slate-300
                  ${statusConfig.borderColor}
                `}
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 24px, #f1f5f9 24px, #f1f5f9 25px)',
                }}
              >
                {/* Document Header - looks like paper */}
                <div className="bg-white border-b border-slate-200 px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-slate-900">{note.documentNumber}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    Sipariş: {note.orderNumber}
                  </div>
                </div>

                {/* Document Body */}
                <div className="px-5 py-4 space-y-3">
                  {/* Customer */}
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      Alıcı
                    </div>
                    <div className="font-medium text-slate-900">{note.customerName}</div>
                  </div>

                  {/* Ship Date & Carrier */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        Sevk Tarihi
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dayjs(note.shipDate).format('DD MMM YYYY')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        Kargo
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-700">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        {note.carrierName}
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      Ürünler ({note.items.length})
                    </div>
                    <div className="text-sm text-slate-600 line-clamp-2">
                      {note.items.map((item) => `${item.quantity}x ${item.productName}`).join(', ')}
                    </div>
                  </div>

                  {/* Package Info */}
                  <div className="flex items-center gap-4 pt-2 border-t border-dashed border-slate-200">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Package className="w-4 h-4" />
                      {note.totalPackages} koli
                    </div>
                    <div className="text-sm text-slate-500">
                      {note.totalWeight} kg
                    </div>
                  </div>
                </div>

                {/* Document Footer */}
                <div className="bg-slate-50 px-5 py-3 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Hazırlayan: {note.preparedBy}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    Önizle
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Print Preview Modal */}
      <Modal
        title={null}
        open={previewOpen}
        onCancel={() => {
          setPreviewOpen(false);
          setPreviewNote(null);
        }}
        footer={null}
        width={700}
        centered
      >
        {previewNote && (
          <div className="print-preview">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">İrsaliye Önizleme</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Yazdır
                </button>
                <button
                  onClick={() => message.info('PDF indirme özelliği yakında!')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="bg-white border border-slate-200 rounded-lg p-8">
              {/* Document Header */}
              <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-900">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">İRSALİYE</h1>
                  <div className="text-sm text-slate-500">Delivery Note / Sevk Belgesi</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Hash className="w-5 h-5" />
                    {previewNote.documentNumber}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Sipariş: {previewNote.orderNumber}
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Gönderen
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">Stocker A.Ş.</div>
                    <div className="text-sm text-slate-600">
                      Merkez Mah. Teknoloji Cad. No:1
                      <br />
                      Maslak / İstanbul
                    </div>
                    <div className="text-sm text-slate-600">Tel: +90 212 999 0000</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Alıcı
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">{previewNote.customerName}</div>
                    <div className="text-sm text-slate-600">{previewNote.customerAddress}</div>
                    <div className="text-sm text-slate-600">Tel: {previewNote.customerPhone}</div>
                  </div>
                </div>
              </div>

              {/* Shipment Info */}
              <div className="grid grid-cols-4 gap-4 mb-8 p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Sevk Tarihi</div>
                  <div className="font-medium text-slate-900">
                    {dayjs(previewNote.shipDate).format('DD.MM.YYYY HH:mm')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Kargo Firması</div>
                  <div className="font-medium text-slate-900">{previewNote.carrierName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Takip No</div>
                  <div className="font-medium text-slate-900">
                    {previewNote.carrierTrackingNumber || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Durum</div>
                  <div className={`font-medium ${getStatusConfig(previewNote.status).textColor}`}>
                    {getStatusConfig(previewNote.status).label}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase py-3 pr-4">
                        #
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase py-3 pr-4">
                        Ürün Kodu
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase py-3 pr-4">
                        Ürün Adı
                      </th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase py-3 pr-4">
                        Miktar
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase py-3">
                        Birim
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewNote.items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3 pr-4 text-sm text-slate-500">{index + 1}</td>
                        <td className="py-3 pr-4 text-sm font-mono text-slate-600">
                          {item.productSku}
                        </td>
                        <td className="py-3 pr-4 text-sm text-slate-900">{item.productName}</td>
                        <td className="py-3 pr-4 text-sm text-right font-semibold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-sm text-slate-600">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Toplam Koli</div>
                      <div className="text-xl font-bold text-slate-900">
                        {previewNote.totalPackages}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Toplam Ağırlık</div>
                      <div className="text-xl font-bold text-slate-900">
                        {previewNote.totalWeight} kg
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-400 mb-2">Notlar</div>
                  <div className="text-sm text-slate-600">
                    {previewNote.notes || 'Özel not bulunmamaktadır.'}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-xs text-slate-400 mb-8">Teslim Eden</div>
                  <div className="border-b border-slate-300 mb-2" />
                  <div className="text-sm text-slate-600">{previewNote.preparedBy}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-8">Teslim Alan</div>
                  <div className="border-b border-slate-300 mb-2" />
                  <div className="text-sm text-slate-600">
                    {previewNote.deliveredTo || 'İmza / Kaşe'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
