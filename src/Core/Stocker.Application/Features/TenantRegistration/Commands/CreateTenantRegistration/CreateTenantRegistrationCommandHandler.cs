using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Commands.CreateTenantRegistration;

public sealed class CreateTenantRegistrationCommandHandler : IRequestHandler<CreateTenantRegistrationCommand, Result<TenantRegistrationDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CreateTenantRegistrationCommandHandler> _logger;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ICaptchaService _captchaService;

    public CreateTenantRegistrationCommandHandler(
        IMasterDbContext context,
        ILogger<CreateTenantRegistrationCommandHandler> logger,
        IBackgroundJobService backgroundJobService,
        ICaptchaService captchaService)
    {
        _context = context;
        _logger = logger;
        _backgroundJobService = backgroundJobService;
        _captchaService = captchaService;
    }

    public async Task<Result<TenantRegistrationDto>> Handle(CreateTenantRegistrationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify reCAPTCHA v3 token
            if (!string.IsNullOrEmpty(request.CaptchaToken))
            {
                var captchaResult = await _captchaService.VerifyDetailedAsync(request.CaptchaToken, null, cancellationToken);

                if (!captchaResult.Success)
                {
                    _logger.LogWarning("CAPTCHA verification failed for registration attempt. Token: {Token}",
                        request.CaptchaToken?[..Math.Min(10, request.CaptchaToken.Length)] + "...");
                    return Result<TenantRegistrationDto>.Failure(Error.Validation("Captcha.Invalid", "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin."));
                }

                // For reCAPTCHA v3, check score (0.0 = likely bot, 1.0 = likely human)
                if (captchaResult.Score < 0.5)
                {
                    _logger.LogWarning("CAPTCHA score too low: {Score} for registration attempt", captchaResult.Score);
                    return Result<TenantRegistrationDto>.Failure(Error.Validation("Captcha.LowScore", "Güvenlik doğrulaması başarısız. Bot aktivitesi tespit edildi."));
                }

                _logger.LogInformation("CAPTCHA verification successful. Score: {Score}", captchaResult.Score);
            }
            else
            {
                _logger.LogWarning("No CAPTCHA token provided for registration attempt");
                // In production, you might want to reject requests without CAPTCHA
                // return Result<TenantRegistrationDto>.Failure(Error.Validation("Captcha.Required", "Güvenlik doğrulaması gerekli."));
            }

            // Normalize team name to lowercase subdomain
            var subdomain = request.TeamName.ToLowerInvariant().Trim();

            // Check if company code (subdomain) already exists
            var existingCode = await _context.TenantRegistrations
                .AnyAsync(x => x.CompanyCode == subdomain, cancellationToken);

            if (existingCode)
                return Result<TenantRegistrationDto>.Failure(Error.Validation("TeamName.Exists", "Bu takım adı zaten kullanılıyor."));

            // Check if email already exists in registrations
            var emailResult = Email.Create(request.Email);
            if (emailResult.IsFailure)
                return Result<TenantRegistrationDto>.Failure(emailResult.Error);

            var email = emailResult.Value;

            var existingEmail = await _context.TenantRegistrations
                .AnyAsync(x => x.ContactEmail == email || x.AdminEmail == email, cancellationToken);

            if (existingEmail)
                return Result<TenantRegistrationDto>.Failure(Error.Validation("Email.Exists", "Bu e-posta adresi zaten kayıtlı."));

            // Check if email already exists in master users
            // Note: For owned entities, compare the Value property directly
            var existingUser = await _context.MasterUsers
                .AnyAsync(x => x.Email.Value == email.Value, cancellationToken);

            if (existingUser)
                return Result<TenantRegistrationDto>.Failure(Error.Validation("Email.Exists", "Bu e-posta adresi zaten kullanılıyor."));

            // Create dummy phone (will be updated later in setup wizard)
            var dummyPhone = PhoneNumber.Create("+905551234567").Value;

            // Use team name + user's name as company name initially
            var companyName = $"{request.FirstName} {request.LastName}'s Team";

            // Create TenantRegistration entity
            var registration = Domain.Master.Entities.TenantRegistration.Create(
                companyName: companyName,
                companyCode: subdomain,
                contactPersonName: request.FirstName,
                contactPersonSurname: request.LastName,
                contactEmail: email,
                contactPhone: dummyPhone,
                addressLine1: "To be provided", // Will be set in setup wizard
                city: "To be provided",
                postalCode: "00000",
                country: "Türkiye",
                adminEmail: email,
                adminUsername: subdomain, // Use subdomain as username
                adminFirstName: request.FirstName,
                adminLastName: request.LastName);

            // Set admin password (hash it)
            var hashedPassword = Domain.Master.ValueObjects.HashedPassword.Create(request.Password);
            registration.SetAdminPassword(hashedPassword.Value);

            // Set billing info (default to Trial)
            registration.SetBillingInfo("Trial", "Monthly");

            // Accept terms if provided
            if (request.AcceptTerms)
            {
                registration.AcceptTerms("1.0");
            }

            if (request.AcceptPrivacyPolicy)
            {
                registration.AcceptPrivacyPolicy();
            }

            // Add to context
            _context.TenantRegistrations.Add(registration);

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
                BillingCycle = registration.BillingCycle
            };

            _logger.LogInformation("Minimal tenant registration created successfully. Code: {RegistrationCode}, Email: {Email}",
                registration.RegistrationCode, registration.ContactEmail.Value);

            // Queue verification email as background job
            try
            {
                _logger.LogInformation("Queueing verification email for {Email} with code {Code}",
                    registration.ContactEmail.Value,
                    registration.EmailVerificationCode ?? "NULL");

                var jobId = _backgroundJobService.Enqueue<IEmailBackgroundJob>(job =>
                    job.SendTenantVerificationEmailAsync(
                        registration.ContactEmail.Value,
                        registration.EmailVerificationCode ?? "",
                        registration.EmailVerificationToken ?? "",
                        $"{registration.ContactPersonName} {registration.ContactPersonSurname}"));

                _logger.LogInformation("Verification email queued successfully with JobId: {JobId}", jobId);
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
            _logger.LogError(ex, "Error creating minimal tenant registration");
            return Result<TenantRegistrationDto>.Failure(Error.Failure("Registration.CreateFailed", $"Kayıt oluşturulurken hata oluştu: {ex.Message}"));
        }
    }
}
