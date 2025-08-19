using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Results;
using BC = BCrypt.Net.BCrypt;

namespace Stocker.Application.Features.Identity.Commands.Register;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<RegisterResponse>>
{
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantDbContext _tenantContext;
    private readonly ITokenService _tokenService;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IMasterDbContext masterContext,
        ITenantDbContext tenantContext,
        ITokenService tokenService,
        ILogger<RegisterCommandHandler> logger)
    {
        _masterContext = masterContext;
        _tenantContext = tenantContext;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<Result<RegisterResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting registration for company: {CompanyName}", request.CompanyName);

            // Create tenant
            var tenant = new Tenant(
                name: request.CompanyName,
                subdomain: GenerateSubdomain(request.CompanyName),
                connectionString: null);

            _masterContext.Tenants.Add(tenant);
            await _masterContext.SaveChangesAsync(cancellationToken);

            // Create company with all the new fields
            var company = Company.Create(
                name: request.CompanyName,
                taxNumber: null,
                taxOffice: null,
                address: null,
                city: null,
                country: "Türkiye",
                phone: null,
                email: request.Email,
                website: null,
                tenantId: tenant.Id);

            // Set the new fields
            company.SetIdentityInfo(request.IdentityType, request.IdentityNumber);
            company.SetSector(request.Sector);
            company.SetEmployeeCount(request.EmployeeCount);

            _masterContext.Companies.Add(company);
            await _masterContext.SaveChangesAsync(cancellationToken);

            // Create master user
            var hashedPassword = BC.HashPassword(request.Password);
            var masterUser = new MasterUser(
                username: request.Username,
                email: request.Email,
                passwordHash: hashedPassword,
                firstName: request.FirstName,
                lastName: request.LastName,
                phoneNumber: null);

            _masterContext.MasterUsers.Add(masterUser);
            await _masterContext.SaveChangesAsync(cancellationToken);

            // Create user-tenant relationship
            var userTenant = new UserTenant(
                userId: masterUser.Id,
                tenantId: tenant.Id,
                role: "TenantAdmin",
                isActive: true,
                isOwner: true);

            _masterContext.UserTenants.Add(userTenant);
            await _masterContext.SaveChangesAsync(cancellationToken);

            // Generate JWT token for auto-login
            var token = _tokenService.GenerateToken(
                userId: masterUser.Id,
                email: masterUser.Email,
                tenantId: tenant.Id,
                role: "TenantAdmin");

            var refreshToken = _tokenService.GenerateRefreshToken();
            
            // Save refresh token
            masterUser.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Registration completed successfully for company: {CompanyName}", request.CompanyName);

            return Result<RegisterResponse>.Success(new RegisterResponse
            {
                Success = true,
                Message = "Kayıt başarıyla tamamlandı",
                UserId = masterUser.Id,
                TenantId = tenant.Id,
                CompanyId = company.Id,
                Token = token,
                RefreshToken = refreshToken,
                Email = masterUser.Email,
                FullName = $"{masterUser.FirstName} {masterUser.LastName}",
                CompanyName = company.Name,
                RequiresEmailVerification = true,
                RedirectUrl = $"/welcome?tenant={tenant.Id}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for company: {CompanyName}", request.CompanyName);
            return Result<RegisterResponse>.Failure(Error.Failure("Register.Failed", "Kayıt işlemi sırasında bir hata oluştu"));
        }
    }

    private string GenerateSubdomain(string companyName)
    {
        // Generate a URL-safe subdomain from company name
        var subdomain = companyName.ToLower()
            .Replace(" ", "-")
            .Replace("ş", "s")
            .Replace("ç", "c")
            .Replace("ğ", "g")
            .Replace("ı", "i")
            .Replace("ö", "o")
            .Replace("ü", "u")
            .Replace(".", "")
            .Replace(",", "");

        // Ensure uniqueness by adding a suffix if needed
        return $"{subdomain}-{Guid.NewGuid().ToString("N").Substring(0, 6)}";
    }
}