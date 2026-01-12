using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Commands;

public class DeactivateLocationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int LocationId { get; set; }
}

public class DeactivateLocationCommandHandler : IRequestHandler<DeactivateLocationCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivateLocationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(request.LocationId, cancellationToken);
        if (location == null)
        {
            return Result<bool>.Failure(new Error("Location.NotFound", $"Konum bulunamadı (ID: {request.LocationId})", ErrorType.NotFound));
        }

        if (!location.IsActive)
        {
            return Result<bool>.Failure(new Error("Location.AlreadyInactive", "Konum zaten pasif durumda", ErrorType.Validation));
        }

        // Check if location has stock
        if (location.Stocks?.Any(s => s.Quantity > 0) == true)
        {
            return Result<bool>.Failure(new Error("Location.HasStock", "Stoku olan konum pasifleştirilemez. Önce stokları taşıyın veya silin.", ErrorType.Validation));
        }

        location.Deactivate();
        await _unitOfWork.Locations.UpdateAsync(location, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
