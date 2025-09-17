# Stocker API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Structure](#api-structure)
4. [Endpoints](#endpoints)
5. [Request/Response Models](#requestresponse-models)
6. [Error Handling](#error-handling)

## Overview

The Stocker API is a RESTful web service built with ASP.NET Core that provides comprehensive business management functionality. The API is organized into multiple modules supporting multi-tenant architecture with master administration capabilities.

### Base URL
```
Production: https://api.stocker.com
Development: https://localhost:5001
```

### API Version
Current Version: v1

## Authentication

The API uses JWT Bearer token authentication with refresh token support.

### Authentication Types

1. **Public Endpoints** - No authentication required (marked with `[AllowAnonymous]`)
2. **Tenant User Authentication** - Standard JWT Bearer token (marked with `[Authorize]`)
3. **Master Admin Authentication** - Special admin privileges required
4. **Tenant-Specific Authentication** - Requires valid tenant context

### Authentication Flow

1. **Login**: POST to `/api/auth/login` with credentials
2. **Receive**: JWT access token and refresh token
3. **Use**: Include token in Authorization header: `Bearer {token}`
4. **Refresh**: POST to `/api/auth/refresh-token` when token expires

## API Structure

The API is organized into the following main sections:

### 1. Public APIs (`/api/public/*`)
- No authentication required
- Tenant registration and validation
- Public information endpoints

### 2. Authentication APIs (`/api/auth/*`)
- User authentication and registration
- Email verification
- Token management

### 3. Tenant APIs (`/api/tenant/*`)
- Tenant-specific operations
- Requires tenant context and authentication
- Company, user, and module management

### 4. Master APIs (`/api/master/*`)
- Master admin operations
- System-wide management
- Analytics and monitoring

### 5. Admin APIs (`/api/admin/*`)
- Administrative operations
- Logs and migrations
- System maintenance

## Endpoints

### Authentication Endpoints

#### **POST** `/api/auth/login`
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "tenantCode": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": {
    "id": "guid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "tenantId": "guid"
  }
}
```

#### **POST** `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "tenantCode": "string"
}
```

#### **POST** `/api/auth/refresh-token`
Refresh an expired access token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

#### **POST** `/api/auth/logout`
Logout and invalidate refresh token.
- **Authorization:** Required

#### **POST** `/api/auth/verify-email`
Verify email address with verification token.

**Request Body:**
```json
{
  "token": "string",
  "email": "string"
}
```

#### **POST** `/api/auth/resend-verification-email`
Resend email verification link.

**Request Body:**
```json
{
  "email": "string"
}
```

### Public Endpoints

#### **GET** `/api/public/tenants/check/{tenantCode}`
Check if a tenant code is available.

**Response:**
```json
{
  "isValid": true,
  "message": "string"
}
```

#### **POST** `/api/public/tenant-registration/register`
Register a new tenant.

**Request Body:**
```json
{
  "companyName": "string",
  "tenantCode": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "address": "string",
  "city": "string",
  "country": "string",
  "postalCode": "string",
  "selectedPackageId": "guid",
  "selectedModules": ["guid"]
}
```

#### **POST** `/api/public/validate/email`
Validate email format and availability.

**Request Body:**
```json
{
  "email": "string"
}
```

#### **POST** `/api/public/validate/tenant-code`
Validate tenant code format and availability.

**Request Body:**
```json
{
  "tenantCode": "string"
}
```

### Tenant Management Endpoints

#### **GET** `/api/tenant/dashboard`
Get tenant dashboard data.
- **Authorization:** Required

**Response:**
```json
{
  "statistics": {
    "totalUsers": 0,
    "activeUsers": 0,
    "totalRevenue": 0,
    "pendingTasks": 0
  },
  "revenueChart": [{
    "month": "string",
    "revenue": 0
  }],
  "recentActivities": [{
    "id": "guid",
    "description": "string",
    "timestamp": "datetime",
    "type": "string"
  }],
  "notifications": [{
    "id": "guid",
    "message": "string",
    "type": "string",
    "isRead": false,
    "createdAt": "datetime"
  }]
}
```

#### **GET** `/api/tenant/modules`
Get available modules for the tenant.
- **Authorization:** Required

**Response:**
```json
{
  "modules": [{
    "id": "guid",
    "name": "string",
    "description": "string",
    "isActive": true,
    "features": ["string"],
    "permissions": ["string"]
  }]
}
```

#### **POST** `/api/tenant/modules/toggle`
Toggle module activation status.
- **Authorization:** Required

**Request Body:**
```json
{
  "moduleId": "guid",
  "isActive": true
}
```

#### **GET** `/api/tenant/settings`
Get tenant settings.
- **Authorization:** Required

**Response:**
```json
{
  "categories": [{
    "id": "guid",
    "name": "string",
    "settings": [{
      "key": "string",
      "value": "string",
      "type": "string",
      "description": "string",
      "isEditable": true
    }]
  }]
}
```

#### **POST** `/api/tenant/settings/update`
Update tenant settings.
- **Authorization:** Required

**Request Body:**
```json
{
  "settings": [{
    "key": "string",
    "value": "string"
  }]
}
```

#### **GET** `/api/tenant/users`
Get list of tenant users.
- **Authorization:** Required

**Query Parameters:**
- `pageNumber` (int): Page number (default: 1)
- `pageSize` (int): Items per page (default: 10)
- `searchTerm` (string): Search filter
- `sortBy` (string): Sort field
- `sortOrder` (string): asc/desc

**Response:**
```json
{
  "items": [{
    "id": "guid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "isActive": true,
    "roles": ["string"],
    "createdDate": "datetime",
    "lastLoginDate": "datetime"
  }],
  "totalCount": 0,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

#### **POST** `/api/tenant/users/create`
Create a new tenant user.
- **Authorization:** Required

**Request Body:**
```json
{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "password": "string",
  "roles": ["string"]
}
```

#### **POST** `/api/tenant/companies/create`
Create a company profile for the tenant.
- **Authorization:** Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "address": "string",
  "city": "string",
  "country": "string",
  "postalCode": "string",
  "phone": "string",
  "email": "string",
  "website": "string",
  "taxNumber": "string"
}
```

### Master Admin Endpoints

#### **POST** `/api/master/auth/login`
Master admin authentication.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

#### **GET** `/api/master/dashboard`
Get master dashboard statistics.
- **Authorization:** Master Admin Required

**Response:**
```json
{
  "statistics": {
    "totalTenants": 0,
    "activeTenants": 0,
    "totalUsers": 0,
    "totalRevenue": 0,
    "monthlyRevenue": 0,
    "yearlyRevenue": 0
  },
  "tenantGrowth": [{
    "month": "string",
    "count": 0
  }],
  "revenueReport": [{
    "month": "string",
    "amount": 0
  }],
  "topTenants": [{
    "id": "guid",
    "name": "string",
    "revenue": 0,
    "userCount": 0
  }],
  "subscriptionMetrics": {
    "active": 0,
    "trial": 0,
    "expired": 0,
    "cancelled": 0
  }
}
```

#### **GET** `/api/master/tenants`
Get list of all tenants.
- **Authorization:** Master Admin Required

**Query Parameters:**
- `pageNumber` (int): Page number
- `pageSize` (int): Items per page
- `searchTerm` (string): Search filter
- `status` (string): Filter by status

**Response:**
```json
{
  "items": [{
    "id": "guid",
    "name": "string",
    "code": "string",
    "status": "string",
    "createdDate": "datetime",
    "userCount": 0,
    "subscriptionStatus": "string",
    "revenue": 0
  }],
  "totalCount": 0,
  "pageNumber": 1,
  "pageSize": 10
}
```

#### **POST** `/api/master/tenants/create`
Create a new tenant.
- **Authorization:** Master Admin Required

**Request Body:**
```json
{
  "name": "string",
  "code": "string",
  "adminEmail": "string",
  "adminFirstName": "string",
  "adminLastName": "string",
  "packageId": "guid",
  "modules": ["guid"]
}
```

#### **GET** `/api/master/packages`
Get available subscription packages.
- **Authorization:** Master Admin Required

**Response:**
```json
{
  "packages": [{
    "id": "guid",
    "name": "string",
    "description": "string",
    "price": 0,
    "currency": "string",
    "features": ["string"],
    "maxUsers": 0,
    "maxStorage": 0,
    "isActive": true
  }]
}
```

#### **POST** `/api/master/packages/create`
Create a new subscription package.
- **Authorization:** Master Admin Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": 0,
  "currency": "string",
  "features": ["string"],
  "maxUsers": 0,
  "maxStorage": 0,
  "modules": ["guid"]
}
```

