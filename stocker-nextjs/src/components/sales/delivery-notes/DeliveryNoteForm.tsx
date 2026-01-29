'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, Table, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  TruckIcon,
  DocumentTextIcon,
  CubeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type {
  DeliveryNoteDto,
  DeliveryNoteItemDto,
  CreateDeliveryNoteDto,
  CreateDeliveryNoteItemDto,
  DeliveryNoteType,
  TransportMode,
} from '@/features/sales/types';

// =====================================
// TYPES
// =====================================

interface DeliveryNoteFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialData?: DeliveryNoteDto | null;
  onSubmit: (values: CreateDeliveryNoteDto) => Promise<void>;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

interface DeliveryNoteFormValues {
  series: string;
  deliveryNoteDate: dayjs.Dayjs;
  deliveryNoteType: DeliveryNoteType;
  senderTaxId: string;
  senderName: string;
  senderAddress: string;
  receiverTaxId: string;
  receiverName: string;
  receiverAddress: string;
  transportMode: TransportMode;
  carrierName?: string;
  carrierTaxId?: string;
  vehiclePlate?: string;
  driverName?: string;
  driverIdNumber?: string;
  salesOrderId?: string;
  warehouseId?: string;
  description?: string;
}

interface ItemRow extends CreateDeliveryNoteItemDto {
  key: string;
}

// =====================================
// CONSTANTS
// =====================================

