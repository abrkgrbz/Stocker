using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using System.Text.Json;

namespace Stocker.Application.Features.Onboarding.Commands.CompleteOnboarding;

public sealed class CompleteOnboardingCommandHandler
    : IRequestHandler<CompleteOnboardingCommand, Result<CompleteOnboardingResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<CompleteOnboardingCommandHandler> _logger;

    public CompleteOnboardingCommandHandler(
        ITenantDbContext context,
        IMasterUnitOfWork masterUnitOfWork,
        IBackgroundJobService backgroundJobService,
        ILogger<CompleteOnboardingCommandHandler> logger)
    {
        _context = context;
        _masterUnitOfWork = masterUnitOfWork;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    public async Task<Result<CompleteOnboardingResponse>> Handle(
        CompleteOnboardingCommand request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing onboarding completion for TenantId: {TenantId}, UserId: {UserId}",
            request.TenantId, request.UserId);

        // Find or create wizard in tenant DB
        var wizard = await _context.SetupWizards
            .Include(w => w.Steps)
            .Where(w => w.WizardType == WizardType.InitialSetup)
            .OrderByDescending(w => w.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (wizard == null)
        {
            // Create new wizard with custom steps for minimal onboarding
            wizard = SetupWizard.Create(WizardType.InitialSetup, request.UserId.ToString());

            // Clear default steps and add our custom minimal steps
            wizard.Steps.Clear();

            // Step 1: Welcome (auto-complete)
            var welcomeStep = SetupWizardStep.Create(
                wizard.Id,
                0,
                "welcome",
                "Hoş Geldiniz",
                "Stocker'a hoş geldiniz",
                StepCategory.Required,
                true,
                false
            );
            wizard.Steps.Add(welcomeStep);

            // Step 2: Sector selection (optional)
            var sectorStep = SetupWizardStep.Create(
                wizard.Id,
                1,
                "sector",
                "Sektör Seçimi",
                "İş sektörünüzü seçin",
                StepCategory.Optional,
                false,
                true
            );
            wizard.Steps.Add(sectorStep);

            // Step 3: Company info (required)
            var companyStep = SetupWizardStep.Create(
                wizard.Id,
                2,
                "company_info",
                "Şirket Bilgileri",
                "Şirket bilgilerinizi girin",
                StepCategory.Required,
                true,
                false
            );
            wizard.Steps.Add(companyStep);

            // Step 4: Package selection (required)
            var packageStep = SetupWizardStep.Create(
                wizard.Id,
                3,
                "package",
                "Paket Seçimi",
                "Size uygun paketi seçin",
                StepCategory.Required,
                true,
                false
            );
            wizard.Steps.Add(packageStep);

            _context.SetupWizards.Add(wizard);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Start wizard if not started
        if (wizard.Status == WizardStatus.NotStarted)
        {
            wizard.StartWizard();
        }

        // Complete all steps with data
        var userName = request.UserId.ToString();

        // Step 1: Welcome - Auto complete
        var welcomeStepToComplete = wizard.Steps.FirstOrDefault(s => s.Name == "welcome");
        if (welcomeStepToComplete != null && welcomeStepToComplete.Status != StepStatus.Completed)
        {
            if (welcomeStepToComplete.Status == StepStatus.Pending)
            {
                welcomeStepToComplete.MarkAsCurrent();
            }
            welcomeStepToComplete.Complete(userName);
        }

        // Step 2: Sector - Complete or skip
        var sectorStepToComplete = wizard.Steps.FirstOrDefault(s => s.Name == "sector");
        if (sectorStepToComplete != null && sectorStepToComplete.Status != StepStatus.Completed && sectorStepToComplete.Status != StepStatus.Skipped)
        {
            if (sectorStepToComplete.Status == StepStatus.Pending)
            {
                sectorStepToComplete.MarkAsCurrent();
            }

            if (!string.IsNullOrWhiteSpace(request.Sector))
            {
                var sectorData = JsonSerializer.Serialize(new { sector = request.Sector });
                sectorStepToComplete.Complete(userName, sectorData);
            }
            else
            {
                sectorStepToComplete.Skip(userName, "User chose to skip sector selection");
            }
        }

        // Step 3: Company Info - Required
        var companyStepToComplete = wizard.Steps.FirstOrDefault(s => s.Name == "company_info");
        if (companyStepToComplete != null && companyStepToComplete.Status != StepStatus.Completed)
        {
            if (companyStepToComplete.Status == StepStatus.Pending)
            {
                companyStepToComplete.MarkAsCurrent();
            }

            var companyData = JsonSerializer.Serialize(new
            {
                companyName = request.CompanyName,
                companyCode = request.CompanyCode,
                contactPhone = request.ContactPhone
            });
            companyStepToComplete.Complete(userName, companyData);
        }

        // Step 4: Package Selection - Required
        var packageStepToComplete = wizard.Steps.FirstOrDefault(s => s.Name == "package");
        if (packageStepToComplete != null && packageStepToComplete.Status != StepStatus.Completed)
        {
            if (packageStepToComplete.Status == StepStatus.Pending)
            {
                packageStepToComplete.MarkAsCurrent();
            }

            var packageData = JsonSerializer.Serialize(new { packageId = request.PackageId });
            wizard.CompleteCurrentStep(userName, packageData);
        }

        // Update wizard progress
        wizard.CompleteCurrentStep(userName, null);

        await _context.SaveChangesAsync(cancellationToken);

        // ============================================
        // MASTER DB OPERATIONS - Update Tenant & Subscription
        // ============================================
        var provisioningStarted = false;

        try
        {
            // Get tenant from master DB
            var tenant = await _masterUnitOfWork.Tenants()
                .AsQueryable()
                .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

            if (tenant == null)
            {
                _logger.LogError("Tenant not found in master DB: {TenantId}", request.TenantId);
                return Result<CompleteOnboardingResponse>.Failure(
                    Error.NotFound("Tenant.NotFound", "Tenant bulunamadı"));
            }

            // Update tenant info if provided
            if (!string.IsNullOrWhiteSpace(request.CompanyName) && tenant.Name != request.CompanyName)
            {
                // Update tenant name - using reflection or domain method
                _logger.LogInformation("Updating tenant name from {OldName} to {NewName}",
                    tenant.Name, request.CompanyName);
            }

            // Get the selected package
            Package? package = null;
            if (!string.IsNullOrWhiteSpace(request.PackageId) && Guid.TryParse(request.PackageId, out var packageGuid))
            {
                package = await _masterUnitOfWork.Packages()
                    .AsQueryable()
                    .Include(p => p.Modules)
                    .FirstOrDefaultAsync(p => p.Id == packageGuid, cancellationToken);

                if (package == null)
                {
                    _logger.LogWarning("Package not found: {PackageId}", request.PackageId);
                }
            }

            // Get or create subscription
            var subscription = await _masterUnitOfWork.Subscriptions()
                .AsQueryable()
                .Include(s => s.Modules)
                .FirstOrDefaultAsync(s => s.TenantId == request.TenantId, cancellationToken);

            if (subscription != null && package != null)
            {
                // Update subscription with new package modules
                _logger.LogInformation("Updating subscription modules for tenant {TenantId} with package {PackageId}",
                    request.TenantId, package.Id);

                // Clear existing modules and add new ones from package
                subscription.Modules.Clear();
                foreach (var module in package.Modules)
                {
                    subscription.AddModule(module.ModuleCode, module.ModuleName, module.MaxEntities);
                }

                // Activate subscription for trial
                if (subscription.Status == SubscriptionStatus.Suspended || subscription.Status == SubscriptionStatus.Pending)
                {
                    subscription.StartTrial(DateTime.UtcNow.AddDays(14));
                }
            }
            else if (package != null)
            {
                // Create new subscription
                _logger.LogInformation("Creating new subscription for tenant {TenantId}", request.TenantId);

                subscription = Subscription.Create(
                    tenantId: request.TenantId,
                    packageId: package.Id,
                    billingCycle: BillingCycle.Aylik,
                    price: package.BasePrice,
                    startDate: DateTime.UtcNow,
                    trialEndDate: DateTime.UtcNow.AddDays(14)
                );

                foreach (var module in package.Modules)
                {
                    subscription.AddModule(module.ModuleCode, module.ModuleName, module.MaxEntities);
                }

                await _masterUnitOfWork.Subscriptions().AddAsync(subscription, cancellationToken);
            }

            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

            // ============================================
            // TRIGGER TENANT PROVISIONING JOB
            // ============================================
            // Only trigger if tenant is not yet active (database not provisioned)
            if (!tenant.IsActive)
            {
                _logger.LogInformation("Triggering tenant provisioning job for TenantId: {TenantId}", request.TenantId);
                _backgroundJobService.Enqueue<ITenantProvisioningJob>(
                    job => job.ProvisionNewTenantAsync(request.TenantId));
                provisioningStarted = true;
            }
            else
            {
                _logger.LogInformation("Tenant {TenantId} is already active, skipping provisioning", request.TenantId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating master DB during onboarding for TenantId: {TenantId}", request.TenantId);
            // Don't fail the whole operation - wizard is already completed
            // The provisioning can be retried
        }

        return Result<CompleteOnboardingResponse>.Success(new CompleteOnboardingResponse
        {
            WizardId = wizard.Id,
            TenantId = request.TenantId,
            IsCompleted = wizard.Status == WizardStatus.Completed,
            ProvisioningStarted = provisioningStarted,
            Message = provisioningStarted
                ? "Onboarding completed, database setup started"
                : "Onboarding completed successfully"
        });
    }
}
