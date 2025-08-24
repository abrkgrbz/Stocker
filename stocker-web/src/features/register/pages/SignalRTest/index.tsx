import React, { useState, useEffect } from 'react';
import { Card, Input, Form, Typography, Space, Alert, Badge, Tag, Spin, Row, Col, Button, Tabs, Divider, Radio } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, ApiOutlined, WifiOutlined, IdcardOutlined } from '@ant-design/icons';
import { useSignalRValidation } from '@/shared/hooks/useSignalR';
import { apiClient } from '@/shared/api/client';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const SignalRTestPage: React.FC = () => {
  // SignalR Hook
  const {
    isConnected,
    emailValidation,
    passwordStrength,
    domainCheck,
    phoneValidation,
    companyNameCheck,
    identityValidation,
    error,
    validateEmail,
    checkPasswordStrength,
    checkDomain,
    validatePhone,
    checkCompanyName,
    validateIdentity,
  } = useSignalRValidation();

  // State for inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [identityInput, setIdentityInput] = useState('');
  const [identityType, setIdentityType] = useState<'tc' | 'vkn'>('tc');

  // State for validation loading
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [isValidatingPassword, setIsValidatingPassword] = useState(false);
  const [isValidatingDomain, setIsValidatingDomain] = useState(false);
  const [isValidatingPhone, setIsValidatingPhone] = useState(false);
  const [isValidatingCompany, setIsValidatingCompany] = useState(false);
  const [isValidatingIdentity, setIsValidatingIdentity] = useState(false);

  // State for REST API results
  const [apiEmailResult, setApiEmailResult] = useState<any>(null);
  const [apiPasswordResult, setApiPasswordResult] = useState<any>(null);
  const [apiDomainResult, setApiDomainResult] = useState<any>(null);
  const [apiPhoneResult, setApiPhoneResult] = useState<any>(null);
  const [apiCompanyResult, setApiCompanyResult] = useState<any>(null);
  const [apiIdentityResult, setApiIdentityResult] = useState<any>(null);

  // State for API loading
  const [apiEmailLoading, setApiEmailLoading] = useState(false);
  const [apiPasswordLoading, setApiPasswordLoading] = useState(false);
  const [apiDomainLoading, setApiDomainLoading] = useState(false);
  const [apiPhoneLoading, setApiPhoneLoading] = useState(false);
  const [apiCompanyLoading, setApiCompanyLoading] = useState(false);
  const [apiIdentityLoading, setApiIdentityLoading] = useState(false);

  // SignalR Handlers
  const handleEmailChange = async (value: string) => {
    setEmailInput(value);
    if (value && value.includes('@')) {
      setIsValidatingEmail(true);
      await validateEmail(value);
    }
  };

  const handlePasswordChange = async (value: string) => {
    setPasswordInput(value);
    if (value) {
      setIsValidatingPassword(true);
      await checkPasswordStrength(value);
    }
  };

  const handleDomainChange = async (value: string) => {
    setDomainInput(value);
    if (value && value.length > 2) {
      setIsValidatingDomain(true);
      await checkDomain(`${value}.stocker.app`);
    }
  };

  const handlePhoneChange = async (value: string) => {
    setPhoneInput(value);
    if (value && value.length > 6) {
      setIsValidatingPhone(true);
      await validatePhone(value, 'TR');
    }
  };

  const handleCompanyChange = async (value: string) => {
    setCompanyInput(value);
    if (value && value.length > 2) {
      setIsValidatingCompany(true);
      await checkCompanyName(value);
    }
  };

  const handleIdentityChange = async (value: string) => {
    setIdentityInput(value);
    const cleanValue = value.replace(/\D/g, '');
    const expectedLength = identityType === 'tc' ? 11 : 10;
    
    if (cleanValue.length === expectedLength) {
      setIsValidatingIdentity(true);
      console.log('=== SignalR Test Page - Validating Identity ===');
      console.log('Type:', identityType);
      console.log('Value:', cleanValue);
      try {
        await validateIdentity(cleanValue);
        console.log('Validation call completed');
      } catch (error) {
        console.error('Validation call failed:', error);
      }
    }
  };

  // REST API Handlers
  const validateEmailViaAPI = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      return;
    }
    
    setApiEmailLoading(true);
    try {
      const response = await apiClient.post('/api/public/validate/email', { email: emailInput });
      setApiEmailResult(response.data);
    } catch (error: any) {
      setApiEmailResult({ 
        isValid: false, 
        message: error.response?.data?.message || 'API hatası'
      });
    } finally {
      setApiEmailLoading(false);
    }
  };

  const checkPasswordViaAPI = async () => {
    if (!passwordInput) {
      return;
    }
    
    setApiPasswordLoading(true);
    try {
      const response = await apiClient.post('/api/public/validate/password-strength', { password: passwordInput });
      setApiPasswordResult(response.data);
    } catch (error: any) {
      setApiPasswordResult({ 
        score: 0,
        message: error.response?.data?.message || 'API hatası'
      });
    } finally {
      setApiPasswordLoading(false);
    }
  };

  const checkDomainViaAPI = async () => {
    if (!domainInput || domainInput.length < 3) {
      return;
    }
    
    setApiDomainLoading(true);
    try {
      const response = await apiClient.post('/api/public/validate/domain', { 
        domain: `${domainInput}.stocker.app` 
      });
      setApiDomainResult(response.data);
    } catch (error: any) {
      setApiDomainResult({ 
        isAvailable: false,
        message: error.response?.data?.message || 'API hatası'
      });
    } finally {
      setApiDomainLoading(false);
    }
  };

  const validatePhoneViaAPI = async () => {
    if (!phoneInput || phoneInput.length < 7) {
      return;
    }
    
    setApiPhoneLoading(true);
    try {
      const response = await apiClient.post('/api/public/validate/phone', { 
        phoneNumber: phoneInput,
        countryCode: 'TR'
      });
      setApiPhoneResult(response.data);
    } catch (error: any) {
      setApiPhoneResult({ 
        isValid: false,
        message: error.response?.data?.message || 'API hatası'
      });
    } finally {
      setApiPhoneLoading(false);
    }
  };

  const checkCompanyViaAPI = async () => {
    if (!companyInput || companyInput.length < 3) {
      return;
    }
    
    setApiCompanyLoading(true);
    try {
      const response = await apiClient.post('/api/public/validate/company-name', { 
        companyName: companyInput 
      });
      setApiCompanyResult(response.data);
    } catch (error: any) {
      setApiCompanyResult({ 
        isValid: false,
        message: error.response?.data?.message || 'API hatası'
      });
    } finally {
      setApiCompanyLoading(false);
    }
  };

  const validateIdentityViaAPI = async () => {
    const cleanValue = identityInput.replace(/\D/g, '');
    const expectedLength = identityType === 'tc' ? 11 : 10;
    
    if (cleanValue.length !== expectedLength) {
      return;
    }
    
    setApiIdentityLoading(true);
    try {
      const response = await apiClient.post('/api/public/validate/identity', { 
        identityNumber: cleanValue 
      });
      setApiIdentityResult(response.data);
    } catch (error: any) {
      setApiIdentityResult({ 
        isValid: false,
        message: error.response?.data?.message || 'API hatası',
        numberType: identityType === 'tc' ? 'TCKimlik' : 'VergiNo'
      });
    } finally {
      setApiIdentityLoading(false);
    }
  };

  // Reset loading states when results come in
  useEffect(() => {
    if (emailValidation) setIsValidatingEmail(false);
  }, [emailValidation]);

  useEffect(() => {
    if (passwordStrength) setIsValidatingPassword(false);
  }, [passwordStrength]);

  useEffect(() => {
    if (domainCheck) setIsValidatingDomain(false);
  }, [domainCheck]);

  useEffect(() => {
    if (phoneValidation) setIsValidatingPhone(false);
  }, [phoneValidation]);

  useEffect(() => {
    if (companyNameCheck) setIsValidatingCompany(false);
  }, [companyNameCheck]);

  useEffect(() => {
    if (identityValidation) setIsValidatingIdentity(false);
  }, [identityValidation]);

  const getPasswordStrengthColor = (level?: string) => {
    switch (level) {
      case 'VeryWeak': return '#ff4d4f';
      case 'Weak': return '#faad14';
      case 'Fair': return '#fadb14';
      case 'Strong': return '#52c41a';
      case 'VeryStrong': return '#389e0d';
      default: return '#d9d9d9';
    }
  };

  const renderValidationCard = (
    title: string,
    input: string,
    setInput: (value: string) => void,
    signalRResult: any,
    apiResult: any,
    handleSignalR: (value: string) => void,
    handleAPI: () => void,
    isSignalRLoading: boolean,
    isAPILoading: boolean,
    placeholder: string,
    isPassword: boolean = false,
    addonAfter?: string
  ) => (
    <Card title={title}>
      <Tabs defaultActiveKey="signalr">
        <TabPane
          tab={
            <span>
              <WifiOutlined /> SignalR (Real-time)
            </span>
          }
          key="signalr"
        >
          <Form.Item
            label={`${title} - SignalR`}
            validateStatus={
              isSignalRLoading ? 'validating' :
              signalRResult ? (signalRResult.isValid || signalRResult.score >= 3 ? 'success' : 'error') : ''
            }
            hasFeedback={isSignalRLoading || !!signalRResult}
            help={signalRResult?.message || (signalRResult?.suggestions && signalRResult.suggestions.join(', '))}
          >
            {isPassword ? (
              <Input.Password
                placeholder={placeholder}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleSignalR(e.target.value);
                }}
              />
            ) : (
              <Input
                placeholder={placeholder}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleSignalR(e.target.value);
                }}
                addonAfter={addonAfter}
                suffix={
                  isSignalRLoading ? <Spin indicator={<LoadingOutlined />} /> :
                  signalRResult ? (
                    signalRResult.isValid || signalRResult.score >= 3 ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  ) : null
                }
              />
            )}
          </Form.Item>
          
          {signalRResult && (
            <Alert
              message="SignalR Result"
              description={
                <div>
                  {signalRResult.score !== undefined && (
                    <div>
                      <Text>Score: </Text>
                      <Tag color={getPasswordStrengthColor(signalRResult.level)}>
                        {signalRResult.level} ({signalRResult.score}/5)
                      </Tag>
                    </div>
                  )}
                  {signalRResult.details && (
                    <pre>{JSON.stringify(signalRResult.details, null, 2)}</pre>
                  )}
                  {signalRResult.suggestions && signalRResult.suggestions.length > 0 && (
                    <ul>
                      {signalRResult.suggestions.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              }
              type={signalRResult.isValid || signalRResult.score >= 3 ? "success" : "warning"}
            />
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <ApiOutlined /> REST API
            </span>
          }
          key="api"
        >
          <Form.Item
            label={`${title} - REST API`}
            validateStatus={
              isAPILoading ? 'validating' :
              apiResult ? (apiResult.isValid || apiResult.score >= 3 || apiResult.isAvailable ? 'success' : 'error') : ''
            }
            hasFeedback={isAPILoading}
          >
            <Space.Compact style={{ width: '100%' }}>
              {isPassword ? (
                <Input.Password
                  placeholder={placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              ) : (
                <Input
                  placeholder={placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  addonAfter={addonAfter}
                />
              )}
              <Button
                type="primary"
                onClick={handleAPI}
                loading={isAPILoading}
              >
                Validate
              </Button>
            </Space.Compact>
          </Form.Item>

          {apiResult && (
            <Alert
              message="API Result"
              description={
                <div>
                  <p><strong>Message:</strong> {apiResult.message}</p>
                  {apiResult.score !== undefined && (
                    <p>
                      <strong>Score:</strong>{' '}
                      <Tag color={getPasswordStrengthColor(apiResult.level)}>
                        {apiResult.level} ({apiResult.score}/5)
                      </Tag>
                    </p>
                  )}
                  {apiResult.formattedNumber && (
                    <p><strong>Formatted:</strong> {apiResult.formattedNumber}</p>
                  )}
                  {apiResult.carrier && (
                    <p><strong>Carrier:</strong> {apiResult.carrier}</p>
                  )}
                  {apiResult.suggestions && apiResult.suggestions.length > 0 && (
                    <div>
                      <strong>Suggestions:</strong>
                      <ul>
                        {apiResult.suggestions.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {apiResult.details && Object.keys(apiResult.details).length > 0 && (
                    <details>
                      <summary>Details</summary>
                      <pre>{JSON.stringify(apiResult.details, null, 2)}</pre>
                    </details>
                  )}
                </div>
              }
              type={apiResult.isValid || apiResult.score >= 3 || apiResult.isAvailable ? "success" : "warning"}
            />
          )}
        </TabPane>
      </Tabs>
    </Card>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={2}>Validation Test Page</Title>
      
      <Alert
        message={isConnected ? "SignalR Connected" : "SignalR Disconnected"}
        description={isConnected 
          ? "Real-time validation is active. Type in the fields to see instant validation." 
          : "SignalR is not connected. Using mock service for real-time validation."}
        type={isConnected ? "success" : "warning"}
        showIcon
        style={{ marginBottom: 24 }}
      />

      {error && (
        <Alert
          message="Validation Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          {renderValidationCard(
            "Email Validation",
            emailInput,
            setEmailInput,
            emailValidation,
            apiEmailResult,
            handleEmailChange,
            validateEmailViaAPI,
            isValidatingEmail,
            apiEmailLoading,
            "test@example.com"
          )}
        </Col>

        <Col xs={24} md={12}>
          {renderValidationCard(
            "Password Strength",
            passwordInput,
            setPasswordInput,
            passwordStrength,
            apiPasswordResult,
            handlePasswordChange,
            checkPasswordViaAPI,
            isValidatingPassword,
            apiPasswordLoading,
            "Enter a password",
            true
          )}
        </Col>

        <Col xs={24} md={12}>
          {renderValidationCard(
            "Domain Availability",
            domainInput,
            setDomainInput,
            domainCheck,
            apiDomainResult,
            handleDomainChange,
            checkDomainViaAPI,
            isValidatingDomain,
            apiDomainLoading,
            "mycompany",
            false,
            ".stocker.app"
          )}
        </Col>

        <Col xs={24} md={12}>
          {renderValidationCard(
            "Phone Validation",
            phoneInput,
            setPhoneInput,
            phoneValidation,
            apiPhoneResult,
            handlePhoneChange,
            validatePhoneViaAPI,
            isValidatingPhone,
            apiPhoneLoading,
            "+90 555 123 4567"
          )}
        </Col>

        <Col xs={24} md={12}>
          {renderValidationCard(
            "Company Name Validation",
            companyInput,
            setCompanyInput,
            companyNameCheck,
            apiCompanyResult,
            handleCompanyChange,
            checkCompanyViaAPI,
            isValidatingCompany,
            apiCompanyLoading,
            "ABC Technology Inc."
          )}
        </Col>

        <Col xs={24} md={12}>
          <Card title="TC Kimlik / Vergi No Validation">
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <Radio.Group 
                value={identityType} 
                onChange={(e) => {
                  setIdentityType(e.target.value);
                  setIdentityInput('');
                  setApiIdentityResult(null);
                }}
              >
                <Radio.Button value="tc">TC Kimlik No</Radio.Button>
                <Radio.Button value="vkn">Vergi No</Radio.Button>
              </Radio.Group>
            </Space>

            <Tabs defaultActiveKey="signalr">
              <TabPane
                tab={
                  <span>
                    <WifiOutlined /> SignalR (Real-time)
                  </span>
                }
                key="signalr"
              >
                <Form.Item
                  label={`${identityType === 'tc' ? 'TC Kimlik No' : 'Vergi No'} - SignalR`}
                  validateStatus={
                    isValidatingIdentity ? 'validating' :
                    identityValidation ? (identityValidation.isValid ? 'success' : 'error') : ''
                  }
                  hasFeedback={isValidatingIdentity || !!identityValidation}
                  help={identityValidation?.message}
                >
                  <Input
                    placeholder={identityType === 'tc' ? '11111111110' : '1234567890'}
                    value={identityInput}
                    onChange={(e) => {
                      setIdentityInput(e.target.value);
                      handleIdentityChange(e.target.value);
                    }}
                    maxLength={identityType === 'tc' ? 11 : 10}
                    prefix={<IdcardOutlined />}
                    suffix={
                      isValidatingIdentity ? <Spin indicator={<LoadingOutlined />} /> :
                      identityValidation ? (
                        identityValidation.isValid ? 
                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      ) : null
                    }
                  />
                </Form.Item>
                
                {identityValidation && (
                  <Alert
                    message="SignalR Result"
                    description={
                      <div>
                        <p><strong>Type:</strong> {identityValidation.numberType}</p>
                        <p><strong>Message:</strong> {identityValidation.message}</p>
                        {identityValidation.details && Object.keys(identityValidation.details).length > 0 && (
                          <details>
                            <summary>Details</summary>
                            <pre>{JSON.stringify(identityValidation.details, null, 2)}</pre>
                          </details>
                        )}
                      </div>
                    }
                    type={identityValidation.isValid ? "success" : "warning"}
                  />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <ApiOutlined /> REST API
                  </span>
                }
                key="api"
              >
                <Form.Item
                  label={`${identityType === 'tc' ? 'TC Kimlik No' : 'Vergi No'} - REST API`}
                  validateStatus={
                    apiIdentityLoading ? 'validating' :
                    apiIdentityResult ? (apiIdentityResult.isValid ? 'success' : 'error') : ''
                  }
                  hasFeedback={apiIdentityLoading}
                >
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      placeholder={identityType === 'tc' ? '11111111110' : '1234567890'}
                      value={identityInput}
                      onChange={(e) => setIdentityInput(e.target.value)}
                      maxLength={identityType === 'tc' ? 11 : 10}
                      prefix={<IdcardOutlined />}
                    />
                    <Button
                      type="primary"
                      onClick={validateIdentityViaAPI}
                      loading={apiIdentityLoading}
                    >
                      Validate
                    </Button>
                  </Space.Compact>
                </Form.Item>

                {apiIdentityResult && (
                  <Alert
                    message="API Result"
                    description={
                      <div>
                        <p><strong>Type:</strong> {apiIdentityResult.numberType}</p>
                        <p><strong>Message:</strong> {apiIdentityResult.message}</p>
                        {apiIdentityResult.formattedNumber && (
                          <p><strong>Formatted:</strong> {apiIdentityResult.formattedNumber}</p>
                        )}
                        {apiIdentityResult.details && Object.keys(apiIdentityResult.details).length > 0 && (
                          <details>
                            <summary>Details</summary>
                            <pre>{JSON.stringify(apiIdentityResult.details, null, 2)}</pre>
                          </details>
                        )}
                      </div>
                    }
                    type={apiIdentityResult.isValid ? "success" : "warning"}
                  />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Connection & API Information" style={{ marginTop: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={5}>SignalR Status</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Badge status={isConnected ? "success" : "error"} />
                <Text strong>Connection: </Text>
                <Text>{isConnected ? 'Connected' : 'Disconnected'}</Text>
              </Space>
              <Space>
                <Text strong>Validation Hub: </Text>
                <Text code>http://localhost:5104/hubs/validation</Text>
              </Space>
              <Space>
                <Text strong>Protocol: </Text>
                <Text>WebSockets / LongPolling</Text>
              </Space>
            </Space>
          </Col>
          
          <Col xs={24} md={12}>
            <Title level={5}>REST API Endpoints</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text code>POST /api/public/validate/email</Text>
              <Text code>POST /api/public/validate/phone</Text>
              <Text code>POST /api/public/validate/password-strength</Text>
              <Text code>POST /api/public/validate/domain</Text>
              <Text code>POST /api/public/validate/company-name</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title="Test Scenarios" style={{ marginTop: 24 }}>
        <Title level={5}>Try these test cases:</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Text strong>Email Tests:</Text>
            <ul>
              <li>Valid: test@example.com</li>
              <li>Typo: test@gmial.com</li>
              <li>Disposable: test@tempmail.com</li>
              <li>Invalid: test@</li>
            </ul>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Phone Tests (TR):</Text>
            <ul>
              <li>Valid: 5551234567</li>
              <li>With code: 905551234567</li>
              <li>Invalid: 1234567890</li>
              <li>Short: 555123</li>
            </ul>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Password Tests:</Text>
            <ul>
              <li>Weak: 123456</li>
              <li>Medium: Test123</li>
              <li>Strong: Test@123456</li>
              <li>Very Strong: MyP@ssw0rd!2024</li>
            </ul>
          </Col>
        </Row>
        <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
          <Col xs={24} md={8}>
            <Text strong>TC Kimlik No Tests:</Text>
            <ul>
              <li>Valid Test: 11111111110</li>
              <li>Valid Test: 10000000146</li>
              <li>Invalid: 12345678901</li>
              <li>Invalid: 00000000000</li>
            </ul>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Vergi No Tests:</Text>
            <ul>
              <li>Valid Test: 1234567890</li>
              <li>Invalid: 1111111111</li>
              <li>Invalid: 0000000000</li>
              <li>Short: 123456</li>
            </ul>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Company Name Tests:</Text>
            <ul>
              <li>Available: MyUniqueCompany</li>
              <li>Similar: Microsoft Tech</li>
              <li>Premium: DataCloud</li>
              <li>Short: AB</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};