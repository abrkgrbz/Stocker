'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Spin,
  Row,
  Col,
  Statistic,
  Empty,
  Modal,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  WalletOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import {
  useExpense,
  useDeleteExpense,
  useApproveExpense,
  useRejectExpense,
} from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: expense, isLoading, error } = useExpense(id);
  const deleteExpense = useDeleteExpense();
  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();

  const handleDelete = () => {
    if (!expense) return;
    Modal.confirm({
      title: 'Harcama Kaydını Sil',
      content: 'Bu harcama kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
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
      await approveExpense.mutateAsync(id);
      message.success('Harcama onaylandı');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Harcamayı Reddet',
      content: 'Bu harcamayı reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await rejectExpense.mutateAsync({ id });
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

  const getStatusConfig = (status?: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      Pending: { color: 'orange', text: 'Beklemede' },
      Approved: { color: 'green', text: 'Onaylandı' },
      Rejected: { color: 'red', text: 'Reddedildi' },
      Paid: { color: 'blue', text: 'Ödendi' },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-' };
  };

  const getCategoryLabel = (category?: string) => {
    const categoryMap: Record<string, string> = {
      Travel: 'Seyahat',
      Meals: 'Yemek',
      Supplies: 'Malzeme',
      Equipment: 'Ekipman',
      Training: 'Eğitim',
      Communication: 'İletişim',
      Transportation: 'Ulaşım',
      Accommodation: 'Konaklama',
      Other: 'Diğer',
    };
    return categoryMap[category || ''] || category || '-';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="p-6">
        <Empty description="Harcama kaydı bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/expenses')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(expense.status);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/expenses')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Harcama Detayı
            </Title>
            <Space>
              <Text type="secondary">
                {expense.employeeName || `Çalışan #${expense.employeeId}`}
              </Text>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
            </Space>
          </div>
        </Space>
        <Space>
          {expense.status === 'Pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Onayla
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={handleReject}>
                Reddet
              </Button>
            </>
          )}
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/hr/expenses/${id}/edit`)}
            disabled={expense.status !== 'Pending'}
          >
            Düzenle
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Sil
          </Button>
        </Space>
      </div>

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
                  value={getCategoryLabel(expense.category)}
                  valueStyle={{ color: '#1890ff', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Tarih"
                  value={dayjs(expense.expenseDate).format('DD.MM.YYYY')}
                  prefix={<CalendarOutlined />}
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
              <Descriptions.Item label="Çalışan">
                <Space>
                  <UserOutlined />
                  {expense.employeeName || `Çalışan #${expense.employeeId}`}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Açıklama">
                {expense.description}
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">
                {getCategoryLabel(expense.category)}
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
                  {expense.approvedByName || `Kullanıcı #${expense.approvedById}`}
                </Descriptions.Item>
              )}
              {expense.approvedAt && (
                <Descriptions.Item label="Onay Tarihi">
                  {dayjs(expense.approvedAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Notes */}
        {expense.notes && (
          <Col xs={24} lg={16}>
            <Card title="Notlar">
              <Paragraph>{expense.notes}</Paragraph>
            </Card>
          </Col>
        )}

        {/* Rejection Reason */}
        {expense.rejectionReason && (
          <Col xs={24} lg={16}>
            <Card title="Ret Nedeni">
              <Paragraph type="danger">{expense.rejectionReason}</Paragraph>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