#### **GET** `/api/master/subscriptions`
Get all subscriptions.
- **Authorization:** Master Admin Required

**Response:**
```json
{
  "subscriptions": [{
    "id": "guid",
    "tenantId": "guid",
    "tenantName": "string",
    "packageId": "guid",
    "packageName": "string",
    "status": "string",
    "startDate": "datetime",
    "endDate": "datetime",
    "amount": 0,
    "paymentStatus": "string"
  }]
}
```

#### **POST** `/api/master/subscriptions/create`
Create a new subscription.
- **Authorization:** Master Admin Required

**Request Body:**
```json
{
  "tenantId": "guid",
  "packageId": "guid",
  "startDate": "datetime",
  "endDate": "datetime",
  "paymentMethod": "string"
}
```

### Invoice Management Endpoints

#### **GET** `/api/tenants/{tenantId}/invoices`
Get tenant invoices.
- **Authorization:** Required

**Response:**
```json
{
  "invoices": [{
    "id": "guid",
    "invoiceNumber": "string",
    "date": "datetime",
    "dueDate": "datetime",
    "totalAmount": 0,
    "status": "string",
    "items": [{
      "description": "string",
      "quantity": 0,
      "unitPrice": 0,
      "total": 0
    }]
  }]
}
```

#### **POST** `/api/tenants/{tenantId}/invoices/create`
Create a new invoice.
- **Authorization:** Required

