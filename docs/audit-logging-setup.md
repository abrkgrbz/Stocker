# Security Audit Logging Setup Guide

## ✅ Completed Implementation

### 1. Domain Layer
- **SecurityAuditLog Entity**: `src/Core/Stocker.Domain/Master/Entities/SecurityAuditLog.cs`
- Factory methods for auth and security events
- Risk score calculation
- Fluent API for building audit entries

### 2. Persistence Layer
- **EF Configuration**: `src/Infrastructure/Stocker.Persistence/Configurations/Master/SecurityAuditLogConfiguration.cs`
- **DbContext**: Added to `MasterDbContext.SecurityAuditLogs`
- MSSQL-optimized with performance indexes

### 3. Application Layer
- **Interface**: `src/Core/Stocker.Application/Common/Interfaces/ISecurityAuditService.cs`
- Methods for logging auth/security events
- Query methods for analytics

### 4. Infrastructure Layer
- **Service Implementation**: `src/Infrastructure/Stocker.Infrastructure/Services/SecurityAuditService.cs`
- **DI Registration**: Added to `ServiceCollectionExtensions.cs`

---

## 🔧 Setup Instructions

### Step 1: Create EF Migration

Navigate to Persistence project:
```bash
cd src/Infrastructure/Stocker.Persistence
```

Create migration for SecurityAuditLog table:
```bash
dotnet ef migrations add AddSecurityAuditLog --context MasterDbContext --output-dir Migrations/Master
```

### Step 2: Apply Migration

**Development:**
```bash
dotnet ef database update --context MasterDbContext
```

**Production:**
```bash
# Option 1: Using dotnet ef
dotnet ef database update --context MasterDbContext --connection "YOUR_CONNECTION_STRING"

# Option 2: Generate SQL script
dotnet ef migrations script --context MasterDbContext --output security_audit_migration.sql

# Then run the SQL script in SSMS or Azure SQL
```

### Step 3: Verify Table Creation

Connect to MSSQL and verify:
```sql
SELECT TOP 10 * FROM master.SecurityAuditLogs;

-- Check indexes
EXEC sp_helpindex 'master.SecurityAuditLogs';
```

---

## 📊 Table Schema

```sql
CREATE TABLE [master].[SecurityAuditLogs] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [Timestamp] DATETIME2 NOT NULL,
    [Event] NVARCHAR(100) NOT NULL,

    -- User/Auth info
    [UserId] UNIQUEIDENTIFIER NULL,
    [Email] NVARCHAR(255) NULL,
    [TenantCode] NVARCHAR(50) NULL,

    -- Request info
    [IpAddress] NVARCHAR(45) NULL,
    [UserAgent] NVARCHAR(500) NULL,
    [RequestId] NVARCHAR(100) NULL,

    -- Security
    [RiskScore] INT NULL CHECK ([RiskScore] >= 0 AND [RiskScore] <= 100),
    [Blocked] BIT NOT NULL DEFAULT 0,

    -- Metadata
    [Metadata] NVARCHAR(MAX) NULL,
    [DurationMs] INT NULL,

    -- Compliance
    [GdprCategory] NVARCHAR(50) NULL,
    [RetentionDays] INT NOT NULL DEFAULT 365,

    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Performance indexes
CREATE NONCLUSTERED INDEX IX_SecurityAuditLogs_Timestamp ON [master].[SecurityAuditLogs]([Timestamp] DESC);
CREATE NONCLUSTERED INDEX IX_SecurityAuditLogs_Event ON [master].[SecurityAuditLogs]([Event]);
CREATE NONCLUSTERED INDEX IX_SecurityAuditLogs_Email ON [master].[SecurityAuditLogs]([Email]);
CREATE NONCLUSTERED INDEX IX_SecurityAuditLogs_TenantCode ON [master].[SecurityAuditLogs]([TenantCode]);
CREATE NONCLUSTERED INDEX IX_SecurityAuditLogs_IpAddress ON [master].[SecurityAuditLogs]([IpAddress]);
CREATE NONCLUSTERED INDEX IX_SecurityAuditLogs_RiskScore ON [master].[SecurityAuditLogs]([RiskScore]) WHERE [RiskScore] > 50;
```

---

## 🔌 Usage in Controllers

### Example: CheckEmail Controller

```csharp
using Stocker.Application.Common.Interfaces;

public class CheckEmailController : ControllerBase
{
    private readonly ISecurityAuditService _auditService;

    public CheckEmailController(ISecurityAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpPost]
    public async Task<IActionResult> CheckEmail([FromBody] CheckEmailRequest request)
    {
        var stopwatch = Stopwatch.StartNew();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var result = await _authService.CheckEmailAsync(request.Email);

            // Log successful email check
            await _auditService.LogAuthEventAsync(new SecurityAuditEvent
            {
                Event = "email_check",
                Email = request.Email,
                TenantCode = result.Tenant?.Code,
                IpAddress = ipAddress,
                UserAgent = Request.Headers["User-Agent"].ToString(),
                DurationMs = (int)stopwatch.ElapsedMilliseconds,
                GdprCategory = "authentication"
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Log failed email check
            await _auditService.LogSecurityEventAsync(new SecurityAuditEvent
            {
                Event = "email_check_error",
                Email = request.Email,
                IpAddress = ipAddress,
                RiskScore = 30,
                Metadata = JsonSerializer.Serialize(new { error = ex.Message })
            });

            throw;
        }
    }
}
```

