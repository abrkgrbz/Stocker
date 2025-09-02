import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Divider, 
  Table, 
  DatePicker,
  InputNumber,
  Select,
  Button,
  message,
  Alert,
  Tag,
  List,
  Tabs,
} from 'antd';
import { 
  GlobalOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  PercentageOutlined,
  NumberOutlined,
  TranslationOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useI18n } from '@/hooks/useI18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TranslatedText } from '@/components/TranslatedText';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function I18nDemo() {
  const { t, currentLanguage, languageConfig, formatters, changeLanguage } = useI18n();
  const [testNumber, setTestNumber] = useState(1234567.89);
  const [testDate, setTestDate] = useState(new Date());
  const [selectedNamespace, setSelectedNamespace] = useState('common');

  const namespaces = ['common', 'auth', 'dashboard', 'products', 'customers', 'orders', 'invoices', 'settings'];

  const formatterExamples = [
    { label: 'Number', value: formatters.number(testNumber), icon: <NumberOutlined /> },
    { label: 'Currency', value: formatters.currency(testNumber), icon: <DollarOutlined /> },
    { label: 'Percentage', value: formatters.percentage(85.5), icon: <PercentageOutlined /> },
    { label: 'Compact', value: formatters.compact(testNumber), icon: <NumberOutlined /> },
    { label: 'Decimal (2)', value: formatters.decimal(testNumber, 2), icon: <NumberOutlined /> },
    { label: 'Date', value: formatters.date(testDate), icon: <CalendarOutlined /> },
    { label: 'Date (short)', value: formatters.date(testDate, 'short'), icon: <CalendarOutlined /> },
  ];

  const translationExamples = [
    { key: 'common.welcome', params: undefined },
    { key: 'dashboard.welcome', params: { name: 'John Doe' } },
    { key: 'messages.success.created', params: { item: t('products.title') } },
    { key: 'messages.warning.confirmDelete', params: { item: t('customers.title') } },
    { key: 'dashboard.lastDays', params: { days: 7 } },
    { key: 'validation.minLength', params: { min: 8 } },
    { key: 'validation.maxLength', params: { max: 255 } },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>
              <GlobalOutlined /> Internationalization (i18n) Demo
            </Title>
            <Paragraph>
              This page demonstrates the i18n features of the application, including language switching,
              translations, number/date formatting, and more.
            </Paragraph>
          </div>

          <Alert
            message={`Current Language: ${languageConfig.name} ${languageConfig.flag}`}
            description={`Locale: ${currentLanguage === 'tr' ? 'tr-TR' : 'en-US'} | Currency: ${languageConfig.currency} | Date Format: ${languageConfig.dateFormat}`}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />

          <Divider orientation="left">Language Switcher Components</Divider>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card title="Select Mode" size="small">
                <LanguageSwitcher mode="select" />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card title="Button Mode" size="small">
                <LanguageSwitcher mode="button" />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card title="Dropdown Mode" size="small">
                <LanguageSwitcher mode="dropdown" />
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">Number & Date Formatting</Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Test Input" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    value={testNumber}
                    onChange={(value) => setTestNumber(value || 0)}
                    placeholder="Enter a number"
                    addonBefore={<NumberOutlined />}
                  />
                  <DatePicker
                    style={{ width: '100%' }}
                    value={dayjs(testDate)}
                    onChange={(date) => setTestDate(date?.toDate() || new Date())}
                    format={languageConfig.dateFormat}
                  />
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Formatted Output" size="small">
                <List
                  dataSource={formatterExamples}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        {item.icon}
                        <Text strong>{item.label}:</Text>
                        <Tag color="blue">{item.value}</Tag>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">Translation Examples</Divider>

          <Card>
            <Tabs defaultActiveKey="examples">
              <TabPane tab="Examples" key="examples">
                <Table
                  dataSource={translationExamples}
                  columns={[
                    {
                      title: 'Key',
                      dataIndex: 'key',
                      key: 'key',
                      render: (text) => <Text code>{text}</Text>,
                    },
                    {
                      title: 'Parameters',
                      dataIndex: 'params',
                      key: 'params',
                      render: (params) => params ? <Text code>{JSON.stringify(params)}</Text> : '-',
                    },
                    {
                      title: 'Result',
                      key: 'result',
                      render: (_, record) => (
                        <Tag color="green">{t(record.key, record.params)}</Tag>
                      ),
                    },
                  ]}
                  pagination={false}
                />
              </TabPane>
              
              <TabPane tab="Namespace Browser" key="browser">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Select
                    style={{ width: 200 }}
                    value={selectedNamespace}
                    onChange={setSelectedNamespace}
                    placeholder="Select namespace"
                  >
                    {namespaces.map((ns) => (
                      <Select.Option key={ns} value={ns}>
                        {ns}
                      </Select.Option>
                    ))}
                  </Select>
                  
                  <Alert
                    message="Translation Keys"
                    description={`Browse translations in the "${selectedNamespace}" namespace`}
                    type="info"
                  />
                  
                  <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    <List
                      dataSource={Object.keys(t(selectedNamespace, { returnObjects: true }) || {})}
                      renderItem={(key) => (
                        <List.Item>
                          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Text code>{`${selectedNamespace}.${key}`}</Text>
                            <Tag>{t(`${selectedNamespace}.${key}`)}</Tag>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>
                </Space>
              </TabPane>

              <TabPane tab="TranslatedText Component" key="component">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Card size="small" title="Basic Usage">
                    <TranslatedText i18nKey="common.welcome" />
                  </Card>
                  
                  <Card size="small" title="With Namespace">
                    <TranslatedText i18nKey="loginTitle" namespace="auth" />
                  </Card>
                  
                  <Card size="small" title="With Values">
                    <TranslatedText 
                      i18nKey="dashboard.welcome" 
                      values={{ name: 'Alice' }}
                    />
                  </Card>
                  
                  <Card size="small" title="With Fallback">
                    <TranslatedText 
                      i18nKey="non.existent.key" 
                      fallback="This is a fallback text"
                    />
                  </Card>
                  
                  <Card size="small" title="With Custom Component">
                    <TranslatedText 
                      i18nKey="common.welcome" 
                      component="h3"
                      style={{ color: '#667eea' }}
                    />
                  </Card>
                </Space>
              </TabPane>
            </Tabs>
          </Card>

          <Divider orientation="left">Quick Actions</Divider>

          <Space wrap>
            <Button 
              type="primary" 
              icon={<TranslationOutlined />}
              onClick={() => {
                changeLanguage(currentLanguage === 'tr' ? 'en' : 'tr');
                message.success(t('messages.success.saved'));
              }}
            >
              Toggle Language
            </Button>
            
            <Button 
              icon={<CheckCircleOutlined />}
              onClick={() => {
                message.success(t('messages.success.created', { item: 'Demo' }));
              }}
            >
              Show Success Message
            </Button>
            
            <Button 
              danger
              onClick={() => {
                message.error(t('messages.error.general'));
              }}
            >
              Show Error Message
            </Button>
            
            <Button 
              onClick={() => {
                message.warning(t('messages.warning.unsavedChanges'));
              }}
            >
              Show Warning
            </Button>
            
            <Button 
              onClick={() => {
                message.info(t('messages.info.loading'));
              }}
            >
              Show Info
            </Button>
          </Space>

          <Divider />

          <Alert
            message="Implementation Notes"
            description={
              <ul>
                <li>Translations are stored in JSON files under src/i18n/locales/</li>
                <li>Language preference is persisted in localStorage</li>
                <li>Date and number formatting adapts to the selected locale</li>
                <li>Missing translations are logged in development mode</li>
                <li>The useI18n hook provides convenient access to all i18n features</li>
                <li>Ant Design components automatically adapt to the selected language</li>
              </ul>
            }
            type="success"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
}