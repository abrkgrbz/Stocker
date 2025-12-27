'use client';

import React, { useState } from 'react';
import {
  Card,
  Steps,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Input,
  Avatar,
  Timeline,
  Tooltip,
  Badge,
  Alert,
  Descriptions,
  Divider,
} from 'antd';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ClockIcon as HistoryIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

// Types
export interface ApprovalStep {
  id: string;
  order: number;
  name: string;
  approverName?: string;
  approverId?: string;
  approverRole?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'waiting';
  approvalDate?: string;
  notes?: string;
  requiredApprovals?: number;
  currentApprovals?: number;
}

export interface ApprovalHistory {
  id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'returned' | 'escalated' | 'comment';
  actorName: string;
  actorId: string;
  timestamp: string;
  notes?: string;
  stepName?: string;
}

export interface ApprovalWorkflowProps {
  // Document info
  documentType: 'order' | 'invoice' | 'payment' | 'return' | 'request';
  documentNumber: string;
  documentStatus: string;
  totalAmount?: number;
  currency?: string;

  // Workflow data
  steps: ApprovalStep[];
  currentStep?: number;
  history?: ApprovalHistory[];

  // Permissions
  canApprove?: boolean;
  canReject?: boolean;
  canSubmit?: boolean;
  canCancel?: boolean;

  // Callbacks
  onApprove?: (notes?: string) => void;
  onReject?: (reason: string) => void;
  onSubmit?: () => void;
  onCancel?: (reason: string) => void;

  // UI options
  showHistory?: boolean;
  compact?: boolean;
}

const statusConfig = {
  pending: { color: 'default', icon: <ClockIcon className="w-4 h-4" />, label: 'Bekliyor' },
  approved: { color: 'success', icon: <CheckCircleIcon className="w-4 h-4" />, label: 'Onaylandı' },
  rejected: { color: 'error', icon: <XCircleIcon className="w-4 h-4" />, label: 'Reddedildi' },
  skipped: { color: 'default', icon: <ClockIcon className="w-4 h-4" />, label: 'Atlandı' },
  waiting: { color: 'processing', icon: <ClockIcon className="w-4 h-4" />, label: 'Sırada' },
};

const documentTypeLabels: Record<string, string> = {
  order: 'Satın Alma Siparişi',
  invoice: 'Satın Alma Faturası',
  payment: 'Tedarikçi Ödemesi',
  return: 'Satın Alma İadesi',
  request: 'Satın Alma Talebi',
};

