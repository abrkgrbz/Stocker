# Payment Service Test Guide

## Overview
This guide provides instructions for testing the Iyzico payment integration in the Stocker application.

## 🚀 Quick Start

### 1. Prerequisites
- API running on localhost:5104
- Iyzico sandbox credentials configured in appsettings.Development.json
- Test mode enabled (`Payment:EnableTestMode: true`)

### 2. Test Endpoints

#### Check Test Status
```bash
GET http://localhost:5104/api/public/payment-test/status
```

#### Get Test Cards
```bash
GET http://localhost:5104/api/public/payment-test/test-cards
```

#### Process Test Payment
```bash
POST http://localhost:5104/api/public/payment-test/process
Content-Type: application/json

{
  "amount": 100.00,
  "testCardType": "success"
}
```

## 🧪 Testing Methods

### Method 1: Web Interface (Recommended)
1. Start the API: `dotnet run --project src/API/Stocker.API`
2. Open browser: http://localhost:5104/payment-test.html
3. Select a test card or enter card details manually
4. Click "Process Payment"
5. Test refund functionality if payment succeeds

### Method 2: API Testing with Postman/Insomnia

#### Step 1: Check Environment Status
```http
GET http://localhost:5104/api/public/payment-test/status
```

Expected Response:
```json
{
  "testModeEnabled": true,
  "environment": "Development",
  "iyzicoBaseUrl": "https://sandbox-api.iyzipay.com",
  "message": "Test mode is enabled. You can use test endpoints."
}
```

#### Step 2: Process a Test Payment
```http
POST http://localhost:5104/api/public/payment-test/process
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "TRY",
  "description": "Test Payment",
  "testCardType": "success"
}
```

#### Step 3: Test with Different Card Types
```http
POST http://localhost:5104/api/public/payment-test/process
Content-Type: application/json

{
  "amount": 50.00,
  "testCardType": "failure"  // Will simulate payment failure
}
```

### Method 3: Unit Tests
```bash
# Run payment service unit tests
dotnet test tests/Stocker.Infrastructure.Tests --filter "FullyQualifiedName~PaymentServiceTests"
```

## 🎯 Test Cards

| Card Type | Number | Description |
|-----------|--------|-------------|
| Success | 5528790000000008 | Master Card - Always succeeds |
| Success Visa | 4543590000000006 | Visa - Always succeeds |
| Failure | 5528790000000009 | Master Card - Always fails |
| 3D Required | 4543590000000014 | Visa - Requires 3D Secure |
| Insufficient Funds | 5528790000000016 | Master Card - Insufficient funds error |
| Invalid CVV | 5528790000000024 | Master Card - Invalid CVV error |
| Expired | 5528790000000032 | Master Card - Expired card error |

## 📝 Test Scenarios

### Scenario 1: Successful Payment
```json
{
  "amount": 100.00,
  "testCardType": "success"
}
```
Expected: Payment succeeds, returns paymentId and transactionId

### Scenario 2: Failed Payment
```json
{
  "amount": 100.00,
  "testCardType": "failure"
}
```
Expected: Payment fails with error message

### Scenario 3: Refund
1. First, make a successful payment and save the paymentId
2. Then, request a refund:
```json
{
  "paymentId": "{{saved_payment_id}}",
  "amount": 50.00
}
```
Expected: Partial refund succeeds

### Scenario 4: Full Custom Data
```json
{
  "amount": 250.00,
  "currency": "TRY",
  "description": "Custom Test Payment",
  "cardHolderName": "Test User",
  "cardNumber": "5528790000000008",
  "expiryMonth": "12",
  "expiryYear": "2030",
  "cvv": "123",
  "buyerName": "Test",
  "buyerSurname": "User",
  "buyerEmail": "test@example.com",
  "buyerPhone": "+905350000000",
  "buyerIdentityNumber": "74300864791",
  "buyerAddress": "Test Address",
  "buyerCity": "Istanbul"
}
```

## 🔒 Security Notes

### Test Environment Only
- Test endpoints are only available when `Payment:EnableTestMode` is `true`
- Never enable test mode in production
- Test credentials should never be used in production

### Iyzico Sandbox Credentials
The following are Iyzico's public sandbox credentials (safe to use for testing):
- API Key: `sandbox-afXhZPW0MQlE4dCUUlHcEopnMBgXnAZI`
- Secret Key: `sandbox-wbwpzKIiplZxI3hh5ALI4FJyAcZKL6kq`
- Base URL: `https://sandbox-api.iyzipay.com`

### Test Identity Number
For Turkish market testing, use: `74300864791`

## 🐛 Troubleshooting

### Issue: "Test mode is not enabled"
**Solution:** Set `Payment:EnableTestMode` to `true` in appsettings.Development.json

### Issue: Connection refused to API
**Solution:** 
1. Ensure API is running: `dotnet run --project src/API/Stocker.API`
2. Check port is 5104 in launchSettings.json
3. Check firewall settings

### Issue: Invalid card error with test card
**Solution:** 
1. Ensure you're using sandbox credentials
2. Use the exact test card numbers provided
3. Check that BaseUrl points to sandbox API

### Issue: CORS error in browser
**Solution:** 
1. Ensure CORS is configured in Program.cs
2. Use the correct origin in CORS policy
3. Try using the API directly without browser

## 📊 Payment Flow Diagram

```
User → PaymentTestController → PaymentService → Iyzico Sandbox API
                                      ↓
                              Process Payment
                                      ↓
                              Generate Auth Header
                                      ↓
                              Send HTTP Request
                                      ↓
                              Parse Response
                                      ↓
                              Return Result → User
```

## 🧩 Integration Points

### Controllers
- `/api/public/payment-test/*` - Test endpoints (anonymous access)
- `/api/master/payments/*` - Production endpoints (requires auth)

### Services
- `IPaymentService` - Main payment service interface
- `PaymentService` - Iyzico implementation

### DTOs
- `PaymentRequest` - Payment request data
- `PaymentResult` - Payment response data
- `PaymentStatus` - Payment status enum

## 📚 Additional Resources

- [Iyzico Test Cards Documentation](https://dev.iyzipay.com/tr/test-kartlari)
- [Iyzico API Documentation](https://dev.iyzipay.com/tr/api)
- [Iyzico Sandbox Environment](https://sandbox-merchant.iyzipay.com)

## 💡 Tips

1. **Always test with different card types** to ensure error handling works
2. **Save successful payment IDs** for testing refunds and status checks
3. **Use the web interface** for visual testing and quick iterations
4. **Check logs** for detailed error messages and API communication
5. **Test partial refunds** to ensure amount calculations work correctly

## 🔄 Next Steps

After successful testing:
1. Configure production Iyzico credentials
2. Implement payment webhook handlers
3. Add payment history storage to database
4. Implement recurring payment support
5. Add more payment methods (BKM Express, PayPal, etc.)