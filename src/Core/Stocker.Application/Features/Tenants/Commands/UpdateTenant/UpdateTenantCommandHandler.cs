using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.UpdateTenant;

public class UpdateTenantCommandHandler : IRequestHandler<UpdateTenantCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateTenantCommandHandler> _logger;

    public UpdateTenantCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<UpdateTenantCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _unitOfWork.Tenants().GetByIdAsync(request.Id, cancellationToken);
        
        if (tenant == null)
        {
            return Result.Failure<bool>(Error.NotFound("Tenant.NotFound", $"Tenant with ID {request.Id} not found"));
        }

        // Update fields based on restriction mode
        // TODO: Implement update methods in Tenant entity
        // For now, we need to add methods to Tenant entity to update these fields
        // tenant.UpdateName(request.Name);
        // tenant.UpdateContactEmail(request.ContactEmail);
        
        if (!request.IsRestrictedMode)
        {
            // Only System Admin can update these fields
            // tenant.UpdateContactPhone(request.ContactPhone);
            // tenant.UpdateAddress(request.Address);
        }
        
        _logger.LogWarning("Tenant update functionality needs to be implemented in domain entity");

        _unitOfWork.Tenants().Update(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Tenant {TenantId} updated by {ModifiedBy}", request.Id, request.ModifiedBy);

        return Result.Success(true);
    }
}