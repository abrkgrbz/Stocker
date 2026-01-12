using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
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
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.LocationId).NotEmpty().WithMessage("Konum kimliği gereklidir");
        RuleFor(x => x.Data).NotNull().WithMessage("Konum bilgileri gereklidir");
        RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Konum adı gereklidir").MaximumLength(200).WithMessage("Konum adı en fazla 200 karakter olabilir");
        RuleFor(x => x.Data.Capacity).GreaterThanOrEqualTo(0).WithMessage("Kapasite negatif olamaz");
    }
}

public class UpdateLocationCommandHandler : IRequestHandler<UpdateLocationCommand, Result<LocationDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateLocationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LocationDto>> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(request.LocationId, cancellationToken);
        if (location == null)
        {
            return Result<LocationDto>.Failure(new Error("Location.NotFound", $"Konum bulunamadı (ID: {request.LocationId})", ErrorType.NotFound));
        }

        var data = request.Data;
        location.UpdateLocation(data.Name, data.Description);
        location.SetLocationDetails(data.Aisle, data.Shelf, data.Bin);
        location.SetCapacity(data.Capacity);

        await _unitOfWork.Locations.UpdateAsync(location, cancellationToken);
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
