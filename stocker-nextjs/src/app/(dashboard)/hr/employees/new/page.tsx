'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  InputNumber,
  Typography,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import {
  useCreateEmployee,
  useDepartments,
  usePositions,
  useShifts,
  useWorkLocations,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { CreateEmployeeDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

export default function NewEmployeePage() {
  const router = useRouter();
  const [form] = Form.useForm();

  // Watch department to filter positions
  const selectedDepartment = Form.useWatch('departmentId', form);

  // API Hooks
  const createEmployee = useCreateEmployee();
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions(selectedDepartment);
  const { data: shifts = [] } = useShifts();
  const { data: workLocations = [] } = useWorkLocations();
  const { data: employees = [] } = useEmployees(); // For manager selection

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateEmployeeDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        nationalId: values.nationalId,
        birthDate: values.birthDate?.toISOString(),
        birthPlace: values.birthPlace,
        gender: values.gender,
        maritalStatus: values.maritalStatus,
        bloodType: values.bloodType,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode,
        country: values.country,
        hireDate: values.hireDate?.toISOString(),
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
        notes: values.notes,
      };

      await createEmployee.mutateAsync(data);
      router.push('/hr/employees');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <UserOutlined className="mr-2" />
                Yeni Çalışan
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir çalışan kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/employees')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createEmployee.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            country: 'Türkiye',
            employmentType: 'FullTime',
          }}
        >
          <Row gutter={48}>
            {/* Left Column - Personal Information */}
            <Col xs={24} lg={12}>
              {/* Personal Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Kişisel Bilgiler
                </Text>
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

              {/* Contact Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  İletişim Bilgileri
                </Text>
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

                  <Form.Item name="address" label="Adres">
                    <TextArea rows={2} placeholder="Adres" variant="filled" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item name="city" label="Şehir">
                        <Input placeholder="Şehir" variant="filled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item name="postalCode" label="Posta Kodu">
                        <Input placeholder="Posta kodu" variant="filled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item name="country" label="Ülke">
                        <Input placeholder="Ülke" variant="filled" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Acil Durum İletişim
                </Text>
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
            </Col>

            {/* Right Column - Employment Information */}
            <Col xs={24} lg={12}>
              {/* Employment Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  İş Bilgileri
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="hireDate"
                        label="İşe Giriş Tarihi"
                        rules={[{ required: true, message: 'İşe giriş tarihi gerekli' }]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder="İşe giriş tarihi seçin"
                          format="DD.MM.YYYY"
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="employmentType"
                        label="Çalışma Tipi"
                        rules={[{ required: true, message: 'Çalışma tipi gerekli' }]}
                      >
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
                      <Form.Item
                        name="departmentId"
                        label="Departman"
                        rules={[{ required: true, message: 'Departman gerekli' }]}
                      >
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
                      <Form.Item
                        name="positionId"
                        label="Pozisyon"
                        rules={[{ required: true, message: 'Pozisyon gerekli' }]}
                      >
                        <Select
                          placeholder="Pozisyon seçin"
                          showSearch
                          optionFilterProp="children"
                          disabled={!selectedDepartment}
                          variant="filled"
                          options={positions.map((p) => ({ value: p.id, label: p.name }))}
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
                          options={employees.map((e) => ({
                            value: e.id,
                            label: `${e.firstName} ${e.lastName}`,
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

              {/* Salary Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Maaş Bilgileri
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item name="baseSalary" label="Brüt Maaş">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Brüt maaş"
                      min={0}
                      variant="filled"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="TRY"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Notlar
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item name="notes" className="mb-0">
                    <TextArea rows={4} placeholder="Ek notlar..." variant="filled" />
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
