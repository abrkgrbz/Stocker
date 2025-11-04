namespace Stocker.Application.Common.Interfaces;

public interface ICompanyService
{
    Task<Guid> GetDefaultCompanyIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
