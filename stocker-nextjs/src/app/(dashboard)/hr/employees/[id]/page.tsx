'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Spin,
  Row,
  Col,
  Statistic,
  Avatar,
  Tabs,
  Table,
  Empty,
  Timeline,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  BankOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
  BookOutlined,
  DeleteOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  useEmployee,
  useEmployeeDocuments,
  useLeaveBalance,
  useEmployeeTrainings,
  useDeleteEmployee,
  useActivateEmployee,
  useDeactivateEmployee,
  useTerminateEmployee,
} from '@/lib/api/hooks/useHR';
import { EmployeeStatus, Gender, EmploymentType } from '@/lib/api/services/hr.types';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Status configuration
const employeeStatusConfig: Record<number, { color: string; label: string }> = {
  [EmployeeStatus.Active]: { color: 'green', label: 'Aktif' },
  [EmployeeStatus.Inactive]: { color: 'default', label: 'Pasif' },
  [EmployeeStatus.OnLeave]: { color: 'blue', label: 'İzinde' },
  [EmployeeStatus.Terminated]: { color: 'red', label: 'İşten Çıkarıldı' },
  [EmployeeStatus.Resigned]: { color: 'orange', label: 'İstifa' },
  [EmployeeStatus.Retired]: { color: 'gray', label: 'Emekli' },
  [EmployeeStatus.Probation]: { color: 'purple', label: 'Deneme Süresinde' },
  [EmployeeStatus.MilitaryService]: { color: 'cyan', label: 'Askerde' },
  [EmployeeStatus.MaternityLeave]: { color: 'magenta', label: 'Doğum İzni' },
  [EmployeeStatus.SickLeave]: { color: 'volcano', label: 'Hastalık İzni' },
};

const defaultStatusConfig = { color: 'default', label: '-' };

