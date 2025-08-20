using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using System.Text.RegularExpressions;

namespace Stocker.Application.Features.Tenants.Queries.CheckSubdomainAvailability;

public sealed class CheckSubdomainAvailabilityQueryHandler : IRequestHandler<CheckSubdomainAvailabilityQuery, Result<CheckSubdomainAvailabilityResponse>>
{
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private static readonly string[] ReservedSubdomains = 
    {
        "www", "api", "admin", "app", "mail", "ftp", "blog", "shop", "support",
        "help", "docs", "status", "cdn", "assets", "images", "static", "files",
        "download", "uploads", "media", "portal", "dashboard", "account", "auth",
        "login", "register", "signup", "signin", "oauth", "sso", "test", "demo",
        "staging", "dev", "development", "prod", "production", "master", "main"
    };

    public CheckSubdomainAvailabilityQueryHandler(IMasterUnitOfWork masterUnitOfWork)
    {
        _masterUnitOfWork = masterUnitOfWork;
    }

    public async Task<Result<CheckSubdomainAvailabilityResponse>> Handle(
        CheckSubdomainAvailabilityQuery request, 
        CancellationToken cancellationToken)
    {
        var subdomain = request.Subdomain.ToLowerInvariant().Trim();

        // Validate subdomain format
        if (string.IsNullOrWhiteSpace(subdomain))
        {
            return Result<CheckSubdomainAvailabilityResponse>.Success(new CheckSubdomainAvailabilityResponse
            {
                Available = false,
                Subdomain = subdomain,
                Reason = "Subdomain boş olamaz",
                SuggestedUrl = string.Empty
            });
        }

        if (subdomain.Length < 3)
        {
            return Result<CheckSubdomainAvailabilityResponse>.Success(new CheckSubdomainAvailabilityResponse
            {
                Available = false,
                Subdomain = subdomain,
                Reason = "Subdomain en az 3 karakter olmalıdır",
                SuggestedUrl = string.Empty
            });
        }

        if (subdomain.Length > 30)
        {
            return Result<CheckSubdomainAvailabilityResponse>.Success(new CheckSubdomainAvailabilityResponse
            {
                Available = false,
                Subdomain = subdomain,
                Reason = "Subdomain en fazla 30 karakter olabilir",
                SuggestedUrl = string.Empty
            });
        }

        // Check format: lowercase alphanumeric with hyphens (not at start/end)
        if (!Regex.IsMatch(subdomain, @"^[a-z0-9]([a-z0-9-]{0,28}[a-z0-9])?$"))
        {
            return Result<CheckSubdomainAvailabilityResponse>.Success(new CheckSubdomainAvailabilityResponse
            {
                Available = false,
                Subdomain = subdomain,
                Reason = "Subdomain sadece küçük harf, rakam ve tire içerebilir (tire başta/sonda olamaz)",
                SuggestedUrl = string.Empty
            });
        }

        // Check if subdomain is reserved
        if (ReservedSubdomains.Contains(subdomain))
        {
            return Result<CheckSubdomainAvailabilityResponse>.Success(new CheckSubdomainAvailabilityResponse
            {
                Available = false,
                Subdomain = subdomain,
                Reason = "Bu subdomain rezerve edilmiş, başka bir isim seçin",
                SuggestedUrl = string.Empty
            });
        }

        // Check if subdomain already exists in Tenant.Code
        var existingTenant = await _masterUnitOfWork.Repository<Tenant>()
            .AsQueryable()
            .FirstOrDefaultAsync(t => t.Code.ToLower() == subdomain, cancellationToken);

        if (existingTenant != null)
        {
            return Result<CheckSubdomainAvailabilityResponse>.Success(new CheckSubdomainAvailabilityResponse
            {
                Available = false,
                Subdomain = subdomain,
                Reason = "Bu subdomain zaten kullanımda",
                SuggestedUrl = string.Empty
            });
        }

        // Check if subdomain exists in TenantDomain table
        var existingDomain = await _masterUnitOfWork.Repository<TenantDomain>()
            .AsQueryable()
            .FirstOrDefaultAsync(td => td.DomainName.ToLower() == subdomain || 
                                      td.DomainName.ToLower() == $"{subdomain}.stoocker.app", 
                                      cancellationToken);

        if (existingDomain != null)
        {
            return Result<CheckSubdomainAvailabilityResponse>.Success(new CheckSubdomainAvailabilityResponse
            {
                Available = false,
                Subdomain = subdomain,
                Reason = "Bu subdomain zaten kullanımda",
                SuggestedUrl = string.Empty
            });
        }

        // Subdomain is available
        return Result<CheckSubdomainAvailabilityResponse>.Success(new CheckSubdomainAvailabilityResponse
        {
            Available = true,
            Subdomain = subdomain,
            Reason = null,
            SuggestedUrl = $"{subdomain}.stoocker.app"
        });
    }
}