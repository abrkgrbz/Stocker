using MediatR;
using Npgsql;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.Events;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Application.Features.Tenants.Commands.CreateTenantFromRegistration;

public sealed class CreateTenantFromRegistrationCommandHandler : IRequestHandler<CreateTenantFromRegistrationCommand, Result<TenantDto>>
{
    private readonly IMasterDbContext _context;
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMigrationService _migrationService;
    private readonly IEmailService _emailService;
    private readonly ILogger<CreateTenantFromRegistrationCommandHandler> _logger;
    private readonly IPublisher _publisher;
    private readonly IConfiguration _configuration;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly ISecurityAuditService _auditService;
    private readonly ITenantCreationProgressService _progressService;

    public CreateTenantFromRegistrationCommandHandler(
        IMasterDbContext context,
        IMasterUnitOfWork unitOfWork,
        IMigrationService migrationService,
        IEmailService emailService,
        ILogger<CreateTenantFromRegistrationCommandHandler> logger,
        IPublisher publisher,
        IConfiguration configuration,
        ITenantDbContextFactory tenantDbContextFactory,
        ISecurityAuditService auditService,
        ITenantCreationProgressService progressService)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _migrationService = migrationService;
        _emailService = emailService;
        _logger = logger;
        _publisher = publisher;
        _configuration = configuration;
        _tenantDbContextFactory = tenantDbContextFactory;
        _auditService = auditService;
        _progressService = progressService;
    }

    public async Task<Result<TenantDto>> Handle(CreateTenantFromRegistrationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get registration
            var registration = await _context.TenantRegistrations
                .FirstOrDefaultAsync(x => x.Id == request.RegistrationId, cancellationToken);

            if (registration == null)
            {
                return Result<TenantDto>.Failure(Error.NotFound("Registration.NotFound", "Kayıt bulunamadı."));
            }

            // Check if already has a tenant
            if (registration.TenantId.HasValue && registration.TenantId.Value != Guid.Empty)
            {
                _logger.LogWarning("Registration already has a tenant: {RegistrationId}", request.RegistrationId);
                
                var existingTenant = await _unitOfWork.Repository<Domain.Master.Entities.Tenant>()
                    .GetByIdAsync(registration.TenantId.Value);
                    
                if (existingTenant != null)
                {
                    return Result<TenantDto>.Success(MapToDto(existingTenant));
                }
            }

            // Check if email verified (minimum requirement for tenant creation)
            if (!registration.EmailVerified)
            {
                return Result<TenantDto>.Failure(Error.Validation("Registration.EmailNotVerified", "E-posta adresi doğrulanmamış."));
            }
            
            // Status can be Pending (will be approved after tenant creation) or Approved
            if (registration.Status != RegistrationStatus.Pending && registration.Status != RegistrationStatus.Approved)
            {
                return Result<TenantDto>.Failure(Error.Validation("Registration.InvalidStatus", "Kayıt durumu tenant oluşturma için uygun değil."));
            }

            // Send progress: Starting
            try
            {
                await _progressService.SendProgressAsync(
                    registration.Id,
                    TenantCreationStep.Starting,
                    "Tenant oluşturma işlemi başlatılıyor...",
                    5,
                    cancellationToken);
            }
            catch (Exception progressEx)
            {
                _logger.LogWarning(progressEx, "Failed to send progress update for Starting step");
            }

            // Check if tenant with same code already exists
            var existingTenantByCode = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Code == registration.CompanyCode, cancellationToken);

            if (existingTenantByCode != null)
            {
                return Result<TenantDto>.Failure(Error.Conflict("Tenant.AlreadyExists", "Bu kod ile tenant zaten mevcut."));
            }

            // Get package with modules (eager loading to avoid N+1 query later)
            var packageId = registration.SelectedPackageId ?? await GetDefaultPackageId(cancellationToken);
            var package = await _context.Packages
                .Include(p => p.Modules)
                .FirstOrDefaultAsync(p => p.Id == packageId, cancellationToken);

            if (package == null)
            {
                return Result<TenantDto>.Failure(Error.NotFound("Package.NotFound", "Paket bulunamadı."));
            }

            // Create connection string
            var databaseName = $"Stocker_{registration.CompanyCode.Replace("-", "_")}_Db";
            var connectionString = GenerateConnectionString(databaseName);
            
            var connectionStringResult = ConnectionString.Create(connectionString);
            if (connectionStringResult.IsFailure)
            {
                return Result<TenantDto>.Failure(connectionStringResult.Error);
            }

            // Create email value object
            var emailResult = Email.Create(registration.ContactEmail.Value);
            if (emailResult.IsFailure)
            {
                return Result<TenantDto>.Failure(emailResult.Error);
            }

            // Create tenant
            var tenant = Domain.Master.Entities.Tenant.Create(
                registration.CompanyName,
                registration.CompanyCode,
                databaseName,
                connectionStringResult.Value,
                emailResult.Value
            );

            // Add domain
            var domainName = $"{registration.CompanyCode.ToLower()}.stocker.app";
            tenant.AddDomain(domainName, isPrimary: true);

            // Send progress: CreatingTenant
            try
            {
                await _progressService.SendProgressAsync(
                    registration.Id,
                    TenantCreationStep.CreatingTenant,
                    "Tenant kaydı oluşturuluyor...",
                    10,
                    cancellationToken);
            }
            catch (Exception progressEx)
            {
                _logger.LogWarning(progressEx, "Failed to send progress update for CreatingTenant step");
            }

            // Create subscription
            var startDate = DateTime.UtcNow;
            DateTime? trialEndDate = package.TrialDays > 0 
                ? startDate.AddDays(package.TrialDays) 
                : null;

            var billingCycle = registration.BillingCycle == "Yillik" 
                ? Domain.Master.Enums.BillingCycle.Yillik 
                : Domain.Master.Enums.BillingCycle.Aylik;
            
            var subscription = Subscription.Create(
                tenant.Id,
                package.Id,
                billingCycle,
                package.BasePrice,
                startDate,
                trialEndDate
            );

            // Add package modules to subscription
            if (package.Modules != null && package.Modules.Any())
            {
                foreach (var packageModule in package.Modules.Where(m => m.IsIncluded))
                {
                    subscription.AddModule(
                        packageModule.ModuleCode,
                        packageModule.ModuleName,
                        packageModule.MaxEntities
                    );
                    _logger.LogInformation("Added module {ModuleCode} to subscription for tenant {TenantId}",
                        packageModule.ModuleCode, tenant.Id);
                }
                _logger.LogInformation("🎯 Added {Count} modules to subscription for tenant {TenantId}",
                    package.Modules.Count(m => m.IsIncluded), tenant.Id);
            }

            // Activate subscription if not trial
            if (!trialEndDate.HasValue)
            {
                subscription.Activate();
            }

            // Send progress: CreatingSubscription
            try
            {
                await _progressService.SendProgressAsync(
                    registration.Id,
                    TenantCreationStep.CreatingSubscription,
                    "Abonelik oluşturuluyor...",
                    20,
                    cancellationToken);
            }
            catch (Exception progressEx)
            {
                _logger.LogWarning(progressEx, "Failed to send progress update for CreatingSubscription step");
            }

            // Add to repository
            await _unitOfWork.Repository<Domain.Master.Entities.Tenant>().AddAsync(tenant);
            await _unitOfWork.Repository<Subscription>().AddAsync(subscription);

            // Approve registration and link to tenant
            registration.Approve(approvedBy: "System", tenantId: tenant.Id);
            _context.TenantRegistrations.Update(registration);

            // Save all changes in single transaction (tenant, subscription, registration)
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Tenant '{TenantName}' created successfully with ID: {TenantId} from registration: {RegistrationId}",
                tenant.Name, tenant.Id, registration.Id);

            // Create MasterUser for admin (required for login)
            try
            {
                _logger.LogInformation("Creating MasterUser for admin: {Email}", registration.AdminEmail.Value);

                var adminEmail = Email.Create(registration.AdminEmail.Value);
                if (adminEmail.IsFailure)
                {
                    _logger.LogError("Invalid admin email: {Email}", registration.AdminEmail.Value);
                    throw new InvalidOperationException($"Invalid admin email: {registration.AdminEmail.Value}");
                }

                // Create phone number if provided
                PhoneNumber? adminPhone = null;
                if (!string.IsNullOrEmpty(registration.AdminPhone))
                {
                    var phoneResult = PhoneNumber.Create(registration.AdminPhone);
                    if (phoneResult.IsSuccess)
                    {
                        adminPhone = phoneResult.Value;
                    }
                }

                // Get admin password hash from registration
                string adminPassword;
                if (!string.IsNullOrEmpty(registration.AdminPasswordHash))
                {
                    // Use password provided during registration (already hashed)
                    adminPassword = registration.AdminPasswordHash;
                    _logger.LogInformation("Using user-provided password for MasterUser creation");
                }
                else
                {
                    // Fallback to default password (shouldn't happen with proper validation)
                    _logger.LogWarning("No password hash found in registration - using default password");
                    var defaultHashedPassword = Domain.Master.ValueObjects.HashedPassword.Create("Admin123!");
                    adminPassword = defaultHashedPassword.Value;
                }

                // Generate unique username by appending tenant code to avoid conflicts
                // Example: "admin" + "abc-tech" => "admin-abc-tech"
                var uniqueUsername = $"{registration.AdminUsername}-{tenant.Code}";

                // Check if username already exists and make it unique if needed
                var existingUser = await _context.MasterUsers
                    .FirstOrDefaultAsync(u => u.Username == uniqueUsername, cancellationToken);

                if (existingUser != null)
                {
                    // Append first 8 chars of tenant ID to ensure absolute uniqueness
                    uniqueUsername = $"{registration.AdminUsername}-{tenant.Code}-{tenant.Id.ToString()[..8]}";
                    _logger.LogWarning("Username conflict detected, using extended unique username: {Username}", uniqueUsername);
                }

                _logger.LogInformation("Creating MasterUser with username: {Username}", uniqueUsername);

                // Create MasterUser with credentials (using pre-hashed password)
                var masterUser = MasterUser.CreateFromHash(
                    username: uniqueUsername,
                    email: adminEmail.Value,
                    passwordHash: adminPassword, // Use hashed password from registration
                    firstName: registration.AdminFirstName,
                    lastName: registration.AdminLastName,
                    userType: UserType.FirmaYoneticisi,
                    phoneNumber: adminPhone
                );

                // Activate and verify email (already verified during registration)
                masterUser.Activate();
                masterUser.VerifyEmail();

                // Assign to tenant
                masterUser.AssignToTenant(tenant.Id, UserType.FirmaYoneticisi);

                // Save MasterUser
                await _unitOfWork.Repository<MasterUser>().AddAsync(masterUser);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("✅ MasterUser created successfully for {Email}, MasterUserId: {MasterUserId}, TenantId: {TenantId}",
                    registration.AdminEmail.Value, masterUser.Id, tenant.Id);

                // Send progress: CreatingMasterUser
                try
                {
                    await _progressService.SendProgressAsync(
                        registration.Id,
                        TenantCreationStep.CreatingMasterUser,
                        "Kullanıcı hesabı oluşturuluyor...",
                        30,
                        cancellationToken);
                }
                catch (Exception progressEx)
                {
                    _logger.LogWarning(progressEx, "Failed to send progress update for CreatingMasterUser step");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create MasterUser for tenant: {TenantId}", tenant.Id);
                throw; // Critical error - cannot proceed without admin user
            }

            // Create and migrate tenant database
            try
            {
                // Send progress: CreatingDatabase
                try
                {
                    await _progressService.SendProgressAsync(
                        registration.Id,
                        TenantCreationStep.CreatingDatabase,
                        "Veritabanı oluşturuluyor...",
                        40,
                        cancellationToken);
                }
                catch (Exception progressEx)
                {
                    _logger.LogWarning(progressEx, "Failed to send progress update for CreatingDatabase step");
                }

                _logger.LogInformation("Starting database migration for tenant: {TenantId}", tenant.Id);
                await _migrationService.MigrateTenantDatabaseAsync(tenant.Id);

                // Send progress: RunningMigrations
                try
                {
                    await _progressService.SendProgressAsync(
                        registration.Id,
                        TenantCreationStep.RunningMigrations,
                        "Veritabanı yapılandırılıyor...",
                        50,
                        cancellationToken);
                }
                catch (Exception progressEx)
                {
                    _logger.LogWarning(progressEx, "Failed to send progress update for RunningMigrations step");
                }

                _logger.LogInformation("Seeding initial data for tenant: {TenantId}", tenant.Id);
                await _migrationService.SeedTenantDataAsync(tenant.Id);

                // Send progress: SeedingData
                try
                {
                    await _progressService.SendProgressAsync(
                        registration.Id,
                        TenantCreationStep.SeedingData,
                        "İlk veriler yükleniyor...",
                        60,
                        cancellationToken);
                }
                catch (Exception progressEx)
                {
                    _logger.LogWarning(progressEx, "Failed to send progress update for SeedingData step");
                }

                // ✅ NOW activate package modules AFTER database is created and migrated
                _logger.LogInformation("Activating package modules for tenant {TenantId}...", tenant.Id);

                try
                {
                    // Use already loaded package with modules (eager loaded at line 96-98)
                    if (package.Modules != null && package.Modules.Any())
                    {
                        // CRITICAL FIX: Use TenantDbContext instead of Master UnitOfWork
                        // TenantModules must be saved to the TENANT database, not Master database!
                        using var tenantDbContext = await _tenantDbContextFactory.CreateDbContextAsync(tenant.Id);

                        foreach (var packageModule in package.Modules.Where(m => m.IsIncluded))
                        {
                            var tenantModule = Domain.Tenant.Entities.TenantModules.Create(
                                tenantId: tenant.Id,
                                moduleName: packageModule.ModuleName,
                                moduleCode: packageModule.ModuleCode,
                                description: $"Module from {package.Name} package",
                                isEnabled: true,
                                recordLimit: packageModule.MaxEntities,
                                isTrial: package.TrialDays > 0
                            );

                            tenantDbContext.TenantModules.Add(tenantModule);
                            _logger.LogInformation("✅ Activated module {ModuleCode} ({ModuleName}) for tenant {TenantId}",
                                packageModule.ModuleCode, packageModule.ModuleName, tenant.Id);
                        }

                        await tenantDbContext.SaveChangesAsync(cancellationToken);
                        _logger.LogInformation("🎉 Successfully activated {Count} modules for tenant {TenantId}",
                            package.Modules.Count(m => m.IsIncluded), tenant.Id);

                        // Send progress: ActivatingModules
                        try
                        {
                            await _progressService.SendProgressAsync(
                                registration.Id,
                                TenantCreationStep.ActivatingModules,
                                "Modüller aktifleştiriliyor...",
                                75,
                                cancellationToken);
                        }
                        catch (Exception progressEx)
                        {
                            _logger.LogWarning(progressEx, "Failed to send progress update for ActivatingModules step");
                        }
                    }
                    else
                    {
                        _logger.LogWarning("⚠️ No modules to activate for tenant {TenantId} - package has no modules or package is null", tenant.Id);
                    }
                }
                catch (Exception moduleEx)
                {
                    _logger.LogError(moduleEx, "❌ CRITICAL: Failed to activate modules for tenant {TenantId}. This will prevent module access!", tenant.Id);
                    // Re-throw to fail tenant creation if modules can't be activated
                    throw new InvalidOperationException($"Failed to activate modules for tenant {tenant.Id}. Tenant database exists but modules are not configured.", moduleEx);
                }

                // Activate tenant after successful database setup and module activation
                // Tenant is created as inactive (IsActive = false) and must be explicitly activated
                _logger.LogInformation("Activating tenant after successful setup: {TenantId}", tenant.Id);
                tenant.Activate();
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("✅ Tenant activated successfully: {TenantId}", tenant.Id);

                // Send progress: ActivatingTenant
                try
                {
                    await _progressService.SendProgressAsync(
                        registration.Id,
                        TenantCreationStep.ActivatingTenant,
                        "Hesabınız aktifleştiriliyor...",
                        85,
                        cancellationToken);
                }
                catch (Exception progressEx)
                {
                    _logger.LogWarning(progressEx, "Failed to send progress update for ActivatingTenant step");
                }

                // Log successful tenant activation
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "tenant_activated",
                    Email = registration.ContactEmail.Value,
                    TenantCode = tenant.Code,
                    RiskScore = 10,
                    GdprCategory = "authentication",
                    Metadata = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        tenantId = tenant.Id,
                        tenantName = tenant.Name,
                        registrationId = registration.Id,
                        packageId = package?.Id,
                        packageName = package?.Name,
                        modulesActivated = package?.Modules?.Count(m => m.IsIncluded) ?? 0
                    })
                }, cancellationToken);

                // Publish domain event for real-time notification
                var tenantActivatedEvent = new TenantActivatedDomainEvent(
                    tenant.Id,
                    tenant.Code,
                    tenant.Name,
                    registration.ContactEmail.Value);

                await _publisher.Publish(tenantActivatedEvent, cancellationToken);

                _logger.LogInformation(
                    "📢 Published TenantActivatedDomainEvent for tenant: {TenantId}",
                    tenant.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to setup tenant database for tenant: {TenantId}. Failing job to prevent orphaned tenant.", tenant.Id);

                // Re-throw ALL critical database setup failures to properly fail the Hangfire job
                // This prevents orphaned tenant records without functioning databases
                if (ex is InvalidOperationException ||
                    ex is DbUpdateException ||
                    ex is NpgsqlException ||
                    ex.GetType().Name.Contains("Migration") ||
                    ex.Message.Contains("database") ||
                    ex.Message.Contains("migration"))
                {
                    throw; // Critical database failure - must fail the entire operation
                }

                // Only non-critical errors should be swallowed (very rare cases)
                throw; // Changed: Default to failing to prevent silent failures
            }

            // Send welcome email
            try
            {
                // Send progress: SendingWelcomeEmail
                try
                {
                    await _progressService.SendProgressAsync(
                        registration.Id,
                        TenantCreationStep.SendingWelcomeEmail,
                        "Hoşgeldin e-postası gönderiliyor...",
                        95,
                        cancellationToken);
                }
                catch (Exception progressEx)
                {
                    _logger.LogWarning(progressEx, "Failed to send progress update for SendingWelcomeEmail step");
                }

                await _emailService.SendWelcomeEmailAsync(
                    email: registration.AdminEmail.Value,
                    userName: $"{registration.AdminFirstName} {registration.AdminLastName}",
                    companyName: tenant.Name,
                    cancellationToken);

                _logger.LogInformation("Welcome email sent to {Email} for tenant {TenantId}", registration.AdminEmail, tenant.Id);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to send welcome email for tenant {TenantId}", tenant.Id);
                // Don't fail the operation if email fails
            }

            // Send completion progress
            try
            {
                await _progressService.SendCompletionAsync(
                    registration.Id,
                    tenant.Id,
                    tenant.Name,
                    cancellationToken);
            }
            catch (Exception progressEx)
            {
                _logger.LogWarning(progressEx, "Failed to send completion progress update");
            }

            return Result<TenantDto>.Success(MapToDto(tenant));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tenant from registration: {RegistrationId}", request.RegistrationId);

            // Send error progress
            try
            {
                await _progressService.SendErrorAsync(
                    request.RegistrationId,
                    $"Tenant oluşturulurken hata oluştu: {ex.Message}",
                    cancellationToken);
            }
            catch (Exception progressEx)
            {
                _logger.LogWarning(progressEx, "Failed to send error progress update");
            }

            // Log tenant activation failure
            try
            {
                var registration = await _context.TenantRegistrations
                    .FirstOrDefaultAsync(r => r.Id == request.RegistrationId, cancellationToken);

                await _auditService.LogSecurityEventAsync(new SecurityAuditEvent
                {
                    Event = "tenant_activation_failed",
                    Email = registration?.ContactEmail?.Value,
                    TenantCode = registration?.CompanyCode,
                    RiskScore = 70,
                    Metadata = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        registrationId = request.RegistrationId,
                        error = ex.Message,
                        errorType = ex.GetType().Name,
                        stackTrace = ex.StackTrace != null ? ex.StackTrace.Substring(0, Math.Min(500, ex.StackTrace.Length)) : null
                    })
                }, cancellationToken);
            }
            catch
            {
                // Ignore audit logging errors in error handler
            }

            // For critical failures (like module activation), re-throw to fail the Hangfire job
            // This prevents "successful" jobs that actually failed
            if (ex is InvalidOperationException)
            {
                throw; // Re-throw critical errors to fail Hangfire job properly
            }

            return Result<TenantDto>.Failure(Error.Failure("Tenant.CreateFailed", $"Tenant oluşturulurken hata oluştu: {ex.Message}"));
        }
    }

    private string GenerateConnectionString(string databaseName)
    {
        // Get master connection string to extract server details
        var masterConnectionString = _configuration.GetConnectionString("MasterConnection");

        if (string.IsNullOrEmpty(masterConnectionString))
        {
            _logger.LogError("Master connection string not found in configuration");
            throw new InvalidOperationException("Master connection string not configured");
        }

        // Parse master connection string to get server, user, and password
        var builder = new NpgsqlConnectionStringBuilder(masterConnectionString);

        // Build tenant connection string with same server but different database
        builder.Database = databaseName;

        _logger.LogInformation("Generated connection string for database: {DatabaseName}, Server: {Server}",
            databaseName, builder.Host);

        return builder.ConnectionString;
    }

    private async Task<Guid> GetDefaultPackageId(CancellationToken cancellationToken)
    {
        var trialPackage = await _context.Packages
            .FirstOrDefaultAsync(p => p.Type == PackageType.Trial, cancellationToken);

        return trialPackage?.Id ?? Guid.Empty;
    }

    private TenantDto MapToDto(Domain.Master.Entities.Tenant tenant)
    {
        var subscription = tenant.Subscriptions?.FirstOrDefault();
        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Code = tenant.Code,
            IsActive = tenant.IsActive,
            Domain = tenant.Domains?.FirstOrDefault(d => d.IsPrimary)?.DomainName ?? $"{tenant.Code}.stocker.app",
            CreatedAt = tenant.CreatedAt,
            UpdatedAt = tenant.UpdatedAt,
            Subscription = subscription != null ? new TenantSubscriptionDto
            {
                Id = subscription.Id,
                PackageId = subscription.PackageId,
                PackageName = subscription.Package?.Name ?? "Trial",
                Status = subscription.Status.ToString(),
                StartDate = subscription.StartDate,
                EndDate = subscription.CurrentPeriodEnd,
                TrialEndDate = subscription.TrialEndDate,
                Price = subscription.Price.Amount
            } : null
        };
    }
}