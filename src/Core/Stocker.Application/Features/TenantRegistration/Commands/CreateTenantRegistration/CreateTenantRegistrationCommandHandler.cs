using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Commands.CreateTenantRegistration;

public sealed class CreateTenantRegistrationCommandHandler : IRequestHandler<CreateTenantRegistrationCommand, Result<TenantRegistrationDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CreateTenantRegistrationCommandHandler> _logger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ICaptchaService _captchaService;

    public CreateTenantRegistrationCommandHandler(
        IMasterDbContext context,
        ILogger<CreateTenantRegistrationCommandHandler> logger,
        ICurrentUserService currentUserService,
        IBackgroundJobService backgroundJobService,
        ICaptchaService captchaService)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService;
        _backgroundJobService = backgroundJobService;
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

            // Save changes
            await _context.SaveChangesAsync(cancellationToken);
            
            // Note: TenantInitialData will be created after tenant approval and database creation
            // in the specific tenant's database context

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
                BillingCycle = registration.BillingCycle
            };

            _logger.LogInformation("Tenant registration created successfully. Code: {RegistrationCode}", registration.RegistrationCode);

            // Queue verification email as background job
            try
            {
                _backgroundJobService.Enqueue<IEmailBackgroundJob>(job =>
                    job.SendVerificationEmailAsync(
                        registration.ContactEmail.Value,
                        registration.EmailVerificationToken ?? "",
                        $"{registration.ContactPersonName} {registration.ContactPersonSurname}"));

                _logger.LogInformation("Verification email queued for {Email}", registration.ContactEmail.Value);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to queue verification email, but registration was successful");
                // Don't fail the registration if email queueing fails
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