**Request Body:**
```json
{
  "customerId": "guid",
  "dueDate": "datetime",
  "items": [{
    "description": "string",
    "quantity": 0,
    "unitPrice": 0
  }],
  "notes": "string"
}
```

### Customer Management Endpoints

#### **GET** `/api/tenants/{tenantId}/customers`
Get tenant customers.
- **Authorization:** Required

**Response:**
```json
{
  "customers": [{
    "id": "guid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "country": "string",
    "totalPurchases": 0,
    "outstandingBalance": 0,
    "createdDate": "datetime"
  }]
}
```

#### **POST** `/api/tenants/{tenantId}/customers/create`
Create a new customer.
- **Authorization:** Required

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "country": "string",
  "postalCode": "string",
  "taxNumber": "string"
}
```

### Health Check Endpoint

#### **GET** `/health`
API health check endpoint.

**Response:**
```json
{
  "status": "Healthy",
  "timestamp": "datetime",
  "services": {
    "database": "Healthy",
    "cache": "Healthy",
    "storage": "Healthy"
  }
}
```

## Request/Response Models

### Common DTOs

#### AuditableDto
Base class for all auditable entities.
```csharp
public class AuditableDto
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
    public string CreatedBy { get; set; }
    public DateTime? ModifiedDate { get; set; }
    public string ModifiedBy { get; set; }
}
```

#### PagedResult<T>
Generic paged result wrapper.
```csharp
public class PagedResult<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
```

#### ApiResponse<T>
Standard API response wrapper.
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<string> Errors { get; set; }
}
```

### Authentication Models

#### LoginCommand
```csharp
public class LoginCommand
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string TenantCode { get; set; }
}
```

#### RegisterCommand
```csharp
public class RegisterCommand
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public string TenantCode { get; set; }
}
```

#### AuthTokenDto
```csharp
public class AuthTokenDto
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public int ExpiresIn { get; set; }
    public string TokenType { get; set; }
    public UserDto User { get; set; }
}
```

### Tenant Models

#### TenantDto
```csharp
public class TenantDto : AuditableDto
{
    public string Name { get; set; }
    public string Code { get; set; }
    public string Status { get; set; }
    public string ConnectionString { get; set; }
    public TenantSettingsDto Settings { get; set; }
    public List<ModuleDto> Modules { get; set; }
}
```

