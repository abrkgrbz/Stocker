import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageHeader,
  ProCard,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Descriptions,
  Table,
  Statistic,
  Typography,
  Timeline,
  Divider,
  Modal,
  message,
  Spin,
  Result,
  Avatar,
  Dropdown,
  Badge,
  Tooltip,
  Alert,
} from 'antd';
import {
  PrinterOutlined,
  DownloadOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CopyOutlined,
  ShareAltOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import invoiceService, { Invoice, InvoiceItem } from '@/services/invoiceService';
import './style.css';

const { Title, Text, Paragraph } = Typography;

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetail();
    }
  }, [id]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true);
      // Gerçek API çağrısı yapılacak
      // const response = await invoiceService.getInvoiceById(id!);
      // setInvoice(response.data);
      
      // Mock data
      const mockInvoice: Invoice = {
        id: id!,
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customerName: 'ABC Teknoloji A.Ş.',
        customerEmail: 'muhasebe@abcteknoloji.com',
        customerPhone: '+90 212 555 0100',
        customerAddress: 'Maslak Mah. Teknoloji Cad. No:15\nSarıyer/İstanbul',
        customerTaxNumber: '1234567890',
        customerTaxOffice: 'Sarıyer',
        invoiceDate: '2024-01-15T00:00:00',
        dueDate: '2024-02-15T00:00:00',
        subTotal: 10000,
        taxAmount: 1800,
        discountAmount: 500,
        totalAmount: 11300,
        currency: 'TRY',
        status: 'Paid',
        paidDate: '2024-02-10T00:00:00',
        paymentMethod: 'BankTransfer',
        notes: 'Ödeme IBAN: TR12 0001 2345 6789 0123 4567 89',
        items: [
          {
            id: '1',
            productId: '1',
            productName: 'Yazılım Lisansı - Pro',
            description: 'Yıllık yazılım lisansı',
            quantity: 2,
            unitPrice: 3000,
            taxRate: 18,
            discountRate: 5,
            totalPrice: 5700,
          },
          {
            id: '2',
            productId: '2',
            productName: 'Destek Paketi',
            description: '7/24 teknik destek hizmeti',
            quantity: 1,
            unitPrice: 4000,
            taxRate: 18,
            discountRate: 0,
            totalPrice: 4720,
          },
        ],
        createdAt: '2024-01-15T10:30:00',
        createdBy: 'Ahmet Yılmaz',
        updatedAt: '2024-02-10T14:20:00',
        updatedBy: 'Mehmet Demir',
      };
      
      setInvoice(mockInvoice);
    } catch (error) {
      message.error('Fatura detayları yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      message.loading('PDF oluşturuluyor...');
      // await invoiceService.downloadInvoicePDF(id!);
      setTimeout(() => {
        message.success('PDF başarıyla indirildi');
      }, 1500);
    } catch (error) {
      message.error('PDF indirilemedi');
    }
  };

  const handleSendEmail = async () => {
    setSendModalVisible(true);
  };

  const handleEdit = () => {
    navigate(`/app/${id}/invoices/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      // await invoiceService.deleteInvoice(id!);
      message.success('Fatura başarıyla silindi');
      navigate(-1);
    } catch (error) {
      message.error('Fatura silinemedi');
    }
  };

  const handleDuplicate = () => {
    message.info('Fatura kopyalandı');
    navigate('/app/tenant/invoices/new');
  };

  const handleMarkAsPaid = async () => {
    try {
      message.success('Fatura ödendi olarak işaretlendi');
      fetchInvoiceDetail();
    } catch (error) {
      message.error('İşlem başarısız');
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      Draft: 'default',
      Sent: 'processing',
      Paid: 'success',
      Overdue: 'error',
      Cancelled: 'warning',
      PartiallyPaid: 'warning',
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const statusIcons: Record<string, React.ReactNode> = {
      Draft: <EditOutlined />,
      Sent: <ClockCircleOutlined />,
      Paid: <CheckCircleOutlined />,
      Overdue: <ExclamationCircleOutlined />,
      Cancelled: <CloseCircleOutlined />,
    };
    return statusIcons[status] || null;
  };

  const moreActions = [
    {
      key: 'duplicate',
      label: 'Kopyala',
      icon: <CopyOutlined />,
      onClick: handleDuplicate,
    },
    {
      key: 'share',
      label: 'Paylaş',
      icon: <ShareAltOutlined />,
    },
    {
      key: 'export-excel',
      label: 'Excel Olarak İndir',
      icon: <FileExcelOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => setDeleteModalVisible(true),
    },
  ];

  const itemColumns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Ürün/Hizmet',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: InvoiceItem) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right' as const,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'İndirim %',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 100,
      align: 'center' as const,
      render: (value: number) => (value > 0 ? `%${value}` : '-'),
    },
    {
      title: 'KDV %',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 100,
      align: 'center' as const,
      render: (value: number) => `%${value}`,
    },
    {
      title: 'Toplam',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 150,
      align: 'right' as const,
      render: (value: number) => <Text strong>{formatCurrency(value)}</Text>,
    },
  ];

  if (loading) {
    return (
      <div className="invoice-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <Result
        status="404"
        title="Fatura Bulunamadı"
        subTitle="Aradığınız fatura bulunamadı veya silinmiş olabilir."
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            Geri Dön
          </Button>
        }
      />
    );
  }

  return (
    <div className="invoice-detail-page">
      <PageHeader
        ghost={false}
        onBack={() => navigate(-1)}
        title={`Fatura #${invoice.invoiceNumber}`}
        tags={
          <Tag
            color={getStatusColor(invoice.status)}
            icon={getStatusIcon(invoice.status)}
          >
            {invoice.status === 'Paid' ? 'Ödendi' :
             invoice.status === 'Overdue' ? 'Gecikmiş' :
             invoice.status === 'Sent' ? 'Gönderildi' :
             invoice.status === 'Draft' ? 'Taslak' :
             invoice.status === 'Cancelled' ? 'İptal' : invoice.status}
          </Tag>
        }
        extra={[
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
            Yazdır
          </Button>,
          <Button
            key="download"
            icon={<FilePdfOutlined />}
            onClick={handleDownloadPDF}
          >
            PDF İndir
          </Button>,
          <Button
            key="send"
            type="primary"
            icon={<MailOutlined />}
            onClick={handleSendEmail}
          >
            Email Gönder
          </Button>,
          <Button key="edit" icon={<EditOutlined />} onClick={handleEdit}>
            Düzenle
          </Button>,
          <Dropdown
            key="more"
            menu={{ items: moreActions }}
            placement="bottomRight"
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>,
        ]}
      />

      <div className="invoice-detail-content">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="invoice-main-card">
              {/* Header */}
              <div className="invoice-header">
                <div className="invoice-logo">
                  <Title level={3}>STOCKER</Title>
                  <Text type="secondary">Profesyonel Fatura</Text>
                </div>
                <div className="invoice-header-info">
                  <Title level={2} style={{ margin: 0 }}>
                    FATURA
                  </Title>
                  <Text strong style={{ fontSize: 16 }}>
                    #{invoice.invoiceNumber}
                  </Text>
                </div>
              </div>

              <Divider />

              {/* Company and Customer Info */}
              <Row gutter={48}>
                <Col span={12}>
                  <div className="info-section">
                    <Text type="secondary">Faturayı Kesen:</Text>
                    <Title level={5}>Stocker Yazılım A.Ş.</Title>
                    <Paragraph>
                      Teknoloji Mah. İnovasyon Cad. No:42<br />
                      Şişli/İstanbul<br />
                      Tel: +90 212 555 0200<br />
                      Email: fatura@stocker.com
                    </Paragraph>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-section">
                    <Text type="secondary">Fatura Edilen:</Text>
                    <Title level={5}>{invoice.customerName}</Title>
                    <Paragraph>
                      {invoice.customerAddress}<br />
                      Tel: {invoice.customerPhone}<br />
                      Email: {invoice.customerEmail}<br />
                      {invoice.customerTaxNumber && (
                        <>
                          VKN: {invoice.customerTaxNumber}<br />
                          V.D.: {invoice.customerTaxOffice}
                        </>
                      )}
                    </Paragraph>
                  </div>
                </Col>
              </Row>

              <Divider />

              {/* Invoice Details */}
              <Row gutter={48} style={{ marginBottom: 24 }}>
                <Col span={8}>
                  <div className="detail-item">
                    <Text type="secondary">Fatura Tarihi:</Text>
                    <div>
                      <Text strong>{formatDate(invoice.invoiceDate)}</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="detail-item">
                    <Text type="secondary">Vade Tarihi:</Text>
                    <div>
                      <Text strong>{formatDate(invoice.dueDate)}</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="detail-item">
                    <Text type="secondary">Ödeme Yöntemi:</Text>
                    <div>
                      <Text strong>
                        {invoice.paymentMethod === 'BankTransfer' ? 'Banka Havalesi' :
                         invoice.paymentMethod === 'CreditCard' ? 'Kredi Kartı' :
                         invoice.paymentMethod === 'Cash' ? 'Nakit' : 
                         invoice.paymentMethod}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Items Table */}
              <Table
                dataSource={invoice.items}
                columns={itemColumns}
                pagination={false}
                rowKey="id"
                className="invoice-items-table"
              />

              {/* Summary */}
              <Row justify="end" style={{ marginTop: 24 }}>
                <Col span={10}>
                  <div className="invoice-summary">
                    <div className="summary-item">
                      <Text>Ara Toplam:</Text>
                      <Text>{formatCurrency(invoice.subTotal)}</Text>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="summary-item">
                        <Text>İndirim:</Text>
                        <Text type="danger">-{formatCurrency(invoice.discountAmount)}</Text>
                      </div>
                    )}
                    <div className="summary-item">
                      <Text>KDV (%18):</Text>
                      <Text>{formatCurrency(invoice.taxAmount)}</Text>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div className="summary-item total">
                      <Title level={4}>Genel Toplam:</Title>
                      <Title level={4} style={{ color: '#1890ff' }}>
                        {formatCurrency(invoice.totalAmount)}
                      </Title>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Notes */}
              {invoice.notes && (
                <>
                  <Divider />
                  <div className="invoice-notes">
                    <Title level={5}>Notlar:</Title>
                    <Paragraph>{invoice.notes}</Paragraph>
                  </div>
                </>
              )}

              {/* Footer */}
              <Divider />
              <div className="invoice-footer">
                <Text type="secondary">
                  Bu fatura {formatDate(invoice.createdAt, 'DD.MM.YYYY HH:mm')} tarihinde 
                  oluşturulmuştur.
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Status Card */}
            <Card className="status-card" style={{ marginBottom: 16 }}>
              <Title level={5}>Fatura Durumu</Title>
              <div className="status-content">
                <Badge
                  status={invoice.status === 'Paid' ? 'success' : 'processing'}
                  text={
                    <Text strong style={{ fontSize: 16 }}>
                      {invoice.status === 'Paid' ? 'Ödendi' :
                       invoice.status === 'Overdue' ? 'Gecikmiş' :
                       invoice.status === 'Sent' ? 'Gönderildi' :
                       invoice.status}
                    </Text>
                  }
                />
                {invoice.paidDate && (
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary">Ödeme Tarihi:</Text>
                    <div>
                      <Text>{formatDate(invoice.paidDate)}</Text>
                    </div>
                  </div>
                )}
              </div>
              {invoice.status !== 'Paid' && (
                <Button
                  type="primary"
                  block
                  style={{ marginTop: 16 }}
                  onClick={handleMarkAsPaid}
                >
                  Ödendi Olarak İşaretle
                </Button>
              )}
            </Card>

            {/* Payment Info Card */}
            <Card className="payment-info-card" style={{ marginBottom: 16 }}>
              <Title level={5}>Ödeme Bilgileri</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Toplam Tutar">
                  <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                    {formatCurrency(invoice.totalAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ödeme Yöntemi">
                  {invoice.paymentMethod === 'BankTransfer' ? 'Banka Havalesi' :
                   invoice.paymentMethod === 'CreditCard' ? 'Kredi Kartı' :
                   invoice.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Vade Tarihi">
                  {formatDate(invoice.dueDate)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Activity Timeline */}
            <Card className="activity-card">
              <Title level={5}>İşlem Geçmişi</Title>
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <>
                        <Text strong>Ödeme alındı</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDate(invoice.paidDate, 'DD.MM.YYYY HH:mm')}
                          </Text>
                        </div>
                      </>
                    ),
                  },
                  {
                    color: 'blue',
                    children: (
                      <>
                        <Text strong>Fatura gönderildi</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDate(invoice.invoiceDate, 'DD.MM.YYYY HH:mm')}
                          </Text>
                        </div>
                      </>
                    ),
                  },
                  {
                    color: 'gray',
                    children: (
                      <>
                        <Text strong>Fatura oluşturuldu</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {invoice.createdBy} • {formatDate(invoice.createdAt, 'DD.MM.YYYY HH:mm')}
                          </Text>
                        </div>
                      </>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Send Email Modal */}
      <Modal
        title="Fatura Gönder"
        open={sendModalVisible}
        onOk={() => {
          message.success('Fatura email ile gönderildi');
          setSendModalVisible(false);
        }}
        onCancel={() => setSendModalVisible(false)}
        okText="Gönder"
        cancelText="İptal"
      >
        <Alert
          message="Fatura müşteriye email olarak gönderilecek"
          description={`${invoice.customerEmail} adresine fatura gönderilecektir.`}
          type="info"
          showIcon
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Faturayı Sil"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true }}
      >
        <Alert
          message="Bu işlem geri alınamaz!"
          description="Faturayı silmek istediğinizden emin misiniz?"
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default InvoiceDetail;