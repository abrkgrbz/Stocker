using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.ToggleTenantStatus;

public class ToggleTenantStatusCommandHandler : IRequestHandler<ToggleTenantStatusCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<ToggleTenantStatusCommandHandler> _logger;

    public ToggleTenantStatusCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<ToggleTenantStatusCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(ToggleTenantStatusCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _unitOfWork.Tenants().GetByIdAsync(request.Id, cancellationToken);
        
        if (tenant == null)
        {
            return Result.Failure<bool>(Error.NotFound("Tenant.NotFound", $"Tenant with ID {request.Id} not found"));
        }

        // Toggle the status using the domain method
        var newStatus = tenant.ToggleStatus();

        _unitOfWork.Tenants().Update(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogWarning("Tenant {TenantId} status toggled to {Status} by {ModifiedBy}",
            request.Id, newStatus ? "Active" : "Inactive", request.ModifiedBy);

        return Result.Success(newStatus);
    }
}
