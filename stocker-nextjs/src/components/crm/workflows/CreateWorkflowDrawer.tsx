'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Space,
  Card,
  Alert,
  Typography,
} from 'antd';
import {
  ThunderboltOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import type { WorkflowTriggerType } from '@/lib/api/services/crm.types';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface CreateWorkflowDrawerProps {
  open: boolean;
  onClose: () => void;
  onNext: (values: Step1FormData) => void;
}

export interface Step1FormData {
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive';
  triggerType: WorkflowTriggerType;
  entityType?: string;
}

// Entity types from backend
const entityTypes = [
  { value: 'Account', label: 'Hesap' },
  { value: 'Contact', label: 'İletişim' },
  { value: 'Customer', label: 'Müşteri' },
  { value: 'Lead', label: 'Potansiyel Müşteri' },
  { value: 'Opportunity', label: 'Fırsat' },
  { value: 'Deal', label: 'Anlaşma' },
  { value: 'Quote', label: 'Teklif' },
  { value: 'Contract', label: 'Sözleşme' },
  { value: 'Ticket', label: 'Destek Talebi' },
  { value: 'Campaign', label: 'Kampanya' },
];

export default function CreateWorkflowDrawer({
  open,
  onClose,
  onNext,
}: CreateWorkflowDrawerProps) {
  const [form] = Form.useForm();
  const [selectedTriggerType, setSelectedTriggerType] = useState<string>('Manual');

  const handleTriggerTypeChange = (value: string) => {
    setSelectedTriggerType(value);
    // Reset entity type when trigger changes
    if (value === 'Manual' || value === 'Scheduled') {
      form.setFieldsValue({ entityType: undefined });
    }
  };

  const handleFinish = (values: Step1FormData) => {
    onNext(values);
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedTriggerType('Manual');
    onClose();
  };

  const requiresEntityType = (triggerType: string) => {
    return !['Manual', 'Scheduled'].includes(triggerType);
  };

  return (
    <Drawer
      title={
        <Space>
          <ThunderboltOutlined />
          <span>Yeni Workflow Oluştur - Adım 1/3</span>
        </Space>
      }
      width={720}
      open={open}
      onClose={handleClose}
      styles={{
        body: { paddingBottom: 80 },
      }}
      footer={
        <div
          style={{
            textAlign: 'right',
            padding: '16px',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Space>
            <Button onClick={handleClose}>İptal</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              icon={<ArrowRightOutlined />}
            >
              İleri: Tetikleyiciyi Yapılandır
            </Button>
          </Space>
        </div>
      }
    >
      <Alert
        message="Workflow oluşturma süreci 3 adımdan oluşur"
        description="1) Temel Bilgiler → 2) Tetikleyici Ayarları → 3) Aksiyon Düzenleyici"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          status: 'draft',
          triggerType: 'Manual',
        }}
      >
        {/* Basic Info */}
        <Card size="small" title="Temel Bilgiler" style={{ marginBottom: 16 }}>
          <Form.Item
            name="name"
            label="Workflow Adı"
            rules={[
              { required: true, message: 'Workflow adı zorunludur' },
              { min: 3, message: 'En az 3 karakter olmalı' },
              { max: 100, message: 'En fazla 100 karakter olabilir' },
            ]}
          >
            <Input placeholder="Örn: Müşteri hoş geldin e-postası" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
            rules={[
              { required: true, message: 'Açıklama zorunludur' },
              { min: 10, message: 'En az 10 karakter olmalı' },
              { max: 500, message: 'En fazla 500 karakter olabilir' },
            ]}
          >
            <TextArea rows={3} placeholder="Workflow'un ne yaptığını açıklayın" />
          </Form.Item>

          <Form.Item name="status" label="Durum">
            <Radio.Group>
              <Radio.Button value="draft">
                <Space>
                  <InfoCircleOutlined />
                  Taslak
                </Space>
              </Radio.Button>
              <Radio.Button value="active">
                <Space>
                  <ThunderboltOutlined />
                  Aktif
                </Space>
              </Radio.Button>
              <Radio.Button value="inactive">
                <Space>
                  Pasif
                </Space>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Alert
            message="Önerilen: İlk oluşturulurken 'Taslak' olarak kaydedin"
            description="Taslak durumundaki workflow'lar test edilebilir ancak otomatik çalışmaz. Test ettikten sonra aktif edebilirsiniz."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Card>

        {/* Trigger Type Selection */}
        <Card size="small" title="Tetikleyici Tipi Seçimi" style={{ marginBottom: 16 }}>
          <Form.Item
            name="triggerType"
            label="Tetikleyici Tipi"
            rules={[{ required: true, message: 'Tetikleyici tipi zorunludur' }]}
          >
            <Select
              placeholder="Workflow'un nasıl tetikleneceğini seçin"
              onChange={handleTriggerTypeChange}
              size="large"
            >
              <Option value="Manual">
                <Space>
                  🖱️ <strong>Manuel</strong> - Elle Başlatılır
                </Space>
              </Option>
              <Option value="Scheduled">
                <Space>
                  ⏰ <strong>Zamanlanmış</strong> - Belirli zamanlarda otomatik çalışır
                </Space>
              </Option>
              <Option value="EntityCreated">
                <Space>
                  ➕ <strong>Kayıt Oluşturulduğunda</strong> - Yeni kayıt eklendiğinde
                </Space>
              </Option>
              <Option value="EntityUpdated">
                <Space>
                  ✏️ <strong>Kayıt Güncellendiğinde</strong> - Mevcut kayıt güncellendiğinde
                </Space>
              </Option>
              <Option value="StatusChanged">
                <Space>
                  🔄 <strong>Durum Değiştiğinde</strong> - Status alanı değiştiğinde
                </Space>
              </Option>
            </Select>
          </Form.Item>

          {/* Entity Type - Only for non-Manual and non-Scheduled triggers */}
          {requiresEntityType(selectedTriggerType) && (
            <Form.Item
              name="entityType"
              label="Entity Tipi"
              rules={[{ required: true, message: 'Entity tipi zorunludur' }]}
            >
              <Select
                placeholder="Workflow'un çalışacağı entity tipini seçin"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {entityTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Info boxes for each trigger type */}
          {selectedTriggerType === 'Manual' && (
            <Alert
              type="info"
              message="Manuel Tetikleyici"
              description="Bu workflow otomatik çalışmaz. Kullanıcı tarafından manuel olarak başlatılması gerekir. Bir sonraki adımda tetikleme koşulları ayarlamanız gerekmeyecek."
              showIcon
            />
          )}

          {selectedTriggerType === 'Scheduled' && (
            <Alert
              type="info"
              message="Zamanlanmış Tetikleyici"
              description="Bir sonraki adımda workflow'un ne zaman çalışacağını (günlük, haftalık, aylık vb.) ayarlayacaksınız."
              showIcon
            />
          )}

          {selectedTriggerType === 'EntityCreated' && (
            <Alert
              type="info"
              message="Kayıt Oluşturma Tetikleyicisi"
              description="Seçilen entity tipinde yeni bir kayıt oluşturulduğunda workflow çalışır. Bir sonraki adımda opsiyonel filtreleme koşulları ekleyebilirsiniz (örn: sadece belirli özelliklere sahip kayıtlar için)."
              showIcon
            />
          )}

          {selectedTriggerType === 'EntityUpdated' && (
            <Alert
              type="info"
              message="Kayıt Güncelleme Tetikleyicisi"
              description="Seçilen entity tipindeki bir kayıt güncellendiğinde workflow çalışır. Bir sonraki adımda hangi koşullarda tetikleneceğini belirleyebilirsiniz."
              showIcon
            />
          )}

          {selectedTriggerType === 'StatusChanged' && (
            <Alert
              type="info"
              message="Durum Değişimi Tetikleyicisi"
              description="Seçilen entity'nin 'Status' alanı değiştiğinde workflow çalışır. Bir sonraki adımda belirli durum değişimlerini (örn: 'New' → 'Qualified') filtreleyebilirsiniz."
              showIcon
            />
          )}
        </Card>

        <Alert
          type="success"
          message="Sonraki Adım"
          description="Temel bilgileri tamamladıktan sonra, tetikleyici için detaylı ayarları yapacaksınız (zamanlama, koşullar, filtreler vb.)"
          showIcon
          style={{ marginBottom: 16 }}
        />
      </Form>
    </Drawer>
  );
}
