import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Space, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

export const CustomerForm: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // TODO: IPC call
            await new Promise(resolve => setTimeout(resolve, 800));
            message.success('Customer saved successfully');
            navigate('/crm/customers');
        } catch (error) {
            message.error('Failed to save customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <h1 className="text-2xl font-bold text-slate-900">New Customer</h1>
                </div>
                <Space>
                    <Button onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading}>
                        Save Customer
                    </Button>
                </Space>
            </div>

            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Row gutter={24}>
                    <Col span={16}>
                        <Card title="Business Info" className="shadow-sm border-slate-200 mb-6">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="name" label="Contact Name" rules={[{ required: true }]}>
                                        <Input size="large" prefix={<UserOutlined />} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="company" label="Company Name">
                                        <Input size="large" prefix={<BankOutlined />} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="email" label="Email Address">
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

                        <Card title="Address" className="shadow-sm border-slate-200">
                            <Form.Item name="address" label="Street Address">
                                <TextArea rows={2} />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="city" label="City">
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="country" label="Country">
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card title="Classification" className="shadow-sm border-slate-200 mb-6">
                            <Form.Item name="type" label="Customer Type" rules={[{ required: true }]}>
                                <Select size="large">
                                    <Option value="vip">VIP</Option>
                                    <Option value="regular">Regular</Option>
                                    <Option value="lead">Lead</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="status" label="Status">
                                <Select size="large" defaultValue="active">
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="source" label="Lead Source">
                                <Select size="large">
                                    <Option value="web">Website</Option>
                                    <Option value="referral">Referral</Option>
                                    <Option value="other">Other</Option>
                                </Select>
                            </Form.Item>
                        </Card>

                        <Card title="Notes" className="shadow-sm border-slate-200">
                            <Form.Item name="notes">
                                <TextArea rows={4} placeholder="Internal notes..." />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

import { UserOutlined, BankOutlined } from '@ant-design/icons';
