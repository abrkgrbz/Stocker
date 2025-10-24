'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, ReloadOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { Lead } from '@/lib/api/services/crm.service';
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
} from '@/hooks/useCRM';
import { LeadsStats, LeadsTable, LeadsFilters } from '@/components/crm/leads';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';

const { Title } = Typography;
const { TextArea } = Input;

export default function LeadsPage() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [form] = Form.useForm();
  const [convertForm] = Form.useForm();

  // API Hooks
  const { data, isLoading, refetch } = useLeads({
    pageNumber: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();

  const leads = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    setSelectedLead(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    form.setFieldsValue(lead);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Potansiyel Müşteriyi Sil',
      content: 'Bu potansiyel müşteriyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteLead.mutateAsync(id);
          message.success('Potansiyel müşteri silindi');
        } catch (error) {
          message.error('Silme işlemi başarısız');
        }
      },
    });
  };

  const handleConvert = (lead: Lead) => {
    setSelectedLead(lead);
    convertForm.setFieldsValue({
      companyName: lead.company,
      contactPerson: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone,
    });
    setConvertModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedLead) {
        await updateLead.mutateAsync({ id: selectedLead.id, data: values });
        message.success('Potansiyel müşteri güncellendi');
      } else {
        await createLead.mutateAsync(values);
        message.success('Potansiyel müşteri oluşturuldu');
      }
      setModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || 'İşlem başarısız');
    }
  };

  const handleConvertSubmit = async (values: any) => {
    if (!selectedLead) return;

    try {
      await convertLead.mutateAsync({
        leadId: selectedLead.id,
        customerData: values,
      });
      message.success('Potansiyel müşteri, müşteriye dönüştürüldü');
      setConvertModalOpen(false);
      convertForm.resetFields();
    } catch (error: any) {
      message.error(error?.message || 'Dönüştürme işlemi başarısız');
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          Potansiyel Müşteriler
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Yeni Potansiyel Müşteri
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <LeadsStats leads={leads} loading={isLoading} />
      </div>

      {/* Search and Table */}
      <AnimatedCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <LeadsFilters searchText={searchText} onSearchChange={setSearchText} />
          <LeadsTable
            leads={leads}
            loading={
              isLoading || createLead.isPending || updateLead.isPending || deleteLead.isPending
            }
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConvert={handleConvert}
          />
        </Space>
      </AnimatedCard>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedLead ? 'Potansiyel Müşteri Düzenle' : 'Yeni Potansiyel Müşteri'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createLead.isPending || updateLead.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ad"
                name="firstName"
                rules={[{ required: true, message: 'Ad gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Soyad"
                name="lastName"
                rules={[{ required: true, message: 'Soyad gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="E-posta"
            name="email"
            rules={[
              { required: true, message: 'E-posta gerekli' },
              { type: 'email', message: 'Geçerli bir e-posta girin' },
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item label="Telefon" name="phone">
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Firma" name="company">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Pozisyon" name="jobTitle">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Kaynak"
                name="source"
                rules={[{ required: true, message: 'Kaynak gerekli' }]}
              >
                <Select>
                  <Select.Option value="Website">Web Sitesi</Select.Option>
                  <Select.Option value="Referral">Referans</Select.Option>
                  <Select.Option value="SocialMedia">Sosyal Medya</Select.Option>
                  <Select.Option value="Event">Etkinlik</Select.Option>
                  <Select.Option value="Other">Diğer</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Durum"
                name="status"
                rules={[{ required: true, message: 'Durum gerekli' }]}
              >
                <Select>
                  <Select.Option value="New">Yeni</Select.Option>
                  <Select.Option value="Contacted">İletişime Geçildi</Select.Option>
                  <Select.Option value="Qualified">Nitelikli</Select.Option>
                  <Select.Option value="Unqualified">Niteliksiz</Select.Option>
                  <Select.Option value="Converted">Dönüştürüldü</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Puan (0-100)" name="score" initialValue={50}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Notlar" name="notes">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Convert to Customer Modal */}
      <Modal
        title="Müşteriye Dönüştür"
        open={convertModalOpen}
        onCancel={() => {
          setConvertModalOpen(false);
          convertForm.resetFields();
        }}
        onOk={() => convertForm.submit()}
        confirmLoading={convertLead.isPending}
        width={600}
      >
        <Form form={convertForm} layout="vertical" onFinish={handleConvertSubmit}>
          <Form.Item
            label="Firma Adı"
            name="companyName"
            rules={[{ required: true, message: 'Firma adı gerekli' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="İletişim Kişisi" name="contactPerson">
            <Input />
          </Form.Item>

          <Form.Item
            label="E-posta"
            name="email"
            rules={[
              { required: true, message: 'E-posta gerekli' },
              { type: 'email', message: 'Geçerli bir e-posta girin' },
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item label="Telefon" name="phone">
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item label="Adres" name="address">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