export function ApprovalWorkflow({
  documentType,
  documentNumber,
  documentStatus,
  totalAmount,
  currency = 'TRY',
  steps = [],
  currentStep = 0,
  history = [],
  canApprove = false,
  canReject = false,
  canSubmit = false,
  canCancel = false,
  onApprove,
  onReject,
  onSubmit,
  onCancel,
  showHistory = true,
  compact = false,
}: ApprovalWorkflowProps) {
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const handleApprove = () => {
    if (onApprove) {
      onApprove(approvalNotes);
      setApproveModalVisible(false);
      setApprovalNotes('');
    }
  };

  const handleReject = () => {
    if (onReject && rejectReason.trim()) {
      onReject(rejectReason);
      setRejectModalVisible(false);
      setRejectReason('');
    }
  };

  const handleCancel = () => {
    if (onCancel && cancelReason.trim()) {
      onCancel(cancelReason);
      setCancelModalVisible(false);
      setCancelReason('');
    }
  };

  // Map step status to Steps component status
  const getStepStatus = (step: ApprovalStep, index: number): 'wait' | 'process' | 'finish' | 'error' => {
    if (step.status === 'approved') return 'finish';
    if (step.status === 'rejected') return 'error';
    if (index === currentStep) return 'process';
    return 'wait';
  };

  // Get icon for step
  const getStepIcon = (step: ApprovalStep) => {
    if (step.status === 'approved') {
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    }
    if (step.status === 'rejected') {
      return <XCircleIcon className="w-4 h-4 text-red-500" />;
    }
    return <ClockIcon className="w-4 h-4 text-gray-400" />;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Render history timeline
  const renderHistory = () => {
    if (!history || history.length === 0) {
      return <div className="text-gray-400 text-center py-4">Henüz işlem geçmişi yok</div>;
    }

    return (
      <Timeline
        items={history.map((item) => ({
          key: item.id,
          color: item.action === 'approved' ? 'green' : item.action === 'rejected' ? 'red' : 'blue',
          dot: item.action === 'approved' ? (
            <CheckCircleIcon className="w-4 h-4" />
          ) : item.action === 'rejected' ? (
            <XCircleIcon className="w-4 h-4" />
          ) : item.action === 'comment' ? (
            <ChatBubbleLeftIcon className="w-4 h-4" />
          ) : (
            <PaperAirplaneIcon className="w-4 h-4" />
          ),
          children: (
            <div>
              <div className="flex items-center gap-2">
                <Avatar size="small" icon={<UserIcon className="w-4 h-4" />} />
                <Text strong>{item.actorName}</Text>
                <Tag color={
                  item.action === 'approved' ? 'green' :
                  item.action === 'rejected' ? 'red' :
                  item.action === 'submitted' ? 'blue' :
                  item.action === 'returned' ? 'orange' :
                  item.action === 'escalated' ? 'purple' : 'default'
                }>
                  {item.action === 'approved' && 'Onayladı'}
                  {item.action === 'rejected' && 'Reddetti'}
                  {item.action === 'submitted' && 'Gönderdi'}
                  {item.action === 'returned' && 'İade Etti'}
                  {item.action === 'escalated' && 'Yükseltti'}
                  {item.action === 'comment' && 'Yorum'}
                </Tag>
              </div>
              {item.stepName && (
                <Text type="secondary" className="text-xs block mt-1">
                  Adım: {item.stepName}
                </Text>
              )}
              {item.notes && (
                <Paragraph className="mt-1 mb-0 text-gray-600 text-sm">
                  "{item.notes}"
                </Paragraph>
              )}
              <Text type="secondary" className="text-xs">
                {dayjs(item.timestamp).format('DD.MM.YYYY HH:mm')}
              </Text>
            </div>
          ),
        }))}
      />
    );
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <Text type="secondary">Onay Durumu:</Text>
          <Steps
            size="small"
            current={currentStep}
            items={steps.map((step, index) => ({
              title: step.name,
              status: getStepStatus(step, index),
            }))}
          />
        </div>
        <Space>
          {canApprove && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleIcon className="w-4 h-4" />}
              onClick={() => setApproveModalVisible(true)}
            >
              Onayla
            </Button>
          )}
          {canReject && (
            <Button
              danger
              size="small"
              icon={<XCircleIcon className="w-4 h-4" />}
              onClick={() => setRejectModalVisible(true)}
            >
              Reddet
            </Button>
          )}
        </Space>
      </div>
    );
  }

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-500" />
            <span>Onay Akışı</span>
          </div>
          {showHistory && history.length > 0 && (
            <Button
              type="text"
              size="small"
              icon={<HistoryIcon className="w-4 h-4" />}
              onClick={() => setHistoryModalVisible(true)}
            >
              Geçmiş ({history.length})
            </Button>
          )}
        </div>
      }
      size="small"
    >
      {/* Document Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <Descriptions size="small" column={3}>
          <Descriptions.Item label="Belge Türü">
            {documentTypeLabels[documentType]}
          </Descriptions.Item>
          <Descriptions.Item label="Belge No">
            <Text strong>{documentNumber}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={
              documentStatus === 'Approved' || documentStatus === 'Confirmed' ? 'green' :
              documentStatus === 'Rejected' ? 'red' :
              documentStatus === 'PendingApproval' || documentStatus === 'Pending' ? 'orange' :
              'default'
            }>
              {documentStatus}
            </Tag>
          </Descriptions.Item>
          {totalAmount !== undefined && (
            <Descriptions.Item label="Tutar">
              <Text strong className="text-blue-600">
                {formatCurrency(totalAmount)}
              </Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {/* Approval Steps */}
      <div className="mb-4">
        <Text type="secondary" className="block mb-3">Onay Adımları</Text>
        <Steps
          current={currentStep}
          size="small"
          direction={steps.length > 3 ? 'vertical' : 'horizontal'}
          items={steps.map((step, index) => ({
            title: (
              <div>
                <span>{step.name}</span>
                {step.requiredApprovals && step.requiredApprovals > 1 && (
                  <Badge
                    count={`${step.currentApprovals || 0}/${step.requiredApprovals}`}
                    style={{
                      backgroundColor: step.currentApprovals === step.requiredApprovals ? '#52c41a' : '#faad14',
                      marginLeft: 8,
                    }}
                  />
                )}
              </div>
            ),
            description: (
              <div className="text-xs">
                {step.approverName && (
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-3 h-3 text-gray-400" />
                    <span>{step.approverName}</span>
                  </div>
                )}
                {step.approverRole && !step.approverName && (
                  <div className="text-gray-400">{step.approverRole}</div>
                )}
                {step.approvalDate && (
                  <div className="text-gray-400">
                    {dayjs(step.approvalDate).format('DD.MM.YYYY HH:mm')}
                  </div>
                )}
                {step.notes && (
                  <Tooltip title={step.notes}>
                    <div className="text-blue-500 truncate max-w-[150px] cursor-help flex items-center">
                      <ChatBubbleLeftIcon className="w-3 h-3 mr-1" />
                      {step.notes}
                    </div>
                  </Tooltip>
                )}
              </div>
            ),
            status: getStepStatus(step, index),
            icon: getStepIcon(step),
          }))}
        />
      </div>

      {/* Pending Approval Alert */}
      {(canApprove || canReject) && (
        <Alert
          type="info"
          showIcon
          icon={<ExclamationCircleIcon className="w-5 h-5" />}
          message="Onayınız Bekleniyor"
          description="Bu belge sizin onayınızı bekliyor. Lütfen belgeyi inceleyip onaylayın veya reddedin."
          className="mb-4"
        />
      )}

      {/* Action Buttons */}
      <Divider className="my-3" />
      <div className="flex items-center justify-between">
        <div>
          {canSubmit && (
            <Button
              type="primary"
              icon={<PaperAirplaneIcon className="w-4 h-4" />}
              onClick={onSubmit}
            >
              Onaya Gönder
            </Button>
          )}
          {canCancel && (
            <Button
              danger
              type="text"
              onClick={() => setCancelModalVisible(true)}
            >
              İptal Et
            </Button>
          )}
        </div>
        <Space>
          {canReject && (
            <Button
              danger
              icon={<XCircleIcon className="w-4 h-4" />}
              onClick={() => setRejectModalVisible(true)}
            >
              Reddet
            </Button>
          )}
          {canApprove && (
            <Button
              type="primary"
              icon={<CheckCircleIcon className="w-4 h-4" />}
              onClick={() => setApproveModalVisible(true)}
            >
              Onayla
            </Button>
          )}
        </Space>
      </div>

      {/* Approve Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span>Belgeyi Onayla</span>
          </div>
        }
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalVisible(false);
          setApprovalNotes('');
        }}
        okText="Onayla"
        cancelText="İptal"
        okButtonProps={{ icon: <CheckCircleIcon className="w-4 h-4" /> }}
      >
        <div className="py-4">
          <Alert
            type="success"
            message={`${documentTypeLabels[documentType]} #${documentNumber} belgesini onaylamak üzeresiniz.`}
            className="mb-4"
          />
          {totalAmount && (
            <div className="text-center mb-4 p-3 bg-gray-50 rounded">
              <Text type="secondary">Tutar</Text>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          )}
          <div>
            <Text type="secondary" className="block mb-2">Not (İsteğe bağlı)</Text>
            <TextArea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Onay notunuzu yazın..."
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <XCircleIcon className="w-5 h-5 text-red-500" />
            <span>Belgeyi Reddet</span>
          </div>
        }
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        okText="Reddet"
        cancelText="İptal"
        okButtonProps={{ danger: true, icon: <XCircleIcon className="w-4 h-4" />, disabled: !rejectReason.trim() }}
      >
        <div className="py-4">
          <Alert
            type="error"
            message={`${documentTypeLabels[documentType]} #${documentNumber} belgesini reddetmek üzeresiniz.`}
            className="mb-4"
          />
          <div>
            <Text type="secondary" className="block mb-2">Red Sebebi *</Text>
            <TextArea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Lütfen red sebebini açıklayın..."
              rows={4}
              status={!rejectReason.trim() ? 'error' : undefined}
            />
            {!rejectReason.trim() && (
              <Text type="danger" className="text-xs">Red sebebi zorunludur</Text>
            )}
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-orange-500" />
            <span>Belgeyi İptal Et</span>
          </div>
        }
        open={cancelModalVisible}
        onOk={handleCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason('');
        }}
        okText="İptal Et"
        cancelText="Vazgeç"
        okButtonProps={{ danger: true, disabled: !cancelReason.trim() }}
      >
        <div className="py-4">
          <Alert
            type="warning"
            message={`${documentTypeLabels[documentType]} #${documentNumber} belgesini iptal etmek üzeresiniz.`}
            description="Bu işlem geri alınamaz."
            className="mb-4"
          />
          <div>
            <Text type="secondary" className="block mb-2">İptal Sebebi *</Text>
            <TextArea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Lütfen iptal sebebini açıklayın..."
              rows={4}
              status={!cancelReason.trim() ? 'error' : undefined}
            />
            {!cancelReason.trim() && (
              <Text type="danger" className="text-xs">İptal sebebi zorunludur</Text>
            )}
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-blue-500" />
            <span>İşlem Geçmişi</span>
          </div>
        }
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="py-4 max-h-[400px] overflow-y-auto">
          {renderHistory()}
        </div>
      </Modal>
    </Card>
  );
}

export default ApprovalWorkflow;
