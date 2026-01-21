using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Commands;

/// <summary>
/// Command to create a new warehouse
/// </summary>
public class CreateWarehouseCommand : IRequest<Result<WarehouseDto>>
{
    public Guid TenantId { get; set; }
    public CreateWarehouseDto WarehouseData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateWarehouseCommand
/// </summary>
public class CreateWarehouseCommandValidator : AbstractValidator<CreateWarehouseCommand>
{
    public CreateWarehouseCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.WarehouseData)
            .NotNull().WithMessage("Depo bilgileri gereklidir");

        When(x => x.WarehouseData != null, () =>
        {
            RuleFor(x => x.WarehouseData.Code)
                .NotEmpty().WithMessage("Depo kodu gereklidir")
                .MaximumLength(50).WithMessage("Depo kodu en fazla 50 karakter olabilir");

            RuleFor(x => x.WarehouseData.Name)
                .NotEmpty().WithMessage("Depo adı gereklidir")
                .MaximumLength(100).WithMessage("Depo adı en fazla 100 karakter olabilir");

            RuleFor(x => x.WarehouseData.Description)
                .MaximumLength(500).WithMessage("Açıklama en fazla 500 karakter olabilir");

            RuleFor(x => x.WarehouseData.TotalArea)
                .GreaterThanOrEqualTo(0).WithMessage("Toplam alan negatif olamaz");
        });
    }
}

/// <summary>
/// Handler for CreateWarehouseCommand
/// </summary>
public class CreateWarehouseCommandHandler : IRequestHandler<CreateWarehouseCommand, Result<WarehouseDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateWarehouseCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WarehouseDto>> Handle(CreateWarehouseCommand request, CancellationToken cancellationToken)
    {
        // Check if warehouse with same code already exists
        var existingWarehouse = await _unitOfWork.Warehouses.GetByCodeAsync(request.WarehouseData.Code, cancellationToken);
        if (existingWarehouse != null)
        {
            return Result<WarehouseDto>.Failure(
                Error.Conflict("Warehouse.Code", "Bu depo kodu zaten kullanılmaktadır"));
        }

        // Create the warehouse
        var warehouse = new Warehouse(
            request.WarehouseData.Code,
            request.WarehouseData.Name,
            request.WarehouseData.BranchId);

        warehouse.SetTenantId(request.TenantId);
        warehouse.RaiseCreatedEvent();

        // Set address and other details if provided
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

        PhoneNumber? phone = null;
        if (!string.IsNullOrEmpty(request.WarehouseData.Phone))
        {
            var phoneResult = PhoneNumber.Create(request.WarehouseData.Phone);
            if (phoneResult.IsSuccess)
            {
                phone = phoneResult.Value;
            }
        }

        if (address != null || phone != null || !string.IsNullOrEmpty(request.WarehouseData.Description) ||
            !string.IsNullOrEmpty(request.WarehouseData.Manager))
        {
            warehouse.UpdateWarehouse(
                request.WarehouseData.Name,
                request.WarehouseData.Description,
                address,
                phone,
                request.WarehouseData.Manager);
        }

        if (request.WarehouseData.TotalArea > 0)
        {
            warehouse.SetTotalArea(request.WarehouseData.TotalArea);
        }

        if (request.WarehouseData.IsDefault)
        {
            // Unset current default warehouse if exists
            var currentDefault = await _unitOfWork.Warehouses.GetDefaultWarehouseAsync(cancellationToken);
            if (currentDefault != null)
            {
                currentDefault.UnsetDefault();
            }
            warehouse.SetAsDefault();
        }

        // Save to repository
        await _unitOfWork.Warehouses.AddAsync(warehouse, cancellationToken);
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
            CreatedAt = warehouse.CreatedDate,
            LocationCount = 0,
            ProductCount = 0
        };

        return Result<WarehouseDto>.Success(warehouseDto);
    }
}
