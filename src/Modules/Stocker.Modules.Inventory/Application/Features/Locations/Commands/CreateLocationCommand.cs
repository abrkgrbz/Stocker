using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Commands;

public class CreateLocationCommand : IRequest<Result<LocationDto>>
{
    public int TenantId { get; set; }
    public CreateLocationDto Data { get; set; } = null!;
}

public class CreateLocationCommandValidator : AbstractValidator<CreateLocationCommand>
{
    public CreateLocationCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.WarehouseId).GreaterThan(0);
        RuleFor(x => x.Data.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Data.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Data.Capacity).GreaterThanOrEqualTo(0);
    }
}

public class CreateLocationCommandHandler : IRequestHandler<CreateLocationCommand, Result<LocationDto>>
{
    private readonly ILocationRepository _locationRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateLocationCommandHandler(ILocationRepository locationRepository, IWarehouseRepository warehouseRepository, IUnitOfWork unitOfWork)
    {
        _locationRepository = locationRepository;
        _warehouseRepository = warehouseRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LocationDto>> Handle(CreateLocationCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var warehouse = await _warehouseRepository.GetByIdAsync(data.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<LocationDto>.Failure(new Error("Warehouse.NotFound", $"Warehouse with ID {data.WarehouseId} not found", ErrorType.NotFound));
        }

        if (await _locationRepository.ExistsWithCodeAsync(data.WarehouseId, data.Code, null, cancellationToken))
        {
            return Result<LocationDto>.Failure(new Error("Location.DuplicateCode", $"Location with code '{data.Code}' already exists in this warehouse", ErrorType.Conflict));
        }

        var location = new Location(data.WarehouseId, data.Code, data.Name);
        location.UpdateLocation(data.Name, data.Description);
        location.SetLocationDetails(data.Aisle, data.Shelf, data.Bin);
        location.SetCapacity(data.Capacity);

        await _locationRepository.AddAsync(location, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<LocationDto>.Success(new LocationDto
        {
            Id = location.Id,
            WarehouseId = location.WarehouseId,
            WarehouseName = warehouse.Name,
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
            CreatedAt = location.CreatedDate
        });
    }
}
