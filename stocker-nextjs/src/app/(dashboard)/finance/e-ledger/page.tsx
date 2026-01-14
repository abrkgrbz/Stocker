'use client';

/**
 * E-Defter (E-Ledger) Management Page
 * GİB E-Defter yönetimi - XBRL GL standardı
 * Yevmiye Defteri ve Büyük Defter (Kebir) oluşturma ve gönderimi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Table, Select, Spin, Empty, Tag, Progress, Modal, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BookOpenIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
type LedgerType = 'yevmiye' | 'kebir';
type LedgerStatus = 'draft' | 'generating' | 'ready' | 'uploading' | 'uploaded' | 'accepted' | 'rejected' | 'error';
type LedgerPeriod = 'monthly' | 'quarterly';

interface ELedger {
  id: number;
  period: string;
  periodType: LedgerPeriod;
  year: number;
  month: number;
  ledgerType: LedgerType;
  entryCount: number;
  totalDebit: number;
  totalCredit: number;
  fileSize: string;
  fileName: string;
  status: LedgerStatus;
  createdAt: string;
  uploadedAt: string | null;
  gibResponseCode: string | null;
  gibResponseMessage: string | null;
  deadline: string;
  isOverdue: boolean;
}

// Status configurations
const statusConfig: Record<LedgerStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Taslak', color: 'default', icon: DocumentTextIcon },
  generating: { label: 'Oluşturuluyor', color: 'processing', icon: ArrowPathIcon },
  ready: { label: 'Hazır', color: 'blue', icon: CheckCircleIcon },
  uploading: { label: 'Yükleniyor', color: 'processing', icon: DocumentArrowUpIcon },
  uploaded: { label: 'Yüklendi', color: 'cyan', icon: DocumentArrowUpIcon },
  accepted: { label: 'Kabul Edildi', color: 'success', icon: CheckCircleIcon },
  rejected: { label: 'Reddedildi', color: 'error', icon: XCircleIcon },
  error: { label: 'Hata', color: 'error', icon: ExclamationTriangleIcon },
};

// Month names in Turkish
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Mock data
const mockLedgers: ELedger[] = [
  {
    id: 1,
    period: 'Aralık 2024',
    periodType: 'monthly',
    year: 2024,
    month: 12,
    ledgerType: 'yevmiye',
    entryCount: 1245,
    totalDebit: 15680000,
    totalCredit: 15680000,
    fileSize: '2.4 MB',
    fileName: 'YEVMIYE_2024_12.xml',
    status: 'accepted',
    createdAt: '2025-01-10',
    uploadedAt: '2025-01-12',
    gibResponseCode: '1000',
    gibResponseMessage: 'Defter başarıyla kabul edildi',
    deadline: '2025-01-31',
    isOverdue: false,
  },
  {
    id: 2,
    period: 'Aralık 2024',
    periodType: 'monthly',
    year: 2024,
    month: 12,
    ledgerType: 'kebir',
    entryCount: 1245,
    totalDebit: 15680000,
    totalCredit: 15680000,
    fileSize: '1.8 MB',
    fileName: 'KEBIR_2024_12.xml',
    status: 'accepted',
    createdAt: '2025-01-10',
    uploadedAt: '2025-01-12',
    gibResponseCode: '1000',
    gibResponseMessage: 'Defter başarıyla kabul edildi',
    deadline: '2025-01-31',
    isOverdue: false,
  },
  {
    id: 3,
    period: 'Kasım 2024',
    periodType: 'monthly',
    year: 2024,
    month: 11,
    ledgerType: 'yevmiye',
    entryCount: 1180,
    totalDebit: 14250000,
    totalCredit: 14250000,
    fileSize: '2.2 MB',
    fileName: 'YEVMIYE_2024_11.xml',
    status: 'accepted',
    createdAt: '2024-12-08',
    uploadedAt: '2024-12-10',
    gibResponseCode: '1000',
    gibResponseMessage: 'Defter başarıyla kabul edildi',
    deadline: '2024-12-31',
    isOverdue: false,
  },
  {
    id: 4,
    period: 'Kasım 2024',
    periodType: 'monthly',
    year: 2024,
    month: 11,
    ledgerType: 'kebir',
    entryCount: 1180,
    totalDebit: 14250000,
    totalCredit: 14250000,
    fileSize: '1.6 MB',
    fileName: 'KEBIR_2024_11.xml',
    status: 'accepted',
    createdAt: '2024-12-08',
    uploadedAt: '2024-12-10',
    gibResponseCode: '1000',
    gibResponseMessage: 'Defter başarıyla kabul edildi',
    deadline: '2024-12-31',
    isOverdue: false,
  },
  {
    id: 5,
    period: 'Ocak 2025',
    periodType: 'monthly',
    year: 2025,
    month: 1,
    ledgerType: 'yevmiye',
    entryCount: 456,
    totalDebit: 5420000,
    totalCredit: 5420000,
    fileSize: '-',
    fileName: '',
    status: 'draft',
    createdAt: '',
    uploadedAt: null,
    gibResponseCode: null,
    gibResponseMessage: null,
    deadline: '2025-02-28',
    isOverdue: false,
  },
  {
    id: 6,
    period: 'Ocak 2025',
    periodType: 'monthly',
    year: 2025,
    month: 1,
    ledgerType: 'kebir',
    entryCount: 456,
    totalDebit: 5420000,
    totalCredit: 5420000,
    fileSize: '-',
    fileName: '',
    status: 'draft',
    createdAt: '',
    uploadedAt: null,
    gibResponseCode: null,
    gibResponseMessage: null,
    deadline: '2025-02-28',
    isOverdue: false,
  },
];

export default function ELedgerPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<ELedger | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`,
  }));

  // Filter by year and tab
  const filteredLedgers = mockLedgers.filter(l => {
    const yearMatch = l.year === selectedYear;
    if (activeTab === 'all') return yearMatch;
    return yearMatch && l.ledgerType === activeTab;
  });

  // Calculate stats
  const stats = mockLedgers.filter(l => l.year === selectedYear).reduce(
    (acc, l) => {
      if (l.ledgerType === 'yevmiye') {
        acc.yevmiyeCount += 1;
        if (l.status === 'accepted') acc.yevmiyeAccepted += 1;
      } else {
        acc.kebirCount += 1;
        if (l.status === 'accepted') acc.kebirAccepted += 1;
      }
      if (l.status === 'draft') acc.pending += 1;
      if (l.isOverdue) acc.overdue += 1;
      return acc;
    },
    { yevmiyeCount: 0, yevmiyeAccepted: 0, kebirCount: 0, kebirAccepted: 0, pending: 0, overdue: 0 }
  );

  const columns: ColumnsType<ELedger> = [
    {
      title: 'Dönem',
      key: 'period',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.period}</div>
          <div className="text-xs text-slate-500">
            {record.periodType === 'monthly' ? 'Aylık' : '3 Aylık'}
          </div>
        </div>
      ),
    },
    {
      title: 'Defter Türü',
      key: 'ledgerType',
      width: 140,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.ledgerType === 'yevmiye' ? (
            <>
              <BookOpenIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">Yevmiye</span>
            </>
          ) : (
            <>
              <DocumentDuplicateIcon className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-700">Büyük Defter</span>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Kayıt Sayısı',
      dataIndex: 'entryCount',
      key: 'entryCount',
      width: 110,
      align: 'center',
      render: (count) => (
        <span className="text-sm font-medium text-slate-900">{count.toLocaleString('tr-TR')}</span>
      ),
    },
    {
      title: 'Borç / Alacak',
      key: 'balance',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="text-xs text-slate-500">
            B: {formatCurrency(record.totalDebit)}
          </div>
          <div className="text-xs text-slate-500">
            A: {formatCurrency(record.totalCredit)}
          </div>
          {record.totalDebit === record.totalCredit ? (
            <div className="text-xs text-emerald-600 font-medium">✓ Dengeli</div>
          ) : (
            <div className="text-xs text-red-600 font-medium">✗ Dengesiz</div>
          )}
        </div>
      ),
    },
    {
      title: 'Dosya',
      key: 'file',
      width: 140,
      render: (_, record) => (
        record.fileName ? (
          <div>
            <div className="text-xs text-slate-600">{record.fileName}</div>
            <div className="text-xs text-slate-400">{record.fileSize}</div>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Oluşturulmadı</span>
        )
      ),
    },
    {
      title: 'Son Tarih',
      key: 'deadline',
      width: 120,
      render: (_, record) => {
        const isClose = dayjs(record.deadline).diff(dayjs(), 'day') <= 7;
        return (
          <div>
            <div className={`text-sm ${record.isOverdue ? 'text-red-600 font-medium' : isClose ? 'text-amber-600' : 'text-slate-600'}`}>
              {dayjs(record.deadline).format('DD.MM.YYYY')}
            </div>
            {record.isOverdue && (
              <div className="text-xs text-red-500">Gecikmiş!</div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSelectedLedger(record);
              setIsDetailModalOpen(true);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Detay"
          >
            <DocumentTextIcon className="w-4 h-4 text-slate-500" />
          </button>
          {record.status === 'draft' && (
            <button
              className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
              title="Oluştur"
            >
              <ArrowPathIcon className="w-4 h-4 text-blue-500" />
            </button>
          )}
          {record.status === 'ready' && (
            <button
              className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
              title="GİB'e Gönder"
            >
              <DocumentArrowUpIcon className="w-4 h-4 text-emerald-500" />
            </button>
          )}
          {(record.status === 'accepted' || record.status === 'ready') && record.fileName && (
            <button
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              title="İndir"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

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
              <h1 className="text-2xl font-bold text-slate-900">E-Defter Yönetimi</h1>
              <p className="text-sm text-slate-500">GİB E-Defter oluşturma ve gönderimi - XBRL GL</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear}
                onChange={(value) => setSelectedYear(value)}
                options={yearOptions}
                size="large"
                className="w-28 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Period Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-purple-900">
              {selectedYear} Yılı E-Defter Durumu
            </h3>
            <p className="text-xs text-purple-700">
              Yevmiye ve Büyük Defter dosyaları aylık olarak GİB&apos;e gönderilmelidir.
              Son gönderim tarihi takip eden ayın son günüdür.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpenIcon className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-slate-500">Yevmiye Defteri</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.yevmiyeAccepted}/{stats.yevmiyeCount}</div>
          <Progress
            percent={(stats.yevmiyeAccepted / Math.max(stats.yevmiyeCount, 1)) * 100}
            size="small"
            showInfo={false}
            strokeColor="#3b82f6"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DocumentDuplicateIcon className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-slate-500">Büyük Defter</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.kebirAccepted}/{stats.kebirCount}</div>
          <Progress
            percent={(stats.kebirAccepted / Math.max(stats.kebirCount, 1)) * 100}
            size="small"
            showInfo={false}
            strokeColor="#a855f7"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-slate-500">Bekleyen</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-slate-500 mt-1">oluşturulacak</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <span className="text-xs text-slate-500">Gecikmiş</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-xs text-slate-500 mt-1">acil gönderilmeli</div>
        </div>
      </div>

      {/* Tabs & Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: 'Tümü' },
            { key: 'yevmiye', label: 'Yevmiye Defteri' },
            { key: 'kebir', label: 'Büyük Defter (Kebir)' },
          ]}
          className="mb-4"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredLedgers.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-slate-500">E-Defter kaydı bulunmuyor</span>}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredLedgers}
            rowKey="id"
            pagination={{
              pageSize: 12,
              showTotal: (total) => `Toplam ${total} kayıt`,
            }}
            className={tableClassName}
          />
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-slate-100 border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">E-Defter Hakkında</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Yevmiye Defteri</h4>
            <p>
              İşletmenin tüm mali işlemlerinin tarih sırasına göre kaydedildiği defterdir.
              Her işlem için borç-alacak dengesi sağlanmalıdır. VUK madde 183-186 hükümlerine tabidir.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Büyük Defter (Kebir)</h4>
            <p>
              Yevmiye defterindeki kayıtların hesap bazında gruplandığı defterdir.
              Her hesabın borç ve alacak hareketleri ayrı ayrı izlenir. XBRL GL formatında oluşturulur.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Yasal Süre</h4>
            <p>
              E-Defter, ilgili olduğu ayı takip eden üçüncü ayın son gününe kadar oluşturulup
              GİB&apos;e gönderilmelidir. Geç gönderim için özel usulsüzlük cezası uygulanır.
            </p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        title={`E-Defter Detayı - ${selectedLedger?.period}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedLedger && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Defter Türü</div>
                <div className="text-sm font-medium text-slate-900">
                  {selectedLedger.ledgerType === 'yevmiye' ? 'Yevmiye Defteri' : 'Büyük Defter'}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Dönem</div>
                <div className="text-sm font-medium text-slate-900">{selectedLedger.period}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Kayıt Sayısı</div>
                <div className="text-sm font-medium text-slate-900">{selectedLedger.entryCount.toLocaleString('tr-TR')}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Toplam Borç</div>
                <div className="text-sm font-medium text-slate-900">{formatCurrency(selectedLedger.totalDebit)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Toplam Alacak</div>
                <div className="text-sm font-medium text-slate-900">{formatCurrency(selectedLedger.totalCredit)}</div>
              </div>
            </div>

            {selectedLedger.gibResponseMessage && (
              <div className={`rounded-lg p-3 ${selectedLedger.status === 'accepted' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="text-xs text-slate-500 mb-1">GİB Yanıtı</div>
                <div className={`text-sm ${selectedLedger.status === 'accepted' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {selectedLedger.gibResponseMessage}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Son gönderim: {dayjs(selectedLedger.deadline).format('DD MMMM YYYY')}
              </div>
              <Tag color={statusConfig[selectedLedger.status].color}>
                {statusConfig[selectedLedger.status].label}
              </Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
