import React, { useState } from 'react';
import { Steps, Form, Input, Button, message, Result } from 'antd';
import {
    KeyOutlined,
    BankOutlined,
    UserOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';

const { Step } = Steps;
const { TextArea } = Input;

export const SetupWizard: React.FC = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [form] = Form.useForm();

    // Step 1: License Verification
    const handleLicenseSubmit = async (values: any) => {
        setLoading(true);
        try {
            // TODO: Verify license via IPC
            // await window.electron.ipcRenderer.invoke('license:verify', values.licenseKey);
            await new Promise(resolve => setTimeout(resolve, 800));

            setFormData({ ...formData, ...values });
            setCurrent(current + 1);
        } catch (error) {
            message.error('Invalid license key');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Company Details
    const handleCompanySubmit = async (values: any) => {
        setFormData({ ...formData, company: values });
        setCurrent(current + 1);
    };

    // Step 3: Admin Account & Finalize
    const handleAdminSubmit = async (values: any) => {
        setLoading(true);
        try {
            const finalData = {
                licenseKey: formData.licenseKey,
                company: formData.company,
                admin: values
            };

            // TODO: Submit initialization via IPC
            // await window.electron.ipcRenderer.invoke('system:initialize', finalData);
            await new Promise(resolve => setTimeout(resolve, 1500));

            setCurrent(current + 1); // Move to success step
        } catch (error) {
            message.error('Setup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'License',
            icon: <KeyOutlined />,
            content: (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLicenseSubmit}
                    initialValues={formData}
                >
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium">Activate Stocker</h3>
                        <p className="text-slate-500 text-sm">Enter your license key to begin</p>
                    </div>

                    <Form.Item
                        name="licenseKey"
                        rules={[{ required: true, message: 'Please enter a valid license key' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="eyJhbGciOiJ..."
                            className="font-mono text-xs"
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Verify License
                    </Button>
                </Form>
            ),
        },
        {
            title: 'Company',
            icon: <BankOutlined />,
            content: (
                <Form
                    layout="vertical"
                    onFinish={handleCompanySubmit}
                    initialValues={formData.company}
                >
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium">Organization Profile</h3>
                        <p className="text-slate-500 text-sm">Tell us about your company</p>
                    </div>

                    <Form.Item
                        name="name"
                        label="Company Name"
                        rules={[{ required: true, message: 'Required' }]}
                    >
                        <Input size="large" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="taxId"
                            label="Tax ID / VKN"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="city"
                            label="City"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input />
                        </Form.Item>
                    </div>

                    <Button type="primary" htmlType="submit" block>
                        Continue
                    </Button>
                </Form>
            ),
        },
        {
            title: 'Admin',
            icon: <UserOutlined />,
            content: (
                <Form
                    layout="vertical"
                    onFinish={handleAdminSubmit}
                >
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium">Administrator Account</h3>
                        <p className="text-slate-500 text-sm">Create the Super Admin user</p>
                    </div>

                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true }]}
                    >
                        <Input size="large" prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true }]}
                    >
                        <Input size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, min: 6 }]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Complete Setup
                    </Button>
                </Form>
            ),
        },
        {
            title: 'Done',
            icon: <CheckCircleOutlined />,
            content: (
                <Result
                    status="success"
                    title="Setup Complete!"
                    subTitle="Stocker Desktop has been successfully initialized. You can now log in."
                    extra={[
                        <Button type="primary" key="login" onClick={() => navigate('/login')}>
                            Go to Login
                        </Button>,
                    ]}
                />
            )
        }
    ];

    return (
        <AuthLayout>
            <Steps
                current={current}
                items={steps.map(s => ({ title: s.title, icon: s.icon }))}
                className="mb-8"
                size="small"
            />

            <div className="mt-4">
                {steps[current].content}
            </div>
        </AuthLayout>
    );
};
