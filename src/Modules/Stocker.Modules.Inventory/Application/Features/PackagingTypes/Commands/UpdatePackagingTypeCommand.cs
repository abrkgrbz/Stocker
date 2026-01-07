using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PackagingTypes.Commands;

/// <summary>
/// Command to update an existing packaging type
/// </summary>
public class UpdatePackagingTypeCommand : IRequest<Result<PackagingTypeDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdatePackagingTypeDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdatePackagingTypeCommand
/// </summary>
public class UpdatePackagingTypeCommandValidator : AbstractValidator<UpdatePackagingTypeCommand>
{
    public UpdatePackagingTypeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Data.Description).MaximumLength(500);
        RuleFor(x => x.Data.MaterialType).MaximumLength(100);
        RuleFor(x => x.Data.BarcodePrefix).MaximumLength(20);
    }
}

/// <summary>
/// Handler for UpdatePackagingTypeCommand
/// </summary>
public class UpdatePackagingTypeCommandHandler : IRequestHandler<UpdatePackagingTypeCommand, Result<PackagingTypeDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdatePackagingTypeCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PackagingTypeDto>> Handle(UpdatePackagingTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.PackagingTypes.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<PackagingTypeDto>.Failure(new Error("PackagingType.NotFound", $"Packaging type with ID {request.Id} not found", ErrorType.NotFound));
        }

        var data = request.Data;

        entity.SetDescription(data.Description);
        entity.SetDimensions(data.Length, data.Width, data.Height);
        entity.SetWeightInfo(data.EmptyWeight, data.MaxWeightCapacity);
        entity.SetCapacity(data.DefaultQuantity, data.MaxQuantity);
        entity.SetStackingInfo(data.IsStackable, data.StackableCount);
        entity.SetPalletInfo(data.UnitsPerPallet, data.UnitsPerPalletLayer);
        entity.SetMaterialInfo(data.MaterialType, data.IsRecyclable);
        entity.SetReturnableInfo(data.IsReturnable, data.DepositAmount);

        BarcodeType? barcodeType = null;
        if (!string.IsNullOrEmpty(data.DefaultBarcodeType))
            barcodeType = Enum.Parse<BarcodeType>(data.DefaultBarcodeType);
        entity.SetBarcodeInfo(data.BarcodePrefix, barcodeType);

        if (data.IsActive)
            entity.Activate();
        else
            entity.Deactivate();

        await _unitOfWork.PackagingTypes.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new PackagingTypeDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            Description = entity.Description,
            Category = entity.Category.ToString(),
            IsActive = entity.IsActive,
            Length = entity.Length,
            Width = entity.Width,
            Height = entity.Height,
            Volume = entity.Volume,
            EmptyWeight = entity.EmptyWeight,
            MaxWeightCapacity = entity.MaxWeightCapacity,
            DefaultQuantity = entity.DefaultQuantity,
            MaxQuantity = entity.MaxQuantity,
            IsStackable = entity.IsStackable,
            StackableCount = entity.StackableCount,
            UnitsPerPallet = entity.UnitsPerPallet,
            UnitsPerPalletLayer = entity.UnitsPerPalletLayer,
            BarcodePrefix = entity.BarcodePrefix,
            DefaultBarcodeType = entity.DefaultBarcodeType?.ToString(),
            MaterialType = entity.MaterialType,
            IsRecyclable = entity.IsRecyclable,
            IsReturnable = entity.IsReturnable,
            DepositAmount = entity.DepositAmount,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<PackagingTypeDto>.Success(dto);
    }
}
