import React, { useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Slider,
  Switch,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Divider,
  InputNumber,
  Checkbox,
  Typography,
} from 'antd';
import {
  FilterOutlined,
  DeleteOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export interface FilterConfig {
  name?: string;
  domain?: string;
  email?: string;
  status?: string[];
  plan?: string[];
  userRange?: [number, number];
  storageRange?: [number, number];
  revenueRange?: [number, number];
  dateRange?: [Date, Date];
  modules?: string[];
  hasCustomDomain?: boolean;
  hasApiAccess?: boolean;
  isActive?: boolean;
}

interface AdvancedFilterProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterConfig) => void;
  onReset: () => void;
  initialFilters?: FilterConfig;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  visible,
  onClose,
  onApply,
  onReset,
  initialFilters = {},
}) => {
  const [form] = Form.useForm();
  const [savedFilters, setSavedFilters] = useState<{ name: string; config: FilterConfig }[]>([]);

  const handleApply = () => {
    const values = form.getFieldsValue();
    onApply(values);
    onClose();
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const handleSaveFilter = () => {
    const filterName = prompt('Filtre adı girin:');
    if (filterName) {
      const config = form.getFieldsValue();
      setSavedFilters([...savedFilters, { name: filterName, config }]);
    }
  };

  const handleLoadFilter = (config: FilterConfig) => {
    form.setFieldsValue(config);
  };

  return (
    <Drawer
      title={
        <Space>
          <FilterOutlined />
          <span>Gelişmiş Filtreler</span>
        </Space>
      }
      placement="right"
      width={400}
      onClose={onClose}
      open={visible}
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Sıfırla
            </Button>
            <Button icon={<SaveOutlined />} onClick={handleSaveFilter}>
              Kaydet
            </Button>
          </Space>
          <Space>
            <Button onClick={onClose}>İptal</Button>
            <Button type="primary" onClick={handleApply}>
              Uygula
            </Button>
          </Space>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialFilters}
      >
        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <>
            <Title level={5}>Kayıtlı Filtreler</Title>
            <Space wrap style={{ marginBottom: 16 }}>
              {savedFilters.map((filter, index) => (
                <Tag
                  key={index}
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleLoadFilter(filter.config)}
                  closable
                  onClose={() => {
                    setSavedFilters(savedFilters.filter((_, i) => i !== index));
                  }}
                >
                  {filter.name}
                </Tag>
              ))}
            </Space>
            <Divider />
          </>
        )}

        {/* Text Filters */}
        <Title level={5}>Metin Araması</Title>
        <Form.Item name="name" label="Tenant Adı">
          <Input placeholder="Tenant adı içinde ara..." />
        </Form.Item>

        <Form.Item name="domain" label="Domain">
          <Input placeholder="Domain içinde ara..." />
        </Form.Item>

        <Form.Item name="email" label="E-posta">
          <Input placeholder="E-posta içinde ara..." />
        </Form.Item>

        <Divider />

        {/* Status & Plan Filters */}
        <Title level={5}>Durum ve Plan</Title>
        <Form.Item name="status" label="Durum">
          <Select mode="multiple" placeholder="Durum seçin">
            <Option value="active">Aktif</Option>
            <Option value="suspended">Askıda</Option>
            <Option value="pending">Beklemede</Option>
            <Option value="expired">Süresi Dolmuş</Option>
          </Select>
        </Form.Item>

        <Form.Item name="plan" label="Plan">
          <Select mode="multiple" placeholder="Plan seçin">
            <Option value="Free">Free</Option>
            <Option value="Starter">Starter</Option>
            <Option value="Professional">Professional</Option>
            <Option value="Enterprise">Enterprise</Option>
          </Select>
        </Form.Item>

        <Divider />

        {/* Numeric Filters */}
        <Title level={5}>Sayısal Filtreler</Title>
        <Form.Item name="userRange" label="Kullanıcı Sayısı">
          <Slider range min={0} max={1000} marks={{ 0: '0', 500: '500', 1000: '1000+' }} />
        </Form.Item>

        <Form.Item name="storageRange" label="Depolama (GB)">
          <Slider range min={0} max={100} marks={{ 0: '0', 50: '50', 100: '100' }} />
        </Form.Item>

        <Form.Item name="revenueRange" label="Gelir (₺)">
          <Row gutter={8}>
            <Col span={12}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Min"
                min={0}
                formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Max"
                min={0}
                formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Col>
          </Row>
        </Form.Item>

        <Divider />

        {/* Date Filters */}
        <Title level={5}>Tarih Filtreleri</Title>
        <Form.Item name="dateRange" label="Oluşturma Tarihi">
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Divider />

        {/* Module Filters */}
        <Title level={5}>Modüller</Title>
        <Form.Item name="modules">
          <Checkbox.Group>
            <Row>
              <Col span={12}>
                <Checkbox value="CRM">CRM</Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox value="Sales">Sales</Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox value="Finance">Finance</Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox value="HR">HR</Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox value="Inventory">Inventory</Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox value="Support">Support</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Divider />

        {/* Feature Filters */}
        <Title level={5}>Özellikler</Title>
        <Form.Item name="hasCustomDomain" valuePropName="checked">
          <Switch checkedChildren="Custom Domain" unCheckedChildren="Custom Domain" />
        </Form.Item>

        <Form.Item name="hasApiAccess" valuePropName="checked">
          <Switch checkedChildren="API Access" unCheckedChildren="API Access" />
        </Form.Item>

        <Form.Item name="isActive" valuePropName="checked">
          <Switch checkedChildren="Sadece Aktifler" unCheckedChildren="Tümü" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AdvancedFilter;