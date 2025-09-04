import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, TimePicker, message, Dropdown, Avatar, Tooltip, Badge, Tabs, Calendar, List, Row, Col, Statistic } from 'antd';
import { PlusOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EditOutlined, DeleteOutlined, UserOutlined, EnvironmentOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService } from '../../../services/crm/activityService';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface Activity {
  id: string;
  subject: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  status: 'scheduled' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  completedAt?: string;
  duration?: number;
  location?: string;
  leadId?: string;
  leadName?: string;
  customerId?: string;
  customerName?: string;
  contactId?: string;
  contactName?: string;
  opportunityId?: string;
  opportunityName?: string;
  dealId?: string;
  dealTitle?: string;
  assignedToId?: string;
  assignedToName?: string;
  outcome?: string;
  notes?: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt?: string;
}

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

export const ActivitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [form] = Form.useForm();
  const [completeForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', filterType, filterStatus],
    queryFn: () => activityService.getActivities({
      type: filterType as any,
      status: filterStatus as any
    })
  });

  const { data: upcomingActivities } = useQuery({
    queryKey: ['upcoming-activities'],
    queryFn: () => activityService.getUpcomingActivities(7)
  });

  const { data: overdueActivities } = useQuery({
    queryKey: ['overdue-activities'],
    queryFn: () => activityService.getOverdueActivities()
  });

  const { data: statistics } = useQuery({
    queryKey: ['activity-statistics'],
    queryFn: () => activityService.getActivityStatistics()
  });

  const createActivityMutation = useMutation({
    mutationFn: activityService.createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      queryClient.invalidateQueries(['upcoming-activities']);
      message.success('Activity created successfully');
      setIsCreateModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create activity');
    }
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => activityService.updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      message.success('Activity updated successfully');
      setIsEditModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to update activity');
    }
  });

  const completeActivityMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => activityService.completeActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      queryClient.invalidateQueries(['upcoming-activities']);
      queryClient.invalidateQueries(['overdue-activities']);
      message.success('Activity completed successfully');
      setIsCompleteModalOpen(false);
      completeForm.resetFields();
    },
    onError: () => {
      message.error('Failed to complete activity');
    }
  });

  const cancelActivityMutation = useMutation({
    mutationFn: (id: string) => activityService.cancelActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      message.success('Activity cancelled successfully');
    },
    onError: () => {
      message.error('Failed to cancel activity');
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: activityService.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      message.success('Activity deleted successfully');
    },
    onError: () => {
      message.error('Failed to delete activity');
    }
  });

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneOutlined />;
      case 'email':
        return <MailOutlined />;
      case 'meeting':
        return <TeamOutlined />;
      case 'task':
        return <CheckCircleOutlined />;
      case 'note':
        return <FileTextOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'blue';
      case 'email':
        return 'green';
      case 'meeting':
        return 'purple';
      case 'task':
        return 'orange';
      case 'note':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'processing';
      case 'cancelled':
        return 'default';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#ff4d4f';
      case 'high':
        return '#fa8c16';
      case 'medium':
        return '#1890ff';
      case 'low':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  const handleCreateActivity = () => {
    form.validateFields().then(values => {
      createActivityMutation.mutate({
        ...values,
        dueDate: values.dueDate.format('YYYY-MM-DD') + 'T' + values.dueTime.format('HH:mm:ss')
      });
    });
  };

  const handleUpdateActivity = () => {
    form.validateFields().then(values => {
      updateActivityMutation.mutate({
        id: selectedActivity?.id,
        ...values,
        dueDate: values.dueDate.format('YYYY-MM-DD') + 'T' + values.dueTime.format('HH:mm:ss')
      });
    });
  };

  const handleCompleteActivity = () => {
    completeForm.validateFields().then(values => {
      completeActivityMutation.mutate({
        id: selectedActivity?.id,
        ...values
      });
    });
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag icon={getActivityTypeIcon(type)} color={getActivityTypeColor(type)}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string, record: Activity) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              {record.description.substring(0, 100)}...
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Related To',
      key: 'relatedTo',
      render: (_: any, record: Activity) => {
        if (record.dealTitle) {
          return (
            <div>
              <Tag color="purple">Deal</Tag>
              <span>{record.dealTitle}</span>
            </div>
          );
        }
        if (record.opportunityName) {
          return (
            <div>
              <Tag color="blue">Opportunity</Tag>
              <span>{record.opportunityName}</span>
            </div>
          );
        }
        if (record.customerName) {
          return (
            <div>
              <Tag color="green">Customer</Tag>
              <span>{record.customerName}</span>
            </div>
          );
        }
        if (record.leadName) {
          return (
            <div>
              <Tag color="orange">Lead</Tag>
              <span>{record.leadName}</span>
            </div>
          );
        }
        return '-';
      }
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string, record: Activity) => (
        <div>
          <div>{dayjs(date).format('DD MMM YYYY')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {dayjs(date).format('HH:mm')}
          </div>
          {record.isOverdue && (
            <Tag color="error" style={{ marginTop: 4 }}>Overdue</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedToName',
      key: 'assignedTo',
      render: (name: string) => name ? (
        <Space>
          <Avatar size="small" icon={<UserOutlined />}>
            {name[0]}
          </Avatar>
          <span>{name}</span>
        </Space>
      ) : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Activity) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'View Details',
                icon: <FileTextOutlined />,
                onClick: () => {
                  setSelectedActivity(record);
                  // Open view modal
                }
              },
              {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => {
                  setSelectedActivity(record);
                  form.setFieldsValue({
                    ...record,
                    dueDate: dayjs(record.dueDate),
                    dueTime: dayjs(record.dueDate)
                  });
                  setIsEditModalOpen(true);
                }
              },
              record.status === 'scheduled' && {
                key: 'complete',
                label: 'Mark Complete',
                icon: <CheckCircleOutlined />,
                onClick: () => {
                  setSelectedActivity(record);
                  setIsCompleteModalOpen(true);
                }
              },
              record.status === 'scheduled' && {
                key: 'cancel',
                label: 'Cancel',
                icon: <CloseCircleOutlined />,
                onClick: () => {
                  Modal.confirm({
                    title: 'Cancel Activity',
                    content: `Are you sure you want to cancel "${record.subject}"?`,
                    onOk: () => cancelActivityMutation.mutate(record.id)
                  });
                }
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Delete',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: 'Delete Activity',
                    content: `Are you sure you want to delete "${record.subject}"?`,
                    onOk: () => deleteActivityMutation.mutate(record.id)
                  });
                }
              }
            ].filter(Boolean)
          }}
        >
          <Button type="text" icon={<EditOutlined />} />
        </Dropdown>
      )
    }
  ];

  const dateCellRender = (value: Dayjs) => {
    const dayActivities = activities?.filter(activity => 
      dayjs(activity.dueDate).isSame(value, 'day')
    ) || [];

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayActivities.slice(0, 3).map(activity => (
          <li key={activity.id}>
            <Badge
              status={activity.status === 'completed' ? 'success' : 'processing'}
              text={
                <span style={{ fontSize: 11, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activity.subject}
                </span>
              }
            />
          </li>
        ))}
        {dayActivities.length > 3 && (
          <li style={{ fontSize: 11, color: '#1890ff' }}>
            +{dayActivities.length - 3} more
          </li>
        )}
      </ul>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Activities"
                  value={statistics?.totalActivities || 0}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Completed"
                  value={statistics?.completedActivities || 0}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Pending"
                  value={statistics?.pendingActivities || 0}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Overdue"
                  value={statistics?.overdueActivities || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="List View" key="list">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Select
                  placeholder="Filter by Type"
                  allowClear
                  style={{ width: 150 }}
                  onChange={setFilterType}
                >
                  <Option value="call">Call</Option>
                  <Option value="email">Email</Option>
                  <Option value="meeting">Meeting</Option>
                  <Option value="task">Task</Option>
                  <Option value="note">Note</Option>
                </Select>
                
                <Select
                  placeholder="Filter by Status"
                  allowClear
                  style={{ width: 150 }}
                  onChange={setFilterStatus}
                >
                  <Option value="scheduled">Scheduled</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                  <Option value="overdue">Overdue</Option>
                </Select>
              </Space>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Add Activity
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={activities}
              loading={isLoading}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} activities`
              }}
            />
          </TabPane>

          <TabPane tab="Calendar View" key="calendar">
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Add Activity
              </Button>
            </div>
            
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={(date) => {
                setSelectedDate(date);
                // Show activities for selected date
              }}
            />
          </TabPane>

          <TabPane tab="Upcoming" key="upcoming">
            <List
              loading={isLoading}
              dataSource={upcomingActivities}
              renderItem={(activity: Activity) => (
                <List.Item
                  actions={[
                    <Button
                      key="complete"
                      type="link"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        setSelectedActivity(activity);
                        setIsCompleteModalOpen(true);
                      }}
                    >
                      Complete
                    </Button>,
                    <Button
                      key="edit"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedActivity(activity);
                        form.setFieldsValue({
                          ...activity,
                          dueDate: dayjs(activity.dueDate),
                          dueTime: dayjs(activity.dueDate)
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: getActivityTypeColor(activity.type) }}
                        icon={getActivityTypeIcon(activity.type)}
                      />
                    }
                    title={
                      <Space>
                        <span>{activity.subject}</span>
                        <Tag color={getPriorityColor(activity.priority)}>
                          {activity.priority.toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        {activity.description && <div>{activity.description}</div>}
                        <Space>
                          <CalendarOutlined />
                          {dayjs(activity.dueDate).format('DD MMM YYYY HH:mm')}
                          {activity.location && (
                            <>
                              <EnvironmentOutlined />
                              {activity.location}
                            </>
                          )}
                          {activity.assignedToName && (
                            <>
                              <UserOutlined />
                              {activity.assignedToName}
                            </>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane 
            tab={
              <Badge count={overdueActivities?.length || 0} offset={[10, 0]}>
                Overdue
              </Badge>
            } 
            key="overdue"
          >
            <List
              loading={isLoading}
              dataSource={overdueActivities}
              renderItem={(activity: Activity) => (
                <List.Item
                  actions={[
                    <Button
                      key="complete"
                      type="link"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        setSelectedActivity(activity);
                        setIsCompleteModalOpen(true);
                      }}
                    >
                      Complete
                    </Button>,
                    <Button
                      key="reschedule"
                      type="link"
                      icon={<CalendarOutlined />}
                      onClick={() => {
                        setSelectedActivity(activity);
                        form.setFieldsValue({
                          ...activity,
                          dueDate: dayjs(activity.dueDate),
                          dueTime: dayjs(activity.dueDate)
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      Reschedule
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#ff4d4f' }}
                        icon={getActivityTypeIcon(activity.type)}
                      />
                    }
                    title={
                      <Space>
                        <span>{activity.subject}</span>
                        <Tag color="error">OVERDUE</Tag>
                        <Tag color={getPriorityColor(activity.priority)}>
                          {activity.priority.toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        {activity.description && <div>{activity.description}</div>}
                        <Space>
                          <CalendarOutlined />
                          <span style={{ color: '#ff4d4f' }}>
                            {dayjs(activity.dueDate).format('DD MMM YYYY HH:mm')}
                            ({dayjs().diff(dayjs(activity.dueDate), 'day')} days overdue)
                          </span>
                          {activity.assignedToName && (
                            <>
                              <UserOutlined />
                              {activity.assignedToName}
                            </>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Activity Modal */}
      <Modal
        title="Create Activity"
        open={isCreateModalOpen}
        onOk={handleCreateActivity}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select activity type">
              <Option value="call">Call</Option>
              <Option value="email">Email</Option>
              <Option value="meeting">Meeting</Option>
              <Option value="task">Task</Option>
              <Option value="note">Note</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter subject' }]}
          >
            <Input placeholder="Enter activity subject" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueTime"
                label="Time"
                rules={[{ required: true, message: 'Please select time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                initialValue="medium"
              >
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
              >
                <Input type="number" placeholder="e.g., 30" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Enter location (optional)" />
          </Form.Item>

          <Form.Item
            name="assignedToId"
            label="Assign To"
          >
            <Select placeholder="Select assignee">
              {/* Load users here */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        title="Edit Activity"
        open={isEditModalOpen}
        onOk={handleUpdateActivity}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedActivity(null);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          {/* Same form fields as create modal */}
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter subject' }]}
          >
            <Input placeholder="Enter activity subject" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueTime"
                label="Time"
                rules={[{ required: true, message: 'Please select time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
              >
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
              >
                <Input type="number" placeholder="e.g., 30" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Enter location (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Complete Activity Modal */}
      <Modal
        title="Complete Activity"
        open={isCompleteModalOpen}
        onOk={handleCompleteActivity}
        onCancel={() => {
          setIsCompleteModalOpen(false);
          setSelectedActivity(null);
          completeForm.resetFields();
        }}
        width={500}
      >
        <Form form={completeForm} layout="vertical">
          <Form.Item
            name="outcome"
            label="Outcome"
          >
            <Select placeholder="Select outcome">
              <Option value="successful">Successful</Option>
              <Option value="unsuccessful">Unsuccessful</Option>
              <Option value="rescheduled">Rescheduled</Option>
              <Option value="no_show">No Show</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Completion Notes"
          >
            <TextArea 
              rows={4} 
              placeholder="Enter any notes about the completed activity..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};