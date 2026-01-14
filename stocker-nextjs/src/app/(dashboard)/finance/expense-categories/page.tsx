'use client';

/**
 * Expense Categories Page (Gider Kategorileri)
 * Gider türleri ve kategori yönetimi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Table, Input, Modal, Form, Select, Spin, Empty, Tag, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  TagIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
interface ExpenseCategory {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  parentName: string | null;
  accountCode: string;
  vatRate: number;
  isDeductible: boolean;
  description: string;
  expenseCount: number;
  totalAmount: number;
  status: 'active' | 'inactive';
}

// Mock data
const mockCategories: ExpenseCategory[] = [
  {
    id: 1,
    code: 'GDR-001',
    name: 'Personel Giderleri',
    parentId: null,
    parentName: null,
    accountCode: '770',
    vatRate: 0,
    isDeductible: true,
    description: 'Maaş, sigorta, prim ve personel yan hakları',
    expenseCount: 45,
    totalAmount: 850000,
    status: 'active',
  },
  {
    id: 2,
    code: 'GDR-002',
    name: 'Kira Giderleri',
    parentId: null,
    parentName: null,
    accountCode: '770.01',
    vatRate: 20,
    isDeductible: true,
    description: 'Ofis, depo ve araç kira giderleri',
    expenseCount: 12,
    totalAmount: 240000,
    status: 'active',
  },
  {
    id: 3,
    code: 'GDR-003',
    name: 'Enerji Giderleri',
    parentId: null,
    parentName: null,
    accountCode: '770.02',
    vatRate: 20,
    isDeductible: true,
    description: 'Elektrik, doğalgaz, su ve yakıt giderleri',
    expenseCount: 36,
    totalAmount: 125000,
    status: 'active',
  },
  {
    id: 4,
    code: 'GDR-004',
    name: 'İletişim Giderleri',
    parentId: null,
    parentName: null,
    accountCode: '770.03',
    vatRate: 20,
    isDeductible: true,
    description: 'Telefon, internet ve posta giderleri',
    expenseCount: 24,
    totalAmount: 45000,
    status: 'active',
  },
  {
    id: 5,
    code: 'GDR-005',
    name: 'Ulaşım Giderleri',
    parentId: null,
    parentName: null,
    accountCode: '770.04',
    vatRate: 20,
    isDeductible: true,
    description: 'Taşıt yakıt, bakım ve yol masrafları',
    expenseCount: 68,
    totalAmount: 180000,
    status: 'active',
  },
  {
    id: 6,
    code: 'GDR-006',
    name: 'Temsil ve Ağırlama',
    parentId: null,
    parentName: null,
    accountCode: '770.05',
    vatRate: 20,
    isDeductible: false,
    description: 'Müşteri ağırlama, hediye ve organizasyon',
    expenseCount: 15,
    totalAmount: 35000,
    status: 'active',
  },
  {
    id: 7,
    code: 'GDR-007',
    name: 'Pazarlama Giderleri',
    parentId: null,
    parentName: null,
    accountCode: '760',
    vatRate: 20,
    isDeductible: true,
    description: 'Reklam, tanıtım ve pazarlama faaliyetleri',
    expenseCount: 22,
    totalAmount: 95000,
    status: 'active',
  },
  {
    id: 8,
    code: 'GDR-008',
    name: 'Danışmanlık Giderleri',
    parentId: null,
    parentName: null,
    accountCode: '770.06',
    vatRate: 20,
    isDeductible: true,
    description: 'Hukuk, mali müşavir ve teknik danışmanlık',
    expenseCount: 8,
    totalAmount: 120000,
    status: 'active',
  },
];

export default function ExpenseCategoriesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [form] = Form.useForm();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Calculate totals
  const totalCategories = mockCategories.length;
  const activeCategories = mockCategories.filter(c => c.status === 'active').length;
  const totalExpenseAmount = mockCategories.reduce((sum, c) => sum + c.totalAmount, 0);

  const columns: ColumnsType<ExpenseCategory> = [
    {
      title: 'Kategori',
      key: 'category',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <FolderIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{record.name}</div>
            <div className="text-xs text-slate-500">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Hesap Kodu',
      dataIndex: 'accountCode',
      key: 'accountCode',
      width: 100,
      render: (code) => (
        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {code}
        </span>
      ),
    },
    {
      title: 'KDV Oranı',
      dataIndex: 'vatRate',
      key: 'vatRate',
      width: 100,
      align: 'center',
      render: (rate) => (
        <span className="text-sm text-slate-600">%{rate}</span>
      ),
    },
    {
      title: 'İndirim',
      key: 'deductible',
      width: 100,
      render: (_, record) => (
        <Tag color={record.isDeductible ? 'green' : 'default'}>
          {record.isDeductible ? 'İndirilebilir' : 'KKEG'}
        </Tag>
      ),
    },
    {
      title: 'Gider Sayısı',
      dataIndex: 'expenseCount',
      key: 'expenseCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <span className="text-sm text-slate-600">{count}</span>
      ),
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount) => (
        <span className="text-sm font-medium text-slate-900">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'green' : 'default'}>
          {record.status === 'active' ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEdit(record)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4 text-slate-500" />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <TrashIcon className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log('Saving category:', values);
      setIsModalOpen(false);
      form.resetFields();
      setEditingCategory(null);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <TagIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Gider Kategorileri</h1>
              <p className="text-sm text-slate-500">Gider türleri ve muhasebe kategorizasyonu</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Yeni Kategori</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Toplam Kategori</div>
          <div className="text-2xl font-bold text-slate-900">{totalCategories}</div>
          <div className="text-xs text-slate-500 mt-1">{activeCategories} aktif</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Toplam Gider</div>
          <div className="text-xl font-bold text-slate-900">
            {mockCategories.reduce((sum, c) => sum + c.expenseCount, 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">kayıtlı gider</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Toplam Tutar</div>
          <div className="text-xl font-bold text-red-600">{formatCurrency(totalExpenseAmount)}</div>
          <div className="text-xs text-slate-500 mt-1">gider toplamı</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <Input
          placeholder="Kategori adı veya kodu ara..."
          prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-80"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FolderIcon className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Kategori Listesi</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : mockCategories.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-slate-500">Gider kategorisi bulunmuyor</span>}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={mockCategories}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kategori`,
            }}
            className={tableClassName}
          />
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-amber-900 mb-3">Gider Kategorileri Hakkında</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-amber-700">
          <div>
            <h4 className="font-medium text-amber-800 mb-1">KDV İndirimi</h4>
            <p>
              İşletme faaliyetleriyle doğrudan ilgili giderler için ödenen KDV, hesaplanan KDV&apos;den
              indirilebilir. Temsil ve ağırlama gibi KKEG giderleri için KDV indirimi yapılamaz.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-amber-800 mb-1">Muhasebe Entegrasyonu</h4>
            <p>
              Her kategori için tanımlanan hesap kodu, gider kayıtlarının otomatik olarak doğru
              muhasebe hesabına aktarılmasını sağlar. TDHP uyumlu hesap kodları kullanılmalıdır.
            </p>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        okText="Kaydet"
        cancelText="İptal"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Kategori Kodu"
              rules={[{ required: true, message: 'Kod gerekli' }]}
            >
              <Input placeholder="GDR-XXX" />
            </Form.Item>
            <Form.Item
              name="accountCode"
              label="Hesap Kodu"
              rules={[{ required: true, message: 'Hesap kodu gerekli' }]}
            >
              <Input placeholder="770.XX" />
            </Form.Item>
          </div>
          <Form.Item
            name="name"
            label="Kategori Adı"
            rules={[{ required: true, message: 'Ad gerekli' }]}
          >
            <Input placeholder="Kategori adı" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={2} placeholder="Kategori açıklaması" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="vatRate"
              label="KDV Oranı (%)"
              rules={[{ required: true, message: 'KDV oranı gerekli' }]}
            >
              <InputNumber className="w-full" min={0} max={100} />
            </Form.Item>
            <Form.Item
              name="isDeductible"
              label="KDV İndirimi"
              rules={[{ required: true, message: 'Seçim gerekli' }]}
            >
              <Select
                options={[
                  { value: true, label: 'İndirilebilir' },
                  { value: false, label: 'KKEG (İndirilmez)' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
