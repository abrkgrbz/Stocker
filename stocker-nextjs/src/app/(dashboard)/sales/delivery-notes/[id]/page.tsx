'use client';

/**
 * Delivery Note Detail Page
 * Irsaliye detay sayfasi - Monochrome Design System
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  TruckIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  XCircleIcon,
  PrinterIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { Table, Spin, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useDeliveryNote, useDispatchDeliveryNote, useDeliverDeliveryNote, useCancelDeliveryNote } from '@/features/sales';
import type { DeliveryNoteItemDto } from '@/features/sales';

dayjs.locale('tr');

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  Dispatched: { label: 'Sevk Edildi', bgColor: 'bg-slate-300', textColor: 'text-slate-800' },
  InTransit: { label: 'Yolda', bgColor: 'bg-slate-500', textColor: 'text-white' },
  Delivered: { label: 'Teslim Edildi', bgColor: 'bg-slate-800', textColor: 'text-white' },
  Cancelled: { label: 'Iptal', bgColor: 'bg-slate-900', textColor: 'text-white' },
};

export default function DeliveryNoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: note, isLoading } = useDeliveryNote(id);
  const dispatchMutation = useDispatchDeliveryNote();
  const deliverMutation = useDeliverDeliveryNote();
  const cancelMutation = useCancelDeliveryNote();

  const handleDispatch = () => {
    dispatchMutation.mutate({ id, data: { dispatchDate: dayjs().toISOString() } });
  };

  const handleDeliver = () => {
    deliverMutation.mutate({ id, data: {} });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Irsaliye Iptal',
      content: 'Bu irsaliyeyi iptal etmek istediginizden emin misiniz?',
      okText: 'Iptal Et',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: () => {
        cancelMutation.mutate({ id, reason: 'Kullanici tarafindan iptal edildi' });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">Irsaliye bulunamadi</h2>
          <Link href="/sales/delivery-notes" className="text-sm text-slate-500 hover:text-slate-700 mt-2 inline-block">
            Listeye don
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[note.status] || statusConfig.Draft;

  const itemColumns: ColumnsType<DeliveryNoteItemDto> = [
    {
      title: '#',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 50,
      render: (num: number) => <span className="text-sm text-slate-500">{num}</span>,
    },
    {
      title: 'Urun Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 140,
      render: (code: string) => <span className="font-mono text-sm text-slate-700">{code}</span>,
    },
    {
      title: 'Urun Adi',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string) => <span className="text-sm font-medium text-slate-900">{name}</span>,
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (qty: number) => <span className="text-sm font-semibold text-slate-900">{qty}</span>,
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (unit: string) => <span className="text-sm text-slate-600">{unit}</span>,
    },
    {
      title: 'Lot/Seri',
      key: 'lotSerial',
      width: 140,
      render: (_, record) => (
        <div className="text-xs text-slate-500">
          {record.lotNumber && <div>Lot: {record.lotNumber}</div>}
          {record.serialNumber && <div>Seri: {record.serialNumber}</div>}
          {!record.lotNumber && !record.serialNumber && '-'}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/sales/delivery-notes"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{note.deliveryNoteNumber}</h1>
                <p className="text-sm text-slate-500">
                  {dayjs(note.deliveryNoteDate).format('DD MMMM YYYY')}
                  {note.salesOrderNumber && ` - Siparis: ${note.salesOrderNumber}`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {note.status === 'Draft' && (
              <button
                onClick={handleDispatch}
                disabled={dispatchMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Sevk Et
              </button>
            )}
            {(note.status === 'Dispatched' || note.status === 'InTransit') && (
              <button
                onClick={handleDeliver}
                disabled={deliverMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Teslim Et
              </button>
            )}
            {note.status !== 'Cancelled' && note.status !== 'Delivered' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Iptal Et
              </button>
            )}
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <PrinterIcon className="w-4 h-4" />
              Yazdir
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Note Info Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Irsaliye Bilgileri
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Irsaliye No</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">{note.deliveryNoteNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Seri</p>
                  <p className="text-sm font-medium text-slate-900">{note.series}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tip</p>
                  <p className="text-sm font-medium text-slate-900">{note.deliveryNoteType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">E-Irsaliye</p>
                  <p className="text-sm font-medium text-slate-900">{note.isEDeliveryNote ? 'Evet' : 'Hayir'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Toplam Kalem</p>
                  <p className="text-sm font-medium text-slate-900">{note.totalLineCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Toplam Miktar</p>
                  <p className="text-sm font-medium text-slate-900">{note.totalQuantity}</p>
                </div>
                {note.totalGrossWeight && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Brut Agirlik</p>
                    <p className="text-sm font-medium text-slate-900">{note.totalGrossWeight} kg</p>
                  </div>
                )}
                {note.totalNetWeight && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Net Agirlik</p>
                    <p className="text-sm font-medium text-slate-900">{note.totalNetWeight} kg</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 pb-4 border-b border-slate-100">
                <h3 className="text-base font-semibold text-slate-900">Kalemler</h3>
                <p className="text-xs text-slate-500">{note.items?.length || 0} kalem</p>
              </div>
              <Table
                className="enterprise-table"
                columns={itemColumns}
                dataSource={note.items || []}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>

            {/* Notes */}
            {(note.notes || note.description) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">Notlar</h3>
                {note.description && <p className="text-sm text-slate-700 mb-2">{note.description}</p>}
                {note.notes && <p className="text-sm text-slate-600">{note.notes}</p>}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Durum</h3>
              <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg ${status.bgColor} ${status.textColor}`}>
                {status.label}
              </span>
            </div>

            {/* Sender Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-400" />
                Gonderici
              </h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{note.senderName}</p>
                <p className="text-xs text-slate-500">VKN: {note.senderTaxId}</p>
                <p className="text-xs text-slate-600">{note.senderAddress}</p>
                {note.senderCity && (
                  <p className="text-xs text-slate-500">
                    {note.senderDistrict && `${note.senderDistrict} / `}{note.senderCity}
                  </p>
                )}
              </div>
            </div>

            {/* Receiver Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-slate-400" />
                Alici
              </h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{note.receiverName}</p>
                <p className="text-xs text-slate-500">VKN: {note.receiverTaxId}</p>
                <p className="text-xs text-slate-600">{note.receiverAddress}</p>
                {note.receiverCity && (
                  <p className="text-xs text-slate-500">
                    {note.receiverDistrict && `${note.receiverDistrict} / `}{note.receiverCity}
                  </p>
                )}
              </div>
            </div>

            {/* Transport Card */}
            {(note.transportMode || note.carrierName || note.vehiclePlate || note.driverName) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TruckIcon className="w-4 h-4 text-slate-400" />
                  Tasima Bilgileri
                </h3>
                <div className="space-y-2">
                  {note.transportMode && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Mod</span>
                      <span className="text-xs font-medium text-slate-700">{note.transportMode}</span>
                    </div>
                  )}
                  {note.carrierName && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Tasiyici</span>
                      <span className="text-xs font-medium text-slate-700">{note.carrierName}</span>
                    </div>
                  )}
                  {note.vehiclePlate && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Plaka</span>
                      <span className="text-xs font-medium text-slate-700">{note.vehiclePlate}</span>
                    </div>
                  )}
                  {note.driverName && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Surucu</span>
                      <span className="text-xs font-medium text-slate-700">{note.driverName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dates Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                Tarihler
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Duzenleme</span>
                  <span className="text-xs font-medium text-slate-700">
                    {dayjs(note.deliveryNoteDate).format('DD.MM.YYYY')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Sevk</span>
                  <span className="text-xs font-medium text-slate-700">
                    {dayjs(note.dispatchDate).format('DD.MM.YYYY')}
                  </span>
                </div>
                {note.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Teslim</span>
                    <span className="text-xs font-medium text-slate-700">
                      {dayjs(note.deliveryDate).format('DD.MM.YYYY')}
                    </span>
                  </div>
                )}
                {note.receivedBy && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Teslim Alan</span>
                    <span className="text-xs font-medium text-slate-700">{note.receivedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
