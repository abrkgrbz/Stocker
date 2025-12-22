import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Row, Col, Table, message, Divider } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Search } = Input;

export const OrderForm: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [items, setItems] = useState<any[]>([]);

    const columns = [
        { title: 'Product', dataIndex: 'product', key: 'product' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 100 },
        { title: 'Price', dataIndex: 'price', key: 'price', width: 120, render: (val: number) => `₺${val}` },
        { title: 'Total', key: 'total', width: 120, render: (_: any, record: any) => `₺${record.price * record.quantity}` },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_: any, record: any, index: number) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                        const newItems = [...items];
                        newItems.splice(index, 1);
                        setItems(newItems);
                    }}
                />
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <h1 className="text-2xl font-bold text-slate-900">New Sales Order</h1>
                </div>
                <Button type="primary" icon={<SaveOutlined />} size="large">
                    Create Order
                </Button>
            </div>

            <Row gutter={24}>
                <Col span={16}>
                    <Card title="Order Items" className="shadow-sm border-slate-200 min-h-[500px]">
                        <div className="mb-4 flex space-x-2">
                            <Search placeholder="Scan barcode or search product..." size="large" enterButton={<PlusOutlined />} />
                        </div>
                        <Table
                            columns={columns}
                            dataSource={items}
                            pagination={false}
                            locale={{ emptyText: 'Scan products to add to order' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Customer & Details" className="shadow-sm border-slate-200 mb-6">
                        <Form layout="vertical" form={form}>
                            <Form.Item name="customer" label="Customer" rules={[{ required: true }]}>
                                <Select size="large" showSearch placeholder="Select customer">
                                    <Option value="walk-in">Walk-in Customer</Option>
                                    <Option value="acme">Acme Corp</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="date" label="Order Date">
                                <Input type="date" size="large" />
                            </Form.Item>

                            <Form.Item name="notes" label="Notes">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </Form>
                    </Card>

                    <Card className="shadow-sm border-slate-200 bg-slate-50">
                        <div className="space-y-2 text-right">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal:</span>
                                <span>₺0.00</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Tax (20%):</span>
                                <span>₺0.00</span>
                            </div>
                            <Divider className="my-2" />
                            <div className="flex justify-between text-xl font-bold text-slate-900">
                                <span>Total:</span>
                                <span>₺0.00</span>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
