'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Divider,
  Tag,
  Collapse,
  Switch,
  Row,
  Col,
} from 'antd';
import {
  FunnelIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

export interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'numberrange' | 'boolean';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  defaultValue?: any;
  group?: string;
}

export interface AdvancedFilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  onFilter: (values: Record<string, any>) => void;
  onReset?: () => void;
  fields: FilterField[];
  title?: string;
  initialValues?: Record<string, any>;
  width?: number;
}

export function AdvancedFilterDrawer({
  visible,
  onClose,
  onFilter,
  onReset,
  fields,
  title = 'Gelişmiş Filtreler',
  initialValues = {},
  width = 400,
}: AdvancedFilterDrawerProps) {
  const [form] = Form.useForm();
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
      countActiveFilters(initialValues);
    }
  }, [visible, initialValues, form]);

  const countActiveFilters = (values: Record<string, any>) => {
    let count = 0;
    Object.entries(values).forEach(([_, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          count++;
        } else if (!Array.isArray(value)) {
          count++;
        }
      }
    });
    setActiveFiltersCount(count);
  };

  const handleFinish = (values: Record<string, any>) => {
    // Convert date values to ISO strings
    const processedValues = { ...values };
    Object.entries(processedValues).forEach(([key, value]) => {
      if (dayjs.isDayjs(value)) {
        processedValues[key] = value.toISOString();
      } else if (Array.isArray(value) && value.length === 2 && dayjs.isDayjs(value[0])) {
        processedValues[key] = [value[0].toISOString(), value[1].toISOString()];
      }
    });

    countActiveFilters(processedValues);
    onFilter(processedValues);
    onClose();
  };

  const handleReset = () => {
    form.resetFields();
    setActiveFiltersCount(0);
    if (onReset) {
      onReset();
    }
    onFilter({});
    onClose();
  };

  // Group fields by their group property
  const groupedFields = fields.reduce((acc, field) => {
    const group = field.group || 'Genel';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(field);
    return acc;
  }, {} as Record<string, FilterField[]>);

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder || `${field.label} girin`}
            allowClear
          />
        );

      case 'select':
        return (
          <Select
            placeholder={field.placeholder || `${field.label} seçin`}
            options={field.options}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        );

      case 'multiselect':
        return (
          <Select
            mode="multiple"
            placeholder={field.placeholder || `${field.label} seçin`}
            options={field.options}
            allowClear
            showSearch
            optionFilterProp="label"
            maxTagCount="responsive"
          />
        );

      case 'date':
        return (
          <DatePicker
            style={{ width: '100%' }}
            placeholder={field.placeholder || 'Tarih seçin'}
            format="DD.MM.YYYY"
          />
        );

      case 'daterange':
        return (
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['Başlangıç', 'Bitiş']}
            format="DD.MM.YYYY"
          />
        );

      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={field.placeholder || `${field.label} girin`}
            min={field.min}
            max={field.max}
          />
        );

      case 'numberrange':
        return (
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name={[field.name, 'min']} noStyle>
              <InputNumber
                style={{ width: '50%' }}
                placeholder="Min"
                min={field.min}
                max={field.max}
              />
            </Form.Item>
            <Form.Item name={[field.name, 'max']} noStyle>
              <InputNumber
                style={{ width: '50%' }}
                placeholder="Max"
                min={field.min}
                max={field.max}
              />
            </Form.Item>
          </Space.Compact>
        );

      case 'boolean':
        return (
          <Select
            placeholder={field.placeholder || 'Seçin'}
            allowClear
            options={[
              { value: true, label: 'Evet' },
              { value: false, label: 'Hayır' },
            ]}
          />
        );

      default:
        return <Input placeholder={field.placeholder} allowClear />;
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-blue-500" />
            <span>{title}</span>
            {activeFiltersCount > 0 && (
              <Tag color="blue">{activeFiltersCount} aktif</Tag>
            )}
          </div>
        </div>
      }
      placement="right"
      width={width}
      open={visible}
      onClose={onClose}
      extra={
        <Button
          type="text"
          icon={<XMarkIcon className="w-4 h-4" />}
          onClick={onClose}
        />
      }
      footer={
        <div className="flex justify-between">
          <Button
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={handleReset}
          >
            Temizle
          </Button>
          <Space>
            <Button onClick={onClose}>İptal</Button>
            <Button
              type="primary"
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
              onClick={() => form.submit()}
            >
              Filtrele
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        {Object.keys(groupedFields).length === 1 ? (
          // Single group - no collapse
          groupedFields[Object.keys(groupedFields)[0]].map((field) => (
            <Form.Item
              key={field.name}
              name={field.type === 'numberrange' ? undefined : field.name}
              label={field.label}
            >
              {renderField(field)}
            </Form.Item>
          ))
        ) : (
          // Multiple groups - use collapse
          <Collapse
            defaultActiveKey={Object.keys(groupedFields)}
            ghost
            expandIconPosition="end"
          >
            {Object.entries(groupedFields).map(([group, groupFields]) => (
              <Panel header={group} key={group}>
                {groupFields.map((field) => (
                  <Form.Item
                    key={field.name}
                    name={field.type === 'numberrange' ? undefined : field.name}
                    label={field.label}
                  >
                    {renderField(field)}
                  </Form.Item>
                ))}
              </Panel>
            ))}
          </Collapse>
        )}
      </Form>
    </Drawer>
  );
}

// Pre-configured filter fields for common use cases

export const purchaseOrderFilterFields: FilterField[] = [
  { name: 'searchTerm', label: 'Arama', type: 'text', placeholder: 'Sipariş no veya tedarikçi...', group: 'Genel' },
  {
    name: 'status',
    label: 'Durum',
    type: 'multiselect',
    group: 'Genel',
    options: [
      { value: 'Draft', label: 'Taslak' },
      { value: 'PendingApproval', label: 'Onay Bekliyor' },
      { value: 'Confirmed', label: 'Onaylandı' },
      { value: 'Rejected', label: 'Reddedildi' },
      { value: 'Sent', label: 'Gönderildi' },
      { value: 'PartiallyReceived', label: 'Kısmen Alındı' },
      { value: 'Received', label: 'Teslim Alındı' },
      { value: 'Completed', label: 'Tamamlandı' },
      { value: 'Cancelled', label: 'İptal' },
    ],
  },
  { name: 'orderDate', label: 'Sipariş Tarihi', type: 'daterange', group: 'Tarih' },
  { name: 'expectedDeliveryDate', label: 'Beklenen Teslim', type: 'daterange', group: 'Tarih' },
  { name: 'totalAmount', label: 'Toplam Tutar', type: 'numberrange', group: 'Tutar', min: 0 },
  { name: 'hasOverdueDelivery', label: 'Geciken Teslimat', type: 'boolean', group: 'Diğer' },
];

export const purchaseInvoiceFilterFields: FilterField[] = [
  { name: 'searchTerm', label: 'Arama', type: 'text', placeholder: 'Fatura no veya tedarikçi...', group: 'Genel' },
  {
    name: 'status',
    label: 'Durum',
    type: 'multiselect',
    group: 'Genel',
    options: [
      { value: 'Draft', label: 'Taslak' },
      { value: 'PendingApproval', label: 'Onay Bekliyor' },
      { value: 'Approved', label: 'Onaylandı' },
      { value: 'Rejected', label: 'Reddedildi' },
      { value: 'PartiallyPaid', label: 'Kısmen Ödendi' },
      { value: 'Paid', label: 'Ödendi' },
      { value: 'Cancelled', label: 'İptal' },
    ],
  },
  { name: 'invoiceDate', label: 'Fatura Tarihi', type: 'daterange', group: 'Tarih' },
  { name: 'dueDate', label: 'Vade Tarihi', type: 'daterange', group: 'Tarih' },
  { name: 'totalAmount', label: 'Toplam Tutar', type: 'numberrange', group: 'Tutar', min: 0 },
  { name: 'remainingAmount', label: 'Kalan Tutar', type: 'numberrange', group: 'Tutar', min: 0 },
  { name: 'isOverdue', label: 'Vadesi Geçmiş', type: 'boolean', group: 'Diğer' },
];

export const supplierFilterFields: FilterField[] = [
  { name: 'searchTerm', label: 'Arama', type: 'text', placeholder: 'Tedarikçi adı veya kodu...', group: 'Genel' },
  {
    name: 'status',
    label: 'Durum',
    type: 'multiselect',
    group: 'Genel',
    options: [
      { value: 'Active', label: 'Aktif' },
      { value: 'Inactive', label: 'Pasif' },
      { value: 'Pending', label: 'Onay Bekliyor' },
      { value: 'Blacklisted', label: 'Bloklu' },
      { value: 'OnHold', label: 'Beklemede' },
    ],
  },
  {
    name: 'type',
    label: 'Tip',
    type: 'multiselect',
    group: 'Genel',
    options: [
      { value: 'Manufacturer', label: 'Üretici' },
      { value: 'Wholesaler', label: 'Toptancı' },
      { value: 'Distributor', label: 'Distribütör' },
      { value: 'Importer', label: 'İthalatçı' },
      { value: 'Retailer', label: 'Perakendeci' },
      { value: 'ServiceProvider', label: 'Hizmet Sağlayıcı' },
    ],
  },
  { name: 'city', label: 'Şehir', type: 'text', group: 'Konum' },
  { name: 'currentBalance', label: 'Bakiye', type: 'numberrange', group: 'Finansal' },
  { name: 'rating', label: 'Puan', type: 'numberrange', group: 'Değerlendirme', min: 0, max: 5 },
  { name: 'hasActiveOrders', label: 'Aktif Siparişi Var', type: 'boolean', group: 'Diğer' },
];

export default AdvancedFilterDrawer;
