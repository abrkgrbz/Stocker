using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Commands;

/// <summary>
/// Command to update a warehouse
/// </summary>
public class UpdateWarehouseCommand : IRequest<Result<WarehouseDto>>
{
    public Guid TenantId { get; set; }
    public int WarehouseId { get; set; }
    public UpdateWarehouseDto WarehouseData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateWarehouseCommand
/// </summary>
public class UpdateWarehouseCommandValidator : AbstractValidator<UpdateWarehouseCommand>
{
    public UpdateWarehouseCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.WarehouseId)
            .NotEmpty().WithMessage("Warehouse ID is required");

        RuleFor(x => x.WarehouseData)
            .NotNull().WithMessage("Warehouse data is required");

        When(x => x.WarehouseData != null, () =>
        {
            RuleFor(x => x.WarehouseData.Name)
                .NotEmpty().WithMessage("Warehouse name is required")
                .MaximumLength(100).WithMessage("Warehouse name must not exceed 100 characters");

            RuleFor(x => x.WarehouseData.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
        });
    }
}

/// <summary>
/// Handler for UpdateWarehouseCommand
/// </summary>
public class UpdateWarehouseCommandHandler : IRequestHandler<UpdateWarehouseCommand, Result<WarehouseDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateWarehouseCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WarehouseDto>> Handle(UpdateWarehouseCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(request.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<WarehouseDto>.Failure(
                Error.NotFound("Warehouse", $"Warehouse with ID {request.WarehouseId} not found"));
        }

        // Build address if provided
        Address? address = null;
        if (!string.IsNullOrEmpty(request.WarehouseData.Street) &&
            !string.IsNullOrEmpty(request.WarehouseData.City) &&
            !string.IsNullOrEmpty(request.WarehouseData.Country))
        {
            address = Address.Create(
                request.WarehouseData.Street,
                request.WarehouseData.City,
                request.WarehouseData.Country,
                request.WarehouseData.PostalCode,
                state: request.WarehouseData.State);
        }

        // Build phone if provided
        PhoneNumber? phone = null;
        if (!string.IsNullOrEmpty(request.WarehouseData.Phone))
        {
            var phoneResult = PhoneNumber.Create(request.WarehouseData.Phone);
            if (phoneResult.IsSuccess)
            {
                phone = phoneResult.Value;
            }
        }

        // Update warehouse
        warehouse.UpdateWarehouse(
            request.WarehouseData.Name,
            request.WarehouseData.Description,
            address,
            phone,
            request.WarehouseData.Manager);

        if (request.WarehouseData.TotalArea > 0)
        {
            warehouse.SetTotalArea(request.WarehouseData.TotalArea);
        }

        // IsActive is managed via activate/deactivate endpoints

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var warehouseDto = new WarehouseDto
        {
            Id = warehouse.Id,
            Code = warehouse.Code,
            Name = warehouse.Name,
            Description = warehouse.Description,
            BranchId = warehouse.BranchId,
            Street = warehouse.Address?.Street,
            City = warehouse.Address?.City,
            State = warehouse.Address?.State,
            Country = warehouse.Address?.Country,
            PostalCode = warehouse.Address?.PostalCode,
            Phone = warehouse.Phone?.Value,
            Manager = warehouse.Manager,
            TotalArea = warehouse.TotalArea,
            IsActive = warehouse.IsActive,
            IsDefault = warehouse.IsDefault,
            CreatedAt = warehouse.CreatedDate
        };

        return Result<WarehouseDto>.Success(warehouseDto);
    }
}
