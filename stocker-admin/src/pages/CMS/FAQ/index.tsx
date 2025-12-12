import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Typography, Modal, Form, Select, Collapse, Spin } from 'antd';
import {
  QuestionCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  DragOutlined,
  EyeOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  useFAQItems,
  useFAQCategories,
  useCreateFAQItem,
  useUpdateFAQItem,
  useDeleteFAQItem,
} from '../../../hooks/useCMS';
import {
  FAQItemDto,
  FAQCategoryListDto,
  CreateFAQItemDto,
  UpdateFAQItemDto,
} from '../../../services/api/cmsService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const CMSFAQ: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItemDto | null>(null);
  const [form] = Form.useForm();

  // API hooks
  const { data: faqs = [], isLoading: faqsLoading } = useFAQItems(categoryFilter);
  const { data: categories = [], isLoading: categoriesLoading } = useFAQCategories();
  const createFAQ = useCreateFAQItem();
  const updateFAQ = useUpdateFAQItem();
  const deleteFAQ = useDeleteFAQItem();

  const isLoading = faqsLoading || categoriesLoading;

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const handleAdd = () => {
    setEditingFaq(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (faq: FAQItemDto) => {
    setEditingFaq(faq);
    form.setFieldsValue({
      question: faq.question,
      answer: faq.answer,
      categoryId: faq.categoryId,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (faq: FAQItemDto) => {
    Modal.confirm({
      title: 'SSS Sil',
      content: `Bu soruyu silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        deleteFAQ.mutate(faq.id);
      },
    });
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingFaq) {
        const updateData: UpdateFAQItemDto = {
          question: values.question,
          answer: values.answer,
          sortOrder: values.sortOrder || editingFaq.sortOrder,
          isActive: values.isActive ?? editingFaq.isActive,
          categoryId: values.categoryId,
        };
        updateFAQ.mutate(
          { id: editingFaq.id, data: updateData },
          {
            onSuccess: () => setIsModalOpen(false),
          }
        );
      } else {
        const createData: CreateFAQItemDto = {
          question: values.question,
          answer: values.answer,
          sortOrder: values.sortOrder,
          isActive: values.isActive ?? true,
          categoryId: values.categoryId,
        };
        createFAQ.mutate(createData, {
          onSuccess: () => setIsModalOpen(false),
        });
      }
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
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 150,
      render: (category: string) => <Tag color="blue">{category || '-'}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: (a: FAQItemDto, b: FAQItemDto) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Görüntüleme',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      render: (views: number) => views?.toLocaleString() || '0',
    },
    {
      title: 'İşlemler',
      key: 'action',
      width: 120,
      render: (_: any, record: FAQItemDto) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  // Group by category for preview
  const groupedFaqs = categories.reduce((acc, cat) => {
    acc[cat.name] = filteredFaqs.filter((f) => f.categoryId === cat.id);
    return acc;
  }, {} as Record<string, FAQItemDto[]>);

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Sıkça Sorulan Sorular
          </Title>
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
            style={{ width: 200 }}
            placeholder="Kategori seçin"
            allowClear
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Table View */}
      <Card title="SSS Listesi" style={{ marginBottom: 16 }}>
        <Table
          dataSource={filteredFaqs}
          columns={columns}
          rowKey="id"
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <Paragraph style={{ margin: 0, paddingLeft: 40 }}>{record.answer}</Paragraph>
            ),
          }}
        />
      </Card>

      {/* Preview by Category */}
      <Card title="Kategoriye Göre Önizleme">
        <Collapse>
          {Object.entries(groupedFaqs).map(
            ([category, items]) =>
              items.length > 0 && (
                <Panel header={`${category} (${items.length})`} key={category}>
                  {items.map((faq) => (
                    <div
                      key={faq.id}
                      style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}
                    >
                      <Text strong>
                        <QuestionCircleOutlined style={{ marginRight: 8 }} />
                        {faq.question}
                      </Text>
                      <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                        {faq.answer}
                      </Paragraph>
                    </div>
                  ))}
                </Panel>
              )
          )}
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
        confirmLoading={createFAQ.isPending || updateFAQ.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="question"
            label="Soru"
            rules={[{ required: true, message: 'Soru gerekli' }]}
          >
            <Input placeholder="Soruyu yazın..." />
          </Form.Item>
          <Form.Item
            name="answer"
            label="Cevap"
            rules={[{ required: true, message: 'Cevap gerekli' }]}
          >
            <TextArea rows={4} placeholder="Cevabı yazın..." />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Kategori"
            rules={[{ required: true, message: 'Kategori seçin' }]}
          >
            <Select placeholder="Kategori seçin">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sortOrder" label="Sıra">
            <Input type="number" placeholder="1" />
          </Form.Item>
          <Form.Item name="isActive" label="Durum">
            <Select placeholder="Durum seçin" defaultValue={true}>
              <Option value={true}>Aktif</Option>
              <Option value={false}>Pasif</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CMSFAQ;
