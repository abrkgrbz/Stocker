using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Commands;

public class UpdateLocationCommand : IRequest<Result<LocationDto>>
{
    public Guid TenantId { get; set; }
    public int LocationId { get; set; }
    public UpdateLocationDto Data { get; set; } = null!;
}

public class UpdateLocationCommandValidator : AbstractValidator<UpdateLocationCommand>
{
    public UpdateLocationCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.LocationId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Data.Capacity).GreaterThanOrEqualTo(0);
    }
}

public class UpdateLocationCommandHandler : IRequestHandler<UpdateLocationCommand, Result<LocationDto>>
{
    private readonly ILocationRepository _locationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateLocationCommandHandler(ILocationRepository locationRepository, IUnitOfWork unitOfWork)
    {
        _locationRepository = locationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LocationDto>> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await _locationRepository.GetByIdAsync(request.LocationId, cancellationToken);
        if (location == null)
        {
            return Result<LocationDto>.Failure(new Error("Location.NotFound", $"Location with ID {request.LocationId} not found", ErrorType.NotFound));
        }

        var data = request.Data;
        location.UpdateLocation(data.Name, data.Description);
        location.SetLocationDetails(data.Aisle, data.Shelf, data.Bin);
        location.SetCapacity(data.Capacity);

        await _locationRepository.UpdateAsync(location, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<LocationDto>.Success(new LocationDto
        {
            Id = location.Id,
            WarehouseId = location.WarehouseId,
            WarehouseName = location.Warehouse?.Name,
            Code = location.Code,
            Name = location.Name,
            Description = location.Description,
            Aisle = location.Aisle,
            Shelf = location.Shelf,
            Bin = location.Bin,
            Capacity = location.Capacity,
            UsedCapacity = location.UsedCapacity,
            AvailableCapacity = location.Capacity - location.UsedCapacity,
            IsActive = location.IsActive,
            CreatedAt = location.CreatedDate,
            UpdatedAt = location.UpdatedDate
        });
    }
}