const deliveryNoteTypes: { value: DeliveryNoteType; label: string }[] = [
  { value: 'Sales', label: 'Satış' },
  { value: 'Return', label: 'İade' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Sample', label: 'Numune' },
  { value: 'Other', label: 'Diğer' },
];

const transportModes: { value: TransportMode; label: string }[] = [
  { value: 'Road', label: 'Karayolu' },
  { value: 'Sea', label: 'Deniz' },
  { value: 'Air', label: 'Havayolu' },
  { value: 'Rail', label: 'Demiryolu' },
  { value: 'Multimodal', label: 'Karma' },
];

// =====================================
// COMPONENT
// =====================================

export function DeliveryNoteForm({
  form,
  initialData,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
}: DeliveryNoteFormProps) {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // =====================================
  // STATE
  // =====================================
  const [items, setItems] = useState<ItemRow[]>([]);

  // =====================================
  // EFFECTS
  // =====================================
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        series: initialData.series,
        deliveryNoteDate: dayjs(initialData.deliveryNoteDate),
        deliveryNoteType: initialData.deliveryNoteType as DeliveryNoteType,
        senderTaxId: initialData.senderTaxId,
        senderName: initialData.senderName,
        senderAddress: initialData.senderAddress,
        receiverTaxId: initialData.receiverTaxId,
        receiverName: initialData.receiverName,
        receiverAddress: initialData.receiverAddress,
        transportMode: initialData.transportMode as TransportMode,
        carrierName: initialData.carrierName,
        carrierTaxId: initialData.carrierTaxId,
        vehiclePlate: initialData.vehiclePlate,
        driverName: initialData.driverName,
        driverIdNumber: initialData.driverIdNumber,
        salesOrderId: initialData.salesOrderId,
        warehouseId: initialData.warehouseId,
        description: initialData.description,
      });
      // Map existing items
      const mappedItems: ItemRow[] = initialData.items.map((item: DeliveryNoteItemDto, index: number) => ({
        key: item.id || `item-${index}`,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
      }));
      setItems(mappedItems);
    }
  }, [initialData, form]);

  // =====================================
  // COMPUTED VALUES
  // =====================================
  const totals = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalGrossWeight = items.reduce((sum, item) => sum + (item.grossWeight || 0), 0);
    const totalNetWeight = items.reduce((sum, item) => sum + (item.netWeight || 0), 0);
    return { totalQuantity, totalGrossWeight, totalNetWeight };
  }, [items]);

  // =====================================
  // HANDLERS
  // =====================================
  const handleFormSubmit = async (values: DeliveryNoteFormValues) => {
    const submitItems: CreateDeliveryNoteItemDto[] = items.map(item => ({
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
      batchNumber: item.batchNumber,
      serialNumber: item.serialNumber,
      grossWeight: item.grossWeight,
      netWeight: item.netWeight,
    }));

    const submitData: CreateDeliveryNoteDto = {
      series: values.series,
      deliveryNoteDate: values.deliveryNoteDate.toISOString(),
      deliveryNoteType: values.deliveryNoteType,
      senderTaxId: values.senderTaxId,
      senderName: values.senderName,
      senderAddress: values.senderAddress,
      receiverTaxId: values.receiverTaxId,
      receiverName: values.receiverName,
      receiverAddress: values.receiverAddress,
      transportMode: values.transportMode,
      carrierName: values.carrierName,
      carrierTaxId: values.carrierTaxId,
      vehiclePlate: values.vehiclePlate,
      driverName: values.driverName,
      driverIdNumber: values.driverIdNumber,
      salesOrderId: values.salesOrderId,
      warehouseId: values.warehouseId,
      description: values.description,
      items: submitItems,
    };

    await onSubmit(submitData);
  };

  const addNewItem = () => {
    const newItem: ItemRow = {
      key: `new-${Date.now()}`,
      productId: '',
      productCode: '',
      productName: '',
      quantity: 1,
      unit: 'Adet',
    };
    setItems([...items, newItem]);
  };

  const updateItem = (key: string, field: keyof ItemRow, value: unknown) => {
    setItems(prev => prev.map(item => {
      if (item.key !== key) return item;
      return { ...item, [field]: value };
    }));
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(item => item.key !== key));
  };

  // =====================================
  // TABLE COLUMNS
  // =====================================
  const itemColumns: ColumnsType<ItemRow> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (value: string, record) => isViewMode ? value : (
        <Input
          value={value}
          onChange={(e) => updateItem(record.key, 'productCode', e.target.value)}
          placeholder="Kod"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      render: (value: string, record) => isViewMode ? value : (
        <Input
          value={value}
          onChange={(e) => updateItem(record.key, 'productName', e.target.value)}
          placeholder="Ürün adı"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (value: number, record) => isViewMode ? value : (
        <InputNumber
          value={value}
          onChange={(val) => updateItem(record.key, 'quantity', val || 0)}
          min={0}
          className="w-full !bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (value: string, record) => isViewMode ? value : (
        <Input
          value={value}
          onChange={(e) => updateItem(record.key, 'unit', e.target.value)}
          placeholder="Birim"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Parti No',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
      render: (value: string, record) => isViewMode ? (value || '-') : (
        <Input
          value={value}
          onChange={(e) => updateItem(record.key, 'batchNumber', e.target.value)}
          placeholder="Parti"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Brüt (kg)',
      dataIndex: 'grossWeight',
      key: 'grossWeight',
      width: 100,
      render: (value: number, record) => isViewMode ? (value || '-') : (
        <InputNumber
          value={value}
          onChange={(val) => updateItem(record.key, 'grossWeight', val || 0)}
          min={0}
          precision={2}
          className="w-full !bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Net (kg)',
      dataIndex: 'netWeight',
      key: 'netWeight',
      width: 100,
      render: (value: number, record) => isViewMode ? (value || '-') : (
        <InputNumber
          value={value}
          onChange={(val) => updateItem(record.key, 'netWeight', val || 0)}
          min={0}
          precision={2}
          className="w-full !bg-slate-50 !border-slate-300"
        />
      ),
    },
    ...(isViewMode ? [] : [{
      title: '',
      key: 'action',
      width: 50,
      render: (_: unknown, record: ItemRow) => (
        <Popconfirm
          title="Bu kalemi silmek istediğinize emin misiniz?"
          onConfirm={() => removeItem(record.key)}
          okText="Evet"
          cancelText="Hayır"
        >
          <Button type="text" danger icon={<TrashIcon className="w-4 h-4" />} />
        </Popconfirm>
      ),
    }]),
  ];

  // =====================================
  // RENDER
  // =====================================
  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <TruckIcon className="w-8 h-8 text-slate-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">
              {isViewMode ? 'İrsaliye Detayı' : isEditMode ? 'İrsaliye Düzenle' : 'Yeni İrsaliye'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Mal sevkiyatı için irsaliye oluşturun
            </p>
            {initialData && (
              <p className="text-xs text-slate-400 mt-1">
                İrsaliye No: {initialData.deliveryNoteNumber}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{items.length} Kalem</p>
            <p className="text-sm text-slate-500">Toplam: {totals.totalQuantity} adet</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        disabled={isViewMode}
        initialValues={{
          series: 'A',
          deliveryNoteDate: dayjs(),
          deliveryNoteType: 'Sales',
          transportMode: 'Road',
        }}
        className="p-6"
      >
        {/* Basic Info Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" />
            İrsaliye Bilgileri
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <Form.Item
              name="series"
              label="Seri"
              rules={[{ required: true, message: 'Seri zorunludur' }]}
              className="col-span-2"
            >
              <Input
                placeholder="A"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="deliveryNoteDate"
              label="İrsaliye Tarihi"
              rules={[{ required: true, message: 'Tarih zorunludur' }]}
              className="col-span-3"
            >
              <DatePicker
                format="DD.MM.YYYY"
                placeholder="Tarih seçin"
                className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="deliveryNoteType"
              label="İrsaliye Tipi"
              rules={[{ required: true, message: 'Tip zorunludur' }]}
              className="col-span-3"
            >
              <Select
                options={deliveryNoteTypes}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="salesOrderId"
              label="Sipariş No"
              className="col-span-4"
            >
              <Input
                placeholder="İlişkili sipariş"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>
          </div>
        </div>

        {/* Sender Info Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <BuildingOfficeIcon className="w-4 h-4" />
            Gönderici Bilgileri
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <Form.Item
              name="senderTaxId"
              label="VKN / TCKN"
              rules={[{ required: true, message: 'Vergi no zorunludur' }]}
              className="col-span-3"
            >
              <Input
                placeholder="Vergi numarası"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="senderName"
              label="Ad / Ünvan"
              rules={[{ required: true, message: 'Ad zorunludur' }]}
              className="col-span-5"
            >
              <Input
                placeholder="Gönderici adı veya ünvanı"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="senderAddress"
              label="Adres"
              rules={[{ required: true, message: 'Adres zorunludur' }]}
              className="col-span-4"
            >
              <Input
                placeholder="Gönderici adresi"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>
          </div>
        </div>

        {/* Receiver Info Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" />
            Alıcı Bilgileri
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <Form.Item
              name="receiverTaxId"
              label="VKN / TCKN"
              rules={[{ required: true, message: 'Vergi no zorunludur' }]}
              className="col-span-3"
            >
              <Input
                placeholder="Vergi numarası"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="receiverName"
              label="Ad / Ünvan"
              rules={[{ required: true, message: 'Ad zorunludur' }]}
              className="col-span-5"
            >
              <Input
                placeholder="Alıcı adı veya ünvanı"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="receiverAddress"
              label="Adres"
              rules={[{ required: true, message: 'Adres zorunludur' }]}
              className="col-span-4"
            >
              <Input
                placeholder="Alıcı adresi"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>
          </div>
        </div>

        {/* Transport Info Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <TruckIcon className="w-4 h-4" />
            Taşıma Bilgileri
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <Form.Item
              name="transportMode"
              label="Taşıma Modu"
              rules={[{ required: true, message: 'Taşıma modu zorunludur' }]}
              className="col-span-3"
            >
              <Select
                options={transportModes}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="carrierName"
              label="Taşıyıcı Firma"
              className="col-span-3"
            >
              <Input
                placeholder="Nakliye firması"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="carrierTaxId"
              label="Taşıyıcı VKN"
              className="col-span-3"
            >
              <Input
                placeholder="Taşıyıcı vergi no"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="vehiclePlate"
              label="Araç Plakası"
              className="col-span-3"
            >
              <Input
                placeholder="34 ABC 123"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="driverName"
              label="Sürücü Adı"
              className="col-span-4"
            >
              <Input
                placeholder="Sürücü adı soyadı"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="driverIdNumber"
              label="Sürücü TC"
              className="col-span-4"
            >
              <Input
                placeholder="Sürücü kimlik no"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="warehouseId"
              label="Depo"
              className="col-span-4"
            >
              <Select
                showSearch
                allowClear
                placeholder="Depo seçin"
                options={[]}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>
          </div>
        </div>

        {/* Items Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <CubeIcon className="w-4 h-4" />
            Kalemler
            {!isViewMode && (
              <Button
                type="link"
                size="small"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={addNewItem}
                className="ml-auto"
              >
                Kalem Ekle
              </Button>
            )}
          </h3>
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey="key"
            pagination={false}
            size="small"
            className="border border-slate-200 rounded-lg"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-slate-50">
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <span className="font-medium">Toplam</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <span className="font-medium">{totals.totalQuantity}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} colSpan={2} />
                  <Table.Summary.Cell index={5}>
                    <span className="font-medium">{totals.totalGrossWeight.toFixed(2)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}>
                    <span className="font-medium">{totals.totalNetWeight.toFixed(2)}</span>
                  </Table.Summary.Cell>
                  {!isViewMode && <Table.Summary.Cell index={7} />}
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>

        {/* Description Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
            Açıklama
          </h3>
          <Form.Item name="description" className="mb-0">
            <Input.TextArea
              rows={3}
              placeholder="İrsaliye açıklaması..."
              className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
            />
          </Form.Item>
        </div>

        {/* Status Info - View Mode */}
        {isViewMode && initialData && (
          <div className="mb-8 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-200">
              Durum Bilgileri
            </h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Durum:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  initialData.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  initialData.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                  initialData.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                  initialData.status === 'InTransit' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {initialData.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500">e-İrsaliye:</span>
                <span className="ml-2">{initialData.isEDeliveryNote ? 'Evet' : 'Hayır'}</span>
              </div>
              <div>
                <span className="text-slate-500">Teslim Tarihi:</span>
                <span className="ml-2">
                  {initialData.deliveryDate ? dayjs(initialData.deliveryDate).format('DD.MM.YYYY') : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Teslim Alan:</span>
                <span className="ml-2">{initialData.receivedBy || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button size="large">İptal</Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              className="!bg-slate-900 hover:!bg-slate-800"
            >
              {isEditMode ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}

export default DeliveryNoteForm;
