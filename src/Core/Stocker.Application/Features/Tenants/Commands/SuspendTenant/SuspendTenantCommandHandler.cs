using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.SuspendTenant;

public class SuspendTenantCommandHandler : IRequestHandler<SuspendTenantCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<SuspendTenantCommandHandler> _logger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTime _dateTime;

    public SuspendTenantCommandHandler(
        IApplicationDbContext context,
        ILogger<SuspendTenantCommandHandler> logger,
        ICurrentUserService currentUserService,
        IDateTime dateTime)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService;
        _dateTime = dateTime;
    }

    public async Task<Result<bool>> Handle(SuspendTenantCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<bool>.Failure(Error.NotFound("Tenant", "Tenant not found."));
            }

            if (!tenant.IsActive)
            {
                return Result<bool>.Failure(Error.Validation("Tenant.Status", "Tenant is already suspended or inactive."));
            }

            // Suspend the tenant using the Deactivate method
            tenant.Deactivate();

            // Add suspension log/audit
            _logger.LogWarning("Tenant {TenantId} ({TenantName}) suspended by {UserId}. Reason: {Reason}",
                tenant.Id, tenant.Name, _currentUserService.UserId, request.Reason);

            await _context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suspending tenant {TenantId}", request.TenantId);
            return Result<bool>.Failure(Error.Failure("Tenant.Suspend", "An error occurred while suspending the tenant."));
        }
    }
}