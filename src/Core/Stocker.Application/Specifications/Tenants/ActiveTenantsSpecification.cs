using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Specifications;

namespace Stocker.Application.Specifications.Tenants;

/// <summary>
/// Specification for querying active tenants
/// </summary>
public class ActiveTenantsSpecification : BaseSpecification<Tenant>
{
    public ActiveTenantsSpecification(bool includeSubscriptions = false, bool includeDomains = false)
    {
        AddCriteria(t => t.IsActive);

        if (includeSubscriptions)
        {
            AddInclude(t => t.Subscriptions);
        }

        if (includeDomains)
        {
            AddInclude(t => t.Domains);
        }

        ApplyOrderByDescending(t => t.CreatedAt);
    }
}

/// <summary>
/// Specification for finding tenants by code
/// </summary>
public class TenantByCodeSpecification : BaseSpecification<Tenant>
{
    public TenantByCodeSpecification(string code)
    {
        AddCriteria(t => t.Code == code);
        AddInclude(t => t.Domains);
        AddInclude(t => t.Subscriptions);
    }
}

/// <summary>
/// Specification for paged tenant queries
/// </summary>
public class PagedTenantsSpecification : BaseSpecification<Tenant>
{
    public PagedTenantsSpecification(
        int pageIndex, 
        int pageSize, 
        string? searchTerm = null,
        bool? isActive = null)
    {
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            AddCriteria(t => t.Name.Contains(searchTerm) || t.Code.Contains(searchTerm));
        }

        if (isActive.HasValue)
        {
            AddCriteria(t => t.IsActive == isActive.Value);
        }

        ApplyOrderByDescending(t => t.CreatedAt);
        ApplyPaging(pageIndex * pageSize, pageSize);
    }
}