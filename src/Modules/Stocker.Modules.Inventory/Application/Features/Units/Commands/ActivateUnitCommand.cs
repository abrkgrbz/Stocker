using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Units.Commands;

/// <summary>
/// Command to activate a unit
/// </summary>
public class ActivateUnitCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int UnitId { get; set; }
}

/// <summary>
/// Handler for ActivateUnitCommand
/// </summary>
public class ActivateUnitCommandHandler : IRequestHandler<ActivateUnitCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivateUnitCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = await _unitOfWork.Units.GetByIdAsync(request.UnitId, cancellationToken);

        if (unit == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Unit", $"Birim bulunamadı (ID: {request.UnitId})"));
        }

        // Verify tenant ownership
        if (unit.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(
                Error.NotFound("Unit", $"Birim bulunamadı (ID: {request.UnitId})"));
        }

        unit.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