#### TenantRegistrationDto
```csharp
public class TenantRegistrationDto
{
    public string CompanyName { get; set; }
    public string TenantCode { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public AddressDto Address { get; set; }
    public Guid SelectedPackageId { get; set; }
    public List<Guid> SelectedModules { get; set; }
}
```

### Dashboard Models

#### DashboardStatisticsDto
```csharp
public class DashboardStatisticsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingTasks { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal YearlyRevenue { get; set; }
}
```

#### ActivityDto
```csharp
public class ActivityDto
{
    public Guid Id { get; set; }
    public string Description { get; set; }
    public DateTime Timestamp { get; set; }
    public string Type { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
}
```

### Module Models

#### ModuleDto
```csharp
public class ModuleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
    public List<string> Features { get; set; }
    public List<string> Permissions { get; set; }
    public decimal Price { get; set; }
}
```

### Package Models

#### PackageDto
```csharp
public class PackageDto : AuditableDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public List<string> Features { get; set; }
    public int MaxUsers { get; set; }
    public long MaxStorage { get; set; }
    public bool IsActive { get; set; }
    public List<ModuleDto> IncludedModules { get; set; }
}
```

### Invoice Models

#### InvoiceDto
```csharp
public class InvoiceDto : AuditableDto
{
    public string InvoiceNumber { get; set; }
    public DateTime Date { get; set; }
    public DateTime DueDate { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; }
    public List<InvoiceItemDto> Items { get; set; }
    public string Notes { get; set; }
}
```

#### InvoiceItemDto
```csharp
public class InvoiceItemDto
{
    public Guid Id { get; set; }
    public string Description { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
}
```

## Error Handling

The API uses standard HTTP status codes and returns structured error responses.

### Status Codes

- **200 OK** - Request succeeded
- **201 Created** - Resource created successfully
- **204 No Content** - Request succeeded with no content to return
- **400 Bad Request** - Invalid request parameters
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict (e.g., duplicate)
- **422 Unprocessable Entity** - Validation errors
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "traceId": "guid-for-tracking"
}
```

### Validation Error Response

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Email": ["Email is required", "Invalid email format"],
    "Password": ["Password must be at least 8 characters"]
  },
  "traceId": "0HN4JQGHEPO3M:00000001"
}
```

## Rate Limiting

API endpoints implement rate limiting to prevent abuse:

- **Anonymous endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Master admin endpoints**: 5000 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: UTC timestamp when limit resets

## CORS Configuration

The API supports CORS with the following configuration:

- **Allowed Origins**: Configured per environment
- **Allowed Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Tenant-Id
- **Exposed Headers**: X-Total-Count, X-Page-Number
- **Max Age**: 3600 seconds

## Versioning

The API uses URL path versioning. Current version is v1.

Future versions will be accessible at:
- `/api/v2/[endpoint]`
- `/api/v3/[endpoint]`

## Security Considerations

1. **JWT Token Security**
   - Tokens expire after 1 hour
   - Refresh tokens expire after 7 days
   - Tokens should be stored securely (HttpOnly cookies recommended)

2. **Input Validation**
   - All inputs are validated and sanitized
   - SQL injection protection via parameterized queries
   - XSS protection via input encoding

3. **Rate Limiting**
   - Prevents brute force attacks
   - DDoS protection

4. **Audit Logging**
   - All API calls are logged
   - Sensitive data is masked in logs

5. **HTTPS Only**
   - All production traffic must use HTTPS
   - HTTP Strict Transport Security (HSTS) enabled

## Development Tools

### Swagger/OpenAPI
Available at `/swagger` in development environment.

### Health Check UI
Available at `/health-ui` for monitoring service health.

### API Testing
Postman collection available in `/docs/postman/`

## Support

For API support and questions:
- Documentation: https://docs.stocker.com/api
- Email: api-support@stocker.com
- GitHub: https://github.com/stocker/api-issues

---

*Last Updated: December 2024*
*API Version: 1.0.0*