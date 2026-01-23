using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Commands;

public class CreateLocationCommand : IRequest<Result<LocationDto>>
{
    public Guid TenantId { get; set; }
    public CreateLocationDto Data { get; set; } = null!;
}

public class CreateLocationCommandValidator : AbstractValidator<CreateLocationCommand>
{
    public CreateLocationCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Data).NotNull().WithMessage("Konum bilgileri gereklidir");
        RuleFor(x => x.Data.WarehouseId).NotEmpty().WithMessage("Depo kimliği gereklidir");
        RuleFor(x => x.Data.Code).NotEmpty().WithMessage("Konum kodu gereklidir").MaximumLength(50).WithMessage("Konum kodu en fazla 50 karakter olabilir");
        RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Konum adı gereklidir").MaximumLength(200).WithMessage("Konum adı en fazla 200 karakter olabilir");
        RuleFor(x => x.Data.Capacity).GreaterThanOrEqualTo(0).WithMessage("Kapasite negatif olamaz");
    }
}

public class CreateLocationCommandHandler : IRequestHandler<CreateLocationCommand, Result<LocationDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateLocationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LocationDto>> Handle(CreateLocationCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<LocationDto>.Failure(new Error("Warehouse.NotFound", $"Depo bulunamadı (ID: {data.WarehouseId})", ErrorType.NotFound));
        }

        if (await _unitOfWork.Locations.ExistsWithCodeAsync(data.WarehouseId, data.Code, null, cancellationToken))
        {
            return Result<LocationDto>.Failure(new Error("Location.DuplicateCode", $"'{data.Code}' kodlu konum bu depoda zaten mevcut", ErrorType.Conflict));
        }

        // Validate that new location capacity doesn't exceed warehouse TotalArea
        if (warehouse.TotalArea > 0 && data.Capacity > 0)
        {
            var existingLocations = await _unitOfWork.Locations.GetByWarehouseAsync(data.WarehouseId, cancellationToken);
            var totalExistingCapacity = existingLocations.Sum(l => l.Capacity);
            if ((totalExistingCapacity + data.Capacity) > warehouse.TotalArea)
            {
                return Result<LocationDto>.Failure(
                    Error.Validation("Warehouse.AreaExceeded",
                        $"Depo toplam alanı aşılıyor. Depo alanı: {warehouse.TotalArea}, " +
                        $"Mevcut lokasyon kapasitesi: {totalExistingCapacity}, Eklenmek istenen: {data.Capacity}"));
            }
        }

        var location = new Location(data.WarehouseId, data.Code, data.Name);
        location.SetTenantId(request.TenantId);
        location.UpdateLocation(data.Name, data.Description);
        location.SetLocationDetails(data.Aisle, data.Shelf, data.Bin);
        location.SetCapacity(data.Capacity);

        await _unitOfWork.Locations.AddAsync(location, cancellationToken);
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
