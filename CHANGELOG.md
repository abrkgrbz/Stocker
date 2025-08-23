# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 23 Aralık 2024

### Added
- **Hangfire Background Job System**
  - Complete background job processing infrastructure
  - Email queue with retry mechanism (critical/default/low priorities)
  - Tenant provisioning background jobs
  - Hangfire Dashboard at `/hangfire` endpoint with authentication
  - Background job interfaces in Application layer (Clean Architecture)
  - Automatic retry policies with exponential backoff
  - 3 queue priorities: critical, default, low
  - 32 worker threads for parallel processing

- **Documentation System**
  - CLAUDE.md for AI assistant context
  - PROJECT_STATUS.md for project tracking
  - .claude/project_context.md for quick reference

- **Database Infrastructure**
  - Fresh database migrations for Master and Tenant databases
  - Automatic migration on application startup
  - Seed data with default admin users
  - Hangfire tables automatic creation

### Changed
- Email sending moved from synchronous to asynchronous processing
- User registration now uses background jobs for emails
- Tenant provisioning now runs as background job
- Migration files recreated from scratch for clean structure

### Fixed
- Database migration issues resolved
- Build errors in RegisterCommandHandler fixed
- Clean Architecture violation fixed (moved interfaces to Application layer)

### Security
- Admin default credentials configured:
  - System Admin: `admin@stocker.com` / `Admin123!`
  - Tenant Admin: `admin@tenant.local` / `Admin123!`
- Hangfire Dashboard secured with authorization filter

### Technical Details
- Added Hangfire.Core v1.8.21
- Added Hangfire.SqlServer v1.8.21
- Added Hangfire.AspNetCore v1.8.21
- Created IBackgroundJobService interface
- Created IEmailBackgroundJob interface
- Created ITenantProvisioningJob interface
- Implemented HangfireBackgroundJobService
- Implemented EmailBackgroundJob with retry policies
- Implemented TenantProvisioningJob with concurrency control

### Infrastructure
- **Completed Components**:
  - ✅ Database migrations and seed data
  - ✅ Admin user creation with defaults
  - ✅ Email template system with fallbacks
  - ✅ Serilog monitoring and file logging
  - ✅ API rate limiting (Global: 100/min, Auth: 5/min, API: 60/min)
  - ✅ Hangfire integration with SQL Server storage

### Known Issues
- Backup strategy not implemented
- Load testing scenarios missing
- Security audit pending
- Frontend optimizations needed (code splitting, PWA, dark mode)

## [1.0.0] - 21 Aralık 2024

### Initial Production Release
- Multi-tenant architecture
- User authentication & authorization
- Email service integration
- Turkish localization
- Rate limiting
- Security headers
- CORS configuration
- Health check endpoints

### Known Issues
- Database migration pending
- Admin user seed data missing
- Login functionality blocked due to missing migrations