const genderLabels: Record<Gender, string> = {
  [Gender.Male]: 'Erkek',
  [Gender.Female]: 'Kadın',
  [Gender.Other]: 'Diğer',
  [Gender.PreferNotToSay]: 'Belirtilmemiş',
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]: 'Tam Zamanlı',
  [EmploymentType.PartTime]: 'Yarı Zamanlı',
  [EmploymentType.Contract]: 'Sözleşmeli',
  [EmploymentType.Intern]: 'Stajyer',
  [EmploymentType.Temporary]: 'Geçici',
  [EmploymentType.Consultant]: 'Danışman',
  [EmploymentType.Freelance]: 'Freelance',
  [EmploymentType.Probation]: 'Deneme Süresi',
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: employee, isLoading, error } = useEmployee(id);
  const { data: documents = [] } = useEmployeeDocuments(id);
  const { data: leaveBalances = [] } = useLeaveBalance(id);
  const { data: trainings = [] } = useEmployeeTrainings(id);
  const deleteEmployee = useDeleteEmployee();
  const activateEmployee = useActivateEmployee();
  const deactivateEmployee = useDeactivateEmployee();
  const terminateEmployee = useTerminateEmployee();

  const handleDelete = () => {
    if (!employee) return;
    Modal.confirm({
      title: 'Çalışanı Sil',
      content: `"${employee.fullName}" çalışanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteEmployee.mutateAsync(id);
          router.push('/hr/employees');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!employee) return;
    try {
      if (employee.status === EmployeeStatus.Active) {
        await deactivateEmployee.mutateAsync(id);
      } else {
        await activateEmployee.mutateAsync(id);
      }
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

  const statusConfig = employeeStatusConfig[employee.status] || defaultStatusConfig;

  // Calculate years of service
  const yearsOfService = employee.hireDate
    ? Math.floor((new Date().getTime() - new Date(employee.hireDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  // Document columns
  const documentColumns = [
    { title: 'Belge Adı', dataIndex: 'documentName', key: 'name' },
    { title: 'Tür', dataIndex: 'documentTypeName', key: 'type' },
    {
      title: 'Son Geçerlilik',
      dataIndex: 'expiryDate',
      key: 'expiry',
      render: (date: string) => (date ? new Date(date).toLocaleDateString('tr-TR') : '-'),
    },
    {
      title: 'Durum',
      dataIndex: 'isVerified',
      key: 'status',
      render: (verified: boolean) => (
        <Tag color={verified ? 'green' : 'orange'}>{verified ? 'Doğrulandı' : 'Beklemede'}</Tag>
      ),
    },
  ];

  // Leave balance columns
  const leaveBalanceColumns = [
    { title: 'İzin Türü', dataIndex: 'leaveTypeName', key: 'type' },
    { title: 'Hak', dataIndex: 'entitlement', key: 'entitlement' },
    { title: 'Kullanılan', dataIndex: 'used', key: 'used' },
    { title: 'Kalan', dataIndex: 'remaining', key: 'remaining' },
  ];

  // Training columns
  const trainingColumns = [
    { title: 'Eğitim', dataIndex: 'trainingName', key: 'name' },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          Enrolled: 'blue',
          InProgress: 'orange',
          Completed: 'green',
          Cancelled: 'red',
        };
        const labels: Record<string, string> = {
          Enrolled: 'Kayıtlı',
          InProgress: 'Devam Ediyor',
          Completed: 'Tamamlandı',
          Cancelled: 'İptal',
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      },
    },
    {
      title: 'Tamamlanma Tarihi',
      dataIndex: 'completedDate',
      key: 'completedDate',
      render: (date: string) => (date ? new Date(date).toLocaleDateString('tr-TR') : '-'),
    },
    { title: 'Puan', dataIndex: 'score', key: 'score', render: (score: number) => score || '-' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/employees')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {employee.fullName}
            </Title>
            <Space>
              <Text type="secondary">{employee.employeeCode}</Text>
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
            </Space>
          </div>
        </Space>
        <Space>
          <Button
            icon={employee.status === EmployeeStatus.Active ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={handleToggleActive}
          >
            {employee.status === EmployeeStatus.Active ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => router.push(`/hr/employees/${id}/edit`)}>
            Düzenle
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Sil
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Profile Card */}
        <Col xs={24} lg={8}>
          <Card>
            <div className="text-center mb-6">
              <Avatar
                size={120}
                src={employee.photoUrl}
                icon={<UserOutlined />}
                style={{ backgroundColor: employee.photoUrl ? undefined : '#7c3aed' }}
              />
              <Title level={4} className="mt-4 mb-0">
                {employee.fullName}
              </Title>
              <Text type="secondary">{employee.positionTitle}</Text>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Kıdem (Yıl)"
                  value={yearsOfService}
                  prefix={<CalendarOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Departman"
                  value={employee.departmentName || '-'}
                  prefix={<TeamOutlined />}
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
            </Row>

            <div className="mt-6">
              <Space direction="vertical" className="w-full">
                {employee.email && (
                  <Space>
                    <MailOutlined />
                    <Text>{employee.email}</Text>
                  </Space>
                )}
                {employee.phone && (
                  <Space>
                    <PhoneOutlined />
                    <Text>{employee.phone}</Text>
                  </Space>
                )}
                {(employee.street || employee.city) && (
                  <Space align="start">
                    <HomeOutlined />
                    <Text>{[employee.street, employee.city, employee.country].filter(Boolean).join(', ')}</Text>
                  </Space>
                )}
              </Space>
            </div>
          </Card>
        </Col>

        {/* Right Column - Details */}
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="info">
            <TabPane
              tab={
                <span>
                  <IdcardOutlined />
                  Bilgiler
                </span>
              }
              key="info"
            >
              <Card title="Kişisel Bilgiler" className="mb-4">
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="TC Kimlik No">{employee.nationalId || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Cinsiyet">
                    {employee.gender ? genderLabels[employee.gender] : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Doğum Tarihi">
                    {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('tr-TR') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Medeni Durum">{employee.maritalStatus || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Uyruk">{employee.nationality || '-'}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="İş Bilgileri" className="mb-4">
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="İşe Giriş Tarihi">
                    {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('tr-TR') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Çalışma Tipi">
                    {employee.employmentType ? employmentTypeLabels[employee.employmentType] : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Departman">{employee.departmentName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Pozisyon">{employee.positionTitle || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Yönetici">{employee.managerName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Çalışma Lokasyonu">{employee.workLocationName || '-'}</Descriptions.Item>
                </Descriptions>
              </Card>

              {employee.emergencyContactName && (
                <Card title="Acil Durum İletişim">
                  <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                    <Descriptions.Item label="Ad Soyad">{employee.emergencyContactName}</Descriptions.Item>
                    <Descriptions.Item label="Telefon">{employee.emergencyContactPhone || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Yakınlık">{employee.emergencyContactRelation || '-'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
            </TabPane>

            <TabPane
              tab={
                <span>
                  <CalendarOutlined />
                  İzinler
                </span>
              }
              key="leaves"
            >
              <Card>
                {leaveBalances.length > 0 ? (
                  <Table
                    columns={leaveBalanceColumns}
                    dataSource={leaveBalances}
                    rowKey="leaveTypeId"
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Empty description="İzin bakiyesi bulunamadı" />
                )}
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <FileTextOutlined />
                  Belgeler
                </span>
              }
              key="documents"
            >
              <Card>
                {documents.length > 0 ? (
                  <Table
                    columns={documentColumns}
                    dataSource={documents}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Empty description="Belge bulunamadı" />
                )}
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <BookOutlined />
                  Eğitimler
                </span>
              }
              key="trainings"
            >
              <Card>
                {trainings.length > 0 ? (
                  <Table
                    columns={trainingColumns}
                    dataSource={trainings}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Empty description="Eğitim kaydı bulunamadı" />
                )}
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
}
