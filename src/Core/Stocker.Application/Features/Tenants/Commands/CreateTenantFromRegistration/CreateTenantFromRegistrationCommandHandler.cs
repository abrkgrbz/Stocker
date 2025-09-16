using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.ValueObjects;

namespace Stocker.Application.Features.Tenants.Commands.CreateTenantFromRegistration;

public sealed class CreateTenantFromRegistrationCommandHandler : IRequestHandler<CreateTenantFromRegistrationCommand, Result<TenantDto>>
{
    private readonly IMasterDbContext _context;
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMigrationService _migrationService;
    private readonly IEmailService _emailService;
    private readonly ILogger<CreateTenantFromRegistrationCommandHandler> _logger;

    public CreateTenantFromRegistrationCommandHandler(
        IMasterDbContext context,
        IMasterUnitOfWork unitOfWork,
        IMigrationService migrationService,
        IEmailService emailService,
        ILogger<CreateTenantFromRegistrationCommandHandler> logger)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _migrationService = migrationService;
        _emailService = emailService;
        _logger = logger;
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
                
                var existingTenant = await _unitOfWork.Repository<Tenant>()
                    .GetByIdAsync(registration.TenantId.Value);
                    
                if (existingTenant != null)
                {
                    return Result<TenantDto>.Success(MapToDto(existingTenant));
                }
            }

            // Check if approved
            if (registration.Status != RegistrationStatus.Approved)
            {
                return Result<TenantDto>.Failure(Error.Validation("Registration.NotApproved", "Kayıt henüz onaylanmamış."));
            }

            // Check if tenant with same code already exists
            var existingTenantByCode = await _unitOfWork.Repository<Tenant>()
                .GetAsync(t => t.Code == registration.CompanyCode);

            if (existingTenantByCode.Any())
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
            var emailResult = Email.Create(registration.ContactEmail);
            if (emailResult.IsFailure)
            {
                return Result<TenantDto>.Failure(emailResult.Error);
            }

            // Create tenant
            var tenant = Tenant.Create(
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

            var subscription = Subscription.Create(
                tenant.Id,
                package.Id,
                registration.BillingCycle ?? "Monthly",
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
            await _unitOfWork.Repository<Tenant>().AddAsync(tenant);
            await _unitOfWork.Repository<Subscription>().AddAsync(subscription);

            // Update registration with tenant ID
            registration.AssignTenant(tenant.Id);
            _context.TenantRegistrations.Update(registration);

            // Save to database
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Tenant '{TenantName}' created successfully with ID: {TenantId} from registration: {RegistrationId}", 
                tenant.Name, tenant.Id, registration.Id);

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
                    email: registration.AdminEmail,
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
        var trialPackage = await _unitOfWork.Repository<Package>()
            .GetAsync(p => p.Name.Contains("Trial") || p.Name.Contains("Free"));

        return trialPackage.FirstOrDefault()?.Id ?? Guid.Empty;
    }

    private TenantDto MapToDto(Tenant tenant)
    {
        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Code = tenant.Code,
            DatabaseName = tenant.DatabaseName,
            IsActive = tenant.IsActive,
            SubscriptionStatus = tenant.Subscriptions?.FirstOrDefault()?.Status.ToString() ?? "None",
            Domain = tenant.Domains?.FirstOrDefault(d => d.IsPrimary)?.DomainName ?? $"{tenant.Code}.stocker.app",
            CreatedAt = tenant.CreatedAt,
            PackageName = tenant.Subscriptions?.FirstOrDefault()?.Package?.Name ?? "Trial"
        };
    }
}