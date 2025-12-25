'use client';

/**
 * Customer Segments Page
 * Manage customer groups (VIP, Wholesale, etc.)
 * Modern SaaS-style UI with Tailwind CSS
 */

import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { Plus, Users, Edit2, Trash2, MoreVertical } from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  Badge,
  EmptyState,
} from '@/components/ui/enterprise-page';
import { TeamOutlined } from '@ant-design/icons';

// Types
interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  discountRate: number;
  priority: number;
  customerCount: number;
  isActive: boolean;
  createdAt: string;
}

// Mock data
const mockSegments: CustomerSegment[] = [
  {
    id: '1',
    name: 'VIP Müşteriler',
    description: 'Yüksek hacimli ve sadık müşteriler',
    discountRate: 15,
    priority: 1,
    customerCount: 45,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Toptan Satış',
    description: 'Toptan alım yapan firmalar',
    discountRate: 20,
    priority: 2,
    customerCount: 128,
    isActive: true,
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Perakende',
    description: 'Standart perakende müşteriler',
    discountRate: 5,
    priority: 3,
    customerCount: 312,
    isActive: true,
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Yeni Müşteri',
    description: 'İlk alımını yapan müşteriler',
    discountRate: 10,
    priority: 4,
    customerCount: 67,
    isActive: false,
    createdAt: '2024-04-05',
  },
];

export default function CustomerSegmentsPage() {
  const [segments, setSegments] = useState<CustomerSegment[]>(mockSegments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CustomerSegment | null>(null);
  const [form] = Form.useForm();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleCreateClick = () => {
    setEditingSegment(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditClick = (segment: CustomerSegment) => {
    setEditingSegment(segment);
    form.setFieldsValue({
      name: segment.name,
      description: segment.description,
      discountRate: segment.discountRate,
      priority: segment.priority,
    });
    setIsModalOpen(true);
    setOpenDropdown(null);
  };

  const handleDeleteClick = (id: string) => {
    Modal.confirm({
      title: 'Segmenti Sil',
      content: 'Bu müşteri segmentini silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => {
        setSegments((prev) => prev.filter((s) => s.id !== id));
        message.success('Segment silindi');
      },
    });
    setOpenDropdown(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingSegment) {
        // Update existing segment
        setSegments((prev) =>
          prev.map((s) =>
            s.id === editingSegment.id
              ? { ...s, ...values }
              : s
          )
        );
        message.success('Segment güncellendi');
      } else {
        // Create new segment
        const newSegment: CustomerSegment = {
          id: Date.now().toString(),
          name: values.name,
          description: values.description || '',
          discountRate: values.discountRate || 0,
          priority: values.priority || segments.length + 1,
          customerCount: 0,
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setSegments((prev) => [...prev, newSegment]);
        message.success('Segment oluşturuldu');
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch {
      // Form validation failed
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return <Badge variant="success">En Yüksek</Badge>;
    if (priority === 2) return <Badge variant="info">Yüksek</Badge>;
    if (priority === 3) return <Badge variant="warning">Normal</Badge>;
    return <Badge variant="default">Düşük</Badge>;
  };

  return (
    <PageContainer maxWidth="6xl">
      <ListPageHeader
        icon={<TeamOutlined />}
        iconColor="#6366f1"
        title="Müşteri Segmentleri"
        description="Müşteri gruplarını ve indirim oranlarını yönetin"
        itemCount={segments.length}
        primaryAction={{
          label: 'Yeni Segment',
          onClick: handleCreateClick,
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {segments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="Henüz segment yok"
            description="Müşterilerinizi gruplandırmak için ilk segmenti oluşturun"
            action={{
              label: 'Segment Oluştur',
              onClick: handleCreateClick,
            }}
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Segment Adı
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Açıklama
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    İndirim Oranı
                  </th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Öncelik
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Müşteri Sayısı
                  </th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Durum
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {segments.map((segment) => (
                  <tr
                    key={segment.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-slate-900">
                          {segment.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {segment.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        %{segment.discountRate}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getPriorityBadge(segment.priority)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-slate-600">
                        {segment.customerCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={segment.isActive ? 'success' : 'default'}>
                        {segment.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === segment.id ? null : segment.id
                            )
                          }
                          className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                        {openDropdown === segment.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 z-20 mt-1 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditClick(segment)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(segment.id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Sil
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editingSegment ? 'Segment Düzenle' : 'Yeni Segment Oluştur'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={editingSegment ? 'Güncelle' : 'Oluştur'}
        cancelText="Vazgeç"
        width={480}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Segment Adı"
            rules={[{ required: true, message: 'Segment adı gerekli' }]}
          >
            <Input placeholder="Örn: VIP Müşteriler" />
          </Form.Item>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea
              placeholder="Segment hakkında kısa açıklama..."
              rows={2}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="discountRate"
              label="İndirim Oranı (%)"
              rules={[{ required: true, message: 'İndirim oranı gerekli' }]}
            >
              <InputNumber
                min={0}
                max={100}
                placeholder="0"
                className="w-full"
                addonAfter="%"
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Öncelik"
              rules={[{ required: true, message: 'Öncelik gerekli' }]}
            >
              <InputNumber
                min={1}
                max={10}
                placeholder="1"
                className="w-full"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
}
