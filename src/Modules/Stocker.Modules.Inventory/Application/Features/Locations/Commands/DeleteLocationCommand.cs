using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Commands;

public class DeleteLocationCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int LocationId { get; set; }
}

public class DeleteLocationCommandHandler : IRequestHandler<DeleteLocationCommand, Result<bool>>
{
    private readonly ILocationRepository _locationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteLocationCommandHandler(ILocationRepository locationRepository, IUnitOfWork unitOfWork)
    {
        _locationRepository = locationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await _locationRepository.GetByIdAsync(request.LocationId, cancellationToken);
        if (location == null)
        {
            return Result<bool>.Failure(new Error("Location.NotFound", $"Location with ID {request.LocationId} not found", ErrorType.NotFound));
        }

        if (location.Stocks?.Any() == true)
        {
            return Result<bool>.Failure(new Error("Location.HasStock", "Cannot delete location with existing stock", ErrorType.Validation));
        }

        location.Deactivate();
        await _locationRepository.UpdateAsync(location, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
