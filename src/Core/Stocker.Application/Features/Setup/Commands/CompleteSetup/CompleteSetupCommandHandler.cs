using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Master.Entities;

namespace Stocker.Application.Features.Setup.Commands.CompleteSetup;

public sealed class CompleteSetupCommandHandler : IRequestHandler<CompleteSetupCommand, Result<CompleteSetupResponse>>
{
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private readonly ITenantContextFactory _tenantContextFactory;
    private readonly ILogger<CompleteSetupCommandHandler> _logger;

    public CompleteSetupCommandHandler(
        IMasterUnitOfWork masterUnitOfWork,
        ITenantContextFactory tenantContextFactory,
        ILogger<CompleteSetupCommandHandler> logger)
    {
        _masterUnitOfWork = masterUnitOfWork;
        _tenantContextFactory = tenantContextFactory;
        _logger = logger;
    }

    public async Task<Result<CompleteSetupResponse>> Handle(CompleteSetupCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("SETUP START - UserId: {UserId}, TenantId: {TenantId}, PackageId: {PackageId}",
                request.UserId, request.TenantId, request.PackageId);

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.CompanyName))
            {
                return Result<CompleteSetupResponse>.Failure(
                    Error.Validation("Setup.MissingFields", "Firma adı zorunludur"));
            }

            // Verify package exists
            var package = await _masterUnitOfWork.Repository<Package>()
                .GetByIdAsync(request.PackageId, cancellationToken);

            if (package == null)
            {
                return Result<CompleteSetupResponse>.Failure(
                    Error.NotFound("Setup.PackageNotFound", "Seçilen paket bulunamadı"));
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

            // Use tenant code instead of requesting it again from user
            var tenantCode = tenant.Code;

            Guid companyId = Guid.Empty;
            Guid subscriptionId = Guid.Empty;

            // Create company and subscription in tenant database
            try
            {
                using (var tenantContext = await _tenantContextFactory.CreateAsync(request.TenantId))
                {
                    // Create Company with required fields
                    var emailResult = Domain.Common.ValueObjects.Email.Create(user.Email.Value);
                    if (emailResult.IsFailure)
                    {
                        return Result<CompleteSetupResponse>.Failure(
                            Error.Validation("Setup.InvalidEmail", "Geçersiz e-posta adresi"));
                    }

                    // Create phone if provided
                    Domain.Common.ValueObjects.PhoneNumber? phone = null;
                    if (!string.IsNullOrWhiteSpace(request.ContactPhone))
                    {
                        var phoneResult = Domain.Common.ValueObjects.PhoneNumber.Create(request.ContactPhone);
                        if (phoneResult.IsSuccess)
                        {
                            phone = phoneResult.Value;
                        }
                    }

                    // Create address
                    var addressResult = Domain.Common.ValueObjects.CompanyAddress.Create(
                        country: "Türkiye",
                        city: "İstanbul", // Default
                        district: "Merkez", // Default
                        postalCode: null,
                        addressLine: request.Address ?? "Adres belirtilmemiş");

                    if (addressResult.IsFailure)
                    {
                        return Result<CompleteSetupResponse>.Failure(
                            Error.Validation("Setup.InvalidAddress", "Geçersiz adres bilgisi"));
                    }

                    var company = Company.Create(
                        tenantId: request.TenantId,
                        name: request.CompanyName,
                        code: tenantCode, // Use tenant code instead of requesting from user
                        taxNumber: request.TaxNumber ?? "0000000000", // Default if not provided
                        email: emailResult.Value,
                        address: addressResult.Value,
                        phone: phone,
                        taxOffice: request.TaxOffice,
                        sector: request.Sector,
                        employeeCount: ParseEmployeeCount(request.EmployeeCount));

                    await tenantContext.Set<Company>().AddAsync(company, cancellationToken);
                    await tenantContext.SaveChangesAsync(cancellationToken);

                    companyId = company.Id;
                    _logger.LogInformation("Company created with ID: {CompanyId}", companyId);

                    // Create Subscription in Master database
                    var trialEndDate = package.TrialDays > 0
                        ? DateTime.UtcNow.AddDays(package.TrialDays)
                        : (DateTime?)null;

                    var subscription = Domain.Master.Entities.Subscription.Create(
                        tenantId: request.TenantId,
                        packageId: request.PackageId,
                        billingCycle: Domain.Master.Enums.BillingCycle.Aylik,
                        price: package.BasePrice,
                        startDate: DateTime.UtcNow,
                        trialEndDate: trialEndDate);

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

            // Create and complete SetupWizard in tenant database to mark setup as done
            try
            {
                using (var tenantContext = await _tenantContextFactory.CreateAsync(request.TenantId))
                {
                    // Create SetupWizard with InitialSetup type
                    var setupWizard = SetupWizard.Create(
                        WizardType.InitialSetup,
                        startedBy: user.Username);

                    // Start and immediately complete the wizard since setup form submits everything at once
                    setupWizard.StartWizard();

                    // Complete all required steps
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
                // Don't fail the entire setup for this - the company and subscription are already created
            }

            _logger.LogInformation("Setup completed successfully - CompanyId: {CompanyId}, SubscriptionId: {SubscriptionId}",
                companyId, subscriptionId);

            return Result<CompleteSetupResponse>.Success(new CompleteSetupResponse
            {
                Success = true,
                Message = "Kurulum başarıyla tamamlandı",
                CompanyId = companyId,
                SubscriptionId = subscriptionId,
                SetupCompleted = true,
                RedirectUrl = "/dashboard"
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

    private static int? ParseEmployeeCount(string? employeeCountString)
    {
        if (string.IsNullOrWhiteSpace(employeeCountString))
            return null;

        return employeeCountString switch
        {
            "1-10" => 5,
            "11-50" => 30,
            "51-200" => 125,
            "201-500" => 350,
            "500+" => 1000,
            _ => null
        };
    }
}
