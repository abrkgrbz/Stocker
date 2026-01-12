using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Commands;

public class DeleteLocationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int LocationId { get; set; }
}

public class DeleteLocationCommandHandler : IRequestHandler<DeleteLocationCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteLocationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(request.LocationId, cancellationToken);
        if (location == null)
        {
            return Result<bool>.Failure(new Error("Location.NotFound", $"Konum bulunamadı (ID: {request.LocationId})", ErrorType.NotFound));
        }

        if (location.Stocks?.Any() == true)
        {
            return Result<bool>.Failure(new Error("Location.HasStock", "Stoku olan konum silinemez. Önce stokları taşıyın veya silin.", ErrorType.Validation));
        }

        location.Deactivate();
        await _unitOfWork.Locations.UpdateAsync(location, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
