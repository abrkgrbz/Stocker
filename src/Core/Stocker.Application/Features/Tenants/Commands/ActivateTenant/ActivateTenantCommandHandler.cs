using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.ActivateTenant;

public class ActivateTenantCommandHandler : IRequestHandler<ActivateTenantCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ActivateTenantCommandHandler> _logger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTime _dateTime;

    public ActivateTenantCommandHandler(
        IApplicationDbContext context,
        ILogger<ActivateTenantCommandHandler> logger,
        ICurrentUserService currentUserService,
        IDateTime dateTime)
    {
        _context = context;
        _logger = logger;
        _currentUserService = currentUserService;
        _dateTime = dateTime;
    }

    public async Task<Result<bool>> Handle(ActivateTenantCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<bool>.Failure(Error.NotFound("Tenant", "Tenant not found."));
            }

            if (tenant.IsActive)
            {
                return Result<bool>.Failure(Error.Validation("Tenant.Status", "Tenant is already active."));
            }

            // Activate the tenant using the Activate method
            tenant.Activate();

            // Add activation log/audit
            _logger.LogInformation("Tenant {TenantId} ({TenantName}) activated by {UserId}. Notes: {Notes}",
                tenant.Id, tenant.Name, _currentUserService.UserId, request.Notes);

            await _context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating tenant {TenantId}", request.TenantId);
            return Result<bool>.Failure(Error.Failure("Tenant.Activate", "An error occurred while activating the tenant."));
        }
    }
}