### Example: Login Controller

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var stopwatch = Stopwatch.StartNew();
    var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
    var userAgent = Request.Headers["User-Agent"].ToString();

    try
    {
        // Check for unusual login patterns
        var isUnusual = await _auditService.HasUnusualLoginPatternAsync(
            request.Email,
            ipAddress!,
            userAgent);

        var riskScore = isUnusual ? 40 : 10;

        var result = await _authService.LoginAsync(request.Email, request.Password);

        if (!result.Success)
        {
            // Log failed login
            await _auditService.LogAuthEventAsync(new SecurityAuditEvent
            {
                Event = "login_failed",
                Email = request.Email,
                TenantCode = request.TenantCode,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                RiskScore = riskScore + 20,
                DurationMs = (int)stopwatch.ElapsedMilliseconds
            });

            return Unauthorized(result);
        }

        // Log successful login
        await _auditService.LogAuthEventAsync(new SecurityAuditEvent
        {
            Event = "login_success",
            Email = request.Email,
            TenantCode = request.TenantCode,
            UserId = result.UserId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            RiskScore = riskScore,
            DurationMs = (int)stopwatch.ElapsedMilliseconds
        });

        return Ok(result);
    }
    catch (Exception ex)
    {
        await _auditService.LogSecurityEventAsync(new SecurityAuditEvent
        {
            Event = "login_error",
            Email = request.Email,
            IpAddress = ipAddress,
            RiskScore = 50,
            Metadata = JsonSerializer.Serialize(new { error = ex.Message })
        });

        throw;
    }
}
```

---

## 📈 Analytics Queries

### Failed Login Attempts (Last Hour)
```csharp
var failedAttempts = await _auditService.GetFailedLoginAttemptsAsync(
    email: "user@example.com",
    timeWindow: TimeSpan.FromHours(1));
```

### Suspicious Activity from IP
```csharp
var suspiciousCount = await _auditService.GetSuspiciousActivityCountAsync(
    ipAddress: "192.168.1.1",
    timeWindow: TimeSpan.FromDays(1));
```

### Get Audit Logs
```csharp
var logs = await _auditService.GetAuditLogsAsync(new SecurityAuditFilter
{
    Email = "user@example.com",
    FromDate = DateTime.UtcNow.AddDays(-7),
    MinRiskScore = 50,
    PageNumber = 1,
    PageSize = 20
});
```

---

## 🔍 SQL Analytics Queries

### Top Failed Login Attempts
```sql
SELECT TOP 10
    Email,
    COUNT(*) AS FailedAttempts,
    MAX(Timestamp) AS LastAttempt
FROM master.SecurityAuditLogs
WHERE Event = 'login_failed'
    AND Timestamp >= DATEADD(hour, -24, GETUTCDATE())
GROUP BY Email
ORDER BY FailedAttempts DESC;
```

### High-Risk Events
```sql
SELECT *
FROM master.SecurityAuditLogs
WHERE RiskScore > 70
    AND Timestamp >= DATEADD(day, -7, GETUTCDATE())
ORDER BY Timestamp DESC;
```

### Unusual Login Patterns
```sql
SELECT
    Email,
    IpAddress,
    COUNT(DISTINCT IpAddress) AS UniqueIPs,
    COUNT(*) AS LoginCount
FROM master.SecurityAuditLogs
WHERE Event IN ('login_success', 'login_failed')
    AND Timestamp >= DATEADD(day, -30, GETUTCDATE())
GROUP BY Email, IpAddress
HAVING COUNT(DISTINCT IpAddress) > 5
ORDER BY UniqueIPs DESC;
```

---

## 🛡️ GDPR Compliance

### Data Retention
Audit logs have configurable retention periods (default 365 days):

```sql
-- Cleanup old logs (can be scheduled as SQL Agent Job)
DELETE FROM master.SecurityAuditLogs
WHERE Timestamp < DATEADD(year, -1, GETUTCDATE())
    AND RetentionDays <= 365;
```

### GDPR Categories
- `authentication`: Login/logout events
- `security`: Rate limiting, blocked attempts, HMAC failures
- `data_access`: (Future) User data access logs
- `data_modification`: (Future) User data changes

---

## ✅ Next Steps

1. **Run Migration**: Create and apply the database migration
2. **Update Controllers**: Add audit logging to auth endpoints
3. **Test**: Verify audit logs are being created
4. **Monitor**: Set up alerts for high-risk events
5. **Dashboard**: Create admin panel for viewing audit logs

---

## 🆘 Troubleshooting

**Migration fails:**
- Check connection string in `appsettings.json`
- Verify MasterDbContext is correctly configured
- Check for conflicting migrations

**Audit logs not saving:**
- Check DI registration in `ServiceCollectionExtensions`
- Verify database connection
- Check application logs for errors

**Performance issues:**
- Verify indexes are created
- Consider partitioning for high-volume environments
- Enable query statistics to identify slow queries
