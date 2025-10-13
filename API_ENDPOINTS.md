# Stocker API Endpoints Documentation

Base URL: `https://api.stoocker.app`

## Authentication & Authorization
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user/tenant
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-verification-email` - Resend verification email
- `POST /api/auth/check-email` - Check if email is available
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/validate-reset-token` - Validate password reset token
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/setup-2fa` - Setup two-factor authentication
- `POST /api/auth/enable-2fa` - Enable 2FA
- `POST /api/auth/verify-2fa` - Verify 2FA code
- `POST /api/auth/disable-2fa` - Disable 2FA
- `GET /api/auth/test-seq` - Test Seq logging

## Public Endpoints (No Auth Required)
- `GET /api/public/packages` - Get available packages
- `GET /api/public/packages?OnlyActive=true` - Get only active packages
- `GET /api/public/features` - Get available features
- `GET /api/public/modules` - Get available modules
- `GET /api/public/check-company-code/{code}` - Check company code availability
- `POST /api/public/validate-company-code` - Validate company code via SignalR
- `POST /api/public/validate-email` - Validate email via SignalR
- `POST /api/public/validate-identity-number` - Validate identity number via SignalR
- `POST /api/public/validate-phone` - Validate phone number via SignalR

## Secure Auth (2FA)
- `POST /api/secureauth/login` - Login with 2FA
- `POST /api/secureauth/verify-2fa` - Verify 2FA during login
- `POST /api/secureauth/resend-2fa` - Resend 2FA code
- `GET /api/secureauth/generate-backup-codes` - Generate backup codes
- `POST /api/secureauth/use-backup-code` - Use backup code for 2FA

## Account Management
- `GET /api/account/profile` - Get user profile
- `PUT /api/account/profile` - Update user profile
- `POST /api/account/change-password` - Change password
- `GET /api/account/activity-log` - Get user activity log
- `POST /api/account/profile-image` - Upload profile image

## Health Checks
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check (admin only)
- `GET /api/health/ready` - Readiness check
- `GET /api/health/live` - Liveness check

## Master Admin Endpoints

### User Management
- `GET /api/master/users` - List all users
- `GET /api/master/users/{id}` - Get user by ID
- `POST /api/master/users` - Create user
- `PUT /api/master/users/{id}` - Update user
- `DELETE /api/master/users/{id}` - Delete user
- `POST /api/master/users/{id}/reset-password` - Admin reset user password
- `POST /api/master/users/{id}/toggle-active` - Toggle user active status
- `GET /api/master/users/roles` - Get available roles

### Tenant Management
- `GET /api/master/tenants` - List all tenants
- `GET /api/master/tenants/{id}` - Get tenant by ID
- `POST /api/master/tenants` - Create tenant
- `PUT /api/master/tenants/{id}` - Update tenant
- `DELETE /api/master/tenants/{id}` - Delete tenant
- `POST /api/master/tenants/{id}/toggle-active` - Toggle tenant active status
- `GET /api/master/tenants/{id}/users` - Get tenant users
- `GET /api/master/tenants/{id}/subscription` - Get tenant subscription
- `POST /api/master/tenants/{id}/extend-trial` - Extend trial period
- `POST /api/master/tenants/{id}/change-package` - Change tenant package

### Package Management
- `GET /api/master/packages` - List all packages
- `GET /api/master/packages/{id}` - Get package by ID
- `POST /api/master/packages` - Create package
- `PUT /api/master/packages/{id}` - Update package
- `DELETE /api/master/packages/{id}` - Delete package
- `POST /api/master/packages/{id}/toggle-active` - Toggle package active status
- `GET /api/master/packages/{id}/tenants` - Get tenants using package

### Feature Management
- `GET /api/master/features` - List all features
- `GET /api/master/features/{id}` - Get feature by ID
- `POST /api/master/features` - Create feature
- `PUT /api/master/features/{id}` - Update feature
- `DELETE /api/master/features/{id}` - Delete feature
- `POST /api/master/features/{id}/toggle-active` - Toggle feature active status

### Module Management
- `GET /api/master/modules` - List all modules
- `GET /api/master/modules/{id}` - Get module by ID
- `POST /api/master/modules` - Create module
- `PUT /api/master/modules/{id}` - Update module
- `DELETE /api/master/modules/{id}` - Delete module
- `POST /api/master/modules/{id}/toggle-active` - Toggle module active status
- `GET /api/master/modules/{id}/features` - Get module features
- `POST /api/master/modules/{id}/features` - Add feature to module
- `DELETE /api/master/modules/{id}/features/{featureId}` - Remove feature from module

### Subscription Management
- `GET /api/master/subscriptions` - List all subscriptions
- `GET /api/master/subscriptions/{id}` - Get subscription by ID
- `POST /api/master/subscriptions/{id}/cancel` - Cancel subscription
- `POST /api/master/subscriptions/{id}/renew` - Renew subscription
- `GET /api/master/subscriptions/expiring` - Get expiring subscriptions
- `GET /api/master/subscriptions/trial-ending` - Get trial ending subscriptions

### Dashboard & Reports
- `GET /api/master/dashboard` - Master dashboard statistics
- `GET /api/master/dashboard/revenue` - Revenue reports
- `GET /api/master/dashboard/growth` - Growth metrics
- `GET /api/master/dashboard/usage` - Usage statistics
- `GET /api/master/reports/tenants` - Tenant reports
- `GET /api/master/reports/users` - User reports
- `GET /api/master/reports/subscriptions` - Subscription reports

## Tenant-Specific Endpoints

### Customer Management
- `GET /api/tenants/{tenantId}/customers` - List customers
- `GET /api/tenants/{tenantId}/customers/{id}` - Get customer by ID
- `POST /api/tenants/{tenantId}/customers` - Create customer
- `PUT /api/tenants/{tenantId}/customers/{id}` - Update customer
- `DELETE /api/tenants/{tenantId}/customers/{id}` - Delete customer

### Invoice Management
- `GET /api/tenants/{tenantId}/invoices` - List invoices
- `GET /api/tenants/{tenantId}/invoices/{id}` - Get invoice by ID
- `POST /api/tenants/{tenantId}/invoices` - Create invoice
- `PUT /api/tenants/{tenantId}/invoices/{id}` - Update invoice
- `DELETE /api/tenants/{tenantId}/invoices/{id}` - Delete invoice
- `POST /api/tenants/{tenantId}/invoices/{id}/send` - Send invoice
- `POST /api/tenants/{tenantId}/invoices/{id}/mark-as-paid` - Mark as paid
- `POST /api/tenants/{tenantId}/invoices/{id}/cancel` - Cancel invoice
- `GET /api/tenants/{tenantId}/invoices/{id}/pdf` - Get invoice PDF
- `POST /api/tenants/{tenantId}/invoices/{id}/email` - Send invoice by email
- `GET /api/tenants/{tenantId}/invoices/{id}/payment-history` - Get payment history
- `POST /api/tenants/{tenantId}/invoices/{id}/clone` - Clone invoice
- `POST /api/tenants/{tenantId}/invoices/{id}/convert-to-recurring` - Convert to recurring

### Product Management
- `GET /api/tenants/{tenantId}/products` - List products
- `GET /api/tenants/{tenantId}/products/{id}` - Get product by ID
- `POST /api/tenants/{tenantId}/products` - Create product
- `PUT /api/tenants/{tenantId}/products/{id}` - Update product
- `DELETE /api/tenants/{tenantId}/products/{id}` - Delete product
- `POST /api/tenants/{tenantId}/products/{id}/toggle-active` - Toggle product active status
- `GET /api/tenants/{tenantId}/products/categories` - Get product categories
- `POST /api/tenants/{tenantId}/products/categories` - Create product category

### Stock Management
- `GET /api/tenants/{tenantId}/stocks` - Get stock levels
- `GET /api/tenants/{tenantId}/stocks/{productId}` - Get product stock
- `POST /api/tenants/{tenantId}/stocks/adjust` - Adjust stock level
- `GET /api/tenants/{tenantId}/stocks/movements` - Get stock movements
- `GET /api/tenants/{tenantId}/stocks/low-stock` - Get low stock alerts
- `POST /api/tenants/{tenantId}/stocks/transfer` - Transfer stock between warehouses

### Warehouse Management
- `GET /api/tenants/{tenantId}/warehouses` - List warehouses
- `GET /api/tenants/{tenantId}/warehouses/{id}` - Get warehouse by ID
- `POST /api/tenants/{tenantId}/warehouses` - Create warehouse
- `PUT /api/tenants/{tenantId}/warehouses/{id}` - Update warehouse
- `DELETE /api/tenants/{tenantId}/warehouses/{id}` - Delete warehouse

### Reports
- `GET /api/tenants/{tenantId}/reports/sales` - Sales reports
- `GET /api/tenants/{tenantId}/reports/inventory` - Inventory reports
- `GET /api/tenants/{tenantId}/reports/customers` - Customer reports
- `GET /api/tenants/{tenantId}/reports/financial` - Financial reports
- `GET /api/tenants/{tenantId}/reports/dashboard` - Dashboard summary

### Settings
- `GET /api/tenants/{tenantId}/settings` - Get tenant settings
- `PUT /api/tenants/{tenantId}/settings` - Update tenant settings
- `GET /api/tenants/{tenantId}/settings/invoice` - Get invoice settings
- `PUT /api/tenants/{tenantId}/settings/invoice` - Update invoice settings
- `GET /api/tenants/{tenantId}/settings/email` - Get email settings
- `PUT /api/tenants/{tenantId}/settings/email` - Update email settings

## Admin Endpoints

### Tenant Migration
- `POST /api/admin/tenant-migration/{tenantId}/migrate` - Migrate single tenant
- `POST /api/admin/tenant-migration/migrate-all` - Migrate all tenants

### Tenant Modules
- `POST /api/admin/tenant-modules/{tenantId}/crm/enable` - Enable CRM module
- `POST /api/admin/tenant-modules/{tenantId}/crm/disable` - Disable CRM module
- `GET /api/admin/tenant-modules/{tenantId}/crm/status` - Get CRM module status

### Logs
- `GET /api/admin/logs/recent` - Get recent logs
- `GET /api/admin/logs/files` - List log files
- `GET /api/admin/logs/files/{fileName}` - Download log file
- `GET /api/admin/logs/files/{fileName}/content` - View log file content
- `GET /api/admin/logs/stats` - Get log statistics
- `DELETE /api/admin/logs/clear` - Clear logs (master admin only)

## WebSocket/SignalR Hubs
- `/hubs/validation` - Real-time validation hub
  - Methods: ValidateCompanyCode, ValidateEmail, ValidateIdentityNumber, ValidatePhone
- `/hubs/notification` - Real-time notifications
- `/hubs/sync` - Data synchronization hub

## Notes
- All endpoints except Public and Health require JWT authentication
- Master endpoints require admin role
- Tenant endpoints require tenant membership
- Use `Authorization: Bearer {token}` header for authenticated requests
- All dates should be in ISO 8601 format
- Pagination parameters: `page`, `pageSize`, `sortBy`, `sortOrder`
- Filter parameters vary by endpoint
- Response format: `{ success: boolean, data: any, message?: string, errors?: string[] }`