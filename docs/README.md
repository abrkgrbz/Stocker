# 📚 Stocker Documentation

Welcome to the Stocker project documentation. Stocker is a comprehensive multi-tenant ERP system with modular architecture, built with modern technologies and best practices.

## 📁 Documentation Structure

### [01 - Architecture](./01-architecture/)
System design, database architecture, and API documentation.

- **[Database Architecture](./01-architecture/DATABASE_ARCHITECTURE.md)** - Multi-tenant database design and structure
- **[Database Tables Deployment](./01-architecture/DATABASE_TABLES_DEPLOYMENT.md)** - Table deployment strategies and scripts
- **[Master DB Analysis](./01-architecture/MASTER_DB_ANALYSIS.md)** - Master database structure and relationships
- **[API Documentation](./01-architecture/API_DOCUMENTATION.md)** - Complete API endpoints and usage

### [02 - Security](./02-security/)
Security implementations, authentication, and secret management.

- **[Azure Key Vault Setup](./02-security/AZURE_KEY_VAULT_SETUP.md)** ⭐ - Complete guide for Azure Key Vault integration
- **[Secret Management](./02-security/SECRET_MANAGEMENT.md)** - Secret handling and best practices
- **[Audit Logging](./02-security/audit-logging-implementation-summary.md)** - Audit trail implementation details

### [03 - Testing](./03-testing/)
Test coverage, testing strategies, and guides.

- **[Coverage Report](./03-testing/COVERAGE_REPORT.md)** - Current test coverage statistics
- **[Coverage Improvement Plan](./03-testing/COVERAGE_IMPROVEMENT_PLAN.md)** - Strategy to improve test coverage
- **[Test Coverage Strategy](./03-testing/TEST_COVERAGE_STRATEGY.md)** - Overall testing approach
- **[Payment Test Guide](./03-testing/PAYMENT_TEST_GUIDE.md)** - Payment system testing instructions

### [04 - Infrastructure](./04-infrastructure/)
Deployment, monitoring, and infrastructure configuration.

- **[Production Readiness Checklist](./04-infrastructure/PRODUCTION_READINESS_CHECKLIST.md)** 🚀 - Pre-deployment checklist
- **[Coolify Deployment](./04-infrastructure/COOLIFY-DEPLOYMENT.md)** - Coolify deployment guide
- **[Coolify Monitoring](./04-infrastructure/COOLIFY-MONITORING.md)** - Monitoring setup with Coolify
- **[Hangfire Integration](./04-infrastructure/HANGFIRE_INTEGRATION.md)** - Background job processing
- **[SignalR Deployment](./04-infrastructure/signalr-validation-deployment.md)** - Real-time communication setup

### [05 - Features](./05-features/)
Feature-specific documentation and guides.

- **[Tenant Health Check](./05-features/TenantHealthCheck-Implementation-Guide.md)** - Multi-tenant health monitoring
- **[CRM Module](./05-features/)** - CRM feature documentation

## 🚀 Quick Start

### Development Setup
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Configure environment variables
4. Run `docker-compose up -d`

### Technology Stack
- **Backend**: ASP.NET Core 8.0 API
- **Frontend**: Next.js 14 with TypeScript
- **Database**: SQL Server 2022
- **Container**: Docker & Docker Compose
- **Secret Management**: Azure Key Vault
- **Deployment**: Coolify

### Service Ports
- **API**: Port 5000
- **Web App (Next.js)**: Port 3000
- **Database**: Port 1433
- **Seq (Logging)**: Port 5341
- **RabbitMQ**: Port 5672/15672
- **Redis**: Port 6379

## 📊 Project Status

| Component | Status | Coverage |
|-----------|--------|----------|
| Azure Key Vault | ✅ Integrated | 100% |
| Multi-tenant | ✅ Implemented | 100% |
| CRM Module | 🔄 Active Development | 70% |
| Audit Logging | ✅ Deployed | 100% |
| Test Coverage | 🔄 Improving | ~40% |
| Production Ready | ✅ Ready | 95% |

## 🔐 Security Features

- ✅ Azure Key Vault for secret management
- ✅ JWT authentication with refresh tokens
- ✅ Multi-tenant isolation
- ✅ Audit logging for all operations
- ✅ Rate limiting per tenant
- ✅ CORS configuration
- ✅ Security headers

## 🔗 Important Links

- **Project Roadmap**: [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md)
- **GitHub Repository**: [github.com/abrkgrbz/Stocker](https://github.com/abrkgrbz/Stocker)
- **API Documentation**: [api.stoocker.app/swagger](https://api.stoocker.app/swagger)
- **Application**: [stoocker.app](https://stoocker.app)

## 📝 Documentation Standards

- Use **Markdown** for all documentation
- Include **table of contents** for long documents
- Add **date stamps** for version tracking
- Use **code examples** where applicable
- Keep documentation **up-to-date** with code changes
- Follow the **folder structure** for organization

## 🤝 Contributing

When adding new documentation:
1. Place it in the appropriate category folder
2. Update this README with a link
3. Follow the naming convention: `FEATURE_NAME.md`
4. Include a header with purpose and last updated date

## 📞 Support

For issues and questions:
- Check the relevant documentation section
- Review the [Production Checklist](./04-infrastructure/PRODUCTION_READINESS_CHECKLIST.md)
- Create an issue in the [GitHub repository](https://github.com/abrkgrbz/Stocker/issues)

---

*Last Updated: November 2024*
*Version: 1.0.0*
*Maintained by: Stocker Development Team*