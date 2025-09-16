using MediatR;
using Stocker.Application.Tenants.DTOs;

namespace Stocker.Application.Tenants.Queries;

public class GetTenantBySlugQuery : IRequest<TenantDto?>
{
    public string Slug { get; set; } = string.Empty;
}

public class GetTenantBySlugQueryHandler : IRequestHandler<GetTenantBySlugQuery, TenantDto?>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ILogger<GetTenantBySlugQueryHandler> _logger;

    public GetTenantBySlugQueryHandler(
        ITenantRepository tenantRepository,
        ILogger<GetTenantBySlugQueryHandler> logger)
    {
        _tenantRepository = tenantRepository;
        _logger = logger;
    }

    public async Task<TenantDto?> Handle(GetTenantBySlugQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Getting tenant by slug: {Slug}", request.Slug);

            // Normalize slug (lowercase, trim)
            var normalizedSlug = request.Slug.ToLowerInvariant().Trim();

            // Try to find tenant by slug (subdomain)
            var tenant = await _tenantRepository.GetBySlugAsync(normalizedSlug, cancellationToken);

            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found with slug: {Slug}", request.Slug);
                return null;
            }

            return new TenantDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug ?? normalizedSlug,
                IsActive = tenant.IsActive,
                PrimaryColor = tenant.PrimaryColor,
                SecondaryColor = tenant.SecondaryColor,
                Logo = tenant.Logo,
                CreatedDate = tenant.CreatedDate
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tenant by slug: {Slug}", request.Slug);
            throw;
        }
    }
}