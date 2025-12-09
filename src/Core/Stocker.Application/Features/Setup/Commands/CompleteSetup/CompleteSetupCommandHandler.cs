using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Master.Entities;
using BillingCycle = Stocker.Domain.Master.Enums.BillingCycle;
using MasterTenant = Stocker.Domain.Master.Entities.Tenant;

namespace Stocker.Application.Features.Setup.Commands.CompleteSetup;

public sealed class CompleteSetupCommandHandler : IRequestHandler<CompleteSetupCommand, Result<CompleteSetupResponse>>
{
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private readonly IMasterDbContext _masterDbContext;
    private readonly ITenantContextFactory _tenantContextFactory;
    private readonly ITenantStorageService _tenantStorageService;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<CompleteSetupCommandHandler> _logger;

    public CompleteSetupCommandHandler(
        IMasterUnitOfWork masterUnitOfWork,
        IMasterDbContext masterDbContext,
        ITenantContextFactory tenantContextFactory,
        ITenantStorageService tenantStorageService,
        IBackgroundJobService backgroundJobService,
        ILogger<CompleteSetupCommandHandler> logger)
    {
        _masterUnitOfWork = masterUnitOfWork;
        _masterDbContext = masterDbContext;
        _tenantContextFactory = tenantContextFactory;
        _tenantStorageService = tenantStorageService;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    public async Task<Result<CompleteSetupResponse>> Handle(CompleteSetupCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("SETUP START - UserId: {UserId}, TenantId: {TenantId}, PackageId: {PackageId}, HasCustomPackage: {HasCustom}",
                request.UserId, request.TenantId, request.PackageId, request.CustomPackage != null);

            // Validate: Either PackageId or CustomPackage must be provided
            if (request.PackageId == null && request.CustomPackage == null)
            {
                return Result<CompleteSetupResponse>.Failure(
                    Error.Validation("Setup.MissingPackage", "Lütfen bir paket seçin veya özel paket oluşturun"));
            }

            // Verify user exists
            var user = await _masterUnitOfWork.Repository<MasterUser>()
                .GetByIdAsync(request.UserId, cancellationToken);

            if (user == null)
            {
                return Result<CompleteSetupResponse>.Failure(
                    Error.NotFound("Setup.UserNotFound", "Kullanıcı bulunamadı"));
            }

            // Verify tenant exists and get its code
            var tenant = await _masterUnitOfWork.Repository<Domain.Master.Entities.Tenant>()
                .GetByIdAsync(request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<CompleteSetupResponse>.Failure(
                    Error.NotFound("Setup.TenantNotFound", "Tenant bulunamadı"));
            }

            var tenantCode = tenant.Code;
            Guid companyId = Guid.Empty;
            Guid subscriptionId = Guid.Empty;
            Package? package = null;
            Domain.Common.ValueObjects.Money subscriptionPrice;
            BillingCycle billingCycle = BillingCycle.Aylik;
            int trialDays = 14; // Default trial
            long storageQuotaGB = 5; // Default storage quota

            // Handle ready package
            if (request.PackageId.HasValue)
            {
                package = await _masterUnitOfWork.Repository<Package>()
                    .GetByIdAsync(request.PackageId.Value, cancellationToken);

                if (package == null)
                {
                    return Result<CompleteSetupResponse>.Failure(
                        Error.NotFound("Setup.PackageNotFound", "Seçilen paket bulunamadı"));
                }

                subscriptionPrice = package.BasePrice;
                trialDays = package.TrialDays;

                // Get storage quota from package's limits
                if (package.Limits?.MaxStorage > 0)
                {
                    storageQuotaGB = package.Limits.MaxStorage;
                }
            }
            // Handle custom package
            else if (request.CustomPackage != null)
            {
                var customPriceResult = await CalculateCustomPackagePrice(request.CustomPackage, cancellationToken);
                if (customPriceResult.IsFailure)
                {
                    return Result<CompleteSetupResponse>.Failure(customPriceResult.Error);
                }

                subscriptionPrice = customPriceResult.Value;
                billingCycle = ParseBillingCycle(request.CustomPackage.BillingCycle);

                // Get storage quota from custom package's storage plan
                if (!string.IsNullOrEmpty(request.CustomPackage.StoragePlanCode))
                {
                    var storagePlan = await _masterDbContext.StoragePlans
                        .AsNoTracking()
                        .FirstOrDefaultAsync(sp => sp.Code == request.CustomPackage.StoragePlanCode && sp.IsActive, cancellationToken);

                    if (storagePlan != null)
                    {
                        storageQuotaGB = storagePlan.StorageGB;
                    }
                }
            }
            else
            {
                return Result<CompleteSetupResponse>.Failure(
                    Error.Validation("Setup.MissingPackage", "Paket bilgisi eksik"));
            }

            // Create company and subscription in tenant database
            try
            {
                using (var tenantContext = await _tenantContextFactory.CreateAsync(request.TenantId))
                {
                    // Create Company with default values (billing info will be collected when creating invoice)
                    var emailResult = Domain.Common.ValueObjects.Email.Create(user.Email.Value);
                    if (emailResult.IsFailure)
                    {
                        return Result<CompleteSetupResponse>.Failure(
                            Error.Validation("Setup.InvalidEmail", "Geçersiz e-posta adresi"));
                    }

                    // Create default address
                    var addressResult = Domain.Common.ValueObjects.CompanyAddress.Create(
                        country: "Türkiye",
                        city: "Belirtilmemiş",
                        district: "Belirtilmemiş",
                        postalCode: null,
                        addressLine: "Adres fatura oluşturulurken girilecektir");

                    if (addressResult.IsFailure)
                    {
                        return Result<CompleteSetupResponse>.Failure(
                            Error.Validation("Setup.InvalidAddress", "Adres oluşturulamadı"));
                    }

                    // Use tenant name or user's display name for company
                    var companyName = tenant.Name ?? user.Username;

                    var company = Company.Create(
                        tenantId: request.TenantId,
                        name: companyName,
                        code: tenantCode,
                        taxNumber: "0000000000", // Placeholder - will be updated when creating invoice
                        email: emailResult.Value,
                        address: addressResult.Value,
                        phone: null,
                        taxOffice: null,
                        sector: request.CustomPackage?.IndustryCode,
                        employeeCount: request.CustomPackage?.UserCount);

                    await tenantContext.Set<Company>().AddAsync(company, cancellationToken);
                    await tenantContext.SaveChangesAsync(cancellationToken);

                    companyId = company.Id;
                    _logger.LogInformation("Company created with ID: {CompanyId}", companyId);

                    // Create Subscription in Master database
                    var trialEndDate = trialDays > 0
                        ? DateTime.UtcNow.AddDays(trialDays)
                        : (DateTime?)null;

                    var subscription = Domain.Master.Entities.Subscription.Create(
                        tenantId: request.TenantId,
                        packageId: request.PackageId, // null for custom packages
                        billingCycle: billingCycle,
                        price: subscriptionPrice,
                        startDate: DateTime.UtcNow,
                        trialEndDate: trialEndDate);

                    // Store custom package details if applicable
                    if (request.CustomPackage != null)
                    {
                        subscription.SetCustomPackageDetails(
                            request.CustomPackage.SelectedModuleCodes,
                            request.CustomPackage.UserCount,
                            request.CustomPackage.StoragePlanCode,
                            request.CustomPackage.SelectedAddOnCodes);
                    }

                    await _masterUnitOfWork.Repository<Domain.Master.Entities.Subscription>()
                        .AddAsync(subscription, cancellationToken);
                    await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

                    subscriptionId = subscription.Id;
                    _logger.LogInformation("Subscription created with ID: {SubscriptionId}", subscriptionId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create company and subscription for tenant {TenantId}", request.TenantId);
                return Result<CompleteSetupResponse>.Failure(
                    Error.Failure("Setup.TenantSetupFailed", "Kurulum sırasında bir hata oluştu"));
            }

            // Create tenant storage bucket in MinIO
            string? bucketName = null;
            try
            {
                var bucketResult = await _tenantStorageService.CreateTenantBucketAsync(
                    request.TenantId,
                    storageQuotaGB,
                    cancellationToken);

                if (bucketResult.IsSuccess)
                {
                    bucketName = bucketResult.Value;
                    _logger.LogInformation(
                        "Tenant storage bucket created. TenantId: {TenantId}, Bucket: {Bucket}, QuotaGB: {QuotaGB}",
                        request.TenantId, bucketName, storageQuotaGB);

                    // Update subscription with storage bucket info
                    try
                    {
                        var subscription = await _masterUnitOfWork.Repository<Domain.Master.Entities.Subscription>()
                            .GetByIdAsync(subscriptionId, cancellationToken);

                        if (subscription != null)
                        {
                            subscription.SetStorageBucket(bucketName, storageQuotaGB);
                            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);
                            _logger.LogInformation(
                                "Subscription storage info updated. SubscriptionId: {SubscriptionId}, Bucket: {Bucket}",
                                subscriptionId, bucketName);
                        }
                    }
                    catch (Exception updateEx)
                    {
                        _logger.LogWarning(updateEx,
                            "Failed to update subscription with storage info. SubscriptionId: {SubscriptionId}",
                            subscriptionId);
                    }
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to create tenant storage bucket. TenantId: {TenantId}, Error: {Error}. " +
                        "Bucket will need to be created manually or on first upload.",
                        request.TenantId, bucketResult.Error.Description);
                    // Don't fail setup - bucket can be created later
                }
            }
            catch (Exception storageEx)
            {
                _logger.LogError(storageEx,
                    "Exception creating tenant storage bucket. TenantId: {TenantId}",
                    request.TenantId);
                // Don't fail setup - storage bucket creation is not critical
            }

            // Create and complete SetupWizard in tenant database to mark setup as done
            try
            {
                using (var tenantContext = await _tenantContextFactory.CreateAsync(request.TenantId))
                {
                    var setupWizard = SetupWizard.Create(
                        WizardType.InitialSetup,
                        startedBy: user.Username);

                    setupWizard.StartWizard();

                    while (setupWizard.Status == WizardStatus.InProgress)
                    {
                        setupWizard.CompleteCurrentStep(completedBy: user.Username, stepData: null);
                    }

                    await tenantContext.Set<SetupWizard>().AddAsync(setupWizard, cancellationToken);
                    await tenantContext.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation("SetupWizard created and completed for tenant {TenantId}", request.TenantId);
                }
            }
            catch (Exception setupEx)
            {
                _logger.LogError(setupEx, "Failed to create SetupWizard record for tenant {TenantId}", request.TenantId);
            }

            // Trigger tenant provisioning job
            var provisioningStarted = false;
            try
            {
                var masterTenant = await _masterUnitOfWork.Repository<MasterTenant>()
                    .GetByIdAsync(request.TenantId, cancellationToken);

                _logger.LogWarning("🔍 SETUP DEBUG - TenantId: {TenantId}, IsActive: {IsActive}",
                    request.TenantId, masterTenant?.IsActive);

                if (masterTenant != null && !masterTenant.IsActive)
                {
                    // Tenant not yet active - run full provisioning (database + modules)
                    _logger.LogWarning("🚀 TRIGGERING FULL PROVISIONING JOB from CompleteSetup for TenantId: {TenantId}", request.TenantId);
                    // Schedule with 3 second delay to allow frontend SignalR connection to establish
                    _backgroundJobService.Schedule<ITenantProvisioningJob>(
                        job => job.ProvisionNewTenantAsync(request.TenantId),
                        TimeSpan.FromSeconds(3));
                    provisioningStarted = true;
                }
                else if (masterTenant != null && masterTenant.IsActive)
                {
                    // Tenant already active - run module-only provisioning for newly selected modules
                    _logger.LogWarning("🚀 TRIGGERING MODULE PROVISIONING JOB from CompleteSetup for TenantId: {TenantId}", request.TenantId);
                    // Schedule with 3 second delay to allow frontend SignalR connection to establish
                    _backgroundJobService.Schedule<ITenantProvisioningJob>(
                        job => job.ProvisionModulesAsync(request.TenantId),
                        TimeSpan.FromSeconds(3));
                    provisioningStarted = true;
                }
            }
            catch (Exception provisionEx)
            {
                _logger.LogError(provisionEx, "Error triggering provisioning job for TenantId: {TenantId}", request.TenantId);
                // Don't fail setup - provisioning can be retried
            }

            _logger.LogInformation("Setup completed successfully - CompanyId: {CompanyId}, SubscriptionId: {SubscriptionId}, ProvisioningStarted: {ProvisioningStarted}",
                companyId, subscriptionId, provisioningStarted);

            return Result<CompleteSetupResponse>.Success(new CompleteSetupResponse
            {
                Success = true,
                Message = provisioningStarted
                    ? "Kurulum başlatıldı, veritabanı hazırlanıyor"
                    : "Kurulum başarıyla tamamlandı",
                CompanyId = companyId,
                SubscriptionId = subscriptionId,
                TenantId = request.TenantId,
                SetupCompleted = true,
                ProvisioningStarted = provisioningStarted,
                RedirectUrl = provisioningStarted ? "" : "/dashboard"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SETUP ERROR - UserId: {UserId}, TenantId: {TenantId}",
                request.UserId, request.TenantId);
            return Result<CompleteSetupResponse>.Failure(
                Error.Failure("Setup.Failed", "Kurulum sırasında bir hata oluştu"));
        }
    }

    private async Task<Result<Domain.Common.ValueObjects.Money>> CalculateCustomPackagePrice(
        CustomPackageRequest customPackage,
        CancellationToken cancellationToken)
    {
        decimal totalMonthly = 0m;

        // Calculate module prices
        var modules = await _masterDbContext.ModuleDefinitions
            .AsNoTracking()
            .Where(m => m.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var moduleCode in customPackage.SelectedModuleCodes)
        {
            var module = modules.FirstOrDefault(m => m.Code == moduleCode);
            if (module != null)
            {
                totalMonthly += module.MonthlyPrice.Amount;
            }
        }

        // Calculate user tier price
        if (customPackage.UserCount > 0)
        {
            var userTiers = await _masterDbContext.UserTiers
                .AsNoTracking()
                .Where(ut => ut.IsActive)
                .OrderBy(ut => ut.DisplayOrder)
                .ToListAsync(cancellationToken);

            var applicableTier = userTiers.FirstOrDefault(t => t.IsWithinRange(customPackage.UserCount));
            if (applicableTier != null)
            {
                var tierPrice = applicableTier.CalculatePrice(customPackage.UserCount);
                totalMonthly += tierPrice.Amount;
            }
        }

        // Calculate storage price
        if (!string.IsNullOrEmpty(customPackage.StoragePlanCode))
        {
            var storagePlan = await _masterDbContext.StoragePlans
                .AsNoTracking()
                .FirstOrDefaultAsync(sp => sp.Code == customPackage.StoragePlanCode && sp.IsActive, cancellationToken);

            if (storagePlan != null)
            {
                totalMonthly += storagePlan.MonthlyPrice.Amount;
            }
        }

        // Calculate add-on prices
        if (customPackage.SelectedAddOnCodes?.Any() == true)
        {
            var addOns = await _masterDbContext.AddOns
                .AsNoTracking()
                .Where(a => a.IsActive && customPackage.SelectedAddOnCodes.Contains(a.Code))
                .ToListAsync(cancellationToken);

            totalMonthly += addOns.Sum(a => a.MonthlyPrice.Amount);
        }

        // Apply billing cycle discount
        var billingCycle = ParseBillingCycle(customPackage.BillingCycle);
        var multiplier = GetBillingMultiplier(billingCycle);
        var discountPercent = GetBillingDiscount(billingCycle);
        var finalPrice = totalMonthly * multiplier * (1 - discountPercent / 100);

        return Result<Domain.Common.ValueObjects.Money>.Success(
            Domain.Common.ValueObjects.Money.Create(Math.Round(finalPrice, 2), "TRY"));
    }

    private static BillingCycle ParseBillingCycle(string cycle)
    {
        return cycle?.ToLowerInvariant() switch
        {
            "quarterly" => BillingCycle.UcAylik,
            "semiannual" => BillingCycle.AltiAylik,
            "annual" => BillingCycle.Yillik,
            _ => BillingCycle.Aylik
        };
    }

    private static int GetBillingMultiplier(BillingCycle cycle)
    {
        return cycle switch
        {
            BillingCycle.UcAylik => 3,
            BillingCycle.AltiAylik => 6,
            BillingCycle.Yillik => 12,
            _ => 1
        };
    }

    private static decimal GetBillingDiscount(BillingCycle cycle)
    {
        return cycle switch
        {
            BillingCycle.UcAylik => 10m,
            BillingCycle.AltiAylik => 15m,
            BillingCycle.Yillik => 20m,
            _ => 0m
        };
    }
}
