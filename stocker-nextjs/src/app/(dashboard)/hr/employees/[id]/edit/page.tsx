'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Input, Select, DatePicker, Row, Col, InputNumber, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import {
  useEmployee,
  useUpdateEmployee,
  useDepartments,
  usePositions,
  useShifts,
  useWorkLocations,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { UpdateEmployeeDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // Watch department to filter positions
  const selectedDepartment = Form.useWatch('departmentId', form);

  // API Hooks
  const { data: employee, isLoading, error } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions(selectedDepartment);
  const { data: shifts = [] } = useShifts();
  const { data: workLocations = [] } = useWorkLocations();
  const { data: employees = [] } = useEmployees();

  // Populate form when employee data loads
  useEffect(() => {
    if (employee) {
      form.setFieldsValue({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        nationalId: employee.nationalId,
        birthDate: employee.birthDate ? dayjs(employee.birthDate) : null,
        birthPlace: employee.birthPlace,
        gender: employee.gender,
        maritalStatus: employee.maritalStatus,
        bloodType: employee.bloodType,
        street: employee.street,
        city: employee.city,
        state: employee.state,
        postalCode: employee.postalCode,
        country: employee.country,
        hireDate: employee.hireDate ? dayjs(employee.hireDate) : null,
        employmentType: employee.employmentType,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        managerId: employee.managerId,
        shiftId: employee.shiftId,
        workLocationId: employee.workLocationId,
        baseSalary: employee.baseSalary,
        emergencyContactName: employee.emergencyContactName,
        emergencyContactPhone: employee.emergencyContactPhone,
        emergencyContactRelation: employee.emergencyContactRelation,
      });
    }
  }, [employee, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateEmployeeDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        birthDate: values.birthDate?.toISOString(),
        birthPlace: values.birthPlace,
        gender: values.gender,
        maritalStatus: values.maritalStatus,
        bloodType: values.bloodType,
        street: values.street,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
        employmentType: values.employmentType,
        departmentId: values.departmentId,
        positionId: values.positionId,
        managerId: values.managerId,
        shiftId: values.shiftId,
        workLocationId: values.workLocationId,
        baseSalary: values.baseSalary,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        emergencyContactRelation: values.emergencyContactRelation,
      };

      await updateEmployee.mutateAsync({ id, data });
      router.push(`/hr/employees/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <Empty description="Çalışan bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/employees')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/hr/employees/${id}`)}
            />
            <div className="flex items-center gap-2">
              <UserOutlined className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Çalışan Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {employee.fullName} - {employee.employeeCode}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/employees/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateEmployee.isPending}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Personal Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Kişisel Bilgiler
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="Ad"
                    rules={[{ required: true, message: 'Ad gerekli' }]}
                  >
                    <Input placeholder="Ad" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Soyad"
                    rules={[{ required: true, message: 'Soyad gerekli' }]}
                  >
                    <Input placeholder="Soyad" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="nationalId" label="TC Kimlik No">
                    <Input placeholder="TC Kimlik No" maxLength={11} variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="gender" label="Cinsiyet">
                    <Select
                      placeholder="Cinsiyet seçin"
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
                <Col xs={24} sm={12}>
                  <Form.Item name="birthDate" label="Doğum Tarihi">
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Doğum tarihi seçin"
                      format="DD.MM.YYYY"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="birthPlace" label="Doğum Yeri">
                    <Input placeholder="Doğum yeri" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="maritalStatus" label="Medeni Durum">
                    <Select
                      placeholder="Medeni durum seçin"
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
                <Col xs={24} sm={12}>
                  <Form.Item name="bloodType" label="Kan Grubu">
                    <Select
                      placeholder="Kan grubu seçin"
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
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                İletişim Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="E-posta"
                    rules={[{ type: 'email', message: 'Geçerli bir e-posta girin' }]}
                  >
                    <Input placeholder="E-posta adresi" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Telefon">
                    <Input placeholder="Telefon numarası" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="street" label="Adres">
                <TextArea rows={2} placeholder="Adres" variant="filled" />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} sm={6}>
                  <Form.Item name="city" label="Şehir">
                    <Input placeholder="Şehir" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                  <Form.Item name="state" label="İlçe">
                    <Input placeholder="İlçe" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                  <Form.Item name="postalCode" label="Posta Kodu">
                    <Input placeholder="Posta kodu" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                  <Form.Item name="country" label="Ülke">
                    <Input placeholder="Ülke" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Employment Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                İş Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="hireDate" label="İşe Giriş Tarihi">
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="İşe giriş tarihi seçin"
                      format="DD.MM.YYYY"
                      disabled
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="employmentType" label="Çalışma Tipi">
                    <Select
                      placeholder="Çalışma tipi seçin"
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
                <Col xs={24} sm={12}>
                  <Form.Item name="departmentId" label="Departman">
                    <Select
                      placeholder="Departman seçin"
                      showSearch
                      optionFilterProp="children"
                      variant="filled"
                      options={departments.map((d) => ({ value: d.id, label: d.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="positionId" label="Pozisyon">
                    <Select
                      placeholder="Pozisyon seçin"
                      showSearch
                      optionFilterProp="children"
                      disabled={!selectedDepartment}
                      variant="filled"
                      options={positions.map((p) => ({ value: p.id, label: p.title }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="managerId" label="Yönetici">
                    <Select
                      placeholder="Yönetici seçin"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      variant="filled"
                      options={employees
                        .filter((e) => e.id !== id)
                        .map((e) => ({
                          value: e.id,
                          label: e.fullName,
                        }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="workLocationId" label="Çalışma Lokasyonu">
                    <Select
                      placeholder="Lokasyon seçin"
                      allowClear
                      variant="filled"
                      options={workLocations.map((l) => ({ value: l.id, label: l.name }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="shiftId" label="Vardiya">
                <Select
                  placeholder="Vardiya seçin"
                  allowClear
                  variant="filled"
                  options={shifts.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.startTime} - ${s.endTime})`,
                  }))}
                />
              </Form.Item>
            </div>
          </div>

          {/* Salary Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Maaş Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Form.Item name="baseSalary" label="Brüt Maaş">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Brüt maaş"
                  min={0}
                  variant="filled"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: string | undefined) => (value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                  addonAfter="TRY"
                />
              </Form.Item>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Acil Durum İletişim
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="emergencyContactName" label="Ad Soyad">
                    <Input placeholder="Acil durumda aranacak kişi" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="emergencyContactPhone" label="Telefon">
                    <Input placeholder="Telefon numarası" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="emergencyContactRelation" label="Yakınlık Derecesi">
                <Input placeholder="Örn: Eş, Anne, Baba" variant="filled" />
              </Form.Item>
            </div>
          </div>

          {/* Hidden submit button for form.submit() */}
          <button type="submit" hidden />
        </Form>
      </div>
    </div>
  );
}
