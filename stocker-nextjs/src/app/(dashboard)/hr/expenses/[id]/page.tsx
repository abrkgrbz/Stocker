'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Modal,
  message,
} from 'antd';
import {
  CalendarIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  WalletIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useExpense,
  useDeleteExpense,
  useApproveExpense,
  useRejectExpense,
} from '@/lib/api/hooks/useHR';
import { ExpenseStatus, ExpenseType } from '@/lib/api/services/hr.types';
import { DetailPageLayout } from '@/components/patterns';
import dayjs from 'dayjs';

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: expense, isLoading, isError } = useExpense(id);
  const deleteExpense = useDeleteExpense();
  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();

  const handleDelete = () => {
    if (!expense) return;
    Modal.confirm({
      title: 'Harcama Kaydini Sil',
      content: 'Bu harcama kaydini silmek istediginizden emin misiniz? Bu islem geri alinamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await deleteExpense.mutateAsync(id);
          router.push('/hr/expenses');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async () => {
    try {
      await approveExpense.mutateAsync({ id });
      message.success('Harcama onaylandi');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Harcamayi Reddet',
      content: 'Bu harcamayi reddetmek istediginizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await rejectExpense.mutateAsync({ id, data: { reason: 'Reddedildi' } });
          message.success('Harcama reddedildi');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const getStatusConfig = (status?: ExpenseStatus) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      [ExpenseStatus.Draft]: { color: 'default', text: 'Taslak' },
      [ExpenseStatus.Pending]: { color: 'orange', text: 'Beklemede' },
      [ExpenseStatus.Approved]: { color: 'green', text: 'Onaylandi' },
      [ExpenseStatus.Rejected]: { color: 'red', text: 'Reddedildi' },
      [ExpenseStatus.Paid]: { color: 'blue', text: 'Odendi' },
      [ExpenseStatus.Cancelled]: { color: 'default', text: 'Iptal Edildi' },
    };
    const defaultConfig = { color: 'default', text: '-' };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
  };

  const getExpenseTypeLabel = (expenseType?: ExpenseType) => {
    const typeMap: Record<ExpenseType, string> = {
      [ExpenseType.Transportation]: 'Ulasim',
      [ExpenseType.Meal]: 'Yemek',
      [ExpenseType.Accommodation]: 'Konaklama',
      [ExpenseType.Communication]: 'Iletisim',
      [ExpenseType.OfficeSupplies]: 'Ofis Malzemeleri',
      [ExpenseType.Training]: 'Egitim',
      [ExpenseType.Medical]: 'Saglik',
      [ExpenseType.Entertainment]: 'Eglence',
      [ExpenseType.Other]: 'Diger',
    };
    return expenseType !== undefined ? typeMap[expenseType] : '-';
  };

  const statusConfig = expense ? getStatusConfig(expense.status) : { color: 'default', text: '-' };

  return (
    <DetailPageLayout
      title="Harcama Detayi"
      subtitle={expense ? `${expense.employeeName || `Calisan #${expense.employeeId}`}` : undefined}
      backPath="/hr/expenses"
      icon={<WalletIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-emerald-600"
      statusBadge={expense ? <Tag color={statusConfig.color}>{statusConfig.text}</Tag> : undefined}
      isLoading={isLoading}
      isError={isError || !expense}
      errorMessage="Harcama Kaydi Bulunamadi"
      errorDescription="Istenen harcama kaydi bulunamadi veya bir hata olustu."
      actions={
        expense && (
          <>
            {expense.status === ExpenseStatus.Pending && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleIcon className="w-4 h-4" />}
                  onClick={handleApprove}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Onayla
                </Button>
                <Button danger icon={<XCircleIcon className="w-4 h-4" />} onClick={handleReject}>
                  Reddet
                </Button>
              </>
            )}
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/expenses/${id}/edit`)}
              disabled={expense.status !== ExpenseStatus.Pending}
            >
              Duzenle
            </Button>
            <Button danger icon={<TrashIcon className="w-4 h-4" />} onClick={handleDelete}>
              Sil
            </Button>
          </>
        )
      }
    >
      {expense && (
        <Row gutter={[24, 24]}>
          {/* Stats */}
          <Col xs={24}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Tutar"
                    value={expense.amount || 0}
                    formatter={(val) => formatCurrency(Number(val))}
                    valueStyle={{ color: '#7c3aed', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Kategori"
                    value={getExpenseTypeLabel(expense.expenseType)}
                    valueStyle={{ color: '#1890ff', fontSize: 18 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Tarih"
                    value={dayjs(expense.expenseDate).format('DD.MM.YYYY')}
                    prefix={<CalendarIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#52c41a', fontSize: 16 }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Details */}
          <Col xs={24} lg={16}>
            <Card title="Harcama Bilgileri">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Calisan">
                  <span className="inline-flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {expense.employeeName || `Calisan #${expense.employeeId}`}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Aciklama">
                  {expense.description}
                </Descriptions.Item>
                <Descriptions.Item label="Kategori">
                  {getExpenseTypeLabel(expense.expenseType)}
                </Descriptions.Item>
                <Descriptions.Item label="Harcama Tarihi">
                  {dayjs(expense.expenseDate).format('DD MMMM YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Tutar">
                  <strong style={{ color: '#7c3aed' }}>{formatCurrency(expense.amount)}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                </Descriptions.Item>
                {expense.approvedById && (
                  <Descriptions.Item label="Onaylayan">
                    {expense.approvedByName || `Kullanici #${expense.approvedById}`}
                  </Descriptions.Item>
                )}
                {expense.approvedDate && (
                  <Descriptions.Item label="Onay Tarihi">
                    {dayjs(expense.approvedDate).format('DD.MM.YYYY HH:mm')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          {/* Notes */}
          {expense.notes && (
            <Col xs={24} lg={16}>
              <Card title="Notlar">
                <p>{expense.notes}</p>
              </Card>
            </Col>
          )}

          {/* Rejection Reason */}
          {expense.rejectionReason && (
            <Col xs={24} lg={16}>
              <Card title="Ret Nedeni">
                <p className="text-red-600">{expense.rejectionReason}</p>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </DetailPageLayout>
  );
}
