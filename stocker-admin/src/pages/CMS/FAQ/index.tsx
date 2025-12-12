import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Typography, Modal, message, Form, Select, Collapse } from 'antd';
import {
  QuestionCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  DragOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface FAQ {
  key: string;
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

const CMSFAQ: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form] = Form.useForm();

  const [faqs, setFaqs] = useState<FAQ[]>([
    { key: '1', id: 1, question: 'Stocker nedir?', answer: 'Stocker, işletmelerin stok ve envanter yönetimini kolaylaştıran bulut tabanlı bir SaaS platformudur.', category: 'Genel', order: 1, isActive: true },
    { key: '2', id: 2, question: 'Ücretsiz deneme süresi var mı?', answer: 'Evet! 14 gün boyunca tüm özellikleri ücretsiz deneyebilirsiniz.', category: 'Fiyatlandırma', order: 2, isActive: true },
    { key: '3', id: 3, question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', answer: 'Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz.', category: 'Fiyatlandırma', order: 3, isActive: true },
    { key: '4', id: 4, question: 'Kaç kullanıcı ekleyebilirim?', answer: 'Kullanıcı sayısı seçtiğiniz pakete göre değişir.', category: 'Özellikler', order: 4, isActive: true },
    { key: '5', id: 5, question: 'Mobil uygulama var mı?', answer: 'Evet! iOS ve Android için mobil uygulamamız mevcuttur.', category: 'Özellikler', order: 5, isActive: true },
    { key: '6', id: 6, question: 'Verilerim güvende mi?', answer: 'Kesinlikle. Verileriniz 256-bit SSL şifreleme ile korunur.', category: 'Güvenlik', order: 6, isActive: true },
    { key: '7', id: 7, question: 'İki faktörlü kimlik doğrulama var mı?', answer: 'Evet, hesabınızı korumak için 2FA kullanabilirsiniz.', category: 'Güvenlik', order: 7, isActive: true },
    { key: '8', id: 8, question: 'Teknik destek nasıl alırım?', answer: 'E-posta, canlı sohbet ve telefon ile 7/24 destek alabilirsiniz.', category: 'Destek', order: 8, isActive: true },
  ]);

  const categories = ['Tümü', 'Genel', 'Fiyatlandırma', 'Özellikler', 'Güvenlik', 'Destek'];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    setEditingFaq(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    form.setFieldsValue(faq);
    setIsModalOpen(true);
  };

  const handleDelete = (faq: FAQ) => {
    Modal.confirm({
      title: 'SSS Sil',
      content: `Bu soruyu silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        setFaqs(faqs.filter(f => f.id !== faq.id));
        message.success('SSS silindi');
      },
    });
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      if (editingFaq) {
        setFaqs(faqs.map(f => f.id === editingFaq.id ? { ...f, ...values } : f));
        message.success('SSS güncellendi');
      } else {
        const newFaq: FAQ = {
          key: String(Date.now()),
          id: Date.now(),
          ...values,
          order: faqs.length + 1,
          isActive: true,
        };
        setFaqs([...faqs, newFaq]);
        message.success('SSS eklendi');
      }
      setIsModalOpen(false);
    });
  };

  const columns = [
    {
      title: '',
      key: 'drag',
      width: 40,
      render: () => <DragOutlined style={{ cursor: 'grab', color: '#999' }} />,
    },
    {
      title: 'Soru',
      dataIndex: 'question',
      key: 'question',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a: FAQ, b: FAQ) => a.order - b.order,
    },
    {
      title: 'İşlemler',
      key: 'action',
      width: 120,
      render: (_: any, record: FAQ) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  // Group by category for preview
  const groupedFaqs = categories.slice(1).reduce((acc, cat) => {
    acc[cat] = filteredFaqs.filter(f => f.category === cat);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Sıkça Sorulan Sorular</Title>
          <Text type="secondary">SSS içeriklerini yönetin</Text>
        </div>
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => window.open('/faq', '_blank')}>
            Önizle
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Yeni Soru
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Soru ara..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
          >
            <Option value="all">Tüm Kategoriler</Option>
            {categories.slice(1).map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Table View */}
      <Card title="SSS Listesi" style={{ marginBottom: 16 }}>
        <Table
          dataSource={filteredFaqs}
          columns={columns}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <Paragraph style={{ margin: 0, paddingLeft: 40 }}>
                {record.answer}
              </Paragraph>
            ),
          }}
        />
      </Card>

      {/* Preview by Category */}
      <Card title="Kategoriye Göre Önizleme">
        <Collapse>
          {Object.entries(groupedFaqs).map(([category, items]) => (
            items.length > 0 && (
              <Panel header={`${category} (${items.length})`} key={category}>
                {items.map(faq => (
                  <div key={faq.id} style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
                    <Text strong><QuestionCircleOutlined style={{ marginRight: 8 }} />{faq.question}</Text>
                    <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>{faq.answer}</Paragraph>
                  </div>
                ))}
              </Panel>
            )
          ))}
        </Collapse>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingFaq ? 'SSS Düzenle' : 'Yeni SSS Ekle'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Kaydet"
        cancelText="İptal"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="question" label="Soru" rules={[{ required: true, message: 'Soru gerekli' }]}>
            <Input placeholder="Soruyu yazın..." />
          </Form.Item>
          <Form.Item name="answer" label="Cevap" rules={[{ required: true, message: 'Cevap gerekli' }]}>
            <TextArea rows={4} placeholder="Cevabı yazın..." />
          </Form.Item>
          <Form.Item name="category" label="Kategori" rules={[{ required: true, message: 'Kategori seçin' }]}>
            <Select placeholder="Kategori seçin">
              {categories.slice(1).map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CMSFAQ;
