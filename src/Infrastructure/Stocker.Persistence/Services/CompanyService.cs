using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Services;

public class CompanyService : ICompanyService
{
    private readonly TenantDbContext _context;

    public CompanyService(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> GetDefaultCompanyIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        // For now, return the first company for the tenant
        // In future, this can be enhanced to support multiple companies per tenant
        var company = await _context.Companies
            .Where(c => c.TenantId == tenantId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => c.Id)
            .FirstOrDefaultAsync(cancellationToken);

        return company;
    }
}
