using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Results;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Features.TenantRegistration.Commands.CreateTenantRegistration;

public sealed class CreateTenantRegistrationCommandHandler : IRequestHandler<CreateTenantRegistrationCommand, Result<TenantRegistrationDto>>
{
    private readonly MasterDbContext _context;
    private readonly ILogger<CreateTenantRegistrationCommandHandler> _logger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IEmailService _emailService;
    private readonly ICaptchaService _captchaService;

    public CreateTenantRegistrationCommandHandler(
        MasterDbContext context,
        ILogger<CreateTenantRegistrationCommandHandler> logger,
        ICurrentUserService currentUserService,
        IEmailService emailService,
        ICaptchaService captchaService)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService;
        _emailService = emailService;
        _captchaService = captchaService;
    }

    public async Task<Result<TenantRegistrationDto>> Handle(CreateTenantRegistrationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify captcha if provided
            if (!string.IsNullOrEmpty(request.CaptchaToken))
            {
                var captchaValid = await _captchaService.VerifyAsync(request.CaptchaToken, null, cancellationToken);
                if (!captchaValid)
                {
                    return Result<TenantRegistrationDto>.Failure(Error.Validation("Captcha.Invalid", "Güvenlik doğrulaması başarısız."));
                }
            }
            
            // Check if company code already exists
            var existingCode = await _context.TenantRegistrations
                .AnyAsync(x => x.CompanyCode == request.CompanyCode, cancellationToken);
                
            if (existingCode)
                return Result<TenantRegistrationDto>.Failure(Error.Validation("CompanyCode.Exists", "Bu şirket kodu zaten kullanılıyor."));

            // Check if email already exists
            var contactEmailResult = Email.Create(request.ContactEmail);
            if (contactEmailResult.IsFailure)
                return Result<TenantRegistrationDto>.Failure(contactEmailResult.Error);
                
            var adminEmailResult = Email.Create(request.AdminEmail);
            if (adminEmailResult.IsFailure)
                return Result<TenantRegistrationDto>.Failure(adminEmailResult.Error);
                
            var contactEmail = contactEmailResult.Value;
            var adminEmail = adminEmailResult.Value;
            
            var existingEmail = await _context.TenantRegistrations
                .AnyAsync(x => x.ContactEmail == contactEmail || x.AdminEmail == adminEmail, cancellationToken);
                
            if (existingEmail)
                return Result<TenantRegistrationDto>.Failure(Error.Validation("Email.Exists", "Bu e-posta adresi zaten kayıtlı."));

            // Create value objects
            var contactPhoneResult = PhoneNumber.Create(request.ContactPhone);
            if (contactPhoneResult.IsFailure)
                return Result<TenantRegistrationDto>.Failure(contactPhoneResult.Error);
                
            var contactPhone = contactPhoneResult.Value;

            // Create TenantRegistration entity
            var registration = Domain.Master.Entities.TenantRegistration.Create(
                companyName: request.CompanyName,
                companyCode: request.CompanyCode,
                contactPersonName: request.AdminFirstName,
                contactPersonSurname: request.AdminLastName,
                contactEmail: contactEmail,
                contactPhone: contactPhone,
                addressLine1: request.AddressLine1 ?? string.Empty,
                city: request.City ?? string.Empty,
                postalCode: request.PostalCode ?? string.Empty,
                country: request.Country ?? "Türkiye",
                adminEmail: adminEmail,
                adminUsername: request.AdminUsername,
                adminFirstName: request.AdminFirstName,
                adminLastName: request.AdminLastName);

            // Set tax info
            if (!string.IsNullOrEmpty(request.TaxNumber))
            {
                registration.SetTaxInfo(request.TaxNumber, request.TaxOffice ?? string.Empty);
            }
            
            // Set company details
            registration.SetCompanyDetails(
                request.Website,
                ParseEmployeeCount(request.EmployeeCountRange) ?? 0,
                request.IndustryType);
                
            // Set admin info
            registration.SetAdminInfo(request.AdminPhone, request.AdminTitle);
            
            // Set billing info
            registration.SetBillingInfo(
                request.PackageId.HasValue ? "Professional" : "Trial",
                request.BillingCycle);

            // Select package if provided
            if (request.PackageId.HasValue)
            {
                var package = await _context.Packages
                    .FirstOrDefaultAsync(x => x.Id == request.PackageId.Value, cancellationToken);
                    
                if (package != null)
                {
                    registration.SelectPackage(request.PackageId.Value, package.Name, request.BillingCycle);
                }
            }

            // Add to context
            _context.TenantRegistrations.Add(registration);

            // Create TenantInitialData for setup process
            var initialData = TenantInitialData.Create(
                tenantId: Guid.Empty, // Will be updated after tenant creation
                companyName: request.CompanyName,
                contactEmail: request.ContactEmail,
                contactPhone: request.ContactPhone,
                adminUserEmail: request.AdminEmail,
                adminUserName: request.AdminUsername,
                createdBy: request.AdminEmail);

            initialData.UpdateCompanyDetails(
                request.TaxNumber,
                request.TaxOffice,
                request.TradeRegistryNumber,
                request.MersisNumber,
                request.Website);

            initialData.UpdateAddress(
                request.AddressLine1,
                request.AddressLine2,
                request.City,
                request.State,
                request.Country,
                request.PostalCode);

            initialData.UpdateBusinessInfo(
                request.IndustryType,
                request.BusinessType,
                ParseEmployeeCount(request.EmployeeCountRange),
                request.AnnualRevenue,
                request.Currency,
                null);

            initialData.UpdateAdminUser(
                request.AdminFirstName,
                request.AdminLastName,
                request.AdminPhone);

            initialData.UpdateDefaultSettings(
                request.PreferredLanguage,
                request.PreferredTimeZone,
                "dd.MM.yyyy",
                "HH:mm",
                request.Currency ?? "TRY",
                "light");

            _context.TenantInitialData.Add(initialData);

            // Save changes
            await _context.SaveChangesAsync(cancellationToken);

            // Map to DTO
            var dto = new TenantRegistrationDto
            {
                Id = registration.Id,
                RegistrationCode = registration.RegistrationCode,
                CompanyName = registration.CompanyName,
                CompanyCode = registration.CompanyCode,
                Status = registration.Status.ToString(),
                ContactEmail = registration.ContactEmail.Value,
                ContactPhone = registration.ContactPhone.Value,
                AdminEmail = registration.AdminEmail.Value,
                AdminName = $"{registration.AdminFirstName} {registration.AdminLastName}",
                RequestedAt = registration.RegistrationDate,
                PackageId = registration.SelectedPackageId,
                PackageName = registration.PackageName,
                BillingCycle = registration.BillingCycle,
                InitialDataId = initialData.Id
            };

            _logger.LogInformation("Tenant registration created successfully. Code: {RegistrationCode}", registration.RegistrationCode);

            // Send email verification
            try
            {
                await _emailService.SendEmailVerificationAsync(
                    email: registration.ContactEmail.Value,
                    token: registration.EmailVerificationToken ?? "",
                    userName: $"{registration.ContactPersonName} {registration.ContactPersonSurname}",
                    cancellationToken);
                
                _logger.LogInformation("Verification email sent to {Email}", registration.ContactEmail.Value);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to send verification email, but registration was successful");
                // Don't fail the registration if email fails
            }

            return Result<TenantRegistrationDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tenant registration");
            return Result<TenantRegistrationDto>.Failure(Error.Failure("Registration.CreateFailed", $"Kayıt oluşturulurken hata oluştu: {ex.Message}"));
        }
    }

    private string GenerateRegistrationCode()
    {
        return $"REG-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
    }

    private int? ParseEmployeeCount(string? range)
    {
        if (string.IsNullOrEmpty(range))
            return null;

        return range switch
        {
            "1-10" => 5,
            "11-50" => 30,
            "51-100" => 75,
            "101-500" => 300,
            "500+" => 1000,
            _ => null
        };
    }
}