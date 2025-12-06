'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Divider,
  InputNumber,
  message,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import {
  useCreateEmployee,
  useDepartments,
  usePositions,
  useShifts,
  useWorkLocations,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { CreateEmployeeDto, Gender, EmploymentType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/employees')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <UserOutlined className="mr-2" />
              Yeni Çalışan
            </Title>
            <Text type="secondary">Yeni bir çalışan kaydı oluşturun</Text>
          </div>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          country: 'Türkiye',
          employmentType: 'FullTime',
        }}
      >
        <Row gutter={24}>
          {/* Personal Information */}
          <Col xs={24} lg={12}>
            <Card title="Kişisel Bilgiler" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="Ad"
                    rules={[{ required: true, message: 'Ad gerekli' }]}
                  >
                    <Input placeholder="Ad" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Soyad"
                    rules={[{ required: true, message: 'Soyad gerekli' }]}
                  >
                    <Input placeholder="Soyad" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="nationalId" label="TC Kimlik No">
                    <Input placeholder="TC Kimlik No" maxLength={11} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="gender" label="Cinsiyet">
                    <Select
                      placeholder="Cinsiyet seçin"
                      allowClear
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
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="birthPlace" label="Doğum Yeri">
                    <Input placeholder="Doğum yeri" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="maritalStatus" label="Medeni Durum">
                    <Select
                      placeholder="Medeni durum seçin"
                      allowClear
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
            </Card>

            <Card title="İletişim Bilgileri" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="E-posta"
                    rules={[{ type: 'email', message: 'Geçerli bir e-posta girin' }]}
                  >
                    <Input placeholder="E-posta adresi" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Telefon">
                    <Input placeholder="Telefon numarası" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="address" label="Adres">
                <TextArea rows={2} placeholder="Adres" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="city" label="Şehir">
                    <Input placeholder="Şehir" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="postalCode" label="Posta Kodu">
                    <Input placeholder="Posta kodu" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="country" label="Ülke">
                    <Input placeholder="Ülke" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Acil Durum İletişim" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="emergencyContactName" label="Ad Soyad">
                    <Input placeholder="Acil durumda aranacak kişi" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="emergencyContactPhone" label="Telefon">
                    <Input placeholder="Telefon numarası" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="emergencyContactRelation" label="Yakınlık Derecesi">
                <Input placeholder="Örn: Eş, Anne, Baba" />
              </Form.Item>
            </Card>
          </Col>

          {/* Employment Information */}
          <Col xs={24} lg={12}>
            <Card title="İş Bilgileri" className="mb-6">
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
                      options={workLocations.map((l) => ({ value: l.id, label: l.name }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="shiftId" label="Vardiya">
                <Select
                  placeholder="Vardiya seçin"
                  allowClear
                  options={shifts.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.startTime} - ${s.endTime})`,
                  }))}
                />
              </Form.Item>
            </Card>

            <Card title="Maaş Bilgileri" className="mb-6">
              <Form.Item name="baseSalary" label="Brüt Maaş">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Brüt maaş"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="TRY"
                />
              </Form.Item>
            </Card>

            <Card title="Notlar" className="mb-6">
              <Form.Item name="notes">
                <TextArea rows={4} placeholder="Ek notlar..." />
              </Form.Item>
            </Card>

            {/* Actions */}
            <Card>
              <Space className="w-full justify-end">
                <Button onClick={() => router.push('/hr/employees')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createEmployee.isPending}
                >
                  Kaydet
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
