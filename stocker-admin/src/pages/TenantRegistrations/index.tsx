import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Input,
  Select,
  Typography,
  message,
  Modal,
  Descriptions,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { tenantRegistrationService, TenantRegistrationDto } from '../../services/api/tenantRegistrationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Search } = Input;

const TenantRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<TenantRegistrationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [selectedRegistration, setSelectedRegistration] = useState<TenantRegistrationDto | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await tenantRegistrationService.getPendingRegistrations({
        status: statusFilter,
        searchTerm,
      });
      setRegistrations(data);
    } catch (error: any) {
      message.error(error.message || 'Kayıtlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter]);

  const handleApprove = async (registration: TenantRegistrationDto) => {
    console.log('🔵 handleApprove called', { id: registration.id, company: registration.companyName });

    try {
      Modal.confirm({
        title: 'Kaydı Onayla',
        icon: <ExclamationCircleOutlined />,
        content: `${registration.companyName} firmasının kaydını onaylamak istediğinize emin misiniz? Bu işlem tenant oluşturacak ve kullanıcıya e-posta gönderilecektir.`,
        okText: 'Onayla',
        okType: 'primary',
        cancelText: 'İptal',
        onOk: async () => {
          console.log('✅ Modal confirmed, calling API...');
          try {
            const success = await tenantRegistrationService.approveRegistration(registration.id);
            if (success) {
              message.success('Kayıt onaylandı ve tenant oluşturuldu!');
              fetchRegistrations(); // Refresh list
            } else {
              message.error('Kayıt onaylanamadı');
            }
          } catch (error: any) {
            console.error('❌ API error:', error);
            message.error(error.message || 'Onaylama işlemi başarısız oldu');
          }
        },
        onCancel: () => {
          console.log('❌ Modal cancelled');
        },
      });

      console.log('🟢 Modal.confirm called successfully');
    } catch (error) {
      console.error('🔴 Error in handleApprove:', error);
      message.error('Modal açılırken hata oluştu: ' + (error as Error).message);
    }
  };

  const handleReject = async (registration: TenantRegistrationDto) => {
    Modal.confirm({
      title: 'Kaydı Reddet',
      icon: <CloseCircleOutlined />,
      content: (
        <div>
          <p>{registration.companyName} firmasının kaydını reddetmek istediğinize emin misiniz?</p>
          <Input.TextArea
            placeholder="Ret sebebi (opsiyonel)"
            id="reject-reason"
            rows={3}
            style={{ marginTop: 10 }}
          />
        </div>
      ),
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        const reason = (document.getElementById('reject-reason') as HTMLTextAreaElement)?.value || 'Belirtilmedi';
        try {
          const success = await tenantRegistrationService.rejectRegistration(registration.id, reason);
          if (success) {
            message.success('Kayıt reddedildi');
            fetchRegistrations();
          } else {
            message.error('Kayıt reddedilemedi');
          }
        } catch (error: any) {
          message.error(error.message || 'Reddetme işlemi başarısız oldu');
        }
      },
    });
  };

  const showDetails = (registration: TenantRegistrationDto) => {
    setSelectedRegistration(registration);
    setDetailsModalVisible(true);
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      Pending: { color: 'orange', text: 'Beklemede' },
      Approved: { color: 'green', text: 'Onaylandı' },
      Rejected: { color: 'red', text: 'Reddedildi' },
      Cancelled: { color: 'gray', text: 'İptal' },
      Expired: { color: 'volcano', text: 'Süresi Doldu' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns: ColumnsType<TenantRegistrationDto> = [
    {
      title: 'Kayıt Kodu',
      dataIndex: 'registrationCode',
      key: 'registrationCode',
      width: 200,
      render: (code) => <Text strong>{code}</Text>,
    },
    {
      title: 'Firma Adı',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 200,
    },
    {
      title: 'Firma Kodu',
      dataIndex: 'companyCode',
      key: 'companyCode',
      width: 120,
    },
    {
      title: 'İletişim Email',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
      width: 200,
    },
    {
      title: 'Admin Email',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
      width: 200,
    },
    {
      title: 'Email Doğrulama',
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      width: 150,
      render: (verified) =>
        verified ? (
          <Badge status="success" text="Doğrulandı" />
        ) : (
          <Badge status="warning" text="Bekliyor" />
        ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      width: 150,
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showDetails(record)}
          >
            Detay
          </Button>
          {record.status === 'Pending' && record.emailVerified && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleApprove(record)}
              >
                Onayla
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => handleReject(record)}
              >
                Reddet
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Tenant Kayıtları
            </Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchRegistrations}
              loading={loading}
            >
              Yenile
            </Button>
          </div>

          <Space style={{ width: '100%' }}>
            <Search
              placeholder="Firma adı, kod, email ara..."
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 400 }}
              onSearch={(value) => {
                setSearchTerm(value);
                fetchRegistrations();
              }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 200 }}
            >
              <Select.Option value="All">Tümü</Select.Option>
              <Select.Option value="Pending">Beklemede</Select.Option>
              <Select.Option value="Approved">Onaylandı</Select.Option>
              <Select.Option value="Rejected">Reddedildi</Select.Option>
              <Select.Option value="Cancelled">İptal</Select.Option>
              <Select.Option value="Expired">Süresi Doldu</Select.Option>
            </Select>
          </Space>

          <Table
            columns={columns}
            dataSource={registrations}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayıt`,
            }}
            scroll={{ x: 1500 }}
          />
        </Space>
      </Card>

      {/* Details Modal */}
      <Modal
        title="Kayıt Detayları"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRegistration && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Kayıt Kodu" span={2}>
              {selectedRegistration.registrationCode}
            </Descriptions.Item>
            <Descriptions.Item label="Durum" span={2}>
              {getStatusTag(selectedRegistration.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Firma Adı">
              {selectedRegistration.companyName}
            </Descriptions.Item>
            <Descriptions.Item label="Firma Kodu">
              {selectedRegistration.companyCode}
            </Descriptions.Item>
            <Descriptions.Item label="İletişim Email">
              {selectedRegistration.contactEmail}
            </Descriptions.Item>
            <Descriptions.Item label="İletişim Telefon">
              {selectedRegistration.contactPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Admin Email">
              {selectedRegistration.adminEmail}
            </Descriptions.Item>
            <Descriptions.Item label="Admin Kullanıcı Adı">
              {selectedRegistration.adminUsername}
            </Descriptions.Item>
            <Descriptions.Item label="Admin Adı">
              {selectedRegistration.adminFirstName}
            </Descriptions.Item>
            <Descriptions.Item label="Admin Soyadı">
              {selectedRegistration.adminLastName}
            </Descriptions.Item>
            <Descriptions.Item label="Email Doğrulama">
              {selectedRegistration.emailVerified ? (
                <Badge status="success" text="Doğrulandı" />
              ) : (
                <Badge status="warning" text="Bekliyor" />
              )}
            </Descriptions.Item>
            {selectedRegistration.emailVerifiedAt && (
              <Descriptions.Item label="Email Doğrulama Tarihi">
                {dayjs(selectedRegistration.emailVerifiedAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Kayıt Tarihi">
              {dayjs(selectedRegistration.registrationDate).format('DD.MM.YYYY HH:mm')}
            </Descriptions.Item>
            {selectedRegistration.approvalDate && (
              <Descriptions.Item label="Onay Tarihi">
                {dayjs(selectedRegistration.approvalDate).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TenantRegistrationsPage;
