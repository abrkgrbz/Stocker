import React, { useState } from 'react';
import { Card, Row, Col, Button, Badge, Avatar, Dropdown, Space, Modal, Form, Input, InputNumber, Select, DatePicker, message, Tooltip, Progress, Empty, Spin } from 'antd';
import { PlusOutlined, EllipsisOutlined, DollarOutlined, CalendarOutlined, UserOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, SwapOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService } from '../../../services/crm/pipelineService';
import { opportunityService } from '../../../services/crm/opportunityService';
import { dealService } from '../../../services/crm/dealService';
import dayjs from 'dayjs';

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  isWon?: boolean;
  isLost?: boolean;
}

interface PipelineItem {
  id: string;
  name: string;
  amount: number;
  currency: string;
  probability: number;
  expectedCloseDate: string;
  customerName: string;
  ownerName?: string;
  ownerAvatar?: string;
  stageId: string;
  type: 'opportunity' | 'deal';
}

const { Option } = Select;

export const PipelinePage: React.FC = () => {
  const [selectedPipeline, setSelectedPipeline] = useState<string>('default');
  const [viewType, setViewType] = useState<'opportunity' | 'deal'>('opportunity');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: pipelines, isLoading: pipelinesLoading } = useQuery({
    queryKey: ['pipelines'],
    queryFn: pipelineService.getPipelines
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['pipeline-items', selectedPipeline, viewType],
    queryFn: () => {
      if (viewType === 'opportunity') {
        return opportunityService.getOpportunities({ pipelineId: selectedPipeline });
      } else {
        return dealService.getDeals({ pipelineId: selectedPipeline });
      }
    }
  });

  const moveItemMutation = useMutation({
    mutationFn: ({ itemId, newStageId }: { itemId: string; newStageId: string }) => {
      if (viewType === 'opportunity') {
        return opportunityService.moveToStage(itemId, newStageId);
      } else {
        return dealService.moveToStage(itemId, newStageId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pipeline-items']);
      message.success('Item moved successfully');
    },
    onError: () => {
      message.error('Failed to move item');
    }
  });

  const createItemMutation = useMutation({
    mutationFn: (values: any) => {
      if (viewType === 'opportunity') {
        return opportunityService.createOpportunity(values);
      } else {
        return dealService.createDeal(values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pipeline-items']);
      message.success(`${viewType === 'opportunity' ? 'Opportunity' : 'Deal'} created successfully`);
      setIsCreateModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error(`Failed to create ${viewType === 'opportunity' ? 'opportunity' : 'deal'}`);
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, ...values }: any) => {
      if (viewType === 'opportunity') {
        return opportunityService.updateOpportunity(id, values);
      } else {
        return dealService.updateDeal(id, values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pipeline-items']);
      message.success(`${viewType === 'opportunity' ? 'Opportunity' : 'Deal'} updated successfully`);
      setIsEditModalOpen(false);
      setSelectedItem(null);
      form.resetFields();
    },
    onError: () => {
      message.error(`Failed to update ${viewType === 'opportunity' ? 'opportunity' : 'deal'}`);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => {
      if (viewType === 'opportunity') {
        return opportunityService.deleteOpportunity(id);
      } else {
        return dealService.deleteDeal(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pipeline-items']);
      message.success(`${viewType === 'opportunity' ? 'Opportunity' : 'Deal'} deleted successfully`);
    },
    onError: () => {
      message.error(`Failed to delete ${viewType === 'opportunity' ? 'opportunity' : 'deal'}`);
    }
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      moveItemMutation.mutate({
        itemId: draggableId,
        newStageId: destination.droppableId
      });
    }
  };

  const handleCreateItem = () => {
    form.validateFields().then(values => {
      createItemMutation.mutate({
        ...values,
        pipelineId: selectedPipeline,
        stageId: selectedStage,
        expectedCloseDate: values.expectedCloseDate.format('YYYY-MM-DD')
      });
    });
  };

  const handleUpdateItem = () => {
    form.validateFields().then(values => {
      updateItemMutation.mutate({
        id: selectedItem?.id,
        ...values,
        expectedCloseDate: values.expectedCloseDate.format('YYYY-MM-DD')
      });
    });
  };

  const handleWinItem = (item: PipelineItem) => {
    Modal.confirm({
      title: `Mark as Won`,
      content: `Are you sure you want to mark "${item.name}" as won?`,
      onOk: () => {
        if (viewType === 'opportunity') {
          opportunityService.winOpportunity(item.id).then(() => {
            queryClient.invalidateQueries(['pipeline-items']);
            message.success('Opportunity marked as won');
          });
        } else {
          dealService.closeWon(item.id).then(() => {
            queryClient.invalidateQueries(['pipeline-items']);
            message.success('Deal closed as won');
          });
        }
      }
    });
  };

  const handleLoseItem = (item: PipelineItem) => {
    Modal.confirm({
      title: `Mark as Lost`,
      content: (
        <div>
          <p>Are you sure you want to mark "{item.name}" as lost?</p>
          <Input.TextArea placeholder="Loss reason (optional)" />
        </div>
      ),
      onOk: (close) => {
        if (viewType === 'opportunity') {
          opportunityService.loseOpportunity(item.id, { reason: '' }).then(() => {
            queryClient.invalidateQueries(['pipeline-items']);
            message.success('Opportunity marked as lost');
            close();
          });
        } else {
          dealService.closeLost(item.id, { reason: '' }).then(() => {
            queryClient.invalidateQueries(['pipeline-items']);
            message.success('Deal closed as lost');
            close();
          });
        }
      }
    });
  };

  const defaultStages: PipelineStage[] = [
    { id: 'stage1', name: 'Lead In', order: 1, probability: 10, color: '#8B8B8D' },
    { id: 'stage2', name: 'Contact Made', order: 2, probability: 25, color: '#722ED1' },
    { id: 'stage3', name: 'Needs Defined', order: 3, probability: 40, color: '#1890FF' },
    { id: 'stage4', name: 'Proposal Sent', order: 4, probability: 60, color: '#13C2C2' },
    { id: 'stage5', name: 'Negotiation', order: 5, probability: 80, color: '#FA8C16' },
    { id: 'stage6', name: 'Won', order: 6, probability: 100, color: '#52C41A', isWon: true },
    { id: 'stage7', name: 'Lost', order: 7, probability: 0, color: '#FF4D4F', isLost: true }
  ];

  const stages = pipelines?.find(p => p.id === selectedPipeline)?.stages || defaultStages;

  const getStageItems = (stageId: string) => {
    return items?.filter(item => item.currentStageId === stageId) || [];
  };

  const calculateStageMetrics = (stageId: string) => {
    const stageItems = getStageItems(stageId);
    const totalValue = stageItems.reduce((sum, item) => sum + item.amount, 0);
    const weightedValue = stageItems.reduce((sum, item) => sum + (item.amount * item.probability / 100), 0);
    
    return {
      count: stageItems.length,
      totalValue,
      weightedValue
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (pipelinesLoading || itemsLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="large">
          <Select
            value={selectedPipeline}
            onChange={setSelectedPipeline}
            style={{ width: 200 }}
            placeholder="Select Pipeline"
          >
            <Option value="default">Default Pipeline</Option>
            {pipelines?.map(pipeline => (
              <Option key={pipeline.id} value={pipeline.id}>{pipeline.name}</Option>
            ))}
          </Select>
          
          <Select
            value={viewType}
            onChange={setViewType}
            style={{ width: 150 }}
          >
            <Option value="opportunity">Opportunities</Option>
            <Option value="deal">Deals</Option>
          </Select>
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedStage(stages[0]?.id || '');
            setIsCreateModalOpen(true);
          }}
        >
          Add {viewType === 'opportunity' ? 'Opportunity' : 'Deal'}
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
          {stages.filter(s => !s.isWon && !s.isLost).map(stage => {
            const metrics = calculateStageMetrics(stage.id);
            
            return (
              <div key={stage.id} style={{ minWidth: 300, flex: '0 0 300px' }}>
                <Card
                  title={
                    <div style={{ borderLeft: `4px solid ${stage.color}`, paddingLeft: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{stage.name}</span>
                        <Badge count={metrics.count} style={{ backgroundColor: stage.color }} />
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        {formatCurrency(metrics.totalValue)} ({stage.probability}%)
                      </div>
                    </div>
                  }
                  bodyStyle={{ padding: 8, minHeight: 400 }}
                >
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          minHeight: 380,
                          backgroundColor: snapshot.isDraggingOver ? '#f0f0f0' : 'transparent',
                          borderRadius: 4,
                          padding: 4
                        }}
                      >
                        {getStageItems(stage.id).length === 0 ? (
                          <Empty
                            description="No items"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{ marginTop: 100 }}
                          />
                        ) : (
                          getStageItems(stage.id).map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    marginBottom: 8
                                  }}
                                >
                                  <Card
                                    size="small"
                                    hoverable
                                    style={{
                                      cursor: 'grab',
                                      opacity: snapshot.isDragging ? 0.8 : 1
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                      <div style={{ flex: 1, marginRight: 8 }}>
                                        <div style={{ fontWeight: 500, marginBottom: 4 }}>
                                          {item.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                          {item.customerName}
                                        </div>
                                      </div>
                                      <Dropdown
                                        menu={{
                                          items: [
                                            {
                                              key: 'edit',
                                              label: 'Edit',
                                              icon: <EditOutlined />,
                                              onClick: () => {
                                                setSelectedItem(item);
                                                form.setFieldsValue({
                                                  ...item,
                                                  expectedCloseDate: dayjs(item.expectedCloseDate)
                                                });
                                                setIsEditModalOpen(true);
                                              }
                                            },
                                            {
                                              key: 'win',
                                              label: 'Mark as Won',
                                              icon: <CheckCircleOutlined />,
                                              onClick: () => handleWinItem(item)
                                            },
                                            {
                                              key: 'lose',
                                              label: 'Mark as Lost',
                                              icon: <CloseCircleOutlined />,
                                              onClick: () => handleLoseItem(item)
                                            },
                                            { type: 'divider' },
                                            {
                                              key: 'delete',
                                              label: 'Delete',
                                              icon: <DeleteOutlined />,
                                              danger: true,
                                              onClick: () => {
                                                Modal.confirm({
                                                  title: 'Delete Item',
                                                  content: `Are you sure you want to delete "${item.name}"?`,
                                                  onOk: () => deleteItemMutation.mutate(item.id)
                                                });
                                              }
                                            }
                                          ]
                                        }}
                                      >
                                        <Button
                                          type="text"
                                          icon={<EllipsisOutlined />}
                                          size="small"
                                        />
                                      </Dropdown>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <DollarOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                                        <span style={{ fontWeight: 500 }}>
                                          {formatCurrency(item.amount)}
                                        </span>
                                      </div>
                                      <Progress
                                        percent={item.probability}
                                        size="small"
                                        style={{ width: 60 }}
                                        strokeColor={stage.color}
                                      />
                                    </div>
                                    
                                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                        <CalendarOutlined style={{ marginRight: 4 }} />
                                        {dayjs(item.expectedCloseDate).format('DD MMM YYYY')}
                                      </div>
                                      {item.ownerName && (
                                        <Tooltip title={item.ownerName}>
                                          <Avatar 
                                            size="small" 
                                            src={item.ownerAvatar}
                                            icon={!item.ownerAvatar && <UserOutlined />}
                                          >
                                            {!item.ownerAvatar && item.ownerName[0]}
                                          </Avatar>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create Modal */}
      <Modal
        title={`Create ${viewType === 'opportunity' ? 'Opportunity' : 'Deal'}`}
        open={isCreateModalOpen}
        onOk={handleCreateItem}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder={`Enter ${viewType} name`} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="Customer"
                rules={[{ required: true, message: 'Please select a customer' }]}
              >
                <Select placeholder="Select customer">
                  {/* Customer options would be loaded here */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₺\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="probability"
                label="Probability (%)"
                rules={[{ required: true, message: 'Please enter probability' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  formatter={value => `${value}%`}
                  parser={value => value!.replace('%', '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedCloseDate"
                label="Expected Close Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit ${viewType === 'opportunity' ? 'Opportunity' : 'Deal'}`}
        open={isEditModalOpen}
        onOk={handleUpdateItem}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder={`Enter ${viewType} name`} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₺\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="probability"
                label="Probability (%)"
                rules={[{ required: true, message: 'Please enter probability' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  formatter={value => `${value}%`}
                  parser={value => value!.replace('%', '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expectedCloseDate"
                label="Expected Close Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};