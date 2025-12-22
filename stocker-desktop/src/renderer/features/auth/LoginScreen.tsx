import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';

export const LoginScreen: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onFinish = async (values: any) => {
        setLoading(true);
        setError(null);

        try {
            // TODO: Call IPC login handler
            // const result = await window.electron.ipcRenderer.invoke('auth:login', values);

            // Simulation for now
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Login success:', values);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Please sign in to your account"
        >
            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="mb-4"
                />
            )}

            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input
                        prefix={<UserOutlined className="text-slate-400" />}
                        placeholder="Username"
                        autoComplete="username"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-slate-400" />}
                        placeholder="Password"
                        autoComplete="current-password"
                    />
                </Form.Item>

                <Form.Item>
                    <div className="flex justify-between items-center">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
                        <a className="text-sm font-medium hover:text-slate-900" href="#">
                            Forgot password?
                        </a>
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        className="h-10 font-medium"
                    >
                        Sign in
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};
