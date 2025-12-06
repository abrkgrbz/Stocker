'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography, Switch } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useDepartments, usePositions, useShifts, useWorkLocations, useEmployees } from '@/lib/api/hooks/useHR';
import type { EmployeeDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface EmployeeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: EmployeeDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function EmployeeForm({ form, initialValues, onFinish, loading }: EmployeeFormProps) {
  const [isActive, setIsActive] = useState(true);

  // Watch department to filter positions
  const selectedDepartment = Form.useWatch('departmentId', form);

  // API Hooks
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions(selectedDepartment);
  const { data: shifts = [] } = useShifts();
  const { data: workLocations = [] } = useWorkLocations();
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        birthDate: initialValues.birthDate ? dayjs(initialValues.birthDate) : undefined,
        hireDate: initialValues.hireDate ? dayjs(initialValues.hireDate) : undefined,
      });
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        country: 'Türkiye',
        employmentType: 'FullTime',
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="employee-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">Çalışan Bilgileri</p>
              <p className="text-sm text-white/60">Personel kaydı oluşturun</p>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Durum
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Çalışan aktif' : 'Çalışan pasif'}
                </div>
              </div>
              <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                <Switch
                  checked={isActive}
                  onChange={(val) => {
                    setIsActive(val);
                    form.setFieldValue('isActive', val);
                  }}
                  checkedChildren="Aktif"
                  unCheckedChildren="Pasif"
                  style={{
                    backgroundColor: isActive ? '#52c41a' : '#d9d9d9',
                    minWidth: '80px',
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.leaveBalance || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">İzin Bakiyesi</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.yearsOfService || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kıdem Yılı</div>
              </div>
            </div>
          )}

          {/* Emergency Contact Section - Left Panel */}
          <div className="mt-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Acil Durum İletişim
            </Text>
            <div className="bg-red-50/30 rounded-xl p-4 border border-red-100">
              <div className="text-xs text-gray-400 mb-1">Ad Soyad</div>
              <Form.Item name="emergencyContactName" className="mb-3">
                <Input placeholder="Acil durumda aranacak kişi" variant="filled" />
              </Form.Item>
              <div className="text-xs text-gray-400 mb-1">Telefon</div>
              <Form.Item name="emergencyContactPhone" className="mb-3">
                <Input placeholder="Telefon numarası" variant="filled" />
              </Form.Item>
              <div className="text-xs text-gray-400 mb-1">Yakınlık</div>
              <Form.Item name="emergencyContactRelation" className="mb-0">
                <Input placeholder="Örn: Eş, Anne, Baba" variant="filled" />
              </Form.Item>
            </div>
          </div>
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Employee Name - Hero Input */}
          <div className="mb-8">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  rules={[{ required: true, message: 'Ad zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Ad"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  rules={[{ required: true, message: 'Soyad zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Soyad"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Personal Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Kişisel Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">TC Kimlik No</div>
                <Form.Item name="nationalId" className="mb-4">
                  <Input placeholder="TC Kimlik No" maxLength={11} variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Cinsiyet</div>
                <Form.Item name="gender" className="mb-4">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    variant="filled"
                    options={[
                      { value: 'Male', label: 'Erkek' },
                      { value: 'Female', label: 'Kadın' },
                      { value: 'Other', label: 'Diğer' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Doğum Tarihi</div>
                <Form.Item name="birthDate" className="mb-4">
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="Tarih"
                    format="DD.MM.YYYY"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Doğum Yeri</div>
                <Form.Item name="birthPlace" className="mb-4">
                  <Input placeholder="Şehir" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Kan Grubu</div>
                <Form.Item name="bloodType" className="mb-4">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    variant="filled"
                    options={[
                      { value: 'A+', label: 'A Rh+' },
                      { value: 'A-', label: 'A Rh-' },
                      { value: 'B+', label: 'B Rh+' },
                      { value: 'B-', label: 'B Rh-' },
                      { value: 'AB+', label: 'AB Rh+' },
                      { value: 'AB-', label: 'AB Rh-' },
                      { value: 'O+', label: '0 Rh+' },
                      { value: 'O-', label: '0 Rh-' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Medeni Durum</div>
                <Form.Item name="maritalStatus" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    variant="filled"
                    options={[
                      { value: 'Bekar', label: 'Bekar' },
                      { value: 'Evli', label: 'Evli' },
                      { value: 'Boşanmış', label: 'Boşanmış' },
                      { value: 'Dul', label: 'Dul' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Contact Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              İletişim Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">E-posta</div>
                <Form.Item
                  name="email"
                  rules={[{ type: 'email', message: 'Geçerli e-posta girin' }]}
                  className="mb-4"
                >
                  <Input placeholder="E-posta adresi" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Telefon</div>
                <Form.Item name="phone" className="mb-4">
                  <Input placeholder="Telefon numarası" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-xs text-gray-400 mb-1">Adres</div>
            <Form.Item name="address" className="mb-4">
              <TextArea rows={2} placeholder="Adres" variant="filled" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Şehir</div>
                <Form.Item name="city" className="mb-0">
                  <Input placeholder="Şehir" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Posta Kodu</div>
                <Form.Item name="postalCode" className="mb-0">
                  <Input placeholder="Posta kodu" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Ülke</div>
                <Form.Item name="country" className="mb-0">
                  <Input placeholder="Ülke" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Employment Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              İş Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">İşe Giriş Tarihi *</div>
                <Form.Item
                  name="hireDate"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="Tarih"
                    format="DD.MM.YYYY"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Çalışma Tipi *</div>
                <Form.Item
                  name="employmentType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Seçin"
                    variant="filled"
                    options={[
                      { value: 'FullTime', label: 'Tam Zamanlı' },
                      { value: 'PartTime', label: 'Yarı Zamanlı' },
                      { value: 'Contract', label: 'Sözleşmeli' },
                      { value: 'Intern', label: 'Stajyer' },
                      { value: 'Temporary', label: 'Geçici' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Departman *</div>
                <Form.Item
                  name="departmentId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={departments.map((d) => ({ value: d.id, label: d.name }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Pozisyon *</div>
                <Form.Item
                  name="positionId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Önce departman seçin"
                    showSearch
                    optionFilterProp="label"
                    disabled={!selectedDepartment}
                    variant="filled"
                    options={positions.map((p) => ({ value: p.id, label: p.name }))}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Yönetici</div>
                <Form.Item name="managerId" className="mb-4">
                  <Select
                    placeholder="Seçin"
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    variant="filled"
                    options={employees
                      .filter((e) => !initialValues || e.id !== initialValues.id)
                      .map((e) => ({
                        value: e.id,
                        label: `${e.firstName} ${e.lastName}`,
                      }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Vardiya</div>
                <Form.Item name="shiftId" className="mb-4">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    variant="filled"
                    options={shifts.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.startTime?.substring(0, 5)} - ${s.endTime?.substring(0, 5)})`,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Lokasyon</div>
                <Form.Item name="workLocationId" className="mb-4">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    variant="filled"
                    options={workLocations.map((l) => ({ value: l.id, label: l.name }))}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Brüt Maaş</div>
                <Form.Item name="baseSalary" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    variant="filled"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    addonAfter="TRY"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Notes */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Notlar
            </Text>
            <Form.Item name="notes" className="mb-0">
              <TextArea rows={3} placeholder="Ek notlar..." variant="filled" />
            </Form.Item>
          </div>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
