using AutoMapper;
using MediatR; 
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.Application.Common.Models;
using DatabaseSettings = Stocker.SharedKernel.Settings.DatabaseSettings;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.Extensions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Persistence.Migrations; 
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, Result<TenantDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMigrationService _migrationService;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateTenantCommandHandler> _logger;
    private readonly DatabaseSettings _databaseSettings;

    public CreateTenantCommandHandler(
        IMasterUnitOfWork unitOfWork,
        IMigrationService migrationService,
        IMapper mapper,
        ILogger<CreateTenantCommandHandler> logger,
        IOptions<DatabaseSettings> databaseSettings)
    {
        _unitOfWork = unitOfWork;
        _migrationService = migrationService;
        _mapper = mapper;
        _logger = logger;
        _databaseSettings = databaseSettings.Value;
    }

    public async Task<Result<TenantDto>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if tenant code already exists
            var existingTenant = await _unitOfWork.Tenants()
                .AsQueryable()
                .FirstOrDefaultAsync(t => t.Code == request.Code, cancellationToken);

            if (existingTenant != null)
            {
                return Result<TenantDto>.Failure(DomainErrors.Tenant.AlreadyExists(request.Code));
            }

            // Get the package
            var package = await _unitOfWork.Packages()
                .GetByIdAsync(request.PackageId, cancellationToken);

            if (package == null)
            {
                return Result<TenantDto>.Failure(DomainErrors.Package.NotFound(request.PackageId));
            }

            if (!package.IsActive)
            {
                return Result<TenantDto>.Failure(DomainErrors.Package.Inactive(request.PackageId));
            }

            // Create value objects
            var connectionStringResult = ConnectionString.Create(GenerateConnectionString(request.Code));
            if (connectionStringResult.IsFailure)
            {
                return Result<TenantDto>.Failure(Error.Validation("Tenant.InvalidConnectionString", "Invalid connection string format"));
            }

            var emailResult = Email.Create(request.ContactEmail ?? $"admin@{request.Code}.com");
            if (emailResult.IsFailure)
            {
                return Result<TenantDto>.Failure(Error.Validation("Tenant.InvalidEmail", "Invalid email format"));
            }

            // Generate database name from code
            var databaseName = $"Stocker_{request.Code.Replace("-", "_")}_Db";

            // Create tenant
            var tenant = Domain.Master.Entities.Tenant.Create(
                request.Name,
                request.Code,
                databaseName,
                connectionStringResult.Value,
                emailResult.Value
            );

            // Add primary domain
            var domainName = request.Domain ?? $"{request.Code}.stocker.app";
            tenant.AddDomain(domainName, isPrimary: true);

            // Create subscription
            var startDate = DateTime.UtcNow;
            DateTime? trialEndDate = package.TrialDays > 0 
                ? startDate.AddDays(package.TrialDays) 
                : null;

            var subscription = Subscription.Create(
                tenant.Id,
                package.Id,
                request.BillingCycle, // Use billing cycle from request
                package.BasePrice,     // BasePrice is already Money type
                startDate,
                trialEndDate
            );

            // Set subscription status based on trial
            if (trialEndDate.HasValue)
            {
                // Subscription is created with Trial status by default when trialEndDate is provided
            }
            else
            {
                subscription.Activate();
            }

            // Add to repository
            await _unitOfWork.Tenants().AddAsync(tenant, cancellationToken);
            await _unitOfWork.Subscriptions().AddAsync(subscription, cancellationToken);

            // Save to database
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Tenant '{TenantName}' created successfully with ID: {TenantId}", 
                tenant.Name, tenant.Id);

            // Create and migrate tenant database
            try
            {
                await _migrationService.MigrateTenantDatabaseAsync(tenant.Id);
                await _migrationService.SeedTenantDataAsync(tenant.Id);
                
                _logger.LogInformation("Tenant database setup completed for tenant: {TenantId}", tenant.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to setup tenant database for tenant: {TenantId}. Manual intervention may be required.", tenant.Id);
                // Note: We don't rollback the tenant creation here
                // The tenant exists but database setup failed - this can be retried
            }

            // Load related data for mapping
            tenant = await _unitOfWork.Tenants()
                .AsQueryable()
                .Include(t => t.Domains)
                .Include(t => t.Subscriptions)
                    .ThenInclude(s => s.Package)
                .FirstAsync(t => t.Id == tenant.Id, cancellationToken);

            var tenantDto = _mapper.Map<TenantDto>(tenant);
            return Result<TenantDto>.Success(tenantDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tenant with code: {TenantCode}", request.Code);
            return Result<TenantDto>.Failure(DomainErrors.General.UnProcessableRequest);
        }
    }

    private string GenerateConnectionString(string tenantCode)
    {
        return _databaseSettings.GetTenantConnectionString(tenantCode);
    }
}