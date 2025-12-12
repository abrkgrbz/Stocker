import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Typography, Modal, message, Dropdown, Tooltip, Form, Spin } from 'antd';
import {
  FileTextOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  SolutionOutlined,
  ReadOutlined,
  RocketOutlined,
  SafetyOutlined,
  HistoryOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  usePages,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  usePublishPage,
  useUnpublishPage,
} from '../../../hooks/useCMS';
import { PageDto, PageStatus, CreatePageDto, UpdatePageDto } from '../../../services/api/cmsService';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Icon mapping for pages
const getPageIcon = (slug: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    '/': <HomeOutlined />,
    '/about': <InfoCircleOutlined />,
    '/contact': <PhoneOutlined />,
    '/demo': <RocketOutlined />,
    '/faq': <QuestionCircleOutlined />,
    '/support': <CustomerServiceOutlined />,
    '/careers': <SolutionOutlined />,
    '/blog': <ReadOutlined />,
    '/updates': <HistoryOutlined />,
    '/privacy': <SafetyOutlined />,
    '/terms': <SafetyOutlined />,
    '/kvkk': <SafetyOutlined />,
  };
  return iconMap[slug] || <FileTextOutlined />;
};

const CMSPages: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageDto | null>(null);
  const [form] = Form.useForm();

  // API hooks
  const { data: pages = [], isLoading } = usePages();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const publishPage = usePublishPage();
  const unpublishPage = useUnpublishPage();

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchText.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAdd = () => {
    setEditingPage(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (page: PageDto) => {
    setEditingPage(page);
    form.setFieldsValue({
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      content: page.content,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (page: PageDto) => {
    Modal.confirm({
      title: 'Sayfayı Sil',
      content: `"${page.title}" sayfasını silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        deletePage.mutate(page.id);
      },
    });
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingPage) {
        const updateData: UpdatePageDto = {
          title: values.title,
          slug: values.slug,
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
          metaKeywords: editingPage.metaKeywords,
          content: values.content,
          status: editingPage.status,
          sortOrder: editingPage.sortOrder,
          featuredImage: editingPage.featuredImage,
          template: editingPage.template,
        };
        updatePage.mutate({ id: editingPage.id, data: updateData }, {
          onSuccess: () => setIsModalOpen(false),
        });
      } else {
        const createData: CreatePageDto = {
          title: values.title,
          slug: values.slug,
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
          content: values.content || '',
          status: 'Draft',
        };
        createPage.mutate(createData, {
          onSuccess: () => setIsModalOpen(false),
        });
      }
    });
  };

  const handlePublish = (page: PageDto) => {
    if (page.status === 'Published') {
      unpublishPage.mutate(page.id);
    } else {
      publishPage.mutate(page.id);
    }
  };

  const getStatusColor = (status: PageStatus) => {
    switch (status) {
      case 'Published':
        return 'green';
      case 'Draft':
        return 'orange';
      case 'Archived':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: PageStatus) => {
    switch (status) {
      case 'Published':
        return 'Yayında';
      case 'Draft':
        return 'Taslak';
      case 'Archived':
        return 'Arşiv';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'Sayfa',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: PageDto) => (
        <Space>
          <span style={{ color: '#667eea' }}>{getPageIcon(record.slug)}</span>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.slug}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Meta Başlık',
      dataIndex: 'metaTitle',
      key: 'metaTitle',
      render: (text: string) => <Text type="secondary">{text || '-'}</Text>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: PageStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      sorter: (a: PageDto, b: PageDto) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Son Güncelleme',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string, record: PageDto) => {
        const displayDate = date || record.createdAt;
        return displayDate ? new Date(displayDate).toLocaleDateString('tr-TR') : '-';
      },
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: PageDto) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Önizle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => window.open(record.slug, '_blank')}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'publish',
                  label: record.status === 'Published' ? 'Yayından Kaldır' : 'Yayınla',
                  onClick: () => handlePublish(record),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Sil',
                  danger: true,
                  onClick: () => handleDelete(record),
                },
              ],
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Sayfalar</Title>
          <Text type="secondary">Landing page sayfalarını yönetin</Text>
        </div>
        <Space>
          <Input
            placeholder="Sayfa ara..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Yeni Sayfa
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          dataSource={filteredPages}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Toplam ${total} sayfa`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingPage ? 'Sayfayı Düzenle' : 'Yeni Sayfa Ekle'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Kaydet"
        cancelText="İptal"
        width={700}
        confirmLoading={createPage.isPending || updatePage.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Başlık"
            rules={[{ required: true, message: 'Başlık gerekli' }]}
          >
            <Input placeholder="Sayfa başlığı" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="URL (Slug)"
            rules={[{ required: true, message: 'URL gerekli' }]}
          >
            <Input placeholder="/sayfa-url" />
          </Form.Item>
          <Form.Item name="metaTitle" label="Meta Başlık">
            <Input placeholder="SEO başlığı" />
          </Form.Item>
          <Form.Item name="metaDescription" label="Meta Açıklama">
            <TextArea rows={2} placeholder="SEO açıklaması" />
          </Form.Item>
          <Form.Item name="content" label="İçerik">
            <TextArea rows={6} placeholder="Sayfa içeriği..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CMSPages;
