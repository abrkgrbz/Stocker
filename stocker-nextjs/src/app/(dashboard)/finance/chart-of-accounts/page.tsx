'use client';

/**
 * Chart of Accounts (Hesap Planı) Page
 * Tek Düzen Hesap Planı (TDHP) yönetimi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Button, Input, Tree, Empty, Spin, Tag, Modal, Form, Select, InputNumber } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Account types following Turkish TDHP
const accountTypes = [
  { value: 'asset', label: 'Varlık (Aktif)', color: 'bg-blue-100 text-blue-700' },
  { value: 'liability', label: 'Kaynak (Pasif)', color: 'bg-red-100 text-red-700' },
  { value: 'equity', label: 'Özkaynak', color: 'bg-purple-100 text-purple-700' },
  { value: 'income', label: 'Gelir', color: 'bg-green-100 text-green-700' },
  { value: 'expense', label: 'Gider', color: 'bg-orange-100 text-orange-700' },
];

// Account nature
const accountNatures = [
  { value: 'debit', label: 'Borç' },
  { value: 'credit', label: 'Alacak' },
];

// Mock data - TDHP (Tek Düzen Hesap Planı)
const mockChartOfAccounts: DataNode[] = [
  {
    title: '1 - DÖNEN VARLIKLAR',
    key: '1',
    icon: <FolderIcon className="w-4 h-4 text-blue-600" />,
    children: [
      {
        title: '10 - HAZIR DEĞERLER',
        key: '10',
        icon: <FolderIcon className="w-4 h-4 text-blue-500" />,
        children: [
          { title: '100 - Kasa', key: '100', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '101 - Alınan Çekler', key: '101', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '102 - Bankalar', key: '102', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '103 - Verilen Çekler ve Ödeme Emirleri (-)', key: '103', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '11 - MENKUL KIYMETLER',
        key: '11',
        icon: <FolderIcon className="w-4 h-4 text-blue-500" />,
        children: [
          { title: '110 - Hisse Senetleri', key: '110', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '111 - Özel Kesim Tahvil, Senet ve Bonoları', key: '111', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '112 - Kamu Kesimi Tahvil, Senet ve Bonoları', key: '112', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '12 - TİCARİ ALACAKLAR',
        key: '12',
        icon: <FolderIcon className="w-4 h-4 text-blue-500" />,
        children: [
          { title: '120 - Alıcılar', key: '120', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '121 - Alacak Senetleri', key: '121', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '126 - Verilen Depozito ve Teminatlar', key: '126', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '127 - Diğer Ticari Alacaklar', key: '127', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '128 - Şüpheli Ticari Alacaklar', key: '128', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '129 - Şüpheli Ticari Alacaklar Karşılığı (-)', key: '129', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '15 - STOKLAR',
        key: '15',
        icon: <FolderIcon className="w-4 h-4 text-blue-500" />,
        children: [
          { title: '150 - İlk Madde ve Malzeme', key: '150', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '151 - Yarı Mamuller - Üretim', key: '151', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '152 - Mamuller', key: '152', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '153 - Ticari Mallar', key: '153', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '157 - Diğer Stoklar', key: '157', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '158 - Stok Değer Düşüklüğü Karşılığı (-)', key: '158', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '19 - DİĞER DÖNEN VARLIKLAR',
        key: '19',
        icon: <FolderIcon className="w-4 h-4 text-blue-500" />,
        children: [
          { title: '190 - Devreden KDV', key: '190', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '191 - İndirilecek KDV', key: '191', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '192 - Diğer KDV', key: '192', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '193 - Peşin Ödenen Vergiler ve Fonlar', key: '193', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
    ],
  },
  {
    title: '2 - DURAN VARLIKLAR',
    key: '2',
    icon: <FolderIcon className="w-4 h-4 text-blue-600" />,
    children: [
      {
        title: '25 - MADDİ DURAN VARLIKLAR',
        key: '25',
        icon: <FolderIcon className="w-4 h-4 text-blue-500" />,
        children: [
          { title: '250 - Arazi ve Arsalar', key: '250', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '251 - Yeraltı ve Yerüstü Düzenleri', key: '251', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '252 - Binalar', key: '252', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '253 - Tesis, Makine ve Cihazlar', key: '253', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '254 - Taşıtlar', key: '254', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '255 - Demirbaşlar', key: '255', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '257 - Birikmiş Amortismanlar (-)', key: '257', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
    ],
  },
  {
    title: '3 - KISA VADELİ YABANCI KAYNAKLAR',
    key: '3',
    icon: <FolderIcon className="w-4 h-4 text-red-600" />,
    children: [
      {
        title: '32 - TİCARİ BORÇLAR',
        key: '32',
        icon: <FolderIcon className="w-4 h-4 text-red-500" />,
        children: [
          { title: '320 - Satıcılar', key: '320', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '321 - Borç Senetleri', key: '321', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '326 - Alınan Depozito ve Teminatlar', key: '326', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '329 - Diğer Ticari Borçlar', key: '329', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '36 - ÖDENECEK VERGİ VE DİĞER YÜKÜMLÜLÜKLER',
        key: '36',
        icon: <FolderIcon className="w-4 h-4 text-red-500" />,
        children: [
          { title: '360 - Ödenecek Vergi ve Fonlar', key: '360', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '361 - Ödenecek Sosyal Güvenlik Kesintileri', key: '361', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '368 - Vadesi Geçmiş, Ertelenmiş veya Taksitlendirilmiş Vergi', key: '368', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '39 - DİĞER KISA VADELİ YABANCI KAYNAKLAR',
        key: '39',
        icon: <FolderIcon className="w-4 h-4 text-red-500" />,
        children: [
          { title: '391 - Hesaplanan KDV', key: '391', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
    ],
  },
  {
    title: '5 - ÖZ KAYNAKLAR',
    key: '5',
    icon: <FolderIcon className="w-4 h-4 text-purple-600" />,
    children: [
      {
        title: '50 - ÖDENMİŞ SERMAYE',
        key: '50',
        icon: <FolderIcon className="w-4 h-4 text-purple-500" />,
        children: [
          { title: '500 - Sermaye', key: '500', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '501 - Ödenmemiş Sermaye (-)', key: '501', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '57 - GEÇMİŞ YILLAR KARLARI',
        key: '57',
        icon: <FolderIcon className="w-4 h-4 text-purple-500" />,
        children: [
          { title: '570 - Geçmiş Yıllar Karları', key: '570', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '58 - GEÇMİŞ YILLAR ZARARLARI (-)',
        key: '58',
        icon: <FolderIcon className="w-4 h-4 text-purple-500" />,
        children: [
          { title: '580 - Geçmiş Yıllar Zararları', key: '580', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '59 - DÖNEM NET KARI (ZARARI)',
        key: '59',
        icon: <FolderIcon className="w-4 h-4 text-purple-500" />,
        children: [
          { title: '590 - Dönem Net Karı', key: '590', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '591 - Dönem Net Zararı (-)', key: '591', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
    ],
  },
  {
    title: '6 - GELİR TABLOSU HESAPLARI',
    key: '6',
    icon: <FolderIcon className="w-4 h-4 text-green-600" />,
    children: [
      {
        title: '60 - BRÜT SATIŞLAR',
        key: '60',
        icon: <FolderIcon className="w-4 h-4 text-green-500" />,
        children: [
          { title: '600 - Yurtiçi Satışlar', key: '600', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '601 - Yurtdışı Satışlar', key: '601', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '602 - Diğer Gelirler', key: '602', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '61 - SATIŞ İNDİRİMLERİ (-)',
        key: '61',
        icon: <FolderIcon className="w-4 h-4 text-green-500" />,
        children: [
          { title: '610 - Satıştan İadeler (-)', key: '610', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '611 - Satış İskontoları (-)', key: '611', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '612 - Diğer İndirimler (-)', key: '612', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '62 - SATIŞLARIN MALİYETİ (-)',
        key: '62',
        icon: <FolderIcon className="w-4 h-4 text-green-500" />,
        children: [
          { title: '620 - Satılan Mamul Maliyeti (-)', key: '620', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '621 - Satılan Ticari Mallar Maliyeti (-)', key: '621', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
          { title: '622 - Satılan Hizmet Maliyeti (-)', key: '622', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '77 - GELİR VE KARLAR',
        key: '77',
        icon: <FolderIcon className="w-4 h-4 text-green-500" />,
        children: [
          { title: '770 - Genel Yönetim Giderleri', key: '770', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
    ],
  },
  {
    title: '7 - MALİYET HESAPLARI',
    key: '7',
    icon: <FolderIcon className="w-4 h-4 text-orange-600" />,
    children: [
      {
        title: '70 - MALİYET MUHASEBESİ',
        key: '70',
        icon: <FolderIcon className="w-4 h-4 text-orange-500" />,
        children: [
          { title: '700 - Maliyet Muhasebesi Bağlantı Hesabı', key: '700', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '71 - DİREKT İLK MADDE VE MALZEME GİDERLERİ',
        key: '71',
        icon: <FolderIcon className="w-4 h-4 text-orange-500" />,
        children: [
          { title: '710 - Direkt İlk Madde ve Malzeme Giderleri', key: '710', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
      {
        title: '72 - DİREKT İŞÇİLİK GİDERLERİ',
        key: '72',
        icon: <FolderIcon className="w-4 h-4 text-orange-500" />,
        children: [
          { title: '720 - Direkt İşçilik Giderleri', key: '720', icon: <DocumentTextIcon className="w-4 h-4 text-slate-500" /> },
        ],
      },
    ],
  },
];

export default function ChartOfAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['1', '3', '5', '6']);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading] = useState(false);
  const [form] = Form.useForm();

  // Filter tree data based on search term
  const filterTreeData = (data: DataNode[], searchValue: string): DataNode[] => {
    if (!searchValue) return data;

    const filterNodes = (nodes: DataNode[]): DataNode[] => {
      const result: DataNode[] = [];

      for (const node of nodes) {
        const title = node.title as string;
        const matchesSearch = title.toLowerCase().includes(searchValue.toLowerCase());
        const filteredChildren = node.children ? filterNodes(node.children) : [];

        if (matchesSearch || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children,
          });
        }
      }

      return result;
    };

    return filterNodes(data);
  };

  const filteredData = filterTreeData(mockChartOfAccounts, searchTerm);

  const handleAddAccount = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(() => {
      setIsModalOpen(false);
      // TODO: API call to create account
    });
  };

  // Stats
  const totalAccounts = 85; // Mock count
  const activeAccounts = 72;
  const mainGroups = 7;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <BookOpenIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hesap Planı</h1>
              <p className="text-sm text-slate-500">Tek Düzen Hesap Planı (TDHP) yönetimi</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleAddAccount}
                className="!bg-slate-900 hover:!bg-slate-800"
              >
                Yeni Hesap
              </Button>
              <button
                onClick={() => {}}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Toplam Hesap</div>
              <div className="text-2xl font-bold text-slate-900">{totalAccounts}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Aktif Hesap</div>
              <div className="text-2xl font-bold text-green-600">{activeAccounts}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ana Grup</div>
              <div className="text-2xl font-bold text-blue-600">{mainGroups}</div>
            </div>
          </div>

          {/* Account Type Legend */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-slate-700">Hesap Türleri:</span>
              {accountTypes.map((type) => (
                <Tag key={type.value} className={`${type.color} !border-0`}>
                  {type.label}
                </Tag>
              ))}
            </div>
          </div>

          {/* Search and Tree */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <Input
                placeholder="Hesap kodu veya adı ara..."
                prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md !border-slate-300 !rounded-lg"
              />
              <div className="flex gap-2">
                <Button
                  size="small"
                  onClick={() => setExpandedKeys(['1', '2', '3', '5', '6', '7'])}
                  className="!border-slate-300"
                >
                  Tümünü Aç
                </Button>
                <Button
                  size="small"
                  onClick={() => setExpandedKeys([])}
                  className="!border-slate-300"
                >
                  Tümünü Kapat
                </Button>
              </div>
            </div>

            {filteredData.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-500">Arama kriterlerine uygun hesap bulunamadı</span>
                }
              />
            ) : (
              <Tree
                showIcon
                showLine={{ showLeafIcon: false }}
                treeData={filteredData}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                onExpand={(keys) => setExpandedKeys(keys)}
                onSelect={(keys) => setSelectedKeys(keys)}
                className="[&_.ant-tree-node-content-wrapper]:!py-1.5"
              />
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Tek Düzen Hesap Planı (TDHP) Rehberi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-blue-700 mb-2">1-2: Varlık Hesapları</h4>
                <p className="text-xs text-slate-500">
                  Dönen varlıklar (1) ve duran varlıklar (2) bilanço aktifini oluşturur.
                  Borç bakiye verir.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">3-4: Kaynak Hesapları</h4>
                <p className="text-xs text-slate-500">
                  Kısa vadeli (3) ve uzun vadeli (4) yabancı kaynaklar. Bilanço pasifinde
                  yer alır, alacak bakiye verir.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-700 mb-2">5: Öz Kaynaklar</h4>
                <p className="text-xs text-slate-500">
                  Sermaye, yedekler, kar/zarar hesapları. Alacak bakiye verir, bilanço
                  pasifinde gösterilir.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">6: Gelir Tablosu</h4>
                <p className="text-xs text-slate-500">
                  Satışlar, indirimler, maliyetler. Gelir tablosu kalemlerini içerir.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-orange-700 mb-2">7: Maliyet Hesapları</h4>
                <p className="text-xs text-slate-500">
                  Üretim maliyetleri, genel giderler. Maliyet muhasebesi için kullanılır.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Hesap Numaralandırma</h4>
                <p className="text-xs text-slate-500">
                  3 haneli: Alt hesap | 2 haneli: Hesap grubu | 1 haneli: Ana grup
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Account Modal */}
      <Modal
        title="Yeni Hesap Ekle"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Kaydet"
        cancelText="İptal"
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800' }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="code" label="Hesap Kodu" rules={[{ required: true, message: 'Hesap kodu zorunludur' }]}>
            <Input placeholder="100" className="!border-slate-300 !rounded-lg" />
          </Form.Item>
          <Form.Item name="name" label="Hesap Adı" rules={[{ required: true, message: 'Hesap adı zorunludur' }]}>
            <Input placeholder="Kasa" className="!border-slate-300 !rounded-lg" />
          </Form.Item>
          <Form.Item name="type" label="Hesap Türü" rules={[{ required: true }]}>
            <Select
              options={accountTypes}
              placeholder="Tür seçin"
              className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
            />
          </Form.Item>
          <Form.Item name="nature" label="Hesap Karakteri" rules={[{ required: true }]}>
            <Select
              options={accountNatures}
              placeholder="Karakter seçin"
              className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
            />
          </Form.Item>
          <Form.Item name="parentCode" label="Üst Hesap Kodu">
            <Input placeholder="10 (opsiyonel)" className="!border-slate-300 !rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
