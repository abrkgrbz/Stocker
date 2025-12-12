import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Typography, Modal, Form, Select, Row, Col, Statistic, Spin, DatePicker } from 'antd';
import {
  ReadOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  CalendarOutlined,
  UserOutlined,
  RiseOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useBlogPosts,
  useBlogCategories,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
} from '../../../hooks/useCMS';
import {
  BlogPostDto,
  BlogPostListDto,
  BlogPostStatus,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from '../../../services/api/cmsService';
import { Dropdown } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CMSBlog: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostListDto | null>(null);
  const [form] = Form.useForm();

  // API hooks
  const { data: posts = [], isLoading: postsLoading } = useBlogPosts(categoryFilter);
  const { data: categories = [], isLoading: categoriesLoading } = useBlogCategories();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const publishPost = usePublishBlogPost();
  const unpublishPost = useUnpublishBlogPost();

  const isLoading = postsLoading || categoriesLoading;

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === 'Published').length,
    draft: posts.filter((p) => p.status === 'Draft').length,
    totalViews: posts.reduce((sum, p) => sum + p.viewCount, 0),
  };

  const handleAdd = () => {
    setEditingPost(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (post: BlogPostListDto) => {
    setEditingPost(post);
    form.setFieldsValue({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      author: post.author,
      readTime: post.readTime,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (post: BlogPostListDto) => {
    Modal.confirm({
      title: 'Yazıyı Sil',
      content: `"${post.title}" yazısını silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        deletePost.mutate(post.id);
      },
    });
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingPost) {
        const updateData: UpdateBlogPostDto = {
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt,
          content: values.content || '',
          featuredImage: values.featuredImage,
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
          status: editingPost.status,
          readTime: values.readTime,
          author: values.author,
          tags: values.tags,
          categoryId: values.categoryId,
        };
        updatePost.mutate(
          { id: editingPost.id, data: updateData },
          {
            onSuccess: () => setIsModalOpen(false),
          }
        );
      } else {
        const createData: CreateBlogPostDto = {
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt,
          content: values.content || '',
          featuredImage: values.featuredImage,
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
          status: 'Draft',
          readTime: values.readTime,
          author: values.author,
          tags: values.tags,
          categoryId: values.categoryId,
        };
        createPost.mutate(createData, {
          onSuccess: () => setIsModalOpen(false),
        });
      }
    });
  };

  const handlePublish = (post: BlogPostListDto) => {
    if (post.status === 'Published') {
      unpublishPost.mutate(post.id);
    } else {
      publishPost.mutate(post.id);
    }
  };

  const getStatusTag = (status: BlogPostStatus) => {
    const config: Record<BlogPostStatus, { color: string; text: string }> = {
      Published: { color: 'green', text: 'Yayında' },
      Draft: { color: 'orange', text: 'Taslak' },
      Scheduled: { color: 'blue', text: 'Zamanlanmış' },
      Archived: { color: 'red', text: 'Arşiv' },
    };
    return <Tag color={config[status]?.color || 'default'}>{config[status]?.text || status}</Tag>;
  };

  const columns = [
    {
      title: 'Yazı',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: BlogPostListDto) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.excerpt || '-'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (category: string) => <Tag>{category || '-'}</Tag>,
    },
    {
      title: 'Yazar',
      dataIndex: 'author',
      key: 'author',
      render: (author: string) => (
        <Space>
          <UserOutlined />
          <span>{author || '-'}</span>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: BlogPostStatus) => getStatusTag(status),
    },
    {
      title: 'Yayın Tarihi',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {date ? new Date(date).toLocaleDateString('tr-TR') : '-'}
        </Space>
      ),
    },
    {
      title: 'Görüntüleme',
      dataIndex: 'viewCount',
      key: 'viewCount',
      sorter: (a: BlogPostListDto, b: BlogPostListDto) => a.viewCount - b.viewCount,
      render: (views: number) => views.toLocaleString(),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: BlogPostListDto) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/blog/${record.slug}`, '_blank')}
          />
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
      <div
        style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Blog Yazıları
          </Title>
          <Text type="secondary">Blog içeriklerini yönetin</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Yeni Yazı
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Toplam Yazı" value={stats.total} prefix={<ReadOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Yayında" value={stats.published} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Taslak" value={stats.draft} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Toplam Görüntüleme" value={stats.totalViews} prefix={<RiseOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Yazı ara..."
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

      {/* Table */}
      <Card>
        <Table
          dataSource={filteredPosts}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Toplam ${total} yazı`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingPost ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Kaydet"
        cancelText="İptal"
        width={800}
        confirmLoading={createPost.isPending || updatePost.isPending}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Başlık"
                rules={[{ required: true, message: 'Başlık gerekli' }]}
              >
                <Input placeholder="Yazı başlığı" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="slug"
                label="URL (Slug)"
                rules={[{ required: true, message: 'Slug gerekli' }]}
              >
                <Input placeholder="yazi-url" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="excerpt" label="Özet">
            <TextArea rows={2} placeholder="Kısa özet..." />
          </Form.Item>
          <Form.Item name="content" label="İçerik">
            <TextArea rows={6} placeholder="Yazı içeriği..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="categoryId" label="Kategori">
                <Select placeholder="Kategori seçin" allowClear>
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="author" label="Yazar">
                <Input placeholder="Yazar adı" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="readTime" label="Okuma Süresi">
                <Input placeholder="5 dk" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="metaTitle" label="Meta Başlık">
                <Input placeholder="SEO başlığı" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="Etiketler">
                <Input placeholder="etiket1, etiket2, etiket3" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="metaDescription" label="Meta Açıklama">
            <TextArea rows={2} placeholder="SEO açıklaması" />
          </Form.Item>
          <Form.Item name="featuredImage" label="Öne Çıkan Görsel URL">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CMSBlog;
