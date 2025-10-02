using MediatR;
using Microsoft.EntityFrameworkCore;
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

    public CreateTenantFromRegistrationCommandHandler(
        IMasterDbContext context,
        IMasterUnitOfWork unitOfWork,
        IMigrationService migrationService,
        IEmailService emailService,
        ILogger<CreateTenantFromRegistrationCommandHandler> logger,
        IPublisher publisher)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _migrationService = migrationService;
        _emailService = emailService;
        _logger = logger;
        _publisher = publisher;
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

            // Check if tenant with same code already exists
            var existingTenantByCode = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Code == registration.CompanyCode, cancellationToken);

            if (existingTenantByCode != null)
            {
                return Result<TenantDto>.Failure(Error.Conflict("Tenant.AlreadyExists", "Bu kod ile tenant zaten mevcut."));
            }

            // Get package (default to Trial if not selected)
            var packageId = registration.SelectedPackageId ?? await GetDefaultPackageId(cancellationToken);
            var package = await _unitOfWork.Repository<Package>()
                .GetByIdAsync(packageId);

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

            // Activate subscription if not trial
            if (!trialEndDate.HasValue)
            {
                subscription.Activate();
            }

            // Add to repository
            await _unitOfWork.Repository<Domain.Master.Entities.Tenant>().AddAsync(tenant);
            await _unitOfWork.Repository<Subscription>().AddAsync(subscription);

            // Registration already has tenant ID from auto-approval
            _context.TenantRegistrations.Update(registration);

            // Save to database
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

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

                // Create MasterUser with credentials (using pre-hashed password)
                var masterUser = MasterUser.CreateFromHash(
                    username: registration.AdminUsername,
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
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create MasterUser for tenant: {TenantId}", tenant.Id);
                throw; // Critical error - cannot proceed without admin user
            }

            // Create and migrate tenant database
            try
            {
                _logger.LogInformation("Starting database migration for tenant: {TenantId}", tenant.Id);
                await _migrationService.MigrateTenantDatabaseAsync(tenant.Id);
                
                _logger.LogInformation("Seeding initial data for tenant: {TenantId}", tenant.Id);
                await _migrationService.SeedTenantDataAsync(tenant.Id);
                
                // Activate tenant after successful database setup
                tenant.Activate();
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                
                _logger.LogInformation("Tenant database setup completed for tenant: {TenantId}", tenant.Id);

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
                _logger.LogError(ex, "Failed to setup tenant database for tenant: {TenantId}. Manual intervention may be required.", tenant.Id);
                // Note: We don't rollback the tenant creation here
                // The tenant exists but database setup failed - this can be retried
            }

            // Send welcome email
            try
            {
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

            return Result<TenantDto>.Success(MapToDto(tenant));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tenant from registration: {RegistrationId}", request.RegistrationId);
            return Result<TenantDto>.Failure(Error.Failure("Tenant.CreateFailed", $"Tenant oluşturulurken hata oluştu: {ex.Message}"));
        }
    }

    private string GenerateConnectionString(string databaseName)
    {
        // Get base connection string from configuration
        // For now, use the same server as master database
        return $"Server=coolify.stoocker.app;Database={databaseName};User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=true;MultipleActiveResultSets=true";
    }

    private async Task<Guid> GetDefaultPackageId(CancellationToken cancellationToken)
    {
        var trialPackage = await _context.Packages
            .FirstOrDefaultAsync(p => p.Name.Contains("Trial") || p.Name.Contains("Free"), cancellationToken);

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