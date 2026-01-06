'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography } from 'antd';
import {
  CalendarIcon,
  ComputerDesktopIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { useEmployeeAsset, useUpdateEmployeeAsset, useEmployees } from '@/lib/api/hooks/useHR';
import { FormPageLayout } from '@/components/patterns';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Assigned', label: 'Atandi' },
  { value: 'Available', label: 'Mevcut' },
  { value: 'Returned', label: 'Iade Edildi' },
  { value: 'UnderMaintenance', label: 'Bakimda' },
  { value: 'Lost', label: 'Kayip' },
  { value: 'Damaged', label: 'Hasarli' },
  { value: 'Disposed', label: 'Imha Edildi' },
];

const assetTypeOptions = [
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Desktop', label: 'Masaustu' },
  { value: 'Mobile', label: 'Cep Telefonu' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Keyboard', label: 'Klavye' },
  { value: 'Mouse', label: 'Mouse' },
  { value: 'Headset', label: 'Kulaklik' },
  { value: 'Vehicle', label: 'Arac' },
  { value: 'AccessCard', label: 'Giris Karti' },
  { value: 'Uniform', label: 'Uniforma' },
  { value: 'Tools', label: 'Aletler' },
  { value: 'Other', label: 'Diger' },
];

const conditionOptions = [
  { value: 'New', label: 'Yeni' },
  { value: 'Good', label: 'Iyi' },
  { value: 'Fair', label: 'Orta' },
  { value: 'Poor', label: 'Kotu' },
];

export default function EditEmployeeAssetPage() {
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: asset, isLoading, isError } = useEmployeeAsset(id);
  const updateAsset = useUpdateEmployeeAsset();
  const { data: employees } = useEmployees();

  useEffect(() => {
    if (asset) {
      form.setFieldsValue({
        ...asset,
        assignmentDate: asset.assignmentDate ? dayjs(asset.assignmentDate) : null,
        returnDate: asset.returnDate ? dayjs(asset.returnDate) : null,
        purchaseDate: asset.purchaseDate ? dayjs(asset.purchaseDate) : null,
        warrantyEndDate: asset.warrantyEndDate ? dayjs(asset.warrantyEndDate) : null,
      });
    }
  }, [asset, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        assignmentDate: values.assignmentDate?.toISOString(),
        returnDate: values.returnDate?.toISOString(),
        purchaseDate: values.purchaseDate?.toISOString(),
        warrantyEndDate: values.warrantyEndDate?.toISOString(),
      };
      await updateAsset.mutateAsync({ id, data });
    } catch (error) {
      // Error handled by hook or form validation
    }
  };

  return (
    <FormPageLayout
      title="Varlik Duzenle"
      subtitle={asset?.assetName || ''}
      cancelPath={`/hr/employee-assets/${id}`}
      loading={updateAsset.isPending}
      onSave={handleSubmit}
      isDataLoading={isLoading}
      dataError={isError}
      saveButtonText="Guncelle"
      icon={<ComputerDesktopIcon className="h-6 w-6" />}
      maxWidth="max-w-7xl"
    >
      <Form form={form} layout="vertical">
        <Row gutter={48}>
          <Col xs={24} lg={10}>
            <div className="mb-8">
              <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ComputerDesktopIcon className="w-16 h-16 text-white/90" />
                <p className="mt-4 text-lg font-medium text-white/90">Varlik Atama</p>
                <p className="text-sm text-white/60">Calisan ekipman yonetimi</p>
              </div>
            </div>
            <div className="mb-6">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum & Kondisyon</Text>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item></Col>
                <Col span={12}><Form.Item name="condition" className="mb-3"><Select options={conditionOptions} placeholder="Kondisyon" /></Form.Item></Col>
              </Row>
            </div>
          </Col>
          <Col xs={24} lg={14}>
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4 mr-1" /> Calisan & Varlik Bilgileri</Text>
              <Form.Item name="employeeId" rules={[{ required: true }]} className="mb-3">
                <Select showSearch placeholder="Calisan secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="assetType" rules={[{ required: true }]} className="mb-3"><Select options={assetTypeOptions} placeholder="Varlik turu" /></Form.Item></Col>
                <Col span={12}><Form.Item name="assetName" rules={[{ required: true }]} className="mb-3"><Input placeholder="Varlik adi" variant="filled" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="assetTag" className="mb-3"><Input placeholder="Varlik etiketi" variant="filled" /></Form.Item></Col>
                <Col span={12}><Form.Item name="serialNumber" className="mb-3"><Input placeholder="Seri numarasi" variant="filled" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="brand" className="mb-3"><Input placeholder="Marka" variant="filled" /></Form.Item></Col>
                <Col span={12}><Form.Item name="model" className="mb-3"><Input placeholder="Model" variant="filled" /></Form.Item></Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><CalendarIcon className="w-4 h-4 mr-1" /> Tarihler</Text>
              <Row gutter={16}>
                <Col span={6}><Form.Item name="assignedDate" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" /></Form.Item></Col>
                <Col span={6}><Form.Item name="returnDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" /></Form.Item></Col>
                <Col span={6}><Form.Item name="purchaseDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" /></Form.Item></Col>
                <Col span={6}><Form.Item name="warrantyExpiry" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" /></Form.Item></Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Deger Bilgileri</Text>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="value" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Deger" /></Form.Item></Col>
                <Col span={12}><Form.Item name="currency" className="mb-3"><Select options={[{ value: 'TRY', label: 'TRY' }, { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }]} /></Form.Item></Col>
              </Row>
            </div>
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Notlar</Text>
              <Form.Item name="notes" className="mb-0"><TextArea rows={3} placeholder="Ek notlar..." variant="filled" /></Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </FormPageLayout>
  );
}
