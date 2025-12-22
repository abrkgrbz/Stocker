import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Space, DatePicker, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export const EmployeeForm: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // TODO: IPC call
            await new Promise(resolve => setTimeout(resolve, 800));
            message.success('Employee saved successfully');
            navigate('/hr/employees');
        } catch (error) {
            message.error('Failed to save employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <h1 className="text-2xl font-bold text-slate-900">New Employee</h1>
                </div>
                <Space>
                    <Button onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading}>
                        Save Employee
                    </Button>
                </Space>
            </div>

            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Row gutter={24}>
                    <Col span={16}>
                        <Card title="Personal Information" className="shadow-sm border-slate-200 mb-6">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="phone" label="Phone Number">
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card title="Employment Details" className="shadow-sm border-slate-200">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                                        <Select size="large">
                                            <Option value="it">IT</Option>
                                            <Option value="sales">Sales</Option>
                                            <Option value="hr">HR</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="position" label="Position" rules={[{ required: true }]}>
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="hireDate" label="Hire Date" rules={[{ required: true }]}>
                                        <DatePicker style={{ width: '100%' }} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="manager" label="Reports To">
                                        <Select size="large">
                                            <Option value="manager1">Manager 1</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card title="Status & Access" className="shadow-sm border-slate-200">
                            <Form.Item name="status" label="Employment Status" rules={[{ required: true }]}>
                                <Select size="large" defaultValue="active">
                                    <Option value="active">Active</Option>
                                    <Option value="probation">Probation</Option>
                                    <Option value="terminated">Terminated</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="contractType" label="Contract Type">
                                <Select size="large">
                                    <Option value="fulltime">Full-time</Option>
                                    <Option value="parttime">Part-time</Option>
                                    <Option value="contract">Contract</Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};
