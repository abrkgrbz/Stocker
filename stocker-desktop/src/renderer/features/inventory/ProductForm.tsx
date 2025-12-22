import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Row, Col, Divider, message, Space } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

export const ProductForm: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // TODO: IPC call
            await new Promise(resolve => setTimeout(resolve, 800));
            message.success('Product saved successfully');
            navigate('/inventory/products');
        } catch (error) {
            message.error('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <h1 className="text-2xl font-bold text-slate-900">New Product</h1>
                </div>
                <Space>
                    <Button onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading}>
                        Save Product
                    </Button>
                </Space>
            </div>

            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Row gutter={24}>
                    <Col span={16}>
                        <Card title="Basic Information" className="shadow-sm border-slate-200">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="code" label="SKU / Code" rules={[{ required: true }]}>
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="description" label="Description">
                                <TextArea rows={4} />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                                        <Select size="large">
                                            <Option value="electronics">Electronics</Option>
                                            <Option value="clothing">Clothing</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="brand" label="Brand">
                                        <Select size="large">
                                            <Option value="brandA">Brand A</Option>
                                            <Option value="brandB">Brand B</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
                                        <Select size="large" defaultValue="pcs">
                                            <Option value="pcs">Pieces (Adet)</Option>
                                            <Option value="kg">Kilogram (kg)</Option>
                                            <Option value="lt">Liter (lt)</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card title="Pricing & Inventory" className="shadow-sm border-slate-200 mb-6">
                            <Form.Item name="price" label="Sales Price" rules={[{ required: true }]}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    size="large"
                                    prefix="₺"
                                    precision={2}
                                />
                            </Form.Item>

                            <Form.Item name="cost" label="Cost Price">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    size="large"
                                    prefix="₺"
                                    precision={2}
                                />
                            </Form.Item>

                            <Divider />

                            <Form.Item name="taxRate" label="VAT Rate (%)">
                                <Select size="large" defaultValue={20}>
                                    <Option value={0}>0%</Option>
                                    <Option value={1}>1%</Option>
                                    <Option value={10}>10%</Option>
                                    <Option value={20}>20%</Option>
                                </Select>
                            </Form.Item>
                        </Card>

                        <Card title="Stock Control" className="shadow-sm border-slate-200">
                            <Form.Item name="minStock" label="Low Stock Warning Limit">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="maxStock" label="Max Stock Limit">